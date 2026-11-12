using System.Buffers.Binary;
using System.Text.Json;
using PKHeX.Core;

Directory.CreateDirectory(args[0]);
foreach (var version in new[] { GameVersion.RD, GameVersion.BU, GameVersion.YW, GameVersion.GD, GameVersion.SI })
{
    foreach (var empty in new[] { false, true })
    {
        SaveFile save = version is GameVersion.RD or GameVersion.BU or GameVersion.YW
            ? new SAV1(LanguageID.English, version)
            : new SAV2(LanguageID.English, version);
        save.OT = "TEST";
        if (!empty)
        {
            foreach (ushort species in new ushort[] { 25, 133 })
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
        if (save is SAV1)
        {
            bytes[0x2F2D] = 0xFF;
            bytes[0x30C1] = 0xFF;
            if (version == GameVersion.YW)
                bytes[0x29C3] = 0x54;
            bytes[0x3523] = (byte)~bytes.Skip(0x2598).Take(0x3523 - 0x2598).Sum(b => (int)b);
        }
        else
        {
            bytes[0x288B] = 0xFF;
            bytes[0x2D6D] = 0xFF;
            var sum = (ushort)bytes.Skip(0x2009).Take(0x2D68 - 0x2009 + 1).Sum(b => (int)b);
            BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(0x2D69), sum);
            BinaryPrimitives.WriteUInt16LittleEndian(bytes.AsSpan(0x7E6D), sum);
        }

        var name = $"{version}{(empty ? "-empty" : "")}";
        var reread = SaveUtil.GetSaveFile(bytes);
        if (reread is null || !reread.ChecksumsValid)
            throw new InvalidDataException($"Invalid serialized fixture: {name}");
        File.WriteAllBytes(Path.Combine(args[0], name + ".sav"), bytes);
        Console.WriteLine(JsonSerializer.Serialize(new
        {
            name,
            length = bytes.Length,
            detected = reread.Version.ToString(),
            caught = Enumerable.Range(1, save.MaxSpeciesID).Where(n => reread.GetCaught((ushort)n)),
            seen = Enumerable.Range(1, save.MaxSpeciesID).Where(n => reread.GetSeen((ushort)n)),
            occupied = reread.BoxData.Count(p => p.Species != 0),
        }));
    }
}
