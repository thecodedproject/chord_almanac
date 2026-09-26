import "./guitar_melodic_tetrads_table.css"

import {CSSProperties, Fragment} from "react"

import {
  DiatonicInterval,
  Note,
  Scale,
  scaleDegree,
  scaleDegreesInDiatonicInterval,
  tetradQualityAtScaleDegree,
} from "../lib/chord_anthology"

import {
  TabNote,
  tabChordInPosition,
  tabScalePosition,
} from "../lib/guitar_notation"

import {
  GuitarFingerChart,
} from "./guitar_finger_chart"

import {
  scaleDegreeNumerals,
  tetradQualityLabels,
} from "./music_labels"

interface TableProps extends CSSProperties {
  "--num-chords": number;
}

interface RowProps extends CSSProperties {
  "--row": number;
}

// the seventh chord - by far the most common tetrad
const defaultChordDegrees = [1,3,5,7]

// the interval the table climbs by, which is the one chords most often move through
const defaultChordInterval = DiatonicInterval.Fourth

// one chord of the scale, as it falls under the hand in a position
interface PositionChord {
  rootDegree: number
  name: string
  notes: Note[]
  tabNotes: TabNote[]
}

// chordRootDegrees lists the scale degrees the chords of a cycle are rooted on, each
// the given interval above the last and starting from the first degree of the scale.
//
// A cycle of fourths through a seven note scale reaches every degree - I, IV, VII, III,
// VI, II, V - before it comes back round to where it started.
function chordRootDegrees(s: Scale, interval: DiatonicInterval): number[] {

  const numDegrees = s.intervals.length
  const degreesPerStep = scaleDegreesInDiatonicInterval(interval)

  return [...Array(numDegrees)].map((_, i) => ((i * degreesPerStep)%numDegrees) + 1)
}

// GuitarMelodicTetradsTable draws every chord of a scale as a melodic tetrad played in
// one position of the neck.
//
// A position is all the scale reaches whilst the hand stays put - the notes it covers
// playing a fixed number of them to a string - so each chord is fingered wherever its
// notes fall in that one shape, rather than wherever it sits most easily on the neck.
// Each chart runs the chord right through its position, from the lowest of its notes
// the position reaches to the highest, which is why a chord seldom opens on its own
// root. The position itself is drawn behind every chart, which shows the notes each
// chord leaves out as much as the ones it plays.
export function GuitarMelodicTetradsTable(
  {
    scale,
    tuning,
    notesPerString = 3,
    chordDegrees = defaultChordDegrees,
    chordInterval = defaultChordInterval,
  }: {
    scale: Scale,
    tuning: Note[],
    notesPerString?: number,
    chordDegrees?: number[],
    chordInterval?: DiatonicInterval,
  }
) {

  const position = tabScalePosition(scale, {
    notesPerString: notesPerString,
    tuning: tuning,
  })

  const chords: PositionChord[] = chordRootDegrees(scale, chordInterval).map(
    (rootDegree) => {

      const notes = chordDegrees.map(
        (d) => scaleDegree(scale, rootDegree + d - 1),
      )

      return {
        rootDegree: rootDegree,
        name: notes[0] + tetradQualityLabels[
          tetradQualityAtScaleDegree(scale, rootDegree)
        ],
        notes: notes,
        tabNotes: tabChordInPosition(scale, position, rootDegree, chordDegrees),
      }
    },
  )

  return (
    <div
      className="guitarMelodicTetradsTable"
      style={{"--num-chords": chords.length} as TableProps}
    >
      {chords.map((chord, iChord) => (
        <Fragment key={chord.rootDegree}>

          <div
            className="chordLabel"
            style={{"--row": iChord+1} as RowProps}
          >
            <div className="chordDegree">
              {scaleDegreeNumerals[chord.rootDegree-1]}
            </div>
            <div className="chordName">{chord.name}</div>
            <div className="chordNotes">{chord.notes.join(" ")}</div>
          </div>

          <div
            className="chartCell"
            style={{"--row": iChord+1} as RowProps}
          >
            <GuitarFingerChart
              tabNotes={chord.tabNotes}
              backgroundNotes={position}
              numStrings={tuning.length}
            />
          </div>

        </Fragment>
      ))}
    </div>
  )
}
