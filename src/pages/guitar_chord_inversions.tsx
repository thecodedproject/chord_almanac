import "./guitar_chord_inversions.css"

import {
  newState,
} from "../state"

import {
  GuitarChordInversionsTable
} from "../components/guitar_chord_inversions_table"

import {
  ScaleDegreeSelector,
} from "../components/scale_degree_selector"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  StringSetSelector,
  stringSets,
  triadStringSets,
} from "../components/string_set_selector"

import {
  Note,
  ScaleType,
  numTetradVoices,
  numTriadVoices,
  scaleDegree,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

import {
  chordSymbol,
} from "../lib/chord_names"

// the seventh chord - by far the most common tetrad
const defaultChordDegrees = [1,3,5,7]

// the strings each size of chord can be voiced on, and starts out on
const stringSetsByNumVoices: Record<number, number[][]> = {
  [numTriadVoices]: triadStringSets,
  [numTetradVoices]: stringSets,
}

export function GuitarChordInversions() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    },
    chordDegrees: newState(defaultChordDegrees),

    // triads and tetrads are played on different numbers of strings, so each keeps its
    // own choice of them
    triadStrings: newState(triadStringSets[0]),
    tetradStrings: newState(stringSets[0]),
  }

  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    props.scale.pos.value,
  )

  const chordDegrees = props.chordDegrees.value
  const numVoices = chordDegrees.length

  const strings = numVoices == numTriadVoices ? props.triadStrings : props.tetradStrings

  const isChord = numVoices in stringSetsByNumVoices
  const chord = {scale: scale, tones: [...chordDegrees].sort((a, b) => a-b)}

  // the heading names the chord where it has a name, and always gives its notes
  const notes = chord.tones.map((d) => scaleDegree(scale, d)).join(" ")
  const heading = isChord
    ? ["Chord inversions for", chordSymbol(scale, chord.tones), "[" + notes + "]"]
        .filter((part) => part != undefined)
        .join(" ")
    : "Chord inversions"

  return (
    <div className="guitarChordInversions">
      <h2>{heading}</h2>

      {/* the controls sit above the table so that they stay put as it changes size */}
      <ScaleDegreeSelector
        numScaleDegrees={scale.intervals.length}
        value={chordDegrees}
        set={props.chordDegrees.set}
      />
      <StringSetSelector
        value={strings.value}
        set={strings.set}
        options={stringSetsByNumVoices[numVoices] ?? stringSets}
      />
      <ScaleSelector props={props.scale} choosePositionAs="mode"/>

      {/* three degrees make a triad and four a tetrad; fewer make no chord to invert */}
      {isChord
        ? <GuitarChordInversionsTable
            chord={chord}
            strings={strings.value}
          />
        : <p className="chordDegreesPrompt">
            Choose {numTriadVoices} or {numTetradVoices} scale degrees to voice.
          </p>
      }
    </div>
  )
}
