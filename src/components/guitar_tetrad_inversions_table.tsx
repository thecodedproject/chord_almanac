import "./guitar_tetrad_inversions_table.css"

import {CSSProperties, Fragment} from "react";

import {
  Mode,
  Note,
  TetradVoicing,
  VoiceLeadingChord,
  diatonicScale,
  numTetradVoices,
  tetradVoicing,
  tetradVoicings,
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

// The tetrad is voiced on the four strings below (and including) this one. The widest
// voicings span a little over two octaves, which only fits from the lowest string.
const startingString = 6

export function GuitarTetradInversionsTable() {

  //TODO pass chord to table
  const chord: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1,3,5,7],
  }

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
  {chord, voicing, voicingRow, inversion}: {
    chord: VoiceLeadingChord,
    voicing: TetradVoicing,
    voicingRow: number,
    inversion: number,
  }
) {

  // a voicing spread over more than the neck can reach cannot be played on these
  // strings; show the cell as empty rather than losing the rest of the table
  let tabNotes: TabNote[]
  try {
    tabNotes = tabNotesForVoicing(
      tetradVoicing(chord, voicing, inversion),
      {
        startingString: startingString,
      },
    )
  } catch (e) {
    if (!(e instanceof RangeError)) {
      throw e
    }
    return (
      <div
        className="fingerChart fingerChartUnplayable"
        style={{
          "--voicing": voicingRow,
          "--inversion": inversion+1,
        } as FingerChartProps}
      >
        does not fit on the neck
      </div>
    )
  }

  return (
    <div
      className="fingerChart"
      style={{
        "--voicing": voicingRow,
        "--inversion": inversion+1,
      } as FingerChartProps}
    >
      <GuitarFingerChart tabNotes={tabNotes}/>
    </div>
  )
}
