import {
  newState,
} from "../state"

import {
  GuitarFingerChart,
} from "../components/guitar_finger_chart"

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

import {
  tabScalePosition,
} from "../lib/guitar_notation"

export function GuitarScalePage() {

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

  const scaleTab = tabScalePosition(scale, {tuning: tuning})

  return (
    <>
      <h2>Guitar finger chart</h2>
        <GuitarFingerChart tabNotes={scaleTab} numStrings={tuning.length}/>
      <br />
      <NumStringsSelector
        value={props.numStrings.value}
        set={props.numStrings.set}
      />
      <TuningDisplay tuning={tuning} />
      <ScaleSelector props={props.scale}/>
    </>
  )
}
