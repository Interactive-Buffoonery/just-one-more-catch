"""Build client/data/<pack>.ts from the PokeAPI cache and data/<pack>.json.

Usage: python3 scripts/build_data.py hgss
Run scripts/fetch_pokeapi.py first. Fails on any place no chapter claims.
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
CACHE = os.path.join(ROOT, ".cache", "pokeapi")
PACK = sys.argv[1] if len(sys.argv) > 1 else sys.exit("Usage: build_data.py <pack>")
GAME = json.load(open(os.path.join(ROOT, "data", PACK + ".json")))
VERSIONS = GAME["versions"]
DEFAULT_COND = {"radio-off", "swarm-no", "bug-catching-contest-no", "johto-safari-blocks-inactive", "story-progress-before-national-dex"}
TIME = {"time-morning", "time-day", "time-night"}
GENS = ["generation-i", "generation-ii", "generation-iii", "generation-iv", "generation-v", "generation-vi", "generation-vii", "generation-viii", "generation-ix"]


def cached(name):
    with open(os.path.join(CACHE, name + ".json")) as f:
        return json.load(f)


def nice(slug):
    s = re.sub(r"-area$", "", slug)
    s = re.sub(r"^(johto|kanto|alola)-", "", s)
    return s.replace("-", " ").title().replace("Mt ", "Mt. ")


def pretty(s):
    for a, b in [("Kings Rock", "King's Rock"), ("Dragons Den", "Dragon's Den"), ("Team Rocket Hq", "Team Rocket HQ"),
                 ("Digletts", "Diglett's"), ("Kirks House", "Kirk's House"), ("Bills House", "Bill's House"),
                 ("Ss Anne", "S.S. Anne"), ("Silph Co", "Silph Co."), (" Of ", " of "), ("Pokemon", "Pokémon"),
                 (" City Entrance", " (city side)"), ("Hauoli", "Hau'oli"), ("Ulaula", "Ula'ula"), ("Poke Pelago", "Poké Pelago"), ("Poke Mart", "Poké Mart"),
                 ("Team Rockets Castle", "Team Rocket's Castle"), ("Totems Den", "Totem's Den")]:
        s = s.replace(a, b)
    return s


def base_place(loc):
    loc = GAME["rename"].get(loc, loc)
    if not GAME.get("keep_floors"):
        loc = re.sub(r" (\d+F|B\d+F)( Top)?$", "", loc)
        loc = GAME["rename"].get(loc, loc)
    loc = re.sub(r"^Mt\. Moon Mt\. Moon ", "Mt. Moon ", loc)
    return re.sub(r"^Victory Road 1$", "Victory Road", loc)


PLACES = [(p, i) for i, c in enumerate(GAME["chapters"]) for p in c["places"]]
unmatched = set()
need_hits = set()
row_hits = set()
drop_hits = set()


def chapter_of(place):
    hits = [(p, i) for p, i in PLACES if place == p or place.startswith(p + " ")]
    if not hits:
        unmatched.add(place)
        return -1
    return max(hits, key=lambda h: len(h[0]))[1]


def gen4_types(p):
    for past in sorted(p.get("past_types", []), key=lambda x: GENS.index(x["generation"]["name"])):
        if GENS.index(past["generation"]["name"]) >= GENS.index(GAME["gen"]):
            return [t["type"]["name"] for t in past["types"]]
    return [t["type"]["name"] for t in p["types"]]


def label(slug):
    return slug.replace("-", " ").title()


def evo_text(chain, name):
    def walk(node):
        if node["species"]["name"] == name:
            return node["evolution_details"]
        for c in node["evolves_to"]:
            r = walk(c)
            if r is not None:
                return r
    for d in walk(chain) or []:
        t, parts = d["trigger"]["name"], []
        if d.get("min_level"): parts.append(f"Lv {d['min_level']}")
        if d.get("item"): parts.append(label(d["item"]["name"]))
        if t == "trade": parts.append("Trade" + (f" holding {label(d['held_item']['name'])}" if d.get("held_item") else ""))
        elif d.get("held_item"): parts.append(f"Level up holding {label(d['held_item']['name'])}")
        if d.get("min_happiness"): parts.append("High friendship")
        if d.get("min_beauty"): parts.append("High beauty")
        if d.get("time_of_day"): parts.append(d["time_of_day"].title())
        if d.get("known_move"): parts.append(f"Knows {label(d['known_move']['name'])}")
        if d.get("known_move_type"): parts.append(f"Knows a {d['known_move_type']['name']} move")
        if d.get("location"): parts.append(f"Level up at {label(d['location']['name'])}")
        if d.get("party_species"): parts.append(f"{label(d['party_species']['name'])} in party")
        if d.get("gender") == 1: parts.append("Female")
        if d.get("gender") == 2: parts.append("Male")
        if d.get("relative_physical_stats") is not None: parts.append({1: "Attack higher", -1: "Defense higher", 0: "Attack equals Defense"}[d["relative_physical_stats"]])
        if parts:
            return " + ".join(parts)
    return None


def as_list(v):
    """An area need: a string, a list, or {"needs": ..., "src": url, "quote": ...} when it has a source."""
    if isinstance(v, dict):
        v = v["needs"]
    return [v] if isinstance(v, str) else list(v)


def matches(loc, k):
    return loc == k or loc.startswith(k + " ")


def rows_for(encounters, version, n):
    merged = {}
    source_version = GAME.get("version_sources", {}).get(version, version)
    for a in encounters:
        if not any(v["version"]["name"] == source_version for v in a["version_details"]):
            continue
        loc = nice(a["location_area"]["name"])
        if any(re.search(p, loc) for p in GAME["drop"]):
            continue
        if any(matches(loc, place) and version not in allowed for place, allowed in GAME.get("area_versions", {}).items()):
            continue
        key = next((k for k in GAME["needs"] if matches(loc, k)), None)
        area_need = as_list(GAME["needs"][key]) if key else []
        need_hits.add(key)
        place = base_place(loc)
        chap = chapter_of(place)
        for v in a["version_details"]:
            if v["version"]["name"] != source_version:
                continue
            for d in v["encounter_details"]:
                src = d["method"]["name"]
                if src in GAME.get("drop_methods", []):
                    continue
                drops = {i for i, g in enumerate(GAME.get("drop_rows", []))
                         if g["n"] == n and matches(loc, g["place"]) and g.get("m", src) == src
                         and version in g.get("versions", VERSIONS)}
                drop_hits.update(drops)
                if drops:
                    continue
                cond = sorted(GAME.get("condition_replacements", {}).get(c["name"], c["name"]) for c in d["condition_values"] if c["name"] not in DEFAULT_COND)
                m = GAME.get("methods", {}).get(src, src)
                extra = []
                row_place = place
                for i, g in enumerate(GAME.get("row_needs", [])):
                    if g["n"] == n and matches(loc, g["place"]) and g.get("m", m) == m and version in g.get("versions", VERSIONS):
                        row_hits.add(i)
                        extra += g["needs"]
                        row_place = g.get("show_as", row_place)
                need = tuple(dict.fromkeys(area_need + extra)) or None
                k = (row_place, m, need, tuple(cond))
                r = merged.setdefault(k, {"place": pretty(row_place), "chap": chap, "m": k[1], "need": list(need) if need else None, "cond": cond, "lo": 99, "hi": 0, "by": {}})
                r["lo"] = min(r["lo"], d["min_level"]); r["hi"] = max(r["hi"], d["max_level"]); r["by"][src] = r["by"].get(src, 0) + d["chance"]
    # methods folded into one (Crystal's three Headbutt tree tables) keep the best table's odds
    for r in merged.values():
        r["c"] = min(max(r.pop("by").values()), 100)
    # rows that differ only by time of day and cover all three times become one "any time" row
    groups = {}
    for r in merged.values():
        groups.setdefault((r["place"], r["m"], tuple(r["need"] or ()), tuple(c for c in r["cond"] if c not in TIME)), []).append(r)
    out = []
    for g in groups.values():
        times = {c for r in g for c in r["cond"] if c in TIME}
        same = all(any(c in TIME for c in r["cond"]) and (r["c"], r["lo"], r["hi"]) == (g[0]["c"], g[0]["lo"], g[0]["hi"]) for r in g)
        if len(g) > 1 and times == TIME and same:
            out.append({**g[0], "cond": [c for c in g[0]["cond"] if c not in TIME]})
        else:
            out.extend(g)
    return out


def varieties(sp):
    return [v["pokemon"]["url"].rstrip("/").split("/")[-1] for v in sp["varieties"]]


def short_form(label, n):
    if label == "Normal" and n in (26, 103, 105):
        return "Kanto"
    label = re.sub(r"^Type: |^Alolan Form$|\s(Style|Core|Pattern|Flower|Cloak|Forme?|Rotom|Kyurem)$", lambda m: "Alolan" if m.group(0) == "Alolan Form" else "", label)
    return label


def form_list(n):
    forms = []
    ids = GAME["obtainable_forms"][str(n)]
    traded = GAME.get("traded_forms", {}).get(str(n), [])
    assert set(traded) <= set(ids), f"Unknown traded form for {n}"
    assert ids[0] not in traded, f"Default form cannot be traded: {n}"
    for slug in ids:
        f = cached("pokemon_form_" + slug.replace("-", "_"))
        label = next((x["name"] for x in f["form_names"] if x["language"]["name"] == "en"), f["form_name"].replace("-", " ").title() or "Normal")
        label = short_form(label, n)
        if n == 201:
            label = {"exclamation": "!", "question": "?"}.get(f["form_name"], f["form_name"].upper())
        forms.append({"id": slug, "name": label, **({"trade": True} if slug in traded else {})})
    return forms


def species(n, johto):
    sp = cached(f"pokemon_species_{n}")
    # a pack's "forms" names the form its wild Pokémon are (Alolan Rattata); every form's encounters count for the species
    p = next((cached(f"pokemon_{i}") for i in varieties(sp) if cached(f"pokemon_{i}")["name"] in GAME.get("forms", [])), cached(f"pokemon_{n}"))
    chain_id = sp["evolution_chain"]["url"].rstrip("/").split("/")[-1]
    chain = cached(f"evolution_chain_{chain_id}")["chain"]
    enc = [a for i in varieties(sp) for a in cached(f"pokemon_{i}_encounters")]
    name = lambda s: next(x["name"] for x in s["names"] if x["language"]["name"] == "en")
    rows = {}
    for version, v in VERSIONS.items():
        for r in rows_for(enc, version, n):
            key = json.dumps(r, sort_keys=True)
            rows[key] = rows.get(key, "") + v
    pre = sp["evolves_from_species"]
    if GAME["gen"] == "generation-i" and pre and int(pre["url"].rstrip("/").split("/")[-1]) > 151:
        pre = None
    if GAME.get("historical_pre_evolutions") and pre:
        pre_species = cached(f"pokemon_species_{pre['url'].rstrip('/').split('/')[-1]}")
        if GENS.index(pre_species["generation"]["name"]) > GENS.index(GAME["gen"]):
            pre = None
    historical = GAME["gen"] == "generation-i" or GAME.get("historical_pre_evolutions")
    evo = None if historical and not pre else evo_text(chain, sp["name"])
    override = GAME.get("evolution_overrides", {}).get(str(n), {})
    evo = override.get("evo", evo) if isinstance(override, dict) else override
    return {
        "n": n, "genderRate": sp["gender_rate"], "j": johto.get(n), "name": name(sp), "types": gen4_types(p),
        **({"forms": form_list(n)} if str(n) in GAME.get("obtainable_forms", {}) else {}),
        "from": name(cached(f"pokemon_species_{pre['url'].rstrip('/').split('/')[-1]}")) if pre else None,
        "evo": evo, "baby": sp["is_baby"],
        "rows": sorted(({**json.loads(k), "v": v} for k, v in rows.items()), key=lambda r: (r["chap"], -r["c"])),
    }


if __name__ == "__main__":
    johto = {int(e["pokemon_species"]["url"].rstrip("/").split("/")[-1]): e["entry_number"] for e in cached(f"pokedex_{GAME['pokedex']}")["pokemon_entries"]}
    dex = [species(n, johto) for n in range(1, GAME["species"] + 1)]
    if unmatched:
        sys.exit("No chapter for: " + ", ".join(sorted(unmatched)))
    assert sum(1 for p in dex if p["j"]) == len(johto)
    assert not set(GAME["needs"]) - need_hits, f"needs match no area: {set(GAME['needs']) - need_hits}"
    events = GAME.get("events", [])
    ids = {e["id"] for e in events}
    assert len(ids) == len(events), "duplicate event id"
    assert not set(range(len(GAME.get("row_needs", [])))) - row_hits, f"row_needs match no row: {[g for i, g in enumerate(GAME['row_needs']) if i not in row_hits]}"
    assert not set(range(len(GAME.get("drop_rows", [])))) - drop_hits, f"drop_rows match no row: {[g for i, g in enumerate(GAME['drop_rows']) if i not in drop_hits]}"
    for e in events:
        assert re.fullmatch(r"[a-z][a-z0-9-]*", e["id"]), f"event id must be a lowercase slug: {e['id']}"
        assert 0 <= e["chap"] < len(GAME["chapters"]), f"{e['id']}: no chapter {e['chap']}"
        assert set(e.get("after", [])) <= ids, f"{e['id']}: unknown after {set(e['after']) - ids}"
    # The app finds an event done by walking to its `by` event and to every event listing it in `after`
    edges = {e["id"]: [d["id"] for d in events if e["id"] in d.get("after", [])] + [b for b in [e.get("by")] if b in ids] for e in events}
    def walk(i, path):
        assert i not in path, f"event loop: {' -> '.join(path + [i])}"
        for j in edges[i]:
            walk(j, path + [i])
    for i in edges:
        walk(i, [])
    # Ticking events in order, with every badge and item, must reach every event
    ticked, by_id = set(), {e["id"]: e for e in events}
    ready = lambda e: e["id"] not in ticked and set(e.get("after", [])) <= ticked and {n for n in GAME["chapters"][e["chap"]]["needs"] if n in ids} <= ticked
    while (nxt := [e["id"] for e in events if ready(e)]):
        ticked |= set(nxt)
    assert ticked == ids, f"events never asked (their chapter needs them first): {sorted(ids - ticked)}"
    # Badges are capitalised; anything else that isn't an event is a kit item and needs an icon
    used = [v for n in GAME["needs"].values() for v in as_list(n)] + [v for g in GAME.get("row_needs", []) for v in g["needs"]] + [v for c in GAME["chapters"] for v in c["needs"] + ([c["kit"]] if c.get("kit") else [])] + [e["by"] for e in events if "by" in e]
    kit = {v for v in used if v not in ids and not v[0].isupper()}
    items = {f[:-4] for f in os.listdir(os.path.join(ROOT, "public", "items"))}
    assert not ids & items, f"event id clashes with an item: {ids & items}"
    missing = [k for k in kit if not os.path.exists(os.path.join(ROOT, "public", "items", k + ".png"))]
    assert not missing, f"needs/kit with no item: {missing}"
    if PACK == "hgss":
        assert len(johto) == 256
        assert next(p for p in dex if p["n"] == 35)["types"] == ["normal"], "Clefairy should be Normal in Gen 4"
        assert any(r["m"] == "gift" and r["place"] == "New Bark Town" for r in next(p for p in dex if p["n"] == 152)["rows"])
    game = {"chapters": [{**c, "places": [pretty(p) for p in c["places"]]} for c in GAME["chapters"]], "events": events, "dex": dex}
    out = os.path.join(ROOT, "client", "data")
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, PACK + ".ts"), "w") as f:
        f.write("// Generated by scripts/build_data.py from PokeAPI. Do not edit.\nexport default " + json.dumps(game, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(len(dex), "species,", sum(len(p["rows"]) for p in dex), "rows,", os.path.getsize(os.path.join(out, PACK + ".ts")), "bytes")
