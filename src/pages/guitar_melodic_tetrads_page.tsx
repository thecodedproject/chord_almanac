import "./guitar_melodic_tetrads_page.css"

import {
  newState,
} from "../state"

import {
  GuitarMelodicTetradsTable,
} from "../components/guitar_melodic_tetrads_table"

import {
  CycleSelector,
} from "../components/cycle_selector"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  NumStringsSelector,
  TuningDisplay,
  tuningsByNumStrings,
} from "../components/tuning_selector"

import {
  DiatonicInterval,
  Note,
  ScaleType,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

export function GuitarMelodicTetradsPage() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    },
    numStrings: newState(6),
    cycle: newState(DiatonicInterval.Fourth),
  }

  const tuning = tuningsByNumStrings[props.numStrings.value]

  // the table is given the scale from its first degree, and finds the position from it
  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    1,
  )

  return (
    <div className="guitarMelodicTetrads">
      <h2>Melodic tetrads</h2>

      {/* the controls sit above the table so that they stay put as it changes size */}
      <NumStringsSelector
        value={props.numStrings.value}
        set={props.numStrings.set}
      />
      <TuningDisplay tuning={tuning} />
      <CycleSelector value={props.cycle.value} set={props.cycle.set} />
      <ScaleSelector props={props.scale}/>

      <GuitarMelodicTetradsTable
        scale={scale}
        tuning={tuning}
        position={props.scale.pos.value}
        chordInterval={props.cycle.value}
      />
    </div>
  )
}
