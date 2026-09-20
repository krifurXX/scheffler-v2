import { AXIS, FERRITE_LINES, REGIONS, type RegionId } from '../data/schaeffler'

export interface DiagramMarker {
  x: number
  y: number
  /** Rendered next to the marker; empty string = no label */
  label: string
  shape: 'circle' | 'square' | 'diamond' | 'ring' | 'dot'
  color: string
  size?: 'normal' | 'small'
}

export interface DiagramLine {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  dash?: string
  opacity?: number
}

interface Props {
  markers: DiagramMarker[]
  lines: DiagramLine[]
  activeRegionId: RegionId | null
}

// px per equivalent unit; margins leave room for axis titles and ferrite labels
const S = 22
const M = { left: 64, right: 64, top: 30, bottom: 64 }
const W = M.left + AXIS.crMax * S + M.right
const H = M.top + AXIS.niMax * S + M.bottom

const px = (x: number) => M.left + x * S
const py = (y: number) => M.top + (AXIS.niMax - y) * S

const REGION_FILL: Record<RegionId, string> = {
  A: '#d2e6f4',
  A_M: '#e0d8ec',
  M: '#f3d4d4',
  F_M: '#ecdccc',
  M_F: '#ecdccc',
  A_M_F: '#e6e0d2',
  A_F: '#d8ecd8',
  F: '#f2ecca',
}

/** Draw order: 0 = small dots, 1 = rings, 2 = lettered material badges (always on top). */
const markerLayer = (m: DiagramMarker): number =>
  m.shape === 'ring' ? 1 : m.size !== 'small' && m.label && m.shape !== 'dot' ? 2 : 0

