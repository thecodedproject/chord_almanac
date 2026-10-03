import "./guitar_harmonic_tetrads.css"

import {
  newState,
} from "../state"

import {
  ScaleDegreeSelector,
} from "../components/scale_degree_selector"

import {
  CycleSelector,
} from "../components/cycle_selector"

import {
  GuitarModeCycleTable
} from "../components/guitar_mode_cycle_table"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  StringSetSelector,
  allStringSets,
  stringSets,
} from "../components/string_set_selector"

import {
  DiatonicInterval,
  Note,
  ScaleType,
  TetradVoicing,
  numTetradVoices,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

import {
  Playability,
  tetradVoicingPlayability,
} from "../lib/guitar_chords"

// the seventh chord - by far the most common tetrad
const defaultChordDegrees = [1,3,5,7]

// every set of four strings the chords can be voiced on
const stringSetOptions = allStringSets()

// the voicing the charts on the page are drawn in until another is chosen
const defaultVoicing = TetradVoicing.Drop2

// The table takes a chord through every mode of its scale, moving by the same diatonic
// interval each time; a cycle is named for the interval it moves by.
//
// Climbing through the modes carries the voicings up the neck and out of reach of each
// other. Starting each row further round the inversions than the row above brings them
// back, and each cycle needs its own offset to do so because each climbs by a different
// amount: each row starts on the inversion of its chord nearest the row above's.
const inversionOffsets: Partial<Record<DiatonicInterval, number>> = {
  // a second or a third is a short climb, so a column only needs taking back one
  // inversion - which is the last of the four - to stay where it is
  [DiatonicInterval.Second]: 3,
  [DiatonicInterval.Third]: 3,
  [DiatonicInterval.Fourth]: 2,
}

// the cycle the page starts on
const defaultCycle = DiatonicInterval.Fourth

export function GuitarHarmonicTetrads() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      type: newState(ScaleType.Major),
    },
    chordDegrees: newState(defaultChordDegrees),
    strings: newState(stringSets[0]),
    voicing: newState(defaultVoicing),
    cycle: newState(defaultCycle),
  }

  // the table goes through every mode of the scale in turn, so has no use for a position
  // of it: it always starts from the first
  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    1,
  )

  const chordDegrees = props.chordDegrees.value

  // there is only a chord to draw once all four of its degrees are chosen
  const chord = chordDegrees.length == numTetradVoices
    ? {scale: scale, tones: [...chordDegrees].sort((a, b) => a-b)}
    : undefined

  // how playable each set of strings is in a voicing, found by tabbing every chord the
  // table could draw on it
  const playabilityOf = (voicing: TetradVoicing) => {

    if (chord == undefined) {
      return undefined
    }

    const playabilities = new Map(stringSetOptions.map((strings) => [
      strings.join(),
      tetradVoicingPlayability(chord, voicing, strings),
    ]))
    return (strings: number[]) => playabilities.get(strings.join()) ?? Playability.Unplayable
  }

  const voicingPlayabilityOf = playabilityOf(props.voicing.value)

  // a new voicing keeps to the strings already chosen if they are playable in it, and
  // otherwise moves onto the first strings that are - or, failing that, the first that
  // possibly are
  const setVoicing = (voicing: TetradVoicing) => {

    const playability = playabilityOf(voicing)

    if (playability != undefined && playability(props.strings.value) != Playability.Playable) {
      const strings =
        stringSetOptions.find((s) => playability(s) == Playability.Playable) ??
        stringSetOptions.find((s) => playability(s) == Playability.PossiblyPlayable)
      if (strings != undefined) {
        props.strings.set(strings)
      }
    }

    props.voicing.set(voicing)
  }

  return (
    <div className="guitarHarmonicTetrads">
      <h2>Harmonic tetrads</h2>

      {/* the controls sit above the table so that they stay put as it changes size */}
      <ScaleDegreeSelector
        numScaleDegrees={scale.intervals.length}
        value={chordDegrees}
        set={props.chordDegrees.set}
      />
      <StringSetSelector
        value={props.strings.value}
        set={props.strings.set}
        options={stringSetOptions}
        playabilityOf={voicingPlayabilityOf}
      />
      <CycleSelector value={props.cycle.value} set={props.cycle.set} />
      <ScaleSelector props={props.scale}/>

      {chord != undefined
        ? <GuitarModeCycleTable
            chord={chord}
            strings={props.strings.value}
            voicing={props.voicing.value}
            setVoicing={setVoicing}
            modeInterval={props.cycle.value}
            inversionOffset={inversionOffsets[props.cycle.value]}
          />
        : <p className="chordDegreesPrompt">
            Choose {numTetradVoices} scale degrees to voice.
          </p>
      }
    </div>
  )
}
