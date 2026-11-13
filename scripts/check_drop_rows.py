"""Check that a sourced row exclusion preserves neighbouring encounters."""
import importlib.util
import sys
from pathlib import Path

sys.argv = [sys.argv[0], "rs"]
spec = importlib.util.spec_from_file_location("build_data", Path(__file__).with_name("build_data.py"))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
build.GAME = {
    "drop": [], "rename": {}, "needs": {},
    "drop_rows": [{"place": "New Mauville", "n": 101, "m": "static", "versions": ["ruby"]}],
}
build.VERSIONS = {"ruby": "R", "sapphire": "S"}
build.PLACES = [("New Mauville", 0), ("Team Magma Hideout", 1)]


def encounters(place):
    return [{
        "location_area": {"name": place},
        "version_details": [{
            "version": {"name": version},
            "encounter_details": [{
                "method": {"name": method}, "condition_values": [],
                "chance": 100, "min_level": 25, "max_level": 25,
            } for method in ["static", "walk"]],
        } for version in build.VERSIONS],
    }]


assert [r["m"] for r in build.rows_for(encounters("new-mauville-area"), "ruby", 101)] == ["walk"]
assert len(build.rows_for(encounters("new-mauville-area"), "sapphire", 101)) == 2
assert len(build.rows_for(encounters("new-mauville-area"), "ruby", 100)) == 2
assert len(build.rows_for(encounters("team-magma-hideout-area"), "ruby", 101)) == 2
assert [r["m"] for r in build.rows_for(encounters("new-mauville-entrance"), "ruby", 101)] == ["walk"]
assert build.drop_hits == {0}
for place, version, n in [
    ("new-mauville-area", "sapphire", 101),
    ("new-mauville-area", "ruby", 100),
    ("team-magma-hideout-area", "ruby", 101),
]:
    build.drop_hits.clear()
    build.rows_for(encounters(place), version, n)
    assert not build.drop_hits
build.GAME["drop_rows"].append({"place": "New Mauville", "n": 101, "m": "static"})
build.rows_for(encounters("new-mauville-area"), "ruby", 101)
assert build.drop_hits == {0, 1}, "Overlapping exclusions must each record a hit"
build.GAME["drop_rows"] = [{"place": "New Mauville", "n": 101, "m": "static", "exact": True}]
build.drop_hits.clear()
assert [r["m"] for r in build.rows_for(encounters("new-mauville-area"), "ruby", 101)] == ["walk"]
assert build.drop_hits == {0}
build.drop_hits.clear()
assert len(build.rows_for(encounters("new-mauville-entrance"), "ruby", 101)) == 2
assert not build.drop_hits, "An exact exclusion must not match a neighbouring area"
print("row exclusions: species, method, version, prefix, exact and overlapping matching ok")
