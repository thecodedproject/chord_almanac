import "./guitar_mode_cycle_table.css"

import {CSSProperties, Fragment} from "react";

import {
  DiatonicInterval,
  TetradVoicing,
  VoiceLeadingChord,
  modeForScale,
  numTetradVoices,
  shiftScaleDiatonically,
} from '../lib/chord_anthology'

import {
  inversionLabels,
  modeLabels,
  voicingLabels,
} from './music_labels'

import {
  TetradVoicingChart,
} from './tetrad_voicing_chart'

interface TableProps extends CSSProperties {
  "--num-modes": number;
}

interface ModeProps extends CSSProperties {
  "--mode": number;
}

interface ColumnProps extends CSSProperties {
  "--column": number;
}

interface FingerChartProps extends ModeProps, ColumnProps {}

// each row takes up the inversions this far on from where the row above started, which
// keeps a column's voicings within reach of each other on the neck as its modes climb
const defaultInversionOffset = 2

// modeCycle moves the chord onto each mode of its scale in turn, each mode the given
// diatonic interval above the last.
//
// The chord keeps its scale degrees throughout, so every chord of the cycle is the same
// chord of its own mode - the tonic seventh of each mode, say - and every mode of the
// scale is reached, whichever interval the cycle steps by.
function modeCycle(
  chord: VoiceLeadingChord,
  interval: DiatonicInterval,
): VoiceLeadingChord[] {

  const chords: VoiceLeadingChord[] = []

  let scale = chord.scale
  for (let i=0; i < chord.scale.intervals.length; i++) {
    chords.push({...chord, scale: scale})
    scale = shiftScaleDiatonically(scale, interval)
  }

  return chords
}

export function GuitarModeCycleTable(
  {
    chord,
    strings,
    voicing,
    modeInterval = DiatonicInterval.Fourth,
    inversionOffset = defaultInversionOffset,
  }: {
    chord: VoiceLeadingChord,
    strings: number[],
    voicing: TetradVoicing,
    modeInterval?: DiatonicInterval,
    inversionOffset?: number,
  }
) {

  const columns = [...Array(numTetradVoices)].map((_, i) => i)
  const modeChords = modeCycle(chord, modeInterval)

  // each row works its way up through the inversions as the other tables do, but starts
  // from a different one, so a column holds a different inversion in every row
  const inversionAt = (column: number, iMode: number) =>
    (column + (iMode * inversionOffset))%numTetradVoices

  return (
    <div
      className="guitarModeCycleTable"
      style={{"--num-modes": modeChords.length} as TableProps}
    >

      {/* the corner cell names the voicing every chart in the table is voiced in */}
      <div className="voicingLabel">{voicingLabels[voicing]}</div>

      {/* the columns are only numbered; which inversion each holds changes row by row,
          so every chart names its own */}
      {columns.map((column) => (
        <div
          className="columnLabel"
          style={{"--column": column+1} as ColumnProps}
          key={column}
        >
          {column+1}
        </div>
      ))}

      {modeChords.map((modeChord, iMode) => (
        <Fragment key={iMode}>
          <div
            className="modeLabel"
            style={{"--mode": iMode+1} as ModeProps}
          >
            <div className="modeName">{modeLabels[modeForScale(modeChord.scale)]}</div>
            <div className="modeRoot">{modeChord.scale.root}</div>
          </div>
          {columns.map((column) => {
            const inversion = inversionAt(column, iMode)
            return (
              <TetradVoicingChart
                chord={modeChord}
                strings={strings}
                voicing={voicing}
                inversion={inversion}
                label={inversionLabels[inversion]}
                style={{
                  "--mode": iMode+1,
                  "--column": column+1,
                } as FingerChartProps}
                key={column}
              />
            )
          })}
        </Fragment>
      ))}

    </div>
  )
}
