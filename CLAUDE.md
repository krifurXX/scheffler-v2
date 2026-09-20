# Schaefflerdiagram-app v2

Interaktiv undervisningsapp (Högskolan Väst), vidareutveckling av `../scheffler`
(v1, deployad på scheffler.vercel.app — rör inte den). v2 modellerar svetsning:
två grundmaterial A och B (förvalda stål **eller** egen kemisk sammansättning),
valfritt tillsatsmaterial C, utspädning (dilution) och flersträngssvetsning.

Modell:
- Grundmix = (1−s)·A + s·B där s = "base metal balance"
- Utan tillsatsmaterial ("None — autogenous weld"): v1-beteendet, punkten = grundmix
- Sträng 1: c₁ = (1−D_root)·C + D_root·grundmix
- Sträng n≥2: cₙ = (1−D_fill)·C + D_fill·cₙ₋₁ — punkterna konvergerar geometriskt mot C
- Buffertskikt (valfritt, känd claddingpraxis): sträng 1..N_buffer använder buffertfiller
  C1 (default ER309L), därefter claddinglegering C2 — samma utspädningsregler oavsett
  filler. UI klampar N_buffer till 1..antal strängar−1 (sista strängen alltid C2);
  `multiPassCompositions` själv är permissiv (buffer.passes ≥ passes ⇒ enbart buffert)

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS v4 (konfigurerad i `src/index.css` via `@theme`)
- Diagrammet är ren SVG i React — inga chart-bibliotek
- Tester: vitest (`npx vitest run`)
- Deploy: **eget** Vercel-projekt `scheffler-v2` (`vercel --prod --yes`) — länka aldrig mot v1-projektet

## Arkitektur

```
src/
  data/materials.ts    Materialdatabas: 9 stål (inkl. filler ER309L), MaterialSelection
                       (preset | custom), resolveMaterial
  data/schaeffler.ts   Diagramgeometri: 8 regionpolygoner, 7 ferritlinjer, axelgränser
  lib/calc.ts          creq/nieq (Schaeffler 1949), mixComposition (linjär), classifyPoint
                       (ray casting point-in-polygon), estimateFerrite (interpolering),
                       weldComposition, multiPassCompositions, analyzeComposition
  lib/warnings.ts      Varning bara för punkter utanför diagrammet (N märkta material +
                       passpunkter) + disclaimer med referens till Schaeffler 1949; kol-/kväve-
                       varningar borttagna efter expertgranskning sep 2026
  lib/calc.test.ts     17 v1-tester — FÅR ALDRIG REDIGERAS; nya tester läggs i weld.test.ts
  lib/weld.test.ts     Tester för weldComposition/multiPass/resolveMaterial/varningar
  components/          SchaefflerDiagram (SVG, generiska markers/lines), MaterialSelect
                       (preset + custom-editor + None för filler), WeldControls
                       (balance/dilution/passes), ResultPanel (slutresultat + per-pass-tabell)
  App.tsx              State + sammankoppling
```

## Viktigt om diagramdatan

Koordinaterna i `src/data/schaeffler.ts` är konsensus från två oberoende
vektordigitaliseringar (dacapo svetshandbok-PDF och Wikimedia Commons
"Diagramme schaeffler.svg") som stämmer inom ±0,5 ekvivalentenheter. **Ändra inte
polygonkoordinaterna utan ny källa** — testerna i calc.test.ts låser klassificeringen
av kända punkter. Formlerna är kanonisk Schaeffler (utan kväve). Enligt expertgranskningen
(sep 2026) ska apptexter inte nämna senare koefficienter (DeLong/WRC) eller lista
olämpliga processer, utan hänvisa till originalkällan.

UI-text på engelska (ändrat från svenska juni 2026), kod och kommentarer på engelska.
Decimaler med punkt. HV:s grafiska profil:
mörkblå #003b5b, blå #1380a4, ljusblå #e4f1f8, Arial, skarpa hörn (inga rounded).
Extra markörfärger i v2: filler C teal #0f766e, svetspunkt orange #d9480f.

## Enmaterialsläge (sep 2026)

`LookupHint` (under diagrammet) beskriver hur man slår upp ett enda material: Material A, reglaget
på 100 % A, Filler C = None. `isSingleMaterialLookup` (`src/lib/lookup.ts`) är då sann, och `App.tsx`
utelämnar B-markören, linjen A–B och Material B ur varningskontrollen. Inget separat läge eller knapp.

## Panelordning för tillsats (sep 2026)

Inställningsspalten: Material A → Material B → buffert-kryssruta → Buffer filler C1 (om ikryssad) →
Filler C / Cladding filler C2. Bufferten svetsas först och står därför före C2. Kryssrutan renderas
alltid men är disabled och visas okryssad när Filler C = None; `useBuffer`-state behålls.

## Markörstil i diagrammet (sep 2026)

Materialmarkörer ritas som "brickor": större form med vit kontur och vit bokstav inuti (A cirkel,
B fyrkant, C/C1/C2 romb; ritordning punkter → ringar → brickor via markerLayer). Svetspunktens orange ring (r=13, vit understroke) ritas under
brickorna, så den syns som en ring runt A i enmaterialsläget. Material B är mörk magenta `#8a1c5a`
(token `--color-mat-b`, klass `border-l-mat-b` på B-panelen) – en diagramdatafärg som medvetet
ligger utanför HV-paletten, eftersom HV-blått försvann mot austenitfältet. Beslutat 2026-09-20.

## Axel, disclaimer och originalet (2026-09-20)

Efter att svetsexperten läst genomgången av Schaeffler 1949: Ni-axeln är 0–30 som i originalbladet
(fält och 0 %/5 %-linjerna klippta vid 30 på samma linjer). Disclaimern anger att diagrammet bygger på
experimentdata från bågsvetsning (ingen uppräkning av andra processer), att martensitiska/ferritiska
sorter bara predikteras kvalitativt och att blandförband ger en första approximation; `LIABILITY`
visas sist. Schaefflers punkt X (Type 318) är ett test. Att 1949 är en revision av äldre diagram ska
INTE nämnas i appen.

Geometrins jämförelse mot originalet finns i `../scheffler/docs/comparison/`; ett eventuellt byte av
geometri är ett öppet beslut (väntar på expertens svar) och ska i så fall göras i v1 och v2 samtidigt.
