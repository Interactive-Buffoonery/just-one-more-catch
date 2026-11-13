using System.Buffers.Binary;
using System.Text.Json;
using PKHeX.Core;

Directory.CreateDirectory(args[0]);
ushort[] caught = [25, 133, 252, 255, 258, 280, 290, 292, 349, 350, 380, 381, 384, 386];
var results = new List<object>();
foreach (var name in new[] { "caught", "empty", "rotated", "half" })
{
    var data = new byte[SaveUtil.SIZE_G3RAW];
    for (var sector = 0; sector < 28; sector++)
    {
        var footer = data.AsSpan(sector * 0x1000 + 0xFF4);
        BinaryPrimitives.WriteUInt16LittleEndian(footer, (ushort)(sector % 14));
        BinaryPrimitives.WriteUInt32LittleEndian(footer[4..], 0x08012025);
        BinaryPrimitives.WriteUInt32LittleEndian(footer[8..], sector < 14 ? 5u : 4u);
    }
    var save = new SAV3RS(data);
    save.OT = "TEST";
    if (name != "empty")
    {
        foreach (var species in caught)
        {
            var pokemon = save.BlankPKM;
            pokemon.Species = species;
            pokemon.CurrentLevel = 5;
            save.SetBoxSlotAtIndex(pokemon, 0);
            save.SetBoxSlotAtIndex(save.BlankPKM, 0, EntityImportSettings.None);
        }
        save.SetSeen(1, true);
    }
    var bytes = save.Write().ToArray();
    save.WriteBothSaveSlots(bytes);
    if (name == "rotated")
    {
        var older = bytes.AsSpan(14 * 0x1000, 0x1000);
        older.Slice(0x28, 49).Clear();
        older.Slice(0x5C, 49).Clear();
        BinaryPrimitives.WriteUInt16LittleEndian(older[0xFF6..], Checksums.CheckSum32(older[..0xF80]));
        var newest = bytes.AsSpan(0, 14 * 0x1000).ToArray();
        bytes.AsSpan(14 * 0x1000, 14 * 0x1000).CopyTo(bytes);
        for (var sector = 0; sector < 14; sector++)
            newest.AsSpan(sector * 0x1000, 0x1000).CopyTo(bytes.AsSpan((14 + (sector + 3) % 14) * 0x1000));
    }
    if (name == "half")
    {
        File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes[..0x10000]);
        results.Add(new { name, length = 0x10000, invalid = true });
        continue;
    }
    var reread = SaveUtil.GetSaveFile(bytes);
    if (reread is null || !reread.ChecksumsValid)
        throw new InvalidDataException($"Invalid serialized fixture: {name}");
    var expected = name == "empty" ? Array.Empty<int>() : caught.Select(n => (int)n).ToArray();
    var actual = Enumerable.Range(1, 386).Where(n => reread.GetCaught((ushort)n)).ToArray();
    if (!actual.SequenceEqual(expected) || reread.BoxData.Any(p => p.Species != 0))
        throw new InvalidDataException($"Fixture history did not round-trip: {name}");
    if (reread.Version != GameVersion.RS)
        throw new InvalidDataException($"RS identity was lost: {name}");
    File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes);
    results.Add(new { name, caught = actual, seen = Enumerable.Range(1, 386).Where(n => reread.GetSeen((ushort)n)),
        version = reread.Version.ToString(), length = bytes.Length, checksumsValid = reread.ChecksumsValid });
}
File.WriteAllText(Path.Combine(args[0], "native-results.json"), JsonSerializer.Serialize(results));
Console.WriteLine(JsonSerializer.Serialize(results));
