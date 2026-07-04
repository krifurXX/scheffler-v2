import { AXIS, FERRITE_LINES, REGIONS, type RegionId } from '../data/schaeffler'

export interface DiagramPoint {
  x: number
  y: number
  label: string
}

interface Props {
  pointA: DiagramPoint
  pointB: DiagramPoint
  mixPoint: DiagramPoint
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

export default function SchaefflerDiagram({ pointA, pointB, mixPoint, activeRegionId }: Props) {
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

      {/* mixing line A–B */}
      <line
        x1={px(pointA.x)}
        y1={py(pointA.y)}
        x2={px(pointB.x)}
        y2={py(pointB.y)}
        stroke="#003b5b"
        strokeWidth={1.5}
        strokeDasharray="2 3"
      />

      {/* points A and B */}
      <circle cx={px(pointA.x)} cy={py(pointA.y)} r={6} fill="#003b5b" />
      <text x={px(pointA.x) + 9} y={py(pointA.y) - 8} fontSize={13} fontWeight={700} fill="#003b5b">
        A
      </text>
      <rect x={px(pointB.x) - 5.5} y={py(pointB.y) - 5.5} width={11} height={11} fill="#1380a4" />
      <text x={px(pointB.x) + 9} y={py(pointB.y) - 8} fontSize={13} fontWeight={700} fill="#1380a4">
        B
      </text>

      {/* mix point */}
      <circle cx={px(mixPoint.x)} cy={py(mixPoint.y)} r={8} fill="none" stroke="#d9480f" strokeWidth={3} />
      <circle cx={px(mixPoint.x)} cy={py(mixPoint.y)} r={2.5} fill="#d9480f" />
    </svg>
  )
}
