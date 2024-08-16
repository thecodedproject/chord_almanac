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
  Note,
  ScaleType,
  scaleFromIonianRoot,
  scaleNotes,
} from "../lib/chord_anthology"

import {
  tabNotesNPerString,
} from "../lib/guitar_notation"

export function GuitarScalePage() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    }
  }

  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    props.scale.pos.value,
  )
  const notes = scaleNotes(scale, 3)

  const scaleTab = tabNotesNPerString(
    notes,
    3,
  )


  return (
    <>
      <h2>Guitar finger chart</h2>
        <GuitarFingerChart tabNotes={scaleTab}/>
      <br />
      <ScaleSelector props={props.scale}/>
    </>
  )
}
