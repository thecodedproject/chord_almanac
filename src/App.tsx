import "./App.css"

import { useState } from "react"

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


export default function App() {

  const tabNotes = [
    { string: 1, fret: 1 },
    { string: 2, fret: 2 },
    { string: 3, fret: 3 },

    { string: 4, fret: 10 },
    { string: 5, fret: 13 },
    { string: 6, fret: 15 },
  ]

  const [currentStartingDegree, setCurrentStartingDegree] = useState(1)

  const handleClick = (n: number) => {
    return (event: any) => {
      console.log("Clicked!", n)
      setCurrentStartingDegree(n)
      event.preventDefault()
    }
  }

  const scale = scaleFromIonianRoot(Note.C, ScaleType.Major, currentStartingDegree)
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

      <button onClick={handleClick(1)}>I</button>
      <button onClick={handleClick(2)}>II</button>
      <button onClick={handleClick(3)}>III</button>
      <button onClick={handleClick(4)}>IV</button>
      <button onClick={handleClick(5)}>V</button>
      <button onClick={handleClick(6)}>VI</button>
      <button onClick={handleClick(7)}>VII</button>
    </>
  )
}
