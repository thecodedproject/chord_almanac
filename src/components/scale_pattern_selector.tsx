import "./selector_row.css"
import "./scale_pattern_selector.css"

import {
  IState,
} from "../state"

import {
  Direction,
  Rhythm,
  rhythmForPatternLength,
} from "../lib/scale_patterns"

export interface IScalePatternProps {
  degrees: IState<number[]>
  rhythm: IState<Rhythm>
  direction: IState<Direction>
  beatsPerBar: IState<number>
}

export const patternLengths = [2, 3, 4]

// the degrees a note of the pattern can be, from the tonic up to the octave above it
const patternDegrees = [1, 2, 3, 4, 5, 6, 7, 8]

const rhythms: [Rhythm, string][] = [
  [Rhythm.Quavers, "Quavers"],
  [Rhythm.Triplets, "Triplets"],
  [Rhythm.Semiquavers, "Semiquavers"],
]

const directions: [Direction, string][] = [
  [Direction.Ascending, "Ascending"],
  [Direction.Descending, "Descending"],
]

export const beatsPerBarChoices = [2, 3, 4]

// the class that picks out the button for whatever is currently chosen
const selectedIf = (selected: boolean) => selected ? "selected" : undefined

// ScalePatternSelector picks the pattern taken through the scale: the degrees of its
// notes, the rhythm they are played in and the way it moves through the scale - along
// with the time signature the run is written in.
export function ScalePatternSelector({props}: {props: IScalePatternProps}) {

  const handleClick = (f: () => void) => (event: any) => {
    f()
    event.preventDefault()
  }

  // changing length keeps the notes chosen so far, carrying the pattern on up the scale
  // from them if it grows, and plays it in the rhythm that fits it to the beat
  const setLength = (length: number) => {
    const degrees = props.degrees.value
    const last = degrees[degrees.length - 1]
    props.degrees.set([...Array(length)].map((_, i) => i < degrees.length
      ? degrees[i]
      : Math.min(patternDegrees[patternDegrees.length - 1], last + i - degrees.length + 1),
    ))
    props.rhythm.set(rhythmForPatternLength(length))
  }

  const setDegree = (i: number, degree: number) => {
    props.degrees.set(props.degrees.value.map((d, j) => j == i ? degree : d))
  }

  return (
    <div className="scalePatternSelector">

      <div className="selectorRow patternLengthSelector">
        <span>Notes:</span>
        {patternLengths.map((length) => (
          <button
            key={length}
            onClick={handleClick(() => setLength(length))}
            className={selectedIf(length == props.degrees.value.length)}
          >
            {length}
          </button>
        ))}
      </div>

      <div className="selectorRow patternDegreeSelector">
        <span>Degrees:</span>
        {props.degrees.value.map((degree, i) => (
          <select
            key={i}
            aria-label={"Degree of note " + (i + 1)}
            value={degree}
            onChange={(event) => setDegree(i, Number(event.target.value))}
          >
            {patternDegrees.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        ))}
      </div>

      <div className="selectorRow rhythmSelector">
        <span>Rhythm:</span>
        {rhythms.map(([rhythm, label]) => (
          <button
            key={rhythm}
            onClick={handleClick(() => props.rhythm.set(rhythm))}
            className={selectedIf(rhythm == props.rhythm.value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="selectorRow directionSelector">
        <span>Direction:</span>
        {directions.map(([direction, label]) => (
          <button
            key={direction}
            onClick={handleClick(() => props.direction.set(direction))}
            className={selectedIf(direction == props.direction.value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="selectorRow timeSignatureSelector">
        <span>Time:</span>
        {beatsPerBarChoices.map((beats) => (
          <button
            key={beats}
            onClick={handleClick(() => props.beatsPerBar.set(beats))}
            className={selectedIf(beats == props.beatsPerBar.value)}
          >
            {beats}/4
          </button>
        ))}
      </div>
    </div>
  )
}
