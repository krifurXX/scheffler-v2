import { useMemo, useState } from 'react'
import MaterialSelect from './components/MaterialSelect'
import MixSlider from './components/MixSlider'
import ResultPanel from './components/ResultPanel'
import SchaefflerDiagram from './components/SchaefflerDiagram'
import { MATERIALS } from './data/materials'
import { classifyPoint, creq, estimateFerrite, mixComposition, nieq } from './lib/calc'
import { collectWarnings } from './lib/warnings'

export default function App() {
  const [materialA, setMaterialA] = useState(MATERIALS[0]) // 304
  const [materialB, setMaterialB] = useState(MATERIALS[7]) // S355
  const [pctB, setPctB] = useState(50)

  const mixed = useMemo(
    () => mixComposition(materialA.composition, materialB.composition, pctB / 100),
    [materialA, materialB, pctB],
  )

  const mixX = creq(mixed)
  const mixY = nieq(mixed)
  const region = classifyPoint(mixX, mixY)
  const ferritePct = estimateFerrite(mixX, mixY)
  const warnings = collectWarnings(materialA, materialB, mixed)

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-hv-dark text-white px-6 py-4">
        <h1 className="text-xl font-bold">Schaeffler diagram — mixing two materials</h1>
        <p className="text-sm text-hv-light mt-0.5">
          Select two materials and see where the mixture ends up in the diagram
        </p>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section aria-label="Diagram">
          <SchaefflerDiagram
            pointA={{ x: creq(materialA.composition), y: nieq(materialA.composition), label: 'A' }}
            pointB={{ x: creq(materialB.composition), y: nieq(materialB.composition), label: 'B' }}
            mixPoint={{ x: mixX, y: mixY, label: 'Mixture' }}
            activeRegionId={region?.id ?? null}
          />
        </section>

        <section className="space-y-4" aria-label="Settings and result">
          <MaterialSelect
            label="Material A"
            value={materialA}
            onChange={setMaterialA}
            accentClass="border-l-hv-dark"
          />
          <MaterialSelect
            label="Material B"
            value={materialB}
            onChange={setMaterialB}
            accentClass="border-l-hv-blue"
          />
          <MixSlider pctB={pctB} onChange={setPctB} nameA={materialA.designation} nameB={materialB.designation} />
          <ResultPanel mixed={mixed} region={region} ferritePct={ferritePct} warnings={warnings} />
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-6 text-xs text-gray-500">
        Diagram after Schaeffler (1949). Boundary lines digitized from published reproductions
        (±0.5 units). HV.SE
      </footer>
    </div>
  )
}
