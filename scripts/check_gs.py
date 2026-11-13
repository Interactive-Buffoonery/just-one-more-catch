"""Offline regression checks for opt-in historical data and version gates."""
import json
from pathlib import Path
import runpy
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
with patch.object(sys, "argv", ["build_data.py", "gs"]):
    build = runpy.run_path(str(ROOT / "scripts/build_data.py"))
species = build["species"]
rows_for = build["rows_for"]
env = species.__globals__


class HistoricalData(unittest.TestCase):
    def fixture(self, generation):
        names = lambda name: [{"language": {"name": "en"}, "name": name}]
        return {
            "pokemon_species_1": {
                "names": names("Example"), "name": "example", "gender_rate": 4,
                "is_baby": False, "varieties": [{"pokemon": {"url": "/1/"}}],
                "evolution_chain": {"url": "/1/"},
                "evolves_from_species": {"url": "/2/"},
            },
            "pokemon_species_2": {"names": names("Baby"), "generation": {"name": generation}},
            "pokemon_1": {"name": "example", "types": [{"type": {"name": "normal"}}]},
            "pokemon_1_encounters": [],
            "evolution_chain_1": {"chain": {
                "species": {"name": "example"}, "evolves_to": [],
                "evolution_details": [{"trigger": {"name": "level-up"}, "min_happiness": 220}],
            }},
        }

    def test_later_babies_are_removed_only_when_opted_in(self):
        for enabled, generation, expected in [
            (True, "generation-iv", None),
            (True, "generation-ii", "Baby"),
            (False, "generation-iv", "Baby"),
        ]:
            with self.subTest(enabled=enabled, generation=generation):
                game = {**env["GAME"], "historical_pre_evolutions": enabled}
                with patch.dict(env, GAME=game, cached=self.fixture(generation).__getitem__):
                    result = species(1, {})
                self.assertEqual(result["from"], expected)
                self.assertEqual(result["evo"], "High friendship" if expected else None)

    def test_sourced_evolution_override_is_pack_local(self):
        game = {**env["GAME"], "evolution_overrides": {"1": "High friendship + Morning / Day"}}
        with patch.dict(env, GAME=game, cached=self.fixture("generation-ii").__getitem__):
            self.assertEqual(species(1, {})["evo"], "High friendship + Morning / Day")

    def test_row_gate_stays_with_its_version(self):
        encounter = [{"location_area": {"name": "example-area"}, "version_details": [
            {"version": {"name": version}, "encounter_details": [{
                "method": {"name": "static"}, "condition_values": [],
                "min_level": 40, "max_level": 40, "chance": 100,
            }]} for version in ("gold", "silver")
        ]}]
        game = {**env["GAME"], "needs": {}, "row_needs": [
            {"place": "Example", "n": 1, "needs": ["Elite Four"], "versions": ["gold"]},
            {"place": "Example", "n": 1, "needs": ["wing"]},
        ]}
        with patch.dict(env, GAME=game, chapter_of=lambda place: 0):
            self.assertEqual(rows_for(encounter, "gold", 1)[0]["need"], ["Elite Four", "wing"])
            self.assertEqual(rows_for(encounter, "silver", 1)[0]["need"], ["wing"])

    def test_generated_historical_types_and_ancestry(self):
        text = (ROOT / "client/data/gs.ts").read_text()
        dex = {p["n"]: p for p in json.loads(text[text.index("{"):-2])["dex"]}
        for n in (113, 122, 143, 183, 185, 202):
            self.assertIsNone(dex[n]["from"])
            self.assertIsNone(dex[n]["evo"])
        for n in (35, 39, 175):
            self.assertEqual(dex[n]["types"], ["normal"])
        self.assertEqual(dex[81]["types"], ["electric", "steel"])
        self.assertEqual(dex[196]["evo"], "High friendship + Morning / Day")
        self.assertTrue(any("trade-dragonair-f" in row["cond"] for row in dex[112]["rows"]))

    def test_reassignment_preserves_other_versions_and_rejects_stale_slots(self):
        raw = [{"location_area": {"name": "johto-route-38-area"}, "version_details": [
            {"version": {"name": version}, "encounter_details": [{
                "method": {"name": "walk"}, "condition_values": [{"name": c} for c in ["swarm-no", "time-night"]],
                "min_level": 16, "max_level": 16, "chance": 30,
            }]} for version in ("gold", "silver")
        ]}]
        reassign = build["reassign_encounters"]
        with patch.dict(env, cached=lambda name: raw):
            donor = reassign(19, raw)
            recipient = reassign(52, [])
        self.assertEqual([v["version"]["name"] for v in donor[0]["version_details"]], ["gold"])
        self.assertEqual([v["version"]["name"] for v in recipient[0]["version_details"]], ["silver"])
        self.assertEqual(len(raw[0]["version_details"]), 2)
        self.assertEqual(reassign(25, raw), raw)
        with patch.dict(env, GAME={**env["GAME"], "encounter_reassignments": []}):
            self.assertEqual(reassign(19, raw), raw)
        raw[0]["version_details"][1]["encounter_details"][0]["chance"] = 20
        with self.assertRaisesRegex(AssertionError, "Stale encounter reassignment"):
            reassign(19, raw)

    def test_corrected_night_encounters(self):
        text = (ROOT / "client/data/gs.ts").read_text()
        dex = {p["n"]: p for p in json.loads(text[text.index("{"):-2])["dex"]}
        def rows(n, place, version):
            return [r for r in dex[n]["rows"] if r["place"] == place and version in r["v"] and r["m"] == "walk"]
        self.assertEqual(rows(19, "Route 38", "i"), [])
        self.assertEqual([(r["c"], r["lo"], r["hi"]) for r in rows(52, "Route 38", "i") if r["cond"] == ["time-night"]], [(40, 16, 16)])
        self.assertEqual([(r["c"], r["lo"], r["hi"]) for r in rows(19, "Route 38", "g") if r["cond"] == ["time-night"]], [(40, 16, 16)])
        for version in "gi":
            self.assertEqual(rows(198, "Route 18", version), [])
            self.assertEqual([(r["c"], r["lo"], r["hi"]) for r in rows(89, "Route 18", version) if r["cond"] == ["time-night"]], [(15, 28, 30)])
            self.assertTrue(rows(198, "Route 16", version))
            for place in ("Route 18", "Route 38"):
                total = sum(r["c"] for mon in dex.values() for r in rows(mon["n"], place, version) if not r["cond"] or r["cond"] == ["time-night"])
                self.assertEqual(total, 100, (place, version))

    def test_route16_grass_requires_cut(self):
        text = (ROOT / "client/data/gs.ts").read_text()
        dex = json.loads(text[text.index("{"):-2])["dex"]
        rows = [r for p in dex for r in p["rows"] if r["place"] == "Route 16"]
        self.assertEqual(len(rows), 8)
        self.assertTrue(all(r["m"] == "walk" and r["need"] == ["cut-hm"] for r in rows))
        self.assertEqual({v for r in rows for v in r["v"]}, set("gi"))

    def test_condition_replacement_stays_with_its_pack(self):
        encounter = [{"location_area": {"name": "example-area"}, "version_details": [{
            "version": {"name": "gold"}, "encounter_details": [{
                "method": {"name": "npc-trade"}, "condition_values": [{"name": "trade-dragonair"}],
                "min_level": 30, "max_level": 100, "chance": 100,
            }],
        }]}]
        for replacements, expected in [({}, "trade-dragonair"), ({"trade-dragonair": "trade-dragonair-f"}, "trade-dragonair-f")]:
            game = {**env["GAME"], "needs": {}, "row_needs": [], "condition_replacements": replacements}
            with patch.dict(env, GAME=game, chapter_of=lambda place: 0):
                self.assertEqual(rows_for(encounter, "gold", 112)[0]["cond"], [expected])


if __name__ == "__main__":
    unittest.main()
