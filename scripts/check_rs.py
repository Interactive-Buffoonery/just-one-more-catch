"""Offline regression checks for Ruby/Sapphire encounter corrections."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
game = json.loads((ROOT / "client/data/rs.ts").read_text().split("export default ")[1].rstrip(";\n"))
wynaut = next(p for p in game["dex"] if p["n"] == 360)
assert not any(r["place"] == "Route 130" and r["m"] == "walk" for r in wynaut["rows"])
mirage = [r for r in wynaut["rows"] if r["place"] == "Mirage Island" and r["m"] == "walk"]
assert mirage and all("mirage" in (r["need"] or []) for r in mirage)
assert {v for r in mirage for v in r["v"]} == {"R", "S"}
places = {r["place"] for p in game["dex"] for r in p["rows"]}
assert {"Safari Zone southwest", "Safari Zone southeast"} <= places
assert not {"Safari Zone Sw", "Safari Zone Se"} & places
print("Ruby/Sapphire: Mirage Island gate and Safari Zone labels ok")
