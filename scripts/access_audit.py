"""Audit where each encounter area needs a badge, HM or item, using Bulbapedia.

Usage:
  python3 scripts/access_audit.py serve [port]         # GET: titles to resolve; POST: save a page into .cache/bulbapedia
  python3 scripts/access_audit.py areas <pack>         # per-area work list for reviewers, as JSON
  python3 scripts/access_audit.py check <findings.json>...         # merge findings, drop any whose quote isn't on the page

Bulbapedia blocks scripted fetches, so pages are read in a normal browser
(the Playwright MCP browser) and POSTed to `serve`, which writes
.cache/bulbapedia/<Title>.wiki and .cache/bulbapedia/titles.json.
"""
import json, os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import unquote

ROOT = os.path.join(os.path.dirname(__file__), "..")
POKEAPI = os.path.join(ROOT, ".cache", "pokeapi")
WIKI = os.path.join(ROOT, ".cache", "bulbapedia")
PACKS = ["rs", "crystal", "hgss", "frlg", "usum", "bw", "xy"]


def nice(slug):
    s = re.sub(r"-area$", "", slug)
    s = re.sub(r"^(johto|kanto|alola)-", "", s)
    return s.replace("-", " ").title().replace("Mt ", "Mt. ")


def as_list(v):
    v = v["needs"] if isinstance(v, dict) else v
    return [v] if isinstance(v, str) else list(v)


def areas(pack):
    game = json.load(open(os.path.join(ROOT, "data", pack + ".json")))
    out = {}
    for n in range(1, game["species"] + 1):
        sp = json.load(open(os.path.join(POKEAPI, f"pokemon_species_{n}.json")))
        name = next(x["name"] for x in sp["names"] if x["language"]["name"] == "en")
        forms = [v["pokemon"]["url"].rstrip("/").split("/")[-1] for v in sp["varieties"]]
        for a in [a for i in forms for a in json.load(open(os.path.join(POKEAPI, f"pokemon_{i}_encounters.json")))]:
            loc = nice(a["location_area"]["name"])
            if any(re.search(p, loc) for p in game["drop"]):
                continue
            for v in a["version_details"]:
                if v["version"]["name"] not in game["versions"]:
                    continue
                if any((loc == place or loc.startswith(place + " ")) and v["version"]["name"] not in allowed
                       for place, allowed in game.get("area_versions", {}).items()):
                    continue
                for d in v["encounter_details"]:
                    method = d["method"]["name"]
                    if method in game.get("drop_methods", []):
                        continue
                    if any(g["n"] == n and (loc == g["place"] or loc.startswith(g["place"] + " "))
                           and g.get("m", method) == method and v["version"]["name"] in g.get("versions", game["versions"])
                           for g in game.get("drop_rows", [])):
                        continue
                    out.setdefault(loc, set()).add((n, name, d["method"]["name"]))
    return game, out


def candidates(area, pack):
    """Bulbapedia titles to try for an area, most specific first."""
    area = area.removeprefix("Unova ") if pack == "bw" else area
    a = area.replace(" Of ", " of ").replace(" The ", " the ").replace("Pokemon", "Pokémon")
    for x, y in [("Ss Anne", "S.S. Anne"), ("Dragons Den", "Dragon's Den"), ("Digletts", "Diglett's"),
                 ("Team Rocket Hq", "Team Rocket HQ"), ("Silph Co", "Silph Co."), ("Kirks House", "Kirk's House"),
                 ("Bills House", "Bill's House"), ("Groundon", "Groudon"), ("Hauoli", "Hau'oli"), ("Ulaula", "Ula'ula"),
                 ("Kalae", "Kala'e"), ("Team Rockets Castle", "Team Rocket's Castle"), ("Trainers School", "Trainers' School")]:
        a = a.replace(x, y)
    if pack == "rs":
        a = re.sub(r"^Hoenn ", "", a)
        if a.startswith("Route 119 Weather Institute"):
            return ["Weather Institute", "Walkthrough:Pokémon Ruby and Sapphire/Part 11"]
        if a == "Roaming Hoenn":
            return ["Roaming Pokémon"]
        if a == "Mirage Island":
            return ["Mirage Island (Generation III)"]
        if a.startswith("Victory Road"):
            return ["Victory Road (Hoenn)"]
        if a.startswith("Safari Zone"):
            return ["Hoenn Safari Zone"]
        if a.startswith("Route "):
            return ["Hoenn " + re.match(r"Route \d+", a)[0]]
    if pack == "bw":
        if a.startswith("Victory Road") or a.startswith("Trial Chamber"):
            return ["Victory Road (Black and White)"]
        if a.startswith("Challengers Cave"):
            return ["Challenger's Cave"]
        if a.startswith("Guidance Chamber"):
            return ["Mistralton Cave"]
        if a.startswith("Ns Castle"):
            return ["N's Castle"]
    if pack == "xy":
        a = re.sub(r"^Kalos ", "", a)
        if a.startswith("Friend Safari"):
            return ["Friend Safari"]
        if a == "Berry Fields":
            return ["Berry fields (Kalos)"]
        if a == "Sea Spirits Den":
            return ["Sea Spirit's Den"]
        if a == "Team Flare Secret Hq":
            return ["Walkthrough:Pokémon X and Y/Part 11"]
        if a.startswith("Victory Road"):
            return ["Victory Road (Kalos)"]
        if a.startswith("Unknown Dungeon"):
            return ["Unknown Dungeon (Kalos)"]
    route = re.match(r"(?:Sea )?Route (\d+)", a)
    if route:
        n = int(route.group(1))
        return [f"{'Unova' if pack == 'bw' else 'Kalos' if pack == 'xy' else 'Alola' if pack == 'usum' else 'Johto' if 29 <= n <= 48 else 'Kanto'} Route {n}"]
    if a.startswith("Safari Zone"):
        return ["Johto Safari Zone" if pack == "hgss" else "Kanto Safari Zone"]
    if a.endswith(" Chamber"):
        return ["Tanoby Ruins"]
    if a.startswith("Mt. Silver") and a != "Mt. Silver Outside":
        return ["Mt. Silver Cave"]
    words = re.sub(r" (\d+F|B\d+F)( Top)?$", "", a).split()
    return [" ".join(words[:i]) for i in range(len(words), min(len(words), 2) - 1, -1)]


