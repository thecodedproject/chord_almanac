import "./guitar_tetrad_inversions_table.css"

import {CSSProperties, Fragment} from "react";

import {
  TetradVoicing,
  VoiceLeadingChord,
  numTetradVoices,
  tetradVoicing,
  tetradVoicings,
  voicingScaleDegrees,
} from '../lib/chord_anthology'

import {
  TabNote,
  tabNotesForVoicing,
} from '../lib/guitar_notation'

import {
  GuitarFingerChart,
} from './guitar_finger_chart'

interface VoicingProps extends CSSProperties {
  "--voicing": number;
}

interface InversionProps extends CSSProperties {
  "--inversion": number;
}

interface FingerChartProps extends VoicingProps, InversionProps {}

const voicingLabels: Record<TetradVoicing, string> = {
  [TetradVoicing.Close]: "Close",
  [TetradVoicing.Drop2]: "Drop 2",
  [TetradVoicing.Drop3]: "Drop 3",
  [TetradVoicing.Drop2And3]: "Drop 2+3",
  [TetradVoicing.Drop2And4]: "Drop 2+4",
  [TetradVoicing.Spread]: "Spread",
}

// there is one inversion per chord voice; the first is the chord in root position
const inversionLabels = ["Root", "1st", "2nd", "3rd"]

export function GuitarTetradInversionsTable(
  {chord, strings}: {chord: VoiceLeadingChord, strings: number[]}
) {

  const inversions = [...Array(numTetradVoices)].map((_, i) => i)

  return (
    <>
      <div className="guitarTetradInversionsTable">

        {inversions.map((inversion) => (
          <div
            className="inversionLabel"
            style={{"--inversion": inversion+1} as InversionProps}
            key={inversion}
          >
            {inversionLabels[inversion]}
          </div>
        ))}

        {tetradVoicings.map((voicing, iVoicing) => (
          <Fragment key={voicing}>
            <div
              className="voicingLabel"
              style={{"--voicing": iVoicing+1} as VoicingProps}
            >
              {voicingLabels[voicing]}
            </div>
            {inversions.map((inversion) => (
              <FingerChart
                chord={chord}
                strings={strings}
                voicing={voicing}
                voicingRow={iVoicing+1}
                inversion={inversion}
                key={inversion}
              />
            ))}
          </Fragment>
        ))}

      </div>
    </>
  )
}

function FingerChart(
  {chord, strings, voicing, voicingRow, inversion}: {
    chord: VoiceLeadingChord,
    strings: number[],
    voicing: TetradVoicing,
    voicingRow: number,
    inversion: number,
  }
) {

  const voicedChord = tetradVoicing(chord, voicing, inversion)

  // a voicing spread wider than these strings can reach cannot be played on them; show
  // the cell as empty rather than losing the rest of the table
  let tabNotes: TabNote[] | undefined
  try {
    tabNotes = tabNotesForVoicing(
      voicedChord,
      {
        strings: strings,
      },
    )
  } catch (e) {
    if (!(e instanceof RangeError)) {
      throw e
    }
  }

  return (
    <div
      className="fingerChart"
      style={{
        "--voicing": voicingRow,
        "--inversion": inversion+1,
      } as FingerChartProps}
    >
      <div className="voicingDegrees">
        {voicingScaleDegrees(voicedChord).join(" ")}
      </div>
      {tabNotes == undefined
        ? <div className="unplayable">does not fit on these strings</div>
        : <GuitarFingerChart tabNotes={tabNotes}/>
      }
    </div>
  )
}
