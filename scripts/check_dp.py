"""Check opt-in condition gates without changing legacy pack generation."""
import copy
import sys

sys.argv = [sys.argv[0], "dp"]
import build_data as build

game = copy.deepcopy(build.GAME)
encounter = [{"location_area": {"name": "sinnoh-route-201-area"}, "version_details": [{
    "version": {"name": "diamond"}, "encounter_details": [{
        "method": {"name": "walk"}, "min_level": 2, "max_level": 3, "chance": 10,
        "condition_values": [{"name": "story-progress-national-dex"}],
    }],
}]}]
row = build.rows_for(encounter, "diamond", 1)[0]
assert row["need"] == ["national-dex"]
assert row["cond"] == []
assert (row["lo"], row["hi"], row["c"]) == (2, 3, 10)
for condition in ("radar-on", "slot2-ruby", "backlot-mentioned", "swarm-yes"):
    encounter[0]["version_details"][0]["encounter_details"][0]["condition_values"] = [{"name": condition}]
    row = build.rows_for(encounter, "diamond", 1)[0]
    assert row["need"] == ["national-dex"]
    assert row["cond"] == [condition]
# The same input without the new opt-in configuration keeps legacy semantics.
for key in ("condition_needs", "keep_conditions", "drop_conditions"):
    build.GAME.pop(key, None)
encounter[0]["version_details"][0]["encounter_details"][0]["condition_values"] = [{"name": "story-progress-national-dex"}]
row = build.rows_for(encounter, "diamond", 1)[0]
assert row["need"] is None
assert row["cond"] == ["story-progress-national-dex"]
build.GAME = game
print("D/P condition gates: National Dex and legacy semantics ok")
