"""ORAS-only supplement from cached location wikitext; never fetches pages.

Run python3 scripts/bulbapedia_encounters.py to refresh the checked-in candidate
rows. build_data applies the PokeAPI-first rule against the current API cache.
"""
import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
VERSIONS = ('omega-ruby', 'alpha-sapphire')
METHODS = {'Grass': 'walk', 'Tall grass': 'walk', 'Cave': 'walk', 'Sand': 'walk',
           'Surf': 'surf', 'Fish Old': 'old-rod', 'Fish Good': 'good-rod',
           'Fish Super': 'super-rod', 'Horde Encounter': 'horde',
           'Seaweed': 'seaweed', 'Dive': 'seaweed', 'Rock Smash': 'rock-smash',
           'Flocks': 'flocks', 'Gift': 'gift', 'Egg': 'gift-egg', 'Trade': 'npc-trade',
           'Special': 'static', '1F-5F': 'walk', '1F-4F': 'walk'}


def split_args(text):
    """Split template arguments without splitting nested templates or links."""
    out, start, braces, links = [], 0, 0, 0
    i = 0
    while i < len(text):
        pair = text[i:i + 2]
        if pair in ('{{', '[[', '}}', ']]'):
            braces += (pair == '{{') - (pair == '}}')
            links += (pair == '[[') - (pair == ']]')
            i += 2
            continue
        if text[i] == '|' and braces == links == 0:
            out.append(text[start:i].strip())
            start = i + 1
        i += 1
    return out + [text[start:].strip()]


def plain(text):
    text = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', text)
    while re.search(r'\{\{[^{}]*\}\}', text):
        text = re.sub(r'\{\{([^{}]*)\}\}', lambda m: split_args(m[1])[-1] if not m[1].startswith('tt|') else split_args(m[1])[1], text)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>|\'{2,}', ' ', text))).strip()


def parse_template(text):
    args = split_args(text.strip().removeprefix('{{').removesuffix('}}'))
    assert args.pop(0).lower() == 'catch/entryoras'
    positional = [a for a in args if not re.match(r'^\w+=', a)]
    dex, name, ruby, sapphire, method, levels, rate, *_ = positional
    numbers = [int(n) for n in re.findall(r'\d+', plain(levels))]
    assert numbers, f'No levels: {text}'
    percent = re.search(r'(\d+(?:\.\d+)?)%', plain(rate))
    annotations = re.findall(r'\{\{tt\|[^|]*\|(.+?)\}\}', rate)
    trade = next((a.split('=', 1)[1] for a in args if a.startswith('tradename=')), None)
    if trade: annotations.append('Trade a ' + trade)
    return {'n': int(re.match(r'\d+', dex)[0]), 'versions': [v for v, yes in zip(VERSIONS, (ruby, sapphire)) if yes.lower() == 'yes'],
            'method': METHODS[method], 'lo': min(numbers), 'hi': max(numbers),
            'chance': float(percent[1]) if percent else 100 if plain(rate) == 'One' else 0,
            'conditions': [plain(a) for a in annotations], 'habitat': method, 'rate': plain(rate)}


