import "./tetrad_voicing_chart.css"

import {CSSProperties} from "react";

import {
  TetradVoicing,
  VoiceLeadingChord,
  tetradVoicing,
  voicingScaleDegrees,
} from '../lib/chord_anthology'

import {
  TabNote,
  tabNotesForVoicing,
} from '../lib/guitar_notation'

import {
  GuitarFingerChart,
} from './guitar_finger_chart'

// TetradVoicingChart draws one voicing of one tetrad: the order it stacks its chord
// tones in, over the finger chart which plays it.
//
// It is laid out by whoever draws it - the `style` given is put on the chart itself, so
// a table can place the chart in its grid. A `label` is drawn above the chart, for a
// table whose columns do not name what each of their charts is.
export function TetradVoicingChart(
  {chord, strings, voicing, inversion, label, style}: {
    chord: VoiceLeadingChord,
    strings: number[],
    voicing: TetradVoicing,
    inversion: number,
    label?: string,
    style?: CSSProperties,
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
    <div className="fingerChart" style={style}>
      {label != undefined && <div className="chartLabel">{label}</div>}
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
