# SDS1 · Social Data Science I: Dataanalyse med Python

Kursusmateriale til **Social Data Science I** ved Aalborg Universitet, efterår 2026.

**Kursushjemmeside:** <https://jeppefq.github.io/sds1/>

Kurset handler om at gøre *messy* samfundsdata (tekst, tabeller, billeder, lyd og opslag på nettet) til noget, man kan analysere. Vi bruger Python, og mine slides kan køre koden direkte i browseren. Under hver kodeboks ligger en trinvis forklaring skrevet til begyndere.

- **Underviser:** Jeppe Fjeldgaard Qvist, med gæsteundervisere
- **Tid:** tirsdage og torsdage kl. 12.30–16.15 (se planen)
- **Omfang:** 10 ECTS
- **Eksamen:** mundtlig prøve på baggrund af en portfolio, afleveret som HTML
- **Beskeder, aflevering og UCloud-link:** [Moodle](https://www.moodle.aau.dk/course/view.php?id=59527)

## Læringsmål

Efter kurset kan du

- forklare, hvordan tekst, tabeller, billeder og lyd bliver repræsenteret som data
- indlæse, rydde op i, koble og omforme data med Python og pandas
- vælge og bygge figurer, der viser det, de skal
- hente data fra nettet med scraping og API-kald, og diskutere jura og etik
- gøre tekst analysérbar og bruge ordbøger, sprogmodeller, PCA og k-means
- samle metoderne i en analyse af et samfundsvidenskabeligt spørgsmål, og diskutere metodernes styrker og svagheder

De officielle læringsmål står på siden [Om kurset](https://jeppefq.github.io/sds1/kursus/om-kurset.html).

## Forudsætninger

Ingen erfaring med programmering. Gennemfør e-kurset [Introduktion til Python for Samfundsvidenskab](https://caldiss-aau.github.io/workshop_python-intro/) inden lektion 2, og tjek, at du kan logge ind på UCloud.

## Grundbøger

Begge er frit tilgængelige:

- McKinney, W. (2022): [*Python for Data Analysis*, 3. udgave](https://wesmckinney.com/book/). O'Reilly Media.
- Severance, C. (2016): [*Python for Everybody*](http://do1.dr-chuck.com/pythonlearn/EN_us/pythonlearn.pdf).

## Plan og litteratur

| # | Dato | Emne | Læs | Materiale |
|---|---|---|---|---|
| 1 | 3/9 | Introduktion til faget | Intet læsestof | [side](lektioner/01-messy-data-og-python/index.qmd) · [slides](https://jeppefq.github.io/sds1/lektioner/01-messy-data-og-python/slides.html) |
| 2 | 8/9 | Intro til Python | e-kursus: Introduktion til Python for Samfundsvidenskab | [side](lektioner/02-intro-til-python/index.qmd) · [slides](https://jeppefq.github.io/sds1/lektioner/02-intro-til-python/slides.html) |
| 3 | 10/9 | Data wrangling i Python | Severance kap. 1, 2, 4 · McKinney kap. 8.2–8.3 | [side](lektioner/03-data-wrangling/index.qmd) · [slides](https://jeppefq.github.io/sds1/lektioner/03-data-wrangling/slides.html) |
| 4 | 15/9 | Datavisualisering | Kirk (2019), s. 61–94 | [side](lektioner/04-datavisualisering/index.qmd) · [slides](https://jeppefq.github.io/sds1/lektioner/04-datavisualisering/slides.html) |
| 5 | 17/9 | Scraping og API-kald | Severance kap. 12–13 · Krotov, Redd & Silva (2020) | [side](lektioner/05-scraping-og-api/index.qmd) |
| 6 | 22/9 | Messy data i praksis: oprydning i tekst | Denny & Spirling (2017), s. 1–13 · Hunston (2002), s. 79–95 | [side](lektioner/06-oprydning-i-tekst/index.qmd) · [slides](https://jeppefq.github.io/sds1/lektioner/06-oprydning-i-tekst/slides.html) |
| 7 | 24/9 | Messy data i praksis: tekstanalyse | Bonikowski & Nelson (2022) · Macanovic (2022) · Hunston (2002), s. 25–37 | [side](lektioner/07-computationel-tekstanalyse/index.qmd) · [slides](https://jeppefq.github.io/sds1/lektioner/07-computationel-tekstanalyse/slides.html) |
| 8 | 29/9 | Messy data i praksis: oprydning af data | McKinney kap. 7 · Skelmose m.fl. (2026), kap. 3 | [side](lektioner/08-oprydning-af-data/index.qmd) |
| 9 | 6/10 | Messy data i praksis: lyd og multimodal | | [side](lektioner/09-lyd-og-multimodal/index.qmd) |
| | 9/10 | Seminardag 1 | | [side](workshops/seminardag-1/index.qmd) |
| 10 | 13/10 | Messy data i praksis: oprydning af billeder | Elgendy (2020), kap. 1 · Patel (2023) | [side](lektioner/10-oprydning-af-billeder/index.qmd) |
| 11 | 20/10 | Dataanalyse i Python 1 | | [side](lektioner/11-dataanalyse-i-python-1/index.qmd) |
| 12 | 22/10 | Dataanalyse i Python 2 | | [side](lektioner/12-dataanalyse-i-python-2/index.qmd) |
| | 6/11 | Seminardag 2 | | [side](workshops/seminardag-2/index.qmd) |
| | 18/12 | Aflevering i Digital Eksamen kl. 10.00 | | |
| | 11–15/1 | Mundtligt forsvar | | |

Fulde litteraturhenvisninger står på hver lektions side.

## Eksamen og portfolio

Eksamen er mundtlig på baggrund af et projekt (portfolio), bedømt internt efter 7-trins-skalaen. Portfolioen skrives som en Python-notebook og afleveres som HTML. Teksten må højst fylde 10 normalsider og koden 10 normalsider (à 2.400 tegn). Se [Portfolio og eksamen](https://jeppefq.github.io/sds1/kursus/portfolio.html). De officielle regler står på Moodle.

## Data

Datasættene fra slides ligger i [`data/`](data/) og kan læses direkte. `borgerpanel.csv` er et syntetisk undervisningsdatasæt (500 opdigtede personer), som kan genskabes med `python3 data/lav_borgerpanel.py`.

```python
import pandas as pd
panel = pd.read_csv("https://raw.githubusercontent.com/jeppeFQ/sds1/main/data/borgerpanel.csv")
```

## Sådan er repositoryet bygget op

```
sds1/
├── index.qmd              forsiden
├── _quarto.yml            menu, sidefod og fælles indstillinger
├── _variables.yml         semester, datoer og links (rettes én gang om året)
├── kursus/                om kurset, plan, portfolio, opgaver, værktøjer
├── lektioner/
│   └── 03-data-wrangling/
│       ├── index.qmd      lektionens side: beskrivelse, litteratur, materiale
│       ├── slides.qmd     slides (format: sds1-revealjs)
│       ├── materiale/     øvelsesark og notebooks
│       └── billeder/
├── workshops/             seminardage og ekstra workshops
├── data/                  datasæt, der hentes fra slides og notebooks
├── assets/                AAU-logo og bølger
├── _skabeloner/           skabeloner til nye lektioner og workshops
├── _extensions/
│   ├── sds1/              kursets design: designsystem, celler, layouts, lister
├── _ordliste.yml          ordliste til slides (hover-forklaringer)
│   └── r-wasm/live/       quarto-live (Python og R i browseren)
└── tools/ny.py            opretter en ny lektion eller workshop
```

## Vedligeholdelse

Du skal bruge [Quarto](https://quarto.org) 1.6 eller nyere. Der kræves hverken Python eller R for at bygge siden, fordi al kode køres i læserens browser.

```bash
quarto preview        # se siden lokalt, opdateres når du gemmer
quarto render         # byg hele siden i _site/
```

Når du pusher til `main`, bygger og udgiver GitHub Actions siden automatisk (`.github/workflows/publish.yml`). Første gang: *Settings → Pages → Source: GitHub Actions*.

**Ny lektion eller workshop**

```bash
python3 tools/ny.py lektion 13 "Netværksanalyse"
python3 tools/ny.py workshop W1 "Git for begyndere"
```

Ret derefter `index.qmd` (dato, beskrivelse, `status`) og `slides.qmd` i den nye mappe. Lektionen dukker selv op på forsiden og i planen, sorteret efter `lektion`.

**Felter øverst i en lektions `index.qmd`**

| Felt | Betydning |
|---|---|
| `lektion` | Nummeret i listerne. Bestemmer rækkefølgen |
| `date` | Dato for undervisningen |
| `description` | Én sætning, der vises i listerne |
| `status` | `klar` (links til slides vises), `kommer`, `anden` (anden underviser) eller `moodle` (materiale på Moodle) |
| `slides` | `true`, når der ligger en `slides.qmd` i mappen |
| `litteratur` | Kort litteraturliste til planen |

**Slides: sådan bygger du en lektion**

Start fra `_skabeloner/lektion/slides.qmd`. Den viser alle byggeklodser én gang. Designet ligger ét sted, `_extensions/sds1/`, og skal aldrig kopieres ud i lektionerne.

*Accentfarve.* Hver lektion har én farve til links, fremhævninger, statuslinje og Kør-knap. Sæt den øverst i `slides.qmd`:

```yaml
accent: turkis      # lyseblaa | turkis | orange | lilla | gul
```

*Seks layouts*

| Skriv | Giver |
|---|---|
| (titelslidet laves af YAML) | Titel med bølger, lektionsmærkat, QR-kode og link |
| `# Overskrift` + én linje | Sektion: farvet flade med nummer (01, 02 ...) |
| `## {.udsagn}` + én sætning | Udsagn: én sætning eller ét tal, meget stort |
| `## Overskrift` | Indhold. To kolonner: `:::: {.to-kol}` med to `::: {.kol}` |
| `## Overskrift {.kodelab}` | Kodelab: cellen fylder slidet, editor til venstre, output til højre |
| `## Overskrift {.opgave}` | Opgave: `::: {.opgavetekst}` til venstre, cellen til højre |
| `## Sidst i dag {.sidst}` | Afslutning med kort (`:::: {.kort-raekke}`) og logo |

*Tre slags celler.* Pak kodeblokken ind, så sættes mærkat, knapper og indstillinger selv:

````markdown
:::: {.demo}                          kører af sig selv, kan ikke redigeres
```{pyodide}
panel.head()
```
::::

:::: {.proev forslag="Skift `5` ud med `10`."}      kan redigeres; forslaget står under editoren
```{pyodide}
panel.head(5)
```

::: {.forklaring}
1. {1} `.head(5)` viser de fem første rækker.
:::
::::

:::: {.oevelse}                       huller, Hint, Vis løsning og automatisk tjek
```{pyodide}
panel["alder"].______()
```

::: {.hint}
Et lille skub i den rigtige retning.
:::

::: {.loesning}
```python
panel["alder"].max()
```
:::

```{pyodide}
#| check: true
ok = int(result) == int(panel["alder"].max())
feedback = {"correct": ok, "message": "Rigtigt!" if ok else "Ikke helt."}
feedback
```
::::
````

- **Forklaring.** Hver kodeblok skal have en `::: {.forklaring}`: nummererede trin til en læser, der aldrig har kodet. `{1}` eller `{2-3}` først i et punkt fremhæver de kodelinjer, punktet handler om.
- **Gæt først.** `:::: {.proev gaet="Hvad sker der?" valg="4|22|En fejl"}` skjuler outputtet, til der er gættet og kørt.
- **Skyder og rullemenu.** `viewof bins = sds1.skyder({label: "Antal søjler", min: 2, max: 60, value: 10})` i en `{ojs}`-blok, og `#| input: [bins]` i cellen. `sds1.vaelger({label: "Join", valg: ["inner", "left"]})` giver en rullemenu.
- **Python og R.** Læg to celler i `::::: {.panel-tabset}` med `### Python` og `### R`. Læserens valg af sprog følger med på alle slides.
- **Ordliste.** `[DataFrame]{.ord}` slår op i `_ordliste.yml` i roden (én linje pr. ord).
- **Begrebsfigurer.** `::: {.figur figur="maske" vaerdier="1,5,9" graense="4" navn="x"}`. Findes: `gennemsnit`, `maske`, `variabel`, `funktion`, `gruppe` (groupby), `indeks` (slice), `alias`, `spor` (løkke), `taeller`, `join`, `omform` (pivot/melt), `anatomi` (kodens dele), `kobling` (aes), `stak` (lag), `rens` (preprocessing), `soejler`, `dtm`, `tegn`, `ordbog`, `tfidf`, `pca` og `kmeans`. Hver figur er beskrevet øverst i sin funktion. Nye tilføjes i `_extensions/sds1/resources/figurer.js`.
- **Kodeskift.** To slides med `{auto-animate="true"}` og samme `data-id` på kodeblokken viser, hvad der ændrer sig.
- **Nedtælling.** `[3 min]{.timer tid=180}`.
- **Pas på:** brug ikke `###` inde i bokse (Quarto laver dem om til nye slides). Brug fed tekst.

*Hvor ligger hvad*

| Fil i `_extensions/sds1/` | Indhold |
|---|---|
| `resources/design.css` | Designsystemet: variable (farver, skrift), layouts, celler, mørk tilstand |
| `resources/sds1.js` | Komponenter: husket kode, gæt først, linjefokus, status, værktøjer, ordliste |
| `resources/figurer.js` | Begrebsfigurer |
| `resources/skrift/` | Barlow og JetBrains Mono (ingen Google Fonts) |
| `celler.lua`, `sds1.lua`, `forklaring.lua` | Oversætter markeringerne ovenfor |

**Nyt semester**

1. Ret `semester`, `moodle`, `aflevering` og `mundtlig` i `_variables.yml`.
2. Ret `date` (og evt. `status`) i hver lektions `index.qmd`.
3. Ret tabellen *Vigtige datoer* i `kursus/plan.qmd` og tabellen i denne README.
4. Vil du gemme det gamle semester, så lav et tag først: `git tag e26 && git push --tags`.

**Farver.** Slides: variablerne øverst i `_extensions/sds1/resources/design.css`. Hjemmesiden: `_extensions/sds1/_farver.scss`. AAU Blå er `#211A52`. Sekundærfarverne er pladsholdere, indtil de officielle HEX-værdier fra AAU's designguide er sat ind begge steder; hver farve skal have en `-dyb` variant med kontrast på mindst 4,5:1 mod hvid.

## Licens

Tekst, slides og øvelser: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.da). Kode: MIT. AAU's logo og bølger, tredjepartsbilleder og datasæt er undtaget. Se [LICENSE.md](LICENSE.md).
