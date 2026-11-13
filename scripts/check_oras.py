"""Focused ORAS fallback regression checks; no network or cache required."""
import json
from pathlib import Path
from bulbapedia_encounters import gap_fill, parse_page, parse_template, split_args

ROOT = Path(__file__).resolve().parent.parent
assert split_args('a|{{tt|b|c}}|[[d|e]]|f') == ['a', '{{tt|b|c}}', '[[d|e]]', 'f']
ruby = parse_template('{{catch/entryoras|303|Mawile|yes|no|Cave|20, 22|15%|type1=Steel}}')
assert ruby['versions'] == ['omega-ruby']
assert (ruby['lo'], ruby['hi'], ruby['chance']) == (20, 22, 15)
sapphire = parse_template('{{Catch/entryoras|302|Sableye|no|yes|Cave|28-30|{{tt|35%|At night}}|type1=Dark}}')
assert sapphire['versions'] == ['alpha-sapphire']
assert (sapphire['lo'], sapphire['hi'], sapphire['chance']) == (28, 30, 35)
assert sapphire['conditions'] == ['At night']
trade = parse_template('{{Catch/entryoras|222|Corsola|yes|yes|Trade|tradenum=182|tradename=Bellossom|50|One}}')
assert trade['conditions'] == ['Trade a Bellossom']
form = parse_template('{{Catch/entryoras|025Ro|form=Rock Star|formlink=Cosplay Pikachu|Pikachu|yes|yes|Gift|20|One}}')
assert form['n'] == 25 and form['method'] == 'gift'
page = '''====Generation VI====
=====B1F=====
{{Catch/header|cave|no}}
{{catch/entryoras|303|Mawile|yes|no|Cave|20, 22|15%}}
{{Catch/div|cave|Exclusively as {{color2|000|DexNav#Hidden Pokémon|hidden Pokémon}}}}
{{Catch/entryoras|532|Timburr|yes|yes|Cave|22|??%}}
=====B2F=====
{{Catch/header|cave|no}}
{{Catch/entryoras|302|Sableye|no|yes|Cave|28-30|20%}}
'''
rows = parse_page('Granite Cave', page)
assert [r['area'] for r in rows] == ['Granite Cave B1F', 'Granite Cave B1F', 'Granite Cave B2F']
assert 'DexNav hidden Pokémon' in rows[1]['conditions']
assert 'DexNav hidden Pokémon' not in rows[2]['conditions']
# One API species owns the whole area/method table, including other species.
covered = {('omega-ruby', 'Granite Cave B1F', 'walk')}
filled = gap_fill(rows, covered)
assert all(not (r['area'] == 'Granite Cave B1F' and 'omega-ruby' in r['versions']) for r in filled)
assert next(r for r in filled if r['n'] == 532)['versions'] == ['alpha-sapphire']
assert next(r for r in filled if r['n'] == 302)['versions'] == ['alpha-sapphire']
assert gap_fill(rows, set()) == rows
assert all(r['method'] != 'surf' for r in rows)
surf = {**rows[1], 'method': 'surf'}
assert gap_fill([surf], covered) == [surf]
city = parse_page('Mossdeep City', '''====Generation VI====
{{Catch/entryoras|072|Tentacool|yes|yes|Surf|25|50%}}
{{Catch/entryoras|374|Beldum|yes|yes|Gift|1|One}}
''')
assert [r['area'] for r in city] == ['Mossdeep City', 'Mossdeep City Stevens House']

game = json.loads((ROOT / 'client/data/oras.ts').read_text().split('export default ')[1].rstrip(';\n'))
assert len(game['dex']) == 721
assert sum(bool(p['j']) for p in game['dex']) == 211
mon = lambda n: game['dex'][n - 1]
for n, version in [(383, 'o'), (382, 'a'), (641, 'o'), (642, 'a'), (643, 'o'), (644, 'a')]:
    assert mon(n)['rows'] and all(r['v'] == version for r in mon(n)['rows'])
assert not mon(385)['rows'], 'Jirachi must remain event-only'
for n in [345, 347]:
    assert any(r.get('src') == 'bulbapedia' and r['m'] == 'gift' for r in mon(n)['rows'])
for n in [19, 26, 103]:
    assert not mon(n).get('forms'), 'Alolan forms must not leak into ORAS'
assert len(mon(386)['forms']) == 4
for p in game['dex']:
    for r in p['rows']:
        assert 0 <= r['c'] <= 100 and 1 <= r['lo'] <= r['hi'] <= 100
        assert set(r['v']) <= {'o', 'a'}
        if r.get('src') == 'bulbapedia': assert r['url'].startswith('https://bulbapedia.bulbagarden.net/wiki/')
        if 'DexNav hidden Pokémon' in r['cond']: assert 'primal' in (r['need'] or [])
assert any(r['m'] == 'seaweed' for r in mon(369)['rows'])
assert any(r['m'] == 'old-rod' and r['src'] == 'bulbapedia' for r in mon(129)['rows'])
print('ORAS: template parsing, versions, table precedence, provenance and integration ok')
eon = {(n, r['m']): r['v'] for n in (380, 381) for r in mon(n)['rows']}
assert eon == {(380, 'static'): 'o', (380, 'gift'): 'a', (381, 'static'): 'a', (381, 'gift'): 'o'}, eon
assert [r['place'] for r in mon(27)['rows'] if r['m'] == 'horde'] == ['Route 111 Desert']
assert all(r['chap'] == 2 for p in game['dex'] for r in p['rows'] if r['place'] == 'Route 118')
