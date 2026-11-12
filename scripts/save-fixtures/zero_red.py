"""Create a pre-starter save using unmodified Red's in-game Save command.

Usage: python zero_red.py /path/to/pokered.gbc /path/to/output-directory
Requires PyBoy 2.9.0 and Pillow. No ROM or battery save is distributed.
"""
import hashlib
import shutil
import sys
from pathlib import Path
from pyboy import PyBoy

source, output = Path(sys.argv[1]), Path(sys.argv[2])
assert hashlib.sha1(source.read_bytes()).hexdigest() == "ea9bcae617fdf159b045185467ae58b2e4a48b9a", "Expected unmodified English Red"
output.mkdir(parents=True, exist_ok=True)
rom = output / "pokered.gbc"
assert not rom.exists(), "Use a fresh directory to avoid loading an existing battery save"
shutil.copyfile(source, rom)
p = PyBoy(str(rom), window="null", sound_emulated=False)
p.set_emulation_speed(0)
try:
    p.tick(600, False)
    p.button("start")
    p.tick(120, False)
    p.button("a")
    p.tick(120, False)
    for _ in range(55):
        p.button("a")
        p.tick(120, False)
    p.tick(1, True)

    def press(button):
        p.button_press(button)
        p.tick(12, True)
        p.button_release(button)
        p.tick(120, True)
        p.tick(60, True)

    for button in ("start", "down", "down", "down", "a", "a"):
        press(button)
    p.screen.image.save(str(output / "saved.png"))
    with (output / "red-zero.sav").open("wb") as stream:
        p.stop(ram_file=stream)
except BaseException:
    p.stop(save=False)
    raise
save = (output / "red-zero.sav").read_bytes()
assert save[0x2F2C] == 0, "Expected empty party"
assert not any(save[0x25A3:0x25C9]), "Expected no caught or seen species"
assert save[0x3523] == (~sum(save[0x2598:0x3523]) & 255), "In-game save checksum failed"
print(hashlib.sha256(save).hexdigest())
