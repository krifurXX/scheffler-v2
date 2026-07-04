# Schaefflerdiagram-app

Interaktiv undervisningsapp (Högskolan Väst): välj två material A och B, se deras
punkter i Schaefflerdiagrammet och flytta en blandningspunkt längs linjen mellan dem
med en slider. Appen visar fasfält (austenit/ferrit/martensit/blandfält) och
uppskattad ferrithalt.

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS v4 (konfigurerad i `src/index.css` via `@theme`)
- Diagrammet är ren SVG i React — inga chart-bibliotek
- Tester: vitest (`npx vitest run`)
- Deploy: Vercel (`vercel --prod --yes`)

## Arkitektur

```
src/
  data/materials.ts    Materialdatabas: 8 stål med typsammansättning, EN-intervall, flaggor
  data/schaeffler.ts   Diagramgeometri: 8 regionpolygoner, 7 ferritlinjer, axelgränser
  lib/calc.ts          creq/nieq (Schaeffler 1949), mixComposition (linjär), classifyPoint
                       (ray casting point-in-polygon), estimateFerrite (interpolering)
  lib/warnings.ts      Valideringsregler (hög C, kväve, utanför diagrammet) + disclaimer
  lib/calc.test.ts     17 tester, bl.a. mot BSSA:s publicerade exempel och full
                       polygontäckning av diagramytan
  components/          SchaefflerDiagram (SVG), MaterialSelect, MixSlider, ResultPanel
  App.tsx              State + sammankoppling
```

## Viktigt om diagramdatan

Koordinaterna i `src/data/schaeffler.ts` är konsensus från två oberoende
vektordigitaliseringar (dacapo svetshandbok-PDF och Wikimedia Commons
"Diagramme schaeffler.svg") som stämmer inom ±0,5 ekvivalentenheter. **Ändra inte
polygonkoordinaterna utan ny källa** — testerna i calc.test.ts låser klassificeringen
av kända punkter. Formlerna är kanonisk Schaeffler (utan kväve); DeLong/WRC nämns
bara i varningstexter.

UI-text på engelska (ändrat från svenska juni 2026), kod och kommentarer på engelska.
Decimaler med punkt. HV:s grafiska profil:
mörkblå #003b5b, blå #1380a4, ljusblå #e4f1f8, Arial, skarpa hörn (inga rounded).
