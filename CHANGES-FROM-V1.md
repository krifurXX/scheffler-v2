# What's new in v2

This is a further development of the original Schaeffler diagram app
(`../scheffler`, live at https://scheffler.vercel.app). Version 2 is deployed
separately at https://scheffler-v2.vercel.app. The original app is unchanged.

Version 1 answered one question: *where does a mixture of two steels land in the
Schaeffler diagram?* Version 2 extends this into a realistic welding scenario:
two base materials joined with a filler metal, proper dilution terminology, and
multi-pass welds — while the simple v1 exercise remains the default view.

## 1. Free chemical composition input

Every material slot now offers **"Custom alloy…"** in addition to the preset
steels. Selecting it turns the composition table into editable numeric fields
(C, Mn, Si, Cr, Ni, Mo, Nb), pre-filled from the previously selected steel so
you can start from a known grade and adjust individual elements. Cr_eq and
Ni_eq update live, and compositions that fall outside the diagram axes trigger
an extrapolation warning. The tool is no longer limited to the built-in
material list — any alloy within the diagram's Cr_eq/Ni_eq range can be
plotted.

## 2. Filler metal (Material C)

A third material slot, **Filler C**, models the welding consumable. It defaults
to **"None — autogenous weld"**, which reproduces v1's behavior exactly, so the
introductory two-material exercise is still the starting point. Choosing a
filler (preset or custom) reveals the welding controls and extends the diagram:

- the filler appears as a teal diamond **C**;
- a gray dot marks the base-metal mix on the A–B line;
- the weld-metal point lies on the line from the base mix toward C.

A new preset was added for this purpose: **ER309L**
(EN ISO 14343-A: G 23 12 L), the classic filler for dissimilar joints such as
the app's default 304 + S355 case.

## 3. Conventional welding terminology

Version 1 used a single "Mixing ratio" slider. Version 2 separates the two
concepts that this conflated:

- **Base metal balance (A : B)** — the share of each base material in the
  base-metal contribution (depends on joint geometry).
- **Dilution (D)** — the fraction of the weld metal that is melted base
  material, which is what "dilution" conventionally means in welding. Root and
  fill passes have separate dilution values (D_root, default 40 %, and D_fill,
  default 25 %).

## 4. Multi-pass welding

A **"Number of passes"** control (1–10) simulates multi-pass welds:

- Pass 1 (root): filler diluted with the base-metal mix at D_root.
- Pass n ≥ 2: filler diluted with the *previous pass* at D_fill.

Compositions therefore converge geometrically toward the filler point — each
fill pass closes the remaining distance to C by the factor D_fill. The diagram
shows numbered pass points along the converging path, and the result panel adds
a **per-pass microstructure table** (Cr_eq, Ni_eq, phase field, ferrite content
per pass). The default scenario demonstrates the classic teaching point: the
root pass lands at ~0.5 % ferrite (hot-cracking risk) while later passes climb
to healthy ferrite levels.

## Under the hood

- The SVG diagram component now takes generic marker/line arrays instead of
  three fixed points, so scenes with any number of materials and passes render
  without further changes.
- New calculation functions in `src/lib/calc.ts`: `weldComposition`,
  `multiPassCompositions`, `analyzeComposition`. All are thin compositions of
  the original linear-mixing math; the Schaeffler formulas and the digitized
  diagram geometry are untouched.
- Warnings (`src/lib/warnings.ts`) generalized from exactly two materials to
  any number of labeled materials plus the pass sequence, with separate
  warnings for a final weld point vs. an intermediate pass outside the diagram.
- The 17 original tests are unchanged and still lock the diagram geometry and
  classification; 18 new tests in `src/lib/weld.test.ts` cover the weld math,
  multi-pass convergence, custom materials, and the new warnings (35 total).
- Single-material lookup (September 2026): a "Look up a single material" box
  under the diagram explains the steps; at 100 % A with no filler, Material B
  and the A–B line are hidden and B is left out of the warning check.
- Marker style (September 2026): materials are drawn as lettered badges with a
  white outline, Material B in dark magenta (#8a1c5a); rings are drawn beneath
  badges. The recorded demo videos still show the earlier, smaller markers.
