"""Compare saved WASM reader results with independent raw GB/GBC dex bits.

Usage: python3 scripts/save-fixtures/check_gb_flags.py .cache/save-tests
Requires wasm-results.json and the matching public/ and synthetic/ save files.
Offsets/checksums: pinned PKHeX Core 02c9ec108fe3c96735f6c2397eaebc10e29a049f,
Saves/Substructures/Gen12/SAV{1,2}Offsets.cs and Saves/SAV{1,2}.cs.
"""
import hashlib
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
report = json.loads((root / "wasm-results.json").read_text())
assert report["invalid"]["code"] == "invalid-save"
rows = []
for result in report["results"]:
    name = result["name"]
    data = (root / (name + ".sav")).read_bytes()
    gen1 = name.split("/")[-1].split("-")[0] in {"red", "yellow", "RD", "BU", "YW"}
    crystal = name == "public/crystal"
    caught, seen, count = (0x25A3, 0x25B6, 151) if gen1 else (
        (0x2A27, 0x2A47, 251) if crystal else (0x2A4C, 0x2A6C, 251))

    def bits(offset):
        return [n for n in range(1, count + 1)
                if data[offset + (n - 1) // 8] & (1 << ((n - 1) % 8))]

    if gen1:
        checksums = [data[0x3523] == (~sum(data[0x2598:0x3523]) & 255)]
        party, box = 0x2F2C, 0x30C0
        expected_versions = ["YW"] if name in {"public/yellow", "synthetic/YW", "synthetic/YW-empty"} else ["RD", "GN", "BU"]
    else:
        end, positions = (0x2B82, [0x2D0D, 0x1F0D]) if crystal else (0x2D68, [0x2D69, 0x7E6D])
        total = sum(data[0x2009:end + 1]) & 65535
        checksums = [int.from_bytes(data[p:p + 2], "little") == total for p in positions]
        party, box = (0x2865, 0x2D10) if crystal else (0x288A, 0x2D6C)
        expected_versions = ["C"] if crystal else ["GD", "SI"]
    snapshot = result["inspected"]
    assert snapshot["status"] == "ok", name
    assert result["unchanged"], name
    assert snapshot["game"]["versions"] == expected_versions, name
    assert "startDate" not in snapshot, name
    assert snapshot["pokedex"]["caughtSpecies"] == bits(caught), name
    assert snapshot["pokedex"]["seenSpecies"] == bits(seen), name
    assert all(checksums), (name, checksums)
    if name.startswith("synthetic/"):
        empty = name.endswith("-empty")
        assert bits(caught) == ([] if empty else [25, 133]), name
        assert bits(seen) == ([] if empty else [1, 25, 133]), name
        assert data[party] == data[box] == 0, name
    rows.append(dict(name=name, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(),
                     caught=len(bits(caught)), seen=len(bits(seen)), checksums=checksums,
                     versions=expected_versions, unchanged=True))
expected_names = {"public/" + n for n in ("red", "yellow", "gold", "crystal")}
expected_names.update("synthetic/" + n + suffix
                      for n in ("RD", "BU", "YW", "GD", "SI") for suffix in ("", "-empty"))
assert len(rows) == len(expected_names) == 14
assert {row["name"] for row in rows} == expected_names
print(json.dumps({"passed": len(rows), "invalidRejected": True, "files": rows}, indent=2))
