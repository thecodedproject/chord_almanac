import "./guitar_melodic_tetrads_page.css"

import {
  newState,
} from "../state"

import {
  GuitarMelodicTetradsTable,
} from "../components/guitar_melodic_tetrads_table"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  NumStringsSelector,
  TuningDisplay,
  tuningsByNumStrings,
} from "../components/tuning_selector"

import {
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
  }

  const tuning = tuningsByNumStrings[props.numStrings.value]

  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    props.scale.pos.value,
  )

  return (
    <div className="guitarMelodicTetrads">
      <h2>Guitar melodic tetrads</h2>

      <p className="pageNote">
        Every chord of the scale played as a melodic tetrad, run right through one three
        notes per string position without the hand leaving it - so a chord opens on
        whichever of its notes the position reaches first, root or not. The position
        itself is drawn faintly behind each chord.
      </p>

      {/* the controls sit above the table so that they stay put as it changes size */}
      <NumStringsSelector
        value={props.numStrings.value}
        set={props.numStrings.set}
      />
      <TuningDisplay tuning={tuning} />
      <ScaleSelector props={props.scale}/>

      <GuitarMelodicTetradsTable scale={scale} tuning={tuning} />
    </div>
  )
}
