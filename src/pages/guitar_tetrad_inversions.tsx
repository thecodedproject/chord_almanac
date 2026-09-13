import "./guitar_tetrad_inversions.css"

import {
  newState,
} from "../state"

import {
  GuitarTetradInversionsTable
} from "../components/guitar_tetrad_inversions_table"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  StringSetSelector,
  stringSets,
} from "../components/string_set_selector"

import {
  Note,
  ScaleType,
  numTetradVoices,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

// the seventh chord - by far the most common tetrad
const defaultChordDegrees = [1,3,5,7]

export function GuitarTetradInversions() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    },
    chordDegrees: newState(defaultChordDegrees),
    strings: newState(stringSets[0]),
  }

  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    props.scale.pos.value,
  )

  const chordDegrees = props.chordDegrees.value

  return (
    <div className="guitarTetradInversions">
      <h2>Tetrad inversions</h2>

      {/* the controls sit above the table so that they stay put as it changes size */}
      <ChordDegreeSelector
        numScaleDegrees={scale.intervals.length}
        value={chordDegrees}
        set={props.chordDegrees.set}
      />
      <StringSetSelector
        value={props.strings.value}
        set={props.strings.set}
      />
      <ScaleSelector props={props.scale}/>

      {chordDegrees.length == numTetradVoices
        ? <GuitarTetradInversionsTable
            chord={{scale: scale, tones: [...chordDegrees].sort((a, b) => a-b)}}
            strings={props.strings.value}
          />
        : <p className="chordDegreesPrompt">
            Choose {numTetradVoices} scale degrees to voice.
          </p>
      }
    </div>
  )
}

function ChordDegreeSelector(
  {numScaleDegrees, value, set}: {
    numScaleDegrees: number,
    value: number[],
    set: (d: number[]) => void,
  }
) {

  const handleClick = (degree: number) => (event: any) => {
    set(
      value.includes(degree)
        ? value.filter((d) => d != degree)
        : [...value, degree].sort((a, b) => a-b),
    )
    event.preventDefault()
  }

  const degrees = [...Array(numScaleDegrees)].map((_, i) => i+1)

  return (
    <div className="selectorRow chordDegreeSelector">
      <span>Chord degrees:</span>
      {degrees.map((degree) => {
        const selected = value.includes(degree)
        return (
          <button
            key={degree}
            onClick={handleClick(degree)}
            className={selected ? "selected" : undefined}
            // the table voices four notes, so no more than four can be chosen
            disabled={!selected && value.length >= numTetradVoices}
          >
            {degree}
          </button>
        )
      })}
    </div>
  )
}
