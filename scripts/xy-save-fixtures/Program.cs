using System.Text.Json;
using PKHeX.Core;

Directory.CreateDirectory(args[0]);
ushort[] caught = [25, 133, 252, 386, 493, 649, 650, 651, 652, 653, 656, 666, 669, 678, 716, 717, 718, 719, 720, 721];
var results = new List<object>();
foreach (var version in new[] { GameVersion.X, GameVersion.Y })
foreach (var empty in new[] { false, true })
{
    var name = version + (empty ? "-empty" : "-caught");
    var save = new SAV6XY();
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
        save.Zukan.SetSeen(1, gender: 1, isShiny: false);
        save.Zukan.SetSeen(2, gender: 0, isShiny: true);
        save.Zukan.SetSeen(3, gender: 1, isShiny: true);
        save.GameTime.SecondsToStart = 0x12345678;
    }
    var bytes = save.Write().ToArray();
    System.Buffers.Binary.BinaryPrimitives.WriteUInt32LittleEndian(bytes.AsSpan(bytes.Length - 0x1F0), 0x42454546);
    var reread = SaveUtil.GetSaveFile(bytes);
    if (reread is null || !reread.ChecksumsValid || reread.Version != version || reread.GetType() != save.GetType())
        throw new InvalidDataException($"Serialized identity/checksums failed: {name}");
    var expected = empty ? Array.Empty<int>() : caught.Select(n => (int)n).ToArray();
    var actual = Enumerable.Range(1, 721).Where(n => reread.GetCaught((ushort)n)).ToArray();
    if (!actual.SequenceEqual(expected) || reread.BoxData.Any(p => p.Species != 0) || reread.PartyCount != 0)
        throw new InvalidDataException($"Caught history or empty storage failed: {name}");
    var seen = Enumerable.Range(1, 721).Where(n => reread.GetSeen((ushort)n)).ToArray();
    var expectedSeen = empty ? Array.Empty<int>() : new[] { 1, 2, 3 }.Concat(expected).ToArray();
    if (!seen.SequenceEqual(expectedSeen))
        throw new InvalidDataException($"Seen history failed: {name}");
    File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes);
    results.Add(new { name, caught = actual, seen,
        version = reread.Version.ToString(), length = bytes.Length, checksumsValid = reread.ChecksumsValid });
}
File.WriteAllBytes(Path.Combine(args[0], "invalid.sav"), new byte[SaveUtil.SIZE_G6XY]);
File.WriteAllBytes(Path.Combine(args[0], "truncated.sav"), File.ReadAllBytes(Path.Combine(args[0], "X-caught.sav"))[..0x40000]);
File.WriteAllText(Path.Combine(args[0], "native-results.json"), JsonSerializer.Serialize(results));
Console.WriteLine(JsonSerializer.Serialize(results));
