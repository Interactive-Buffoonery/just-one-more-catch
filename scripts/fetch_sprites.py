"""Download Pokémon and badge sprites from the PokeAPI sprites repo into public/.

Run by hand when a pack is added: uv run scripts/fetch_sprites.py
Files already on disk are skipped, and the site serves its own copies, so
visitors never touch PokeAPI or GitHub.

Every Pokémon sprite is then centred on its canvas, and client/data/sprite-fit.ts
records the ring zoom for the ones too big for the default. scripts/check_sprites.mjs
(part of pnpm check) fails if a pack skips this step.
"""
# /// script
# dependencies = ["pillow"]
# ///
import glob, json, math, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/"
ROOT = os.path.join(os.path.dirname(__file__), "..")
UA = {"User-Agent": "just-one-more-catch-data-build"}
ART = {
    "emerald": "pokemon/versions/generation-iii/emerald/",
    "gs": "pokemon/versions/generation-ii/gold/transparent/",
    "rb": "pokemon/versions/generation-i/red-blue/transparent/",
    "yellow": "pokemon/versions/generation-i/yellow/transparent/",
    "crystal": "pokemon/versions/generation-ii/crystal/transparent/",
    "frlg": "pokemon/versions/generation-iii/firered-leafgreen/",
    "hgss": "pokemon/versions/generation-iv/heartgold-soulsilver/",
    "usum": "pokemon/",
    "oras": "pokemon/",
}
# PokeAPI badge IDs: Kanto 1–8, Johto 9–16, Hoenn 17–24, in gym order
BADGES = ["Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth",
          "Zephyr", "Hive", "Plain", "Fog", "Storm", "Mineral", "Glacier", "Rising",
          "Stone", "Knuckle", "Dynamo", "Heat", "Balance", "Feather", "Mind", "Rain"]
# Kit items: rods are their own items; moves use a disc in the move's type colour
ITEMS = {"flash": "tm-normal", "dive": "tm-water", "mach-bike": "mach-bike", "acro-bike": "acro-bike", "wailmer-pail": "wailmer-pail", "old-rod": "old-rod", "good-rod": "good-rod", "super-rod": "super-rod", "headbutt": "tm-normal", "cut-hm": "tm-normal",
         "yellow-cut": "tm-normal", "rock-smash": "tm-fighting", "surf": "tm-water", "whirlpool": "tm-water", "waterfall": "tm-water", "strength": "tm-normal", "rock-climb": "tm-normal", "bicycle": "bicycle",
         # USUM: Poké Ride moves have no item art, so they use the ride Pokémon; Island Scan uses Rotom
         "fishing-rod": "fishing-rod", "tauros": "../pokemon/128", "mudsdale": "../pokemon/750", "machamp": "../pokemon/68", "island-scan": "../pokemon/479"}
# Alola's trial rewards are Z-Crystals, so its badges use the crystal's bag icon
Z_CRYSTALS = ["Normalium", "Fightinium", "Waterium", "Firium", "Grassium", "Rockium",
              "Electrium", "Ghostium", "Darkinium", "Dragonium", "Fairium", "Groundium"]


def form(n, game):
    """The sprite id for species n: the pack's form from "forms" (Alolan Rattata is 10091), else n."""
    load = lambda name: json.load(open(os.path.join(ROOT, ".cache", "pokeapi", name + ".json")))
    ids = [v["pokemon"]["url"].rstrip("/").split("/")[-1] for v in load(f"pokemon_species_{n}")["varieties"]]
    return next((i for i in ids if load(f"pokemon_{i}")["name"] in game.get("forms", [])), n)


def fetch(job):
    url, path = job
    if os.path.exists(path):
        return
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                data = r.read()
            break
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path + ".tmp", "wb") as f:
        f.write(data)
    os.replace(path + ".tmp", path)


ZOOM = 130  # the ring shows sprites at 130% (.mon .sprite in client/styles.css)


