import "./guitar_tetrad_inversions_table.css"

import {CSSProperties} from "react";

import {cloneDeep} from "lodash"

import {
  Mode,
  Note,
  VoiceLeadingChord,
  majorScale,
  vlChordNotes,
} from '../lib/chord_anthology'

import {
  tabNotesNPerString,
} from '../lib/guitar_notation'

import {
  GuitarFingerChart,
} from './guitar_finger_chart'

interface VoiceProps extends CSSProperties {
  "--voice": number;
}

interface InversionProps extends CSSProperties {
  "--inversion": number;
}

interface FingerChartProps extends VoiceProps, InversionProps {}

export function GuitarTetradInversionsTable() {

  const notes = [
    {string: 1, fret: 1},
    {string: 2, fret: 2},
    {string: 3, fret: 3},
    {string: 4, fret: 4},
  ]

  const chord: VoiceLeadingChord = {
    scale: majorScale(Note.C, Mode.Ionian),
    tones: [1,5,7,3],
  }

  return (
    <>
      <div className="guitarTetradInversionsTable">

        <div className="voiceLabel" style={{"--voice": 1} as VoiceProps}>
          Voice 1
        </div>
        <div className="voiceLabel" style={{"--voice": 2} as VoiceProps}>
          Voice 2
        </div>
        <div className="voiceLabel" style={{"--voice": 3} as VoiceProps}>
          Voice 3
        </div>

        <div className="inversionLabel" style={{"--inversion": 1} as InversionProps}>
          Inversion 1
        </div>
        <div className="inversionLabel" style={{"--inversion": 2} as InversionProps}>
          Inversion 2
        </div>
        <div className="inversionLabel" style={{"--inversion": 3} as InversionProps}>
          Inversion 3
        </div>



        <div
          className="fingerChart"
          style={{
            "--voice": 1,
            "--inversion": 1,
          } as FingerChartProps}>
          <GuitarFingerChart tabNotes={notes}/>
        </div>
        <div
          className="fingerChart"
          style={{
            "--voice": 2,
            "--inversion": 2,
          } as FingerChartProps}>
          <GuitarFingerChart tabNotes={notes}/>
        </div>

        <FingerChart chord={chord} inversion={0}/>
        <FingerChart chord={chord} inversion={1}/>
        <FingerChart chord={chord} inversion={2}/>
        <FingerChart chord={chord} inversion={3}/>
      </div>
    </>
  )
}

function FingerChart({chord, inversion}: {chord: VoiceLeadingChord, inversion: number}) {

  let invertedChord = cloneDeep(chord)
  for (let i=0; i < inversion; i++) {
    const t = invertedChord.tones.shift()
    if (t == undefined) {
      throw new RangeError("got undefined element whilst inverting chordCopy tones")
    }
    invertedChord.tones.push(t)
  }

  const notes = vlChordNotes(invertedChord)

  const tabNotes = tabNotesNPerString(
    notes,
    1,
    5,
  )

  return (
    <>
      <div
        className="fingerChart"
        style={{
          "--voice": 3,
          "--inversion": inversion+1,
        } as FingerChartProps}>
        <GuitarFingerChart tabNotes={tabNotes}/>
      </div>
    </>
  )
}