export default function SchaefflerDiagram({ markers, lines, activeRegionId }: Props) {
  const gridX = []
  for (let x = 0; x <= AXIS.crMax; x += 2) gridX.push(x)
  const gridY = []
  for (let y = 0; y <= AXIS.niMax; y += 2) gridY.push(y)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto bg-white border border-gray-300"
      role="img"
      aria-label="Schaeffler diagram"
    >
      {/* phase fields */}
      {REGIONS.map((r) => (
        <polygon
          key={r.id}
          points={r.polygon.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}
          fill={REGION_FILL[r.id]}
          fillOpacity={activeRegionId === r.id ? 1 : 0.45}
          stroke="#46555f"
          strokeWidth={activeRegionId === r.id ? 2 : 1}
        />
      ))}

      {/* grid (drawn above fields, very light) */}
      {gridX.map((x) => (
        <line key={`gx${x}`} x1={px(x)} y1={py(0)} x2={px(x)} y2={py(AXIS.niMax)} stroke="#000" strokeOpacity={0.07} />
      ))}
      {gridY.map((y) => (
        <line key={`gy${y}`} x1={px(0)} y1={py(y)} x2={px(AXIS.crMax)} y2={py(y)} stroke="#000" strokeOpacity={0.07} />
      ))}

      {/* iso-ferrite lines */}
      {FERRITE_LINES.filter((l) => l.pct !== 0 && l.pct !== 100).map((l) => (
        <line
          key={l.pct}
          x1={px(l.start[0])}
          y1={py(l.start[1])}
          x2={px(l.end[0])}
          y2={py(l.end[1])}
          stroke="#46555f"
          strokeWidth={0.8}
          strokeDasharray="6 4"
        />
      ))}
      {FERRITE_LINES.map((l) => {
        const atTop = l.end[1] >= AXIS.niMax - 0.01
        const lx = atTop ? px(l.end[0]) + 4 : px(l.end[0]) + 6
        const ly = atTop ? py(l.end[1]) - 8 : py(l.end[1]) + 4
        return (
          <text key={`fl${l.pct}`} x={lx} y={ly} fontSize={12} fill="#46555f">
            {l.pct} %
          </text>
        )
      })}
      <text x={px(40) + 6} y={py(28.2) - 18} fontSize={11} fill="#46555f">
        ferrite
      </text>

      {/* region labels */}
      {REGIONS.map((r) => (
        <text
          key={`lbl${r.id}`}
          x={px(r.labelAt[0])}
          y={py(r.labelAt[1])}
          fontSize={r.short.length > 1 ? 13 : 16}
          fontWeight={700}
          fill="#1f2d36"
          textAnchor="middle"
        >
          {r.short}
        </text>
      ))}

      {/* axes */}
      <rect x={px(0)} y={py(AXIS.niMax)} width={AXIS.crMax * S} height={AXIS.niMax * S} fill="none" stroke="#1f2d36" strokeWidth={1.5} />
      {gridX.filter((x) => x % 4 === 0).map((x) => (
        <text key={`tx${x}`} x={px(x)} y={py(0) + 18} fontSize={12} textAnchor="middle" fill="#202020">
          {x}
        </text>
      ))}
      {gridY.filter((y) => y % 4 === 0).map((y) => (
        <text key={`ty${y}`} x={px(0) - 8} y={py(y) + 4} fontSize={12} textAnchor="end" fill="#202020">
          {y}
        </text>
      ))}
      <text x={px(AXIS.crMax / 2)} y={H - 16} fontSize={13} textAnchor="middle" fill="#202020">
        Chromium equivalent  Cr
        <tspan baselineShift="sub" fontSize={10}>eq</tspan> = %Cr + %Mo + 1.5·%Si + 0.5·%Nb
      </text>
      <text
        x={20}
        y={py(AXIS.niMax / 2)}
        fontSize={13}
        textAnchor="middle"
        fill="#202020"
        transform={`rotate(-90 20 ${py(AXIS.niMax / 2)})`}
      >
        Nickel equivalent  Ni
        <tspan baselineShift="sub" fontSize={10}>eq</tspan> = %Ni + 30·%C + 0.5·%Mn
      </text>

      {/* scene lines (mixing lines, pass paths) */}
      {lines.map((l, i) => (
        <line
          key={`sl${i}`}
          x1={px(l.x1)}
          y1={py(l.y1)}
          x2={px(l.x2)}
          y2={py(l.y2)}
          stroke={l.color}
          strokeWidth={1.5}
          strokeDasharray={l.dash}
          strokeOpacity={l.opacity ?? 1}
        />
      ))}

      {/* scene markers, drawn in layers: small dots, then rings, then lettered badges on top */}
      {[...markers]
        .map((m, i) => ({ m, i }))
        .sort((a, b) => markerLayer(a.m) - markerLayer(b.m) || a.i - b.i)
        .map(({ m, i }) => {
          const outside = false
          const cx = px(m.x)
          const cy = py(m.y)
          const small = m.size === 'small'
          const badge = markerLayer(m) === 2
          if (badge) {
            // hollow (white) badge marks a point that is clamped to the diagram edge
            const fill = outside ? '#fff' : m.color
            const ink = outside ? m.color : '#fff'
            const stroke = outside ? m.color : '#fff'
            const ang = outside ? Math.atan2(py(m.y) - cy, px(m.x) - cx) : 0
            return (
              <g key={`sm${i}`}>
                {outside && (
                  <>
                    <line
                      x1={cx + 14 * Math.cos(ang)}
                      y1={cy + 14 * Math.sin(ang)}
                      x2={cx + 26 * Math.cos(ang)}
                      y2={cy + 26 * Math.sin(ang)}
                      stroke={m.color}
                      strokeWidth={2}
                    />
                    <polygon
                      points={`${cx + 26 * Math.cos(ang)},${cy + 26 * Math.sin(ang)} ${cx + 26 * Math.cos(ang) - 7 * Math.cos(ang - 0.45)},${cy + 26 * Math.sin(ang) - 7 * Math.sin(ang - 0.45)} ${cx + 26 * Math.cos(ang) - 7 * Math.cos(ang + 0.45)},${cy + 26 * Math.sin(ang) - 7 * Math.sin(ang + 0.45)}`}
                      fill={m.color}
                    />
                  </>
                )}
                {m.shape === 'circle' && <circle cx={cx} cy={cy} r={10.5} fill={fill} stroke={stroke} strokeWidth={2} />}
                {m.shape === 'square' && (
                  <rect x={cx - 10} y={cy - 10} width={20} height={20} fill={fill} stroke={stroke} strokeWidth={2} />
                )}
                {m.shape === 'diamond' && (
                  <rect
                    x={cx - 9}
                    y={cy - 9}
                    width={18}
                    height={18}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2}
                    transform={`rotate(45 ${cx} ${cy})`}
                  />
                )}
                <text
                  x={cx}
                  y={cy + (m.label.length > 1 ? 4 : 4.5)}
                  fontSize={m.label.length > 1 ? 11 : 13}
                  fontWeight={700}
                  fill={ink}
                  textAnchor="middle"
                >
                  {m.label}
                </text>
                {outside && (
                  <text
                    x={cx + 16}
                    y={cy - 12}
                    fontSize={12}
                    fontWeight={700}
                    fill={m.color}
                    stroke="#fff"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    ({m.x.toFixed(1)}, {m.y.toFixed(1)})
                  </text>
                )}
              </g>
            )
          }
          return (
            <g key={`sm${i}`}>
              {m.shape === 'ring' ? (
                <>
                  <circle cx={cx} cy={cy} r={13} fill="none" stroke="#fff" strokeWidth={6} />
                  <circle cx={cx} cy={cy} r={13} fill="none" stroke={m.color} strokeWidth={3} />
                  {!outside && <circle cx={cx} cy={cy} r={2.5} fill={m.color} />}
                </>
              ) : (
                <circle
                  cx={cx}
                  cy={cy}
                  r={small ? 3.5 : 5}
                  fill={outside ? '#fff' : m.color}
                  stroke={outside ? m.color : '#fff'}
                  strokeWidth={1.5}
                />
              )}
              {m.label && (
                <text
                  x={cx + 7}
                  y={cy - 6}
                  fontSize={11}
                  fontWeight={700}
                  fill={m.color}
                  stroke="#fff"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {m.label}
                </text>
              )}
            </g>
          )
        })}
    </svg>
  )
}
