"""Download Pokémon and badge sprites from the PokeAPI sprites repo into public/.

Run by hand when a pack is added. Files already on disk are skipped, and the
site serves its own copies, so visitors never touch PokeAPI or GitHub.
"""
import json, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/"
ROOT = os.path.join(os.path.dirname(__file__), "..")
UA = {"User-Agent": "just-one-more-catch-data-build"}
ART = {
    "hgss": "pokemon/versions/generation-iv/heartgold-soulsilver/",
    "crystal": "pokemon/versions/generation-ii/crystal/transparent/",
    "frlg": "pokemon/versions/generation-iii/firered-leafgreen/",
}
# PokeAPI numbers badges 1-8 for Kanto and 9-16 for Johto, in gym order
BADGES = ["Boulder", "Cascade", "Thunder", "Rainbow", "Soul", "Marsh", "Volcano", "Earth",
          "Zephyr", "Hive", "Plain", "Fog", "Storm", "Mineral", "Glacier", "Rising"]


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


if __name__ == "__main__":
    jobs = [(f"{BASE}badges/{i + 1}.png", os.path.join(ROOT, "public", "badges", f"{b.lower()}.png")) for i, b in enumerate(BADGES)]
    for pack, path in ART.items():
        count = json.load(open(os.path.join(ROOT, "data", pack + ".json")))["species"]
        jobs += [(f"{BASE}{path}{n}.png", os.path.join(ROOT, "public", "sprites", pack, f"{n}.png")) for n in range(1, count + 1)]
    with ThreadPoolExecutor(4) as ex:  # ponytail: 4 workers, same fair-use pace as fetch_pokeapi.py
        list(ex.map(fetch, jobs))
    print(len(jobs), "sprites in public/")
