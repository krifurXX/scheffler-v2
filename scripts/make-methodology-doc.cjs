const path = require('path')
const fs = require('fs')
const { Document, Packer, Paragraph, TextRun, HeadingLevel, LevelFormat,
        AlignmentType, Footer, PageNumber } = require(path.join(require('child_process')
          .execSync('npm root -g').toString().trim(), 'docx'))

// HV brand: Arial, dark blue #003b5b headings, blue #1380a4 accents
const HV_DARK = '003b5b'

const sub = (t) => new TextRun({ text: t, subScript: true })
const T = (t, opts = {}) => new TextRun({ text: t, ...opts })

// Paragraph helper for body text
const P = (children, opts = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [T(children)],
    spacing: { after: 160, line: 300 }, ...opts })

const bullet = (children) =>
  new Paragraph({ numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 100, line: 300 },
    children: Array.isArray(children) ? children : [T(children)] })

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 }, paragraph: {} } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal',
        run: { size: 40, bold: true, font: 'Arial', color: HV_DARK },
        paragraph: { spacing: { after: 120 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: HV_DARK },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '–',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            T('University West · HV.SE · Page ', { size: 18, color: '666666' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '666666' }),
          ],
        })],
      }),
    },
    children: [
      new Paragraph({ style: 'Title',
        children: [T('How the Schaeffler Diagram in the App Was Constructed')] }),
      P([T('Methodology description for the interactive Schaeffler diagram web application (', {}),
         T('scheffler.vercel.app', { color: '1380a4' }),
         T('), University West, June 2026.', {})],
        { spacing: { after: 320, line: 300 } }),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T('1. Equivalent formulas')] }),
      P([T('The app uses the canonical Schaeffler (1949) formulas, taken from his original paper '),
         T('Constitution Diagram for Stainless Steel Weld Metal', { italics: true }),
         T(' (Metal Progress, vol. 56, 1949):')]),
      bullet([T('Cr'), sub('eq'), T(' = %Cr + %Mo + 1.5·%Si + 0.5·%Nb')]),
      bullet([T('Ni'), sub('eq'), T(' = %Ni + 30·%C + 0.5·%Mn')]),
      P([T('The exact coefficients were cross-checked against three independent sources: the British Stainless Steel Association (BSSA) technical article on the Schaeffler and DeLong diagrams, the dacapo welding handbook, and materialwelding.com. Later variants (DeLong’s +30·%N term, Russian extensions with Ti and V) were deliberately excluded, since the app implements the classic diagram; nitrogen is instead handled through a warning message.')]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T('2. Phase-field boundaries')] }),
      P([T('The original diagram was hand-drawn by Schaeffler from roughly 600 weld metallographs, so no exact analytical equations exist — the boundaries must be digitized from published reproductions. Rather than estimating coordinates from pixel images, the boundary lines were extracted from the embedded vector path data of two independently produced, professionally drawn reproductions:')]),
      bullet([T('the dacapo welding handbook PDF (an InDesign vector drawing, grid-calibrated), and')]),
      bullet([T('the Wikimedia Commons file “Diagramme schaeffler.svg” (an Inkscape vector drawing, grid-calibrated).')]),
      P([T('The two digitizations agree within about ±0.5 equivalent units along all boundaries (worst case ~1 unit at extrapolated extremes). The app uses consensus values of the two. Internal consistency checks were applied: the iso-ferrite lines terminate exactly on the martensite boundary in both sources, and the austenite-field boundary terminates exactly on the 100 % ferrite line. A third source, a US patent digitization giving the 0 %-ferrite line as Ni'),
         sub('eq'), T(' = 1.125·(Cr'), sub('eq'), T(' − 8), agrees within ~1 unit.')]),
      P([T('The result is eight polygons (A, A+M, M, F+M, M+F, A+M+F, A+F, F) that tile the diagram area (Cr'),
         sub('eq'), T(' 0–40, Ni'), sub('eq'),
         T(' 0–32) completely and without overlap, plus seven iso-ferrite lines (0, 5, 10, 20, 40, 80, 100 %).')]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T('3. Classification and mixing')] }),
      P([T('A mixture point is computed by linearly interpolating the chemical composition element by element; because both equivalent formulas are linear in composition, the mixed point moves linearly along the straight line between materials A and B in the diagram. The phase field is determined by a point-in-polygon test against the eight regions, and the ferrite content is estimated by interpolating between the two nearest iso-ferrite lines.')]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T('4. Validation')] }),
      P([T('The implementation is locked down by 17 automated unit tests, including:')]),
      bullet([T('reproduction of BSSA’s published worked examples (AISI 304 → Cr'),
        sub('eq'), T(' 18.92, Ni'), sub('eq'), T(' 10.15; AISI 316 → 19.83, 13.15, both reproduced within 0.3 units),')]),
      bullet([T('classification of known reference points, and')]),
      bullet([T('a coverage test verifying that every point on a dense grid over the whole diagram falls in exactly one region.')]),
      P([T('The rendered diagram was also compared visually against the source reproductions.')]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [T('5. Accuracy')] }),
      P([T('All boundary coordinates carry an uncertainty of about ±0.5 equivalent units, which is within the intrinsic accuracy of the original hand-drawn diagram — Schaeffler himself quoted ±4 % ferrite. The diagram applies to weld metal cooled at arc-welding rates and gives an estimate of the as-solidified microstructure, not exact phase fractions, and it does not account for nitrogen (for nitrogen-alloyed grades the DeLong or WRC-1992 diagram should be used).')]),
    ],
  }],
})

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(path.join(__dirname, '..', 'Schaeffler-diagram-methodology.docx'), buf)
  console.log('written')
})
