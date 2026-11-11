"""Dump a scanned strategy guide's OCR text per page, then grep it by page.

Usage:
  python3 -I scripts/guide_text.py dump <guide.pdf> <name>    # .cache/guides/<name>/NNNN.txt, one file per PDF page
  python3 -I scripts/guide_text.py grep <name> <regex> [-C N]  # matches as "page N: line", N lines of context

Page numbers are PDF page numbers (what the Read tool's `pages` takes),
not the numbers printed on the guide's pages.
"""
import os, re, subprocess, sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
PDFTOTEXT = "/opt/homebrew/bin/pdftotext" if os.path.exists("/opt/homebrew/bin/pdftotext") else "pdftotext"


def out_dir(name):
    return os.path.join(ROOT, ".cache", "guides", name)


def dump(pdf, name):
    d = out_dir(name)
    os.makedirs(d, exist_ok=True)
    text = subprocess.run([PDFTOTEXT, "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
    pages = text.split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    for i, p in enumerate(pages, 1):
        with open(os.path.join(d, f"{i:04d}.txt"), "w") as f:
            f.write(p)
    empty = [i for i, p in enumerate(pages, 1) if len(p.strip()) < 50]
    print(f"{len(pages)} pages to {d}; near-empty (image only?): {empty}")


def grep(name, pattern, context=0):
    rx = re.compile(pattern, re.I)
    d = out_dir(name)
    for fn in sorted(os.listdir(d)):
        lines = open(os.path.join(d, fn)).read().splitlines()
        page = int(fn[:4])
        for i, line in enumerate(lines):
            if rx.search(line):
                lo, hi = max(0, i - context), min(len(lines), i + context + 1)
                for j in range(lo, hi):
                    print(f"page {page}: {lines[j].strip()}")
                if context:
                    print("--")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 3 and a[0] == "dump":
        dump(a[1], a[2])
    elif len(a) in (3, 5) and a[0] == "grep":
        grep(a[1], a[2], int(a[4]) if len(a) == 5 and a[3] == "-C" else 0)
    else:
        sys.exit(__doc__)
