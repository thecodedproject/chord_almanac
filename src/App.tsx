import "./App.css"

import {
  ChordCycleTable,
} from "./components/chord_cycle_table"

import {
  GuitarFingerChart,
} from "./components/guitar_finger_chart"


export default function App() {

  const tabNotes = [
    { string: 1, fret: 1 },
    { string: 2, fret: 2 },
    { string: 3, fret: 3 },

    { string: 4, fret: 10 },
    { string: 5, fret: 13 },
    { string: 6, fret: 15 },
  ]

  const tabNotes2 = [
    { string: 1, fret: 10 },
    { string: 1, fret: 8 },
    { string: 2, fret: 12 },
    { string: 3, fret: 12 },
    { string: 3, fret: 13 },
    { string: 3, fret: 11 },
    { string: 4, fret: 11 },
    { string: 5, fret: 10 },
    { string: 5, fret: 14 },
    { string: 5, fret: 17 },
  ]

  return (
    <>
      <h2>Chord cycle table</h2>
        <ChordCycleTable />
      <h2>Guitar finger chart</h2>
        <GuitarFingerChart tabNotes={tabNotes}/>
        <GuitarFingerChart tabNotes={tabNotes2}/>
    </>
  )
}
