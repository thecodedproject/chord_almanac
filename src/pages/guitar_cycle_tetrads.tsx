import "./guitar_cycle_tetrads.css"

import {
  newState,
} from "../state"

import {
  GuitarModeCycleTable
} from "../components/guitar_mode_cycle_table"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  StringSetSelector,
  stringSets,
} from "../components/string_set_selector"

import {
  DiatonicInterval,
  Note,
  ScaleType,
  TetradVoicing,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

// the seventh chord - by far the most common tetrad
const chordDegrees = [1,3,5,7]

// the voicing every chart on these pages is drawn in
const voicing = TetradVoicing.Drop2

// A cycle takes a chord through every mode of its scale, moving by the same diatonic
// interval each time, and is named for the interval it moves by.
interface Cycle {
  title: string

  // the interval each row of the table climbs by
  modeInterval: DiatonicInterval

  // how many inversions on from the row above each row starts.
  //
  // Climbing through the modes carries the voicings up the neck and out of reach of
  // each other; starting each row further round the inversions brings them back, and
  // each cycle needs its own offset to do so because each climbs by a different amount.
  inversionOffset: number
}

const cycle4: Cycle = {
  title: "Cycle 4 tetrads",
  modeInterval: DiatonicInterval.Fourth,
  inversionOffset: 2,
}

const cycle2: Cycle = {
  title: "Cycle 2 tetrads",
  modeInterval: DiatonicInterval.Second,

  // a second is a shorter climb than a fourth, so a column only needs taking back one
  // inversion - which is the last of the four - to stay where it is
  inversionOffset: 3,
}

export function GuitarCycle4Tetrads() {
  return <CycleTetrads cycle={cycle4}/>
}

export function GuitarCycle2Tetrads() {
  return <CycleTetrads cycle={cycle2}/>
}

function CycleTetrads({cycle}: {cycle: Cycle}) {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    },
    strings: newState(stringSets[0]),
  }

  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    props.scale.pos.value,
  )

  return (
    <div className="guitarCycleTetrads">
      <h2>{cycle.title}</h2>

      {/* the controls sit above the table so that they stay put as it changes size */}
      <StringSetSelector
        value={props.strings.value}
        set={props.strings.set}
      />
      <ScaleSelector props={props.scale}/>

      <GuitarModeCycleTable
        chord={{scale: scale, tones: chordDegrees}}
        strings={props.strings.value}
        voicing={voicing}
        modeInterval={cycle.modeInterval}
        inversionOffset={cycle.inversionOffset}
      />
    </div>
  )
}
