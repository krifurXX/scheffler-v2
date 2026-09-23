/**
 * Schaeffler diagram geometry (Schaeffler 1949, Metal Progress 56).
 *
 * Coordinates are straight-line fits to the original 1949 sheet (400 dpi scan of
 * Metal Progress p. 680-B, deskewed and calibrated against its own grid to
 * ±0.04 units; fit rms 0.015–0.02 units per line). Polygon vertices are the exact
 * intersections of those lines, rounded to 0.01. Two independent vector
 * reproductions (dacapo, Wikimedia) agree within 0.1–0.65 units and serve as a
 * cross-check. See docs/comparison/original1949/. x = Cr_eq, y = Ni_eq.
 */

export type Point = [number, number]

export const AXIS = {
  crMin: 0,
  crMax: 40,
  niMin: 0,
  niMax: 30, // Schaeffler's original 1949 sheet spans Cr_eq 0–40 and Ni_eq 0–30
} as const

export type RegionId = 'A' | 'A_M' | 'M' | 'F_M' | 'M_F' | 'A_M_F' | 'A_F' | 'F'

export interface Region {
  id: RegionId
  /** Display label */
  label: string
  /** Short label drawn inside the diagram */
  short: string
  polygon: Point[]
  /** Anchor for the in-diagram label */
  labelAt: Point
}

export const REGIONS: Region[] = [
  {
    id: 'A',
    label: 'Austenite',
    short: 'A',
    polygon: [[0, 25.52], [17.68, 11.29], [34.73, 30], [0, 30]],
    labelAt: [14, 24],
  },
  {
    id: 'A_M',
    label: 'Austenite + martensite',
    short: 'A + M',
    polygon: [[0, 25.52], [0, 19.35], [14.43, 7.72], [17.68, 11.29]],
    labelAt: [7, 16.2],
  },
  {
    id: 'M',
    label: 'Martensite',
    short: 'M',
    polygon: [[0, 19.35], [0, 7.39], [2.42, 0], [7.4, 0], [14.43, 7.72]],
    labelAt: [5.5, 7.5],
  },
  {
    id: 'F_M',
    label: 'Ferrite + martensite',
    short: 'F + M',
    polygon: [[0, 7.39], [0, 0], [2.42, 0]],
    labelAt: [0.8, 2.4],
  },
  {
    id: 'M_F',
    label: 'Martensite + ferrite',
    short: 'M + F',
    polygon: [[7.4, 0], [12.15, 0], [20.58, 2.75], [14.43, 7.72]],
    labelAt: [13, 3.4],
  },
  {
    id: 'A_M_F',
    label: 'Austenite + martensite + ferrite',
    short: 'A + M + F',
    polygon: [[14.43, 7.72], [20.58, 2.75], [26.07, 4.55], [17.68, 11.29]],
    labelAt: [19.7, 6.6],
  },
  {
    id: 'A_F',
    label: 'Austenite + ferrite',
    short: 'A + F',
    polygon: [[17.68, 11.29], [26.07, 4.55], [40, 9.1], [40, 30], [34.73, 30]],
    labelAt: [30, 16],
  },
  {
    id: 'F',
    label: 'Ferrite',
    short: 'F',
    polygon: [[12.15, 0], [40, 0], [40, 9.1]],
    labelAt: [30, 3],
  },
]

export interface FerriteLine {
  pct: number
  start: Point
  end: Point
}

/**
 * Iso-ferrite lines in the A+F / A+M+F fields. The 0 % and 100 % lines span
 * the whole diagram; the 5–80 % lines are drawn only above the M/(A+M) boundary.
 * The 0 % and 5 % lines are clipped at Ni_eq = 30 (same lines, shorter; top of the original sheet).
 */
export const FERRITE_LINES: FerriteLine[] = [
  { pct: 0, start: [7.4, 0], end: [34.73, 30] },
  { pct: 5, start: [14.92, 7.32], end: [37.37, 30] },
  { pct: 10, start: [15.59, 6.77], end: [40, 28.37] },
  { pct: 20, start: [16.51, 6.03], end: [40, 23.07] },
  { pct: 40, start: [17.41, 5.3], end: [40, 19.66] },
  { pct: 80, start: [18.63, 4.32], end: [40, 14.9] },
  { pct: 100, start: [12.15, 0], end: [40, 9.1] },
]
