using System.Buffers.Binary;
using System.Text.Json;
using PKHeX.Core;

Directory.CreateDirectory(args[0]);
ushort[] caught = [25, 133, 252, 386, 387, 388, 389, 390, 393, 412, 422, 479, 483, 484, 487, 490, 491, 492, 493];
var results = new List<object>();
foreach (var version in new[] { GameVersion.DP, GameVersion.Pt, GameVersion.HG, GameVersion.SS })
foreach (var empty in new[] { false, true })
{
    var name = version + (empty ? "-empty" : "-caught");
    var generalSize = version switch { GameVersion.DP => SAV4DP.GeneralSize, GameVersion.Pt => SAV4Pt.GeneralSize, _ => SAV4HGSS.GeneralSize };
    var data = new byte[SaveUtil.SIZE_G4RAW];
    foreach (var offset in new[] { 0, 0x40000 })
    {
        var footer = data.AsSpan(offset + generalSize - 0xC);
        BinaryPrimitives.WriteUInt32LittleEndian(footer, (uint)generalSize);
        BinaryPrimitives.WriteUInt32LittleEndian(footer[4..], SAV4.MAGIC_JAPAN_INTL);
    }
    SAV4 save = version switch { GameVersion.DP => new SAV4DP(data), GameVersion.Pt => new SAV4Pt(data), _ => new SAV4HGSS(data) };
    save.Version = version;
    save.OT = "TEST";
    save.Language = 2;
    if (!empty)
    {
        foreach (var species in caught)
        {
            var pokemon = save.BlankPKM;
            pokemon.Species = species;
            pokemon.Version = version == GameVersion.DP ? GameVersion.D : version;
            pokemon.CurrentLevel = 5;
            save.SetBoxSlotAtIndex(pokemon, 0);
            save.SetBoxSlotAtIndex(save.BlankPKM, 0, EntityImportSettings.None);
        }
        save.Dex.SetSeen(1);
        save.Dex.SetSeenGenderFirst(1, 1);
        if (version is GameVersion.DP or GameVersion.Pt) save.SecondsToStart = 0x12345678;
    }
    var bytes = save.Write().ToArray();
    var reread = SaveUtil.GetSaveFile(bytes);
    if (reread is null || !reread.ChecksumsValid || reread.Version != version || reread.GetType() != save.GetType())
        throw new InvalidDataException($"Serialized identity/checksums failed: {name}");
    var expected = empty ? Array.Empty<int>() : caught.Select(n => (int)n).ToArray();
    var actual = Enumerable.Range(1, 493).Where(n => reread.GetCaught((ushort)n)).ToArray();
    var seen = Enumerable.Range(1, 493).Where(n => reread.GetSeen((ushort)n)).ToArray();
    if (!actual.SequenceEqual(expected) || !seen.SequenceEqual(empty ? [] : new[] { 1 }.Concat(expected)) ||
        reread.BoxData.Any(p => p.Species != 0) || reread.PartyCount != 0)
        throw new InvalidDataException($"Caught/seen history or empty storage failed: {name}");
    File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes);
    results.Add(new { name, caught = actual, seen, version = reread.Version.ToString(), length = bytes.Length, checksumsValid = reread.ChecksumsValid });
}
File.WriteAllBytes(Path.Combine(args[0], "invalid.sav"), new byte[SaveUtil.SIZE_G4RAW]);
File.WriteAllBytes(Path.Combine(args[0], "truncated.sav"), File.ReadAllBytes(Path.Combine(args[0], "DP-caught.sav"))[..0x40000]);
File.WriteAllText(Path.Combine(args[0], "native-results.json"), JsonSerializer.Serialize(results));
Console.WriteLine(JsonSerializer.Serialize(results));
