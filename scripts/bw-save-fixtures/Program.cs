using System.Text.Json;
using PKHeX.Core;

Directory.CreateDirectory(args[0]);
ushort[] caught = [25, 133, 252, 386, 493, 494, 495, 496, 497, 498, 501, 550, 585, 643, 644, 646, 647, 648, 649];
var results = new List<object>();
foreach (var version in new[] { GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2 })
foreach (var empty in new[] { false, true })
{
    var name = version + (empty ? "-empty" : "-caught");
    SAV5 save = version is GameVersion.B or GameVersion.W ? new SAV5BW() : new SAV5B2W2();
    save.Version = version;
    save.OT = "TEST";
    save.Language = 2;
    if (!empty)
    {
        foreach (var species in caught)
        {
            var pokemon = save.BlankPKM;
            pokemon.Species = species;
            pokemon.Version = version;
            pokemon.CurrentLevel = 5;
            save.SetBoxSlotAtIndex(pokemon, 0);
            save.SetBoxSlotAtIndex(save.BlankPKM, 0, EntityImportSettings.None);
        }
        save.Zukan.SetSeen(1, 1);
        save.Zukan.SetSeen(2, 2);
        save.Zukan.SetSeen(3, 3);
        save.AdventureInfo.SecondsToStart = 0x12345678;
    }
    var bytes = save.Write().ToArray();
    var reread = SaveUtil.GetSaveFile(bytes);
    if (reread is null || !reread.ChecksumsValid || reread.Version != version || reread.GetType() != save.GetType())
        throw new InvalidDataException($"Serialized identity/checksums failed: {name}");
    var expected = empty ? Array.Empty<int>() : caught.Select(n => (int)n).ToArray();
    var actual = Enumerable.Range(1, 649).Where(n => reread.GetCaught((ushort)n)).ToArray();
    if (!actual.SequenceEqual(expected) || reread.BoxData.Any(p => p.Species != 0) || reread.PartyCount != 0)
        throw new InvalidDataException($"Caught history or empty storage failed: {name}");
    File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes);
    results.Add(new { name, caught = actual, seen = Enumerable.Range(1, 649).Where(n => reread.GetSeen((ushort)n)),
        version = reread.Version.ToString(), length = bytes.Length, checksumsValid = reread.ChecksumsValid });
}
File.WriteAllBytes(Path.Combine(args[0], "invalid.sav"), new byte[512 * 1024]);
File.WriteAllBytes(Path.Combine(args[0], "truncated.sav"), File.ReadAllBytes(Path.Combine(args[0], "B-caught.sav"))[..0x24000]);
File.WriteAllText(Path.Combine(args[0], "native-results.json"), JsonSerializer.Serialize(results));
Console.WriteLine(JsonSerializer.Serialize(results));
