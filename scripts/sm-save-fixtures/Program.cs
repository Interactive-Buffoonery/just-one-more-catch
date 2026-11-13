using System.Text.Json;
using PKHeX.Core;

Directory.CreateDirectory(args[0]);
ushort[] caught = [25, 133, 252, 386, 493, 649, 721, 722, 723, 724, 725, 728, 741, 746, 778, 791, 792, 800, 801, 802];
var results = new List<object>();
foreach (var version in new[] { GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM })
foreach (var empty in new[] { false, true })
{
    var name = version + (empty ? "-empty" : "-caught");
    SAV7 save = version is GameVersion.SN or GameVersion.MN ? new SAV7SM() : new SAV7USUM();
    var speciesList = save is SAV7SM ? caught : [.. caught, 803, 804, 805, 806, 807];
    save.Version = version;
    save.OT = "TEST";
    save.Language = 2;
    if (!empty)
    {
        foreach (var species in speciesList)
        {
            var pokemon = save.BlankPKM;
            pokemon.Species = species;
            pokemon.Version = version;
            pokemon.CurrentLevel = 5;
            save.SetBoxSlotAtIndex(pokemon, 0);
            save.SetBoxSlotAtIndex(save.BlankPKM, 0, EntityImportSettings.None);
        }
        save.Zukan.SetSeen(1, bitRegion: 1, value: true);
        save.Zukan.SetSeen(2, bitRegion: 2, value: true);
        save.Zukan.SetSeen(3, bitRegion: 3, value: true);
        save.GameTime.SecondsToStart = (uint)(new DateTime(2020, 2, 29, 12, 0, 0) - new DateTime(2000, 1, 1)).TotalSeconds;
    }
    var bytes = save.Write().ToArray();
    System.Buffers.Binary.BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(bytes.Length - 0x1F0), 0x42454546);
    var reread = SaveUtil.GetSaveFile(bytes);
    if (reread is null || !reread.ChecksumsValid || reread.Version != version || reread.GetType() != save.GetType())
        throw new InvalidDataException($"Serialized identity/checksums failed: {name}");
    var expected = empty ? Array.Empty<int>() : speciesList.Select(n => (int)n).ToArray();
    var actual = Enumerable.Range(1, save.MaxSpeciesID).Where(n => reread.GetCaught((ushort)n)).ToArray();
    if (!actual.SequenceEqual(expected) || reread.BoxData.Any(p => p.Species != 0) || reread.PartyCount != 0)
        throw new InvalidDataException($"Caught history or empty storage failed: {name}");
    var seen = Enumerable.Range(1, save.MaxSpeciesID).Where(n => reread.GetSeen((ushort)n)).ToArray();
    var expectedSeen = empty ? Array.Empty<int>() : new[] { 1, 2, 3 }.Concat(expected).ToArray();
    if (!seen.SequenceEqual(expectedSeen))
        throw new InvalidDataException($"Seen history failed: {name}");
    File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes);
    results.Add(new { name, caught = actual, seen,
        version = reread.Version.ToString(), length = bytes.Length, checksumsValid = reread.ChecksumsValid });
}
File.WriteAllBytes(Path.Combine(args[0], "invalid.sav"), new byte[SaveUtil.SIZE_G7SM]);
File.WriteAllBytes(Path.Combine(args[0], "truncated.sav"), File.ReadAllBytes(Path.Combine(args[0], "SN-caught.sav"))[..0x40000]);
File.WriteAllText(Path.Combine(args[0], "native-results.json"), JsonSerializer.Serialize(results));
Console.WriteLine(JsonSerializer.Serialize(results));