def areas(title, section, method=None):
    """Use PokeAPI's pre-rename area names wherever its table exists."""
    base = title.replace(' (Hoenn)', '').title()
    if title == 'Hoenn Route 104':
        return ['Hoenn Route 104 ' + ('South' if 'South' in section else 'North') + ' Oras']
    if title.startswith('Hoenn Route') and 'Underwater' in section:
        return [base + ' Underwater']
    if title == 'Hoenn Route 111' and section == 'Desert': return [base + ' Desert']
    if title == 'Hoenn Safari Zone':
        return ['Hoenn Safari Zone ' + {'Area 1': 'Sw', 'Area 2': 'Se', 'Area 3': 'Nwmach Bike', 'Area 4': 'Neacro Bike'}[section]]
    if title == 'Granite Cave': return [base + ' ' + section]
    if title == 'Meteor Falls':
        return {'1F 1R': ['Meteor Falls'], '1F 2R & B1F 1R': ['Meteor Falls Back', 'Meteor Falls B1F'], 'B1F 2R': ['Meteor Falls Backsmall Room']}[section]
    if title == 'Mt. Pyre':
        return [base + ' ' + s for s in {'Interior': ['1F', '2F', '3F', '4F'], 'Exterior': ['Outside'], 'Summit': ['Summit']}[section]]
    if title == 'Scorched Slab': return [base + ' ' + s for s in (['B2F', 'B3F'] if section == 'B2F-BF3' else [section])]
    if title == 'Victory Road (Hoenn)': return ['Hoenn Victory Road ' + s for s in (['1F', 'B1F'] if section != '2F' else ['2F'])]
    if title == 'Cave of Origin': return ['Cave Of Origin ' + s for s in ['Entrance', '1F', 'B1F', 'B2F', 'B3F']]
    if title == 'Sky Pillar': return ['Sky Pillar ' + s for s in ['1F', '3F', '5F']]
    if title == 'Shoal Cave': return ['Shoal Cave ' + {'High tide': 'High Tide', 'Low tide': 'Low Tide', 'Ice room': 'B3F'}[section]]
    if title == 'Sea Mauville': return ['Sea Mauville ' + section]
    if title == 'Mossdeep City' and method == 'gift': return ['Mossdeep City Stevens House']
    if title in ('Lilycove City', 'Slateport City', 'Verdanturf Town', 'Fallarbor Town') and method == 'gift': return [base + ' Contest Hall']
    return [base]


def parse_page(title, text):
    headers, division, rows = [], '', []
    for line in text.splitlines():
        header = re.match(r'^(=+)\s*(.*?)\s*\1\s*$', line)
        if header:
            depth = len(header[1])
            headers = [(d, s) for d, s in headers if d < depth] + [(depth, header[2])]
            division = ''
        if re.match(r'\{\{catch/(header|footer)', line, re.I): division = ''
        if re.match(r'\{\{catch/div\|', line, re.I): division = line
        if not re.match(r'\{\{catch/entryoras\|', line, re.I): continue
        row = parse_template(line)
        section = headers[-1][1] if headers else ''
        if 'DexNav' in division:
            row['conditions'] += ['DexNav hidden Pokémon', 'After defeating or capturing Groudon/Kyogre']
        if title == 'Seafloor Cavern': row['conditions'].append(section)
        if title == 'Hoenn Route 120': row['conditions'].append(section)
        if row['habitat'] == 'Tall grass': row['conditions'].append('Long grass')
        if row['rate'] not in ('One',) and not re.search(r'\d+%', row['rate']):
            row['conditions'].append('Encounter rate: ' + row['rate'])
        for area in areas(title, 'Underwater' if title == 'Hoenn Route 107' and row['method'] == 'seaweed' else section, row['method']):
            rows.append({**row, 'area': area, 'src': 'bulbapedia',
                         'url': 'https://bulbapedia.bulbagarden.net/wiki/' + title.replace(' ', '_'),
                         'section': section})
    return rows


def gap_fill(rows, covered):
    """Presence anywhere in a PokeAPI table wins, independent of species."""
    return [{**r, 'versions': versions} for r in rows
            if (versions := [v for v in r['versions'] if (v, r['area'], r['method']) not in covered])]


if __name__ == '__main__':
    rows = []
    for path in sorted((ROOT / '.cache/bulbapedia').glob('*.wiki')):
        if path.stem.startswith('Walkthrough:') or path.stem == 'Horde Encounter': continue
        text = path.read_text()
        if re.search(r'\{\{catch/entryoras\|', text, re.I): rows.extend(parse_page(path.stem, text))
    output = ROOT / 'data/oras-bulbapedia.json'
    output.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(rows)} candidate rows in {output.relative_to(ROOT)}')