def centre(path):
    """Centre the artwork on its canvas. Returns the largest ring zoom, in percent, that keeps it inside the circle."""
    from PIL import Image
    im = Image.open(path)
    w, h = im.size
    alpha = im.convert("RGBA").getchannel("A")
    x0, y0, x1, y1 = box = alpha.getbbox()
    to = ((w - (x1 - x0)) // 2, (h - (y1 - y0)) // 2)
    if to != (x0, y0):
        clear = im.info.get("transparency")
        if isinstance(clear, bytes):
            clear = clear.find(0)
        if im.mode == "P" and isinstance(clear, int) and clear >= 0:
            out = Image.new("P", (w, h), clear)
            out.putpalette(im.getpalette())
            out.paste(im.crop(box), to)
            out.save(path, transparency=im.info["transparency"], optimize=True)
        else:
            out = Image.new("RGBA", (w, h))
            out.paste(im.convert("RGBA").crop(box), to)
            out.save(path, optimize=True)
        alpha = Image.open(path).convert("RGBA").getchannel("A")
    px = alpha.load()
    # Farthest opaque pixel corner from the canvas centre, squared, in half pixels
    far = max(max(abs(2 * x - w), abs(2 * x + 2 - w)) ** 2 + max(abs(2 * y - h), abs(2 * y + 2 - h)) ** 2
              for y in range(h) for x in range(w) if px[x, y])
    return min(ZOOM, math.isqrt((100 * w) ** 2 // far))


def centre_all():
    fit = {}
    for pack in ART:
        zoom = {}
        for path in glob.glob(os.path.join(ROOT, "public", "sprites", pack, "**", "*.png"), recursive=True):
            key = os.path.basename(path)[:-4]
            n = int(key) if key.isdigit() else key
            zoom[n] = min(zoom.get(n, ZOOM), centre(path))
        fit[pack] = {n: z for n, z in sorted(zoom.items(), key=lambda x: (isinstance(x[0], str), x[0])) if z < ZOOM}
    with open(os.path.join(ROOT, "client", "data", "sprite-fit.ts"), "w") as f:
        f.write("// Generated by scripts/fetch_sprites.py. Do not edit.\n")
        f.write(f"export default {json.dumps(fit, separators=(',', ':'))} as Record<string, Record<string, number>>;\n")


if __name__ == "__main__":
    jobs = [(f"{BASE}badges/{i + 1}.png", os.path.join(ROOT, "public", "badges", f"{b.lower()}.png")) for i, b in enumerate(BADGES)]
    jobs += [(f"{BASE}items/{z.lower()}-z--bag.png", os.path.join(ROOT, "public", "badges", f"{z.lower()}.png")) for z in Z_CRYSTALS]
    jobs += [(f"{BASE}items/{src}.png", os.path.join(ROOT, "public", "items", f"{key}.png")) for key, src in ITEMS.items()]
    # Gen 1 has no shiny palette; retain the original art for the tracker’s shiny paths.
    for pack, path in ART.items():
        game = json.load(open(os.path.join(ROOT, "data", pack + ".json")))
        for shiny in ("", "shiny/"):
            jobs += [(f"{BASE}{path}{'' if game['gen'] == 'generation-i' else shiny}{form(n, game)}.png", os.path.join(ROOT, "public", "sprites", pack, shiny, f"{n}.png")) for n in range(1, game["species"] + 1)]
    for pack in ART:
        game = json.load(open(os.path.join(ROOT, "data", pack + ".json")))
        for forms in game.get("obtainable_forms", {}).values():
            for slug in forms:
                data = json.load(open(os.path.join(ROOT, ".cache", "pokeapi", "pokemon_form_" + slug.replace("-", "_") + ".json")))
                # Form endpoints include cosmetic sprites that have no separate pokemon variety.
                for shiny in ("", "shiny/"):
                    url = data["sprites"]["front_shiny" if shiny else "front_default"]
                    assert url, f"No sprite for {pack} {shiny}{slug}"
                    url = f"{BASE}{ART[pack]}{shiny}{url.rsplit('/', 1)[-1]}"
                    jobs.append((url, os.path.join(ROOT, "public", "sprites", pack, "forms", shiny, slug + ".png")))
    with ThreadPoolExecutor(4) as ex:  # ponytail: 4 workers, same fair-use pace as fetch_pokeapi.py
        list(ex.map(fetch, jobs))
    centre_all()
    print(len(jobs), "sprites in public/")
