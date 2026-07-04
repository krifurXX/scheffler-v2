interface Props {
  /** percent of material B, 0–100 */
  pctB: number
  onChange: (pctB: number) => void
  nameA: string
  nameB: string
}

export default function MixSlider({ pctB, onChange, nameA, nameB }: Props) {
  return (
    <div className="border border-gray-300 border-l-4 border-l-hv-blue bg-white">
      <div className="px-4 py-2 bg-hv-light">
        <label className="font-bold text-hv-dark" htmlFor="mix-slider">
          Base metal balance (A : B)
        </label>
      </div>
      <div className="px-4 py-3">
        <input
          id="mix-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={pctB}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-hv-blue"
        />
        <div className="flex justify-between text-sm text-hv-text mt-1">
          <span>
            <strong>{100 - pctB} %</strong> A ({nameA})
          </span>
          <span>
            <strong>{pctB} %</strong> B ({nameB})
          </span>
        </div>
      </div>
    </div>
  )
}