def wiki_path(title):
    return os.path.join(WIKI, title.replace("/", "_") + ".wiki")


# Disambiguation or overview pages, swapped for the page that has the encounter tables
SPECIFIC = {"Pokémon Mansion": "Pokémon Mansion (Kanto)", "Underground Path": "Underground Path (Kanto Routes 5–6)",
            "Victory Road": "Victory Road (Kanto)", "Power plant": "Kanto Power Plant"}


def page_for(area, pack, resolved):
    for t in candidates(area, pack):
        if pack in ("bw", "xy") and os.path.exists(wiki_path(t)):
            return t
        if resolved.get(t):
            return SPECIFIC.get(resolved[t], resolved[t])
    if pack == "rs":
        return next((t for t in candidates(area, pack) if os.path.exists(wiki_path(t))), None)
    return None


SKIP = re.compile(r"manga|animation|anime|trivia|music|other languages|names|spin-off|references|walking pok|slogan|tcg|related|demographics|poké mart|gallery|artwork|development|novels|magazines|terminology|trainer tips|preview", re.I)


def trimmed(title):
    """The page without anime, trivia and other sections that never say how to reach a place."""
    parts = re.split(r"(?m)^(?===[^=])", open(wiki_path(title)).read())
    keep = [p for p in parts if not SKIP.search(p.split("\n", 1)[0]) or not p.startswith("==")]
    path = os.path.join(WIKI, "trimmed", os.path.basename(wiki_path(title)))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(re.sub(r"(?m)^\[\[[a-z]{2}:.*\]\]\n?", "", "".join(keep)))
    return path


def norm(s):
    s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"'{2,}|\{\{[^{}|]*\||\}\}", "", s)
    return re.sub(r"\s+", " ", s).lower().strip()


def all_candidates():
    return sorted({t for pack in PACKS for area in areas(pack)[1] for t in candidates(area, pack)})


def cmd_serve(port):
    os.makedirs(WIKI, exist_ok=True)

    class H(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps(all_candidates()).encode())

        def do_POST(self):
            name = unquote(self.path.lstrip("/"))
            body = self.rfile.read(int(self.headers["Content-Length"]))
            path = os.path.join(WIKI, "titles.json") if name == "titles.json" else wiki_path(name)
            with open(path, "wb") as f:
                f.write(body)
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

    HTTPServer(("127.0.0.1", port), H).serve_forever()


def cmd_areas(pack):
    sys.argv = [sys.argv[0], pack]
    sys.path.insert(0, os.path.dirname(__file__))
    import build_data
    game, found = areas(pack)
    resolved = json.load(open(os.path.join(WIKI, "titles.json")))
    rows = []
    for area in sorted(found):
        key = next((k for k in game["needs"] if area == k or area.startswith(k + " ")), None)
        page = page_for(area, pack, resolved)
        rows.append({
            "area": area,
            "chapter": (lambda i: f"{i}: {game['chapters'][i]['title']} (needs {game['chapters'][i]['needs'] or 'nothing'})")(build_data.chapter_of(build_data.base_place(area))),
            "page": page,
            "wiki": os.path.relpath(trimmed(page), ROOT) if page else None,
            "species": sorted({f"{name} ({m})" for _, name, m in found[area]}),
            "area_needs": as_list(game["needs"][key]) if key else [],
            "row_needs": [g for g in game.get("row_needs", []) if area == g["place"] or area.startswith(g["place"] + " ")],
        })
    print(json.dumps(rows, indent=1, ensure_ascii=False))


def cmd_check(*paths):
    """Merge reviewer findings; drop gate/chapter findings whose quote isn't on the page."""
    resolved = json.load(open(os.path.join(WIKI, "titles.json")))
    kept, dropped = [], []
    for path in paths:
        for f in json.load(open(path)):
            if f["verdict"] in ("gate", "chapter"):
                page = page_for(f["area"], f["pack"], resolved)
                text = norm(open(wiki_path(page)).read()) if page and os.path.exists(wiki_path(page)) else ""
                quote = norm(f.get("quote", ""))
                if not (len(quote.split()) >= 6 and quote in text):
                    dropped.append(f)
                    continue
            kept.append(f)
    seen = {(f["pack"], f["area"]) for f in kept + dropped}
    missing = [(p, a) for p in PACKS for a in areas(p)[1] if (p, a) not in seen]
    json.dump(kept, sys.stdout, indent=1, ensure_ascii=False)
    print(f"\nkept {len(kept)}; dropped {len(dropped)} without a matching quote: {[(d['pack'], d['area']) for d in dropped]}; not reviewed: {missing}", file=sys.stderr)


if __name__ == "__main__":
    cmd, *args = sys.argv[1:] or ["help"]
    if cmd == "serve":
        cmd_serve(int(args[0]) if args else 8765)
    elif cmd == "areas":
        cmd_areas(args[0])
    elif cmd == "check":
        cmd_check(*args)
    else:
        sys.exit(__doc__)
