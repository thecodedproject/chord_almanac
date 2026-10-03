import "./guitar_melodic_tetrads_table.css"

import {CSSProperties, Fragment} from "react"

import {
  DiatonicInterval,
  Note,
  Scale,
  modeForScale,
  scaleDegree,
  scaleDegreesInDiatonicInterval,
  shiftScaleDiatonically,
  tetradQualityAtScaleDegree,
} from "../lib/chord_anthology"

import {
  tabChordInPosition,
  tabScalePosition,
} from "../lib/guitar_notation"

import {
  GuitarFingerChart,
} from "./guitar_finger_chart"

import {
  modeLabels,
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

// modeDegree reads a degree of a scale as a degree of the mode of it that starts on
// startingScaleDegree, so the fourth degree of C major is the third of D dorian.
function modeDegree(s: Scale, parentDegree: number, startingScaleDegree: number): number {

  const numDegrees = s.intervals.length

  return (((parentDegree - startingScaleDegree)%numDegrees + numDegrees)%numDegrees) + 1
}

// one chord of the scale, rooted on a degree of the scale the table is given
interface Chord {
  degree: number
  name: string
  notes: Note[]
}

// GuitarMelodicTetradsTable draws every chord of a scale as a melodic tetrad played in
// one position of the neck.
//
// A position is all the scale reaches whilst the hand stays put - the notes it covers
// playing a fixed number of them to a string - so each chord is fingered wherever its
// notes fall in that one shape, rather than wherever it sits most easily on the neck.
// Each position starts from its own degree of the scale, so is read as the mode of the
// scale starting there.
//
// Each chart runs the chord right through its position, from the lowest of its notes
// the position reaches to the highest, which is why a chord seldom opens on its own
// root. The position itself is drawn behind every chart, which shows the notes each
// chord leaves out as much as the ones it plays.
//
// The chords are taken in the order, and numbered by the degrees, of the scale the
// table is given, so the table runs through the same chords in the same order
// whichever position it is drawn in.
export function GuitarMelodicTetradsTable(
  {
    scale,
    tuning,
    position = 1,
    notesPerString = 3,
    chordDegrees = defaultChordDegrees,
    chordInterval = defaultChordInterval,
  }: {
    scale: Scale,
    tuning: Note[],
    position?: number,
    notesPerString?: number,
    chordDegrees?: number[],
    chordInterval?: DiatonicInterval,
  }
) {

  // the mode of the scale the position is read as
  let modeScale = scale
  for (let i = 1; i < position; i++) {
    modeScale = shiftScaleDiatonically(modeScale, DiatonicInterval.Second)
  }

  const positionNotes = tabScalePosition(modeScale, {
    notesPerString: notesPerString,
    tuning: tuning,
  })

  const chords: Chord[] = chordRootDegrees(scale, chordInterval).map((degree) => {

    const notes = chordDegrees.map((d) => scaleDegree(scale, degree + d - 1))

    return {
      degree: degree,
      name: notes[0] + tetradQualityLabels[tetradQualityAtScaleDegree(scale, degree)],
      notes: notes,
    }
  })

  return (
    <div
      className="guitarMelodicTetradsTable"
      style={{"--num-chords": chords.length} as TableProps}
    >
      <div className="cornerCell"></div>

      <div className="positionLabel">
        <div className="positionName">Position {position}</div>
        <div className="modeName">{modeLabels[modeForScale(modeScale)]}</div>
      </div>

      {chords.map((chord, iChord) => (
        <Fragment key={chord.degree}>

          <div
            className="chordLabel"
            style={{"--row": iChord+1} as RowProps}
          >
            <div className="chordDegree">
              {scaleDegreeNumerals[chord.degree-1]}
            </div>
            <div className="chordName">{chord.name}</div>
            <div className="chordNotes">{chord.notes.join(" ")}</div>
          </div>

          <div
            className="chartCell"
            style={{"--row": iChord+1} as RowProps}
          >
            <GuitarFingerChart
              tabNotes={tabChordInPosition(
                modeScale,
                positionNotes,
                modeDegree(scale, chord.degree, position),
                chordDegrees,
              )}
              backgroundNotes={positionNotes}
              numStrings={tuning.length}
            />
          </div>

        </Fragment>
      ))}
    </div>
  )
}
