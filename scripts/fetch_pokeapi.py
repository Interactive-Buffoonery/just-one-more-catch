"""Fetch every pack's species data from PokeAPI into .cache/pokeapi.

Run by hand when the data needs a refresh. Every response is cached on disk,
so reruns only fetch what's missing. The site never calls PokeAPI.
"""
import json, os, re, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

API = "https://pokeapi.co/api/v2/"
CACHE = os.path.join(os.path.dirname(__file__), "..", ".cache", "pokeapi")
UA = {"User-Agent": "just-one-more-catch-data-build"}


def get(url):
    path = os.path.join(CACHE, re.sub(r"[^a-z0-9]+", "_", url.removeprefix(API)).strip("_") + ".json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                data = json.load(r)
            break
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    os.makedirs(CACHE, exist_ok=True)
    tmp = f"{path}.{threading.get_ident()}.tmp"
    with open(tmp, "w") as f:
        json.dump(data, f)
    os.replace(tmp, path)
    return data


def species(n):
    sp = get(f"{API}pokemon-species/{n}")
    for v in sp["varieties"]:  # alternate forms (Alolan Rattata) have their own encounters and types
        p = get(v["pokemon"]["url"])
        if len(sp["varieties"]) > 1 or len(p["forms"]) > 1:
            for form in p["forms"]:
                get(form["url"])
        get(v["pokemon"]["url"] + "encounters")
    get(sp["evolution_chain"]["url"])


if __name__ == "__main__":
    for dex in (2, 3, 4, 7, 12, 13, 14, 21):  # Kanto, original Johto, Hoenn, HGSS Johto, USUM Alola
        get(f"{API}pokedex/{dex}")
    with ThreadPoolExecutor(4) as ex:  # ponytail: 4 workers keeps us well inside PokeAPI fair use
        list(ex.map(species, range(1, 808)))
    import glob
    selected = set()
    for path in glob.glob(os.path.join(os.path.dirname(__file__), "..", "data", "*.json")):
        with open(path) as f:
            for forms in json.load(f).get("obtainable_forms", {}).values():
                selected.update(forms)
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(lambda slug: get(f"{API}pokemon-form/{slug}"), sorted(selected)))
    print("cached", len(os.listdir(CACHE)), "responses")
