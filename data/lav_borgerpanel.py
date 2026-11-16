"""Laver det syntetiske undervisningsdatasæt borgerpanel.csv (lektion 1-2).

Alle personer er opdigtede. Tallene er trukket fra simple fordelinger med et fast seed,
så filen kan genskabes præcist:   python3 data/lav_borgerpanel.py
Fordelingerne er valgt, så de ligner noget, man kunne møde i en dansk survey,
men datasættet må ikke bruges til at sige noget om virkeligheden.
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
n = 500

region = rng.choice(
    ["Hovedstaden", "Midtjylland", "Syddanmark", "Sjælland", "Nordjylland"],
    size=n, p=[0.32, 0.23, 0.21, 0.14, 0.10])
koen = rng.choice(["kvinde", "mand"], size=n)
alder = rng.integers(18, 80, size=n)
uddannelse = rng.choice(
    ["grundskole", "gymnasial", "erhvervsfaglig", "kort videregående",
     "mellemlang videregående", "lang videregående"],
    size=n, p=[0.16, 0.10, 0.30, 0.06, 0.22, 0.16])

# Månedlig indkomst før skat (kr.): højreskæv, afhænger lidt af uddannelse og alder
tillaeg = pd.Series(uddannelse).map({
    "grundskole": -0.18, "gymnasial": -0.12, "erhvervsfaglig": 0.0,
    "kort videregående": 0.05, "mellemlang videregående": 0.12,
    "lang videregående": 0.30}).to_numpy()
alderseffekt = -((alder - 48) / 60) ** 2
indkomst = np.exp(10.35 + tillaeg + alderseffekt + rng.normal(0, 0.38, size=n))
indkomst = (np.round(indkomst / 100) * 100).astype(int)

# Timer på sociale medier pr. dag: falder med alderen
skaermtid = np.clip(rng.gamma(2.2, 0.9, size=n) * (1.6 - alder / 80), 0, 12).round(1)

# Generel tillid til andre mennesker, 0-10
tillid = np.clip(np.round(rng.normal(6.6, 1.9, size=n) + tillaeg * 2), 0, 10).astype(int)

panel = pd.DataFrame({
    "id": np.arange(1, n + 1), "alder": alder, "koen": koen, "region": region,
    "uddannelse": uddannelse, "indkomst": indkomst, "skaermtid": skaermtid, "tillid": tillid})
panel.to_csv(__file__.replace("lav_borgerpanel.py", "borgerpanel.csv"), index=False)
print(panel.describe().round(1))
