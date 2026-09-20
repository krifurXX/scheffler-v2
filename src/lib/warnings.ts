import type { Material } from '../data/materials'
import { creq, isInsideDiagram, nieq } from './calc'

export interface Warning {
  id: string
  text: string
}

export interface LabeledMaterial {
  label: string
  material: Material
}

/**
 * Validation rules for the Schaeffler prediction. Only geometric checks are
 * made; all other limitations of the diagram are covered by the general
 * statement in DISCLAIMER, as agreed in the expert review (September 2026).
 */
export function collectWarnings(
  inputs: LabeledMaterial[],
  passPoints: { x: number; y: number }[],
): Warning[] {
  const warnings: Warning[] = []

  for (const { material: m, label } of inputs) {
    if (!isInsideDiagram(creq(m.composition), nieq(m.composition))) {
      warnings.push({
        id: `outside-${label}`,
        text: `${label} (${m.designation}) lies outside the diagram area and prediction is not possible.`,
      })
    }
  }

  const final = passPoints[passPoints.length - 1]
  if (final && !isInsideDiagram(final.x, final.y)) {
    warnings.push({
      id: 'outside-weld',
      text: 'The weld metal point lies outside the diagram area and prediction is not possible.',
    })
  } else if (passPoints.slice(0, -1).some((p) => !isInsideDiagram(p.x, p.y))) {
    warnings.push({
      id: 'outside-pass',
      text: 'One or more intermediate pass points lie outside the diagram area and prediction is not possible.',
    })
  }

  return warnings
}

/** Always shown below the result — the diagram is an estimate, not a phase fraction. */
export const DISCLAIMER =
  'The Schaeffler diagram was developed from experimental data from arc-welding processes and gives an estimate of the microstructure — not exact phase fractions. It was developed from 300-series (3XX) austenitic weld metals; predictions for martensitic and ferritic grades are qualitative. For dissimilar joints it gives a first approximation of the resulting microstructure. Schaeffler himself quoted an accuracy of about ±4 % ferrite. The prediction is subject to the limitations and assumptions of the original Schaeffler diagram.'

/** Primary source, shown with the disclaimer. */
export const PRIMARY_REFERENCE =
  'Schaeffler, A. L. (1949). Constitution diagram for stainless steel weld metal. Metal Progress 56(11), 680–680B.'

/** Shown last, below the references. Wording agreed with the expert reviewer (September 2026). */
export const LIABILITY =
  'This app is an interactive digital version of the original published diagram, intended for education. No liability or responsibility is accepted for the predictions.'
