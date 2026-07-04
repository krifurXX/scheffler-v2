import { MATERIALS, type Material } from '../data/materials'
import { creq, nieq } from '../lib/calc'

interface Props {
  label: string
  value: Material
  onChange: (m: Material) => void
  accentClass: string
}

const fmt = (v: number, decimals = 2) =>
  v.toFixed(decimals).replace(/\.?0+$/, '') || '0'

export default function MaterialSelect({ label, value, onChange, accentClass }: Props) {
  return (
    <div className={`border border-gray-300 border-l-4 ${accentClass} bg-white`}>
      <div className="px-4 py-2 bg-hv-light">
        <label className="font-bold text-hv-dark" htmlFor={`select-${label}`}>
          {label}
        </label>
      </div>
      <div className="px-4 py-3 space-y-2">
        <select
          id={`select-${label}`}
          className="w-full border border-gray-400 px-2 py-1.5 bg-white text-hv-text"
          value={value.id}
          onChange={(e) => {
            const m = MATERIALS.find((x) => x.id === e.target.value)
            if (m) onChange(m)
          }}
        >
          {MATERIALS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.designation}
            </option>
          ))}
        </select>
        <table className="w-full text-xs text-hv-text">
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
                <td key={el} className="text-right tabular-nums">{fmt(value.composition[el])}</td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-600 tabular-nums">
          Cr<sub>eq</sub> = {fmt(creq(value.composition), 1)} · Ni<sub>eq</sub> = {fmt(nieq(value.composition), 1)}
        </p>
      </div>
    </div>
  )
}
