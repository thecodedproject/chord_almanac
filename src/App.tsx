import "./App.css"

import {
  newState,
} from "./state"

import {
  ChordCycleTable,
} from "./components/chord_cycle_table"

import {
  GuitarFingerChart,
} from "./components/guitar_finger_chart"

import {
  Note,
  ScaleType,
  scaleFromIonianRoot,
  scaleNotes,
} from "./lib/chord_anthology"

import {
  tabNotesNPerString,
} from "./lib/guitar_notation"

import {
  ScaleSelector,
} from "./components/scale_selector"


export default function App() {

  const tabNotes = [
    { string: 1, fret: 1 },
    { string: 2, fret: 2 },
    { string: 3, fret: 3 },

    { string: 4, fret: 10 },
    { string: 5, fret: 13 },
    { string: 6, fret: 15 },
  ]

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

  const cMaj7Tab = tabNotesNPerString(
    notes,
    3,
  )

  return (
    <>
      <h2>Chord cycle table</h2>
        <ChordCycleTable />
      <h2>Guitar finger chart</h2>
        <GuitarFingerChart tabNotes={tabNotes}/>
        <GuitarFingerChart tabNotes={cMaj7Tab}/>

      <br />

      <ScaleSelector props={props.scale}/>
    </>
  )
}
