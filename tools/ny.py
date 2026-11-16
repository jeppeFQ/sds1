#!/usr/bin/env python3
"""Opret en ny lektion eller workshop ud fra skabelonen.

    python3 tools/ny.py lektion 13 "Netværksanalyse"
    python3 tools/ny.py workshop W1 "Git for begyndere"

Mappen får navnet <nr>-<titel-som-slug> og indeholder index.qmd (+ slides.qmd for lektioner).
"""
import re
import shutil
import sys
from pathlib import Path

ROD = Path(__file__).resolve().parent.parent


def slug(tekst):
    tekst = tekst.lower().replace("æ", "ae").replace("ø", "oe").replace("å", "aa")
    return re.sub(r"[^a-z0-9]+", "-", tekst).strip("-")


def main():
    if len(sys.argv) != 4 or sys.argv[1] not in ("lektion", "workshop"):
        sys.exit(__doc__)
    slags, nr, titel = sys.argv[1:]
    if slags == "lektion":
        navn = f"{int(nr):02d}-{slug(titel)}"
        maal = ROD / "lektioner" / navn
    else:
        navn = slug(titel)
        maal = ROD / "workshops" / navn
    if maal.exists():
        sys.exit(f"Findes allerede: {maal}")
    shutil.copytree(ROD / "_skabeloner" / slags, maal)
    for fil in maal.glob("*.qmd"):
        tekst = fil.read_text(encoding="utf-8")
        tekst = tekst.replace("TITEL PÅ LEKTIONEN", titel).replace("TITEL PÅ WORKSHOPPEN", titel)
        tekst = tekst.replace("lektion: 99", f"lektion: {nr}").replace("Lektion 99", f"Lektion {nr}")
        tekst = tekst.replace('lektion: "W1"', f'lektion: "{nr}"')
        fil.write_text(tekst, encoding="utf-8")
    print(f"Oprettet: {maal.relative_to(ROD)}\nRet datoen og teksten i index.qmd, og kør: quarto preview")


if __name__ == "__main__":
    main()
