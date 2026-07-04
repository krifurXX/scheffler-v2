import type { Composition } from '../data/materials'
import type { Region } from '../data/schaeffler'
import { creq, nieq } from '../lib/calc'
import { DISCLAIMER, type Warning } from '../lib/warnings'

interface Props {
  mixed: Composition
  region: Region | null
  ferritePct: number | null
  warnings: Warning[]
}

const fmt = (v: number, d = 2) => v.toFixed(d)

export default function ResultPanel({ mixed, region, ferritePct, warnings }: Props) {
  return (
    <div className="border border-gray-300 border-l-4 border-l-hv-dark bg-white">
      <div className="px-4 py-2 bg-hv-light">
        <h2 className="font-bold text-hv-dark">Result for the mixing point</h2>
      </div>
      <div className="px-4 py-3 space-y-3 text-hv-text">
        <p className="text-lg">
          Phase field:{' '}
          <strong className="text-hv-dark">
            {region ? region.label : 'Outside the diagram'}
          </strong>
          {ferritePct !== null && (
            <span className="block text-sm text-gray-700">
              Estimated ferrite content: approx. {fmt(Math.round(ferritePct * 2) / 2, 1)} %
            </span>
          )}
        </p>

        <p className="text-sm tabular-nums">
          Cr<sub>eq</sub> = <strong>{fmt(creq(mixed), 1)}</strong> · Ni<sub>eq</sub> ={' '}
          <strong>{fmt(nieq(mixed), 1)}</strong>
        </p>

        <div>
          <h3 className="text-sm font-bold text-hv-dark mb-1">Mixed composition (wt-%)</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                {['C', 'Mn', 'Si', 'Cr', 'Ni', 'Mo', 'Nb'].map((el) => (
                  <th key={el} className="font-normal text-right">{el}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {(['C', 'Mn', 'Si', 'Cr', 'Ni', 'Mo', 'Nb'] as const).map((el) => (
                  <td key={el} className="text-right tabular-nums">
                    {fmt(mixed[el], el === 'C' ? 3 : 2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {warnings.length > 0 && (
          <ul className="space-y-2">
            {warnings.map((w) => (
              <li key={w.id} className="text-sm bg-amber-50 border border-amber-300 border-l-4 border-l-amber-500 px-3 py-2">
                ⚠ {w.text}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-600 border-t border-gray-200 pt-2">{DISCLAIMER}</p>
      </div>
    </div>
  )
}
