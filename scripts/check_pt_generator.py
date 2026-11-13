"""Regression: per-pack story conditions become requirements without losing special methods."""
import importlib.util
import sys

sys.argv = ["build_data.py", "pt"]
spec = importlib.util.spec_from_file_location("build_data", "scripts/build_data.py")
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)
encounter = [{"location_area": {"name": "sinnoh-route-201-area"}, "version_details": [{
    "version": {"name": "platinum"}, "encounter_details": [{
        "method": {"name": "walk"}, "condition_values": [{"name": "story-progress-national-dex"}, {"name": "radar-on"}],
        "min_level": 2, "max_level": 3, "chance": 12,
    }],
}]}]
row = build.rows_for(encounter, "platinum", 29)[0]
assert row["need"] == ["national-dex", "poke-radar"]
assert row["cond"] == ["radar-on"]
assert row["c"] == 12
# Area-specific exclusions preserve static encounters and other caves.
def encounter_at(place, method):
    return [{"location_area": {"name": place}, "version_details": [{
        "version": {"name": "platinum"}, "encounter_details": [{
            "method": {"name": method}, "condition_values": [],
            "min_level": 47, "max_level": 47, "chance": 100,
        }],
    }]}]

assert build.rows_for(encounter_at("turnback-cave-after-pillar-3", "walk"), "platinum", 42) == []
assert build.rows_for(encounter_at("turnback-cave-after-pillar-3", "static"), "platinum", 487)[0]["m"] == "static"
assert build.rows_for(encounter_at("turnback-cave-between-pillars-2-and-3", "walk"), "platinum", 42)[0]["m"] == "walk"
assert build.rows_for(encounter_at("sinnoh-route-201-area", "pokemon-ranger"), "platinum", 490) == []

# Packs without the optional mapping retain the previous condition and requirement behavior.
build.GAME = {**build.GAME, "condition_needs": {}, "keep_conditions": []}
row = build.rows_for(encounter, "platinum", 29)[0]
assert row["need"] is None
assert row["cond"] == ["radar-on", "story-progress-national-dex"]
print("Platinum generator: condition requirements and opt-in compatibility ok")
