import "./guitar_finger_chart.css"

import {CSSProperties} from "react";

import {
  TabNote
} from "../lib/guitar_notation"

interface ChartProps extends CSSProperties {
  "--num-frets": number;
}

interface StringProps extends CSSProperties {
  "--string": number;
}

interface FretProps extends CSSProperties {
  "--fret": number;
}

interface NoteProps extends StringProps, FretProps {}

export function GuitarFingerChart({tabNotes}: {tabNotes: TabNote[]}) {

  let minFret = 24
  let maxFret = 0

  for (const n of tabNotes) {
    if (n.fret < minFret) {
      minFret = n.fret
    }
    if (n.fret > maxFret) {
      maxFret = n.fret
    }
  }

  const numFrets = maxFret - minFret + 1

  const fretNotes = tabNotes.map((n, i) => {
    const relativeFret = n.fret - minFret + 1
    return <Note string={n.string} fret={relativeFret} key={i} />
  })

  return (
    <div className="guitarFingerChart" style={{"--num-frets": numFrets} as ChartProps}>
      <div className="body">
        <Strings />
        <FretWires numFrets={numFrets} />
        <FretMarkers bottomFret={minFret} topFret={maxFret} />
        {fretNotes}
      </div>
    </div>
  )
}

function FretWires({numFrets}: {numFrets: number}) {

  const numFretWires = numFrets + 1

  return [...Array(numFretWires)].map((_, i) => {
    return <div
      className="fretWire"
      style={{"--fret": i} as FretProps}
      key={i}
    ></div>
  })
}

function FretMarkers(
  {bottomFret, topFret}: {bottomFret: number, topFret: number}
) {

  let retVal = []

  for (let fret = bottomFret; fret < topFret+1; fret++) {

    const fretPos = fret - bottomFret

    if (fret == 12) {
      retVal.push(
        <div
          className="fretMarker fretMarkerTop"
          style={{"--fret": fretPos} as FretProps}
          key={"top_" + fret}
        ></div>
       )
      retVal.push(
          <div
            className="fretMarker fretMarkerBottom"
            style={{"--fret": fretPos} as FretProps}
            key={"bottom_" + fret}
          ></div>
      )
    }

    if (fret == 11 || fret == 13) {
      continue
    }

    if (fret%2 == 1) {
      retVal.push(
        <div
          className="fretMarker fretMarkerMiddle"
          style={{"--fret": fretPos} as FretProps}
          key={fret}
        ></div>
      )
    }
  }

  return retVal
}

function Strings() {
  return (
    <>
      <div className="string" style={{"--string": 1} as StringProps}></div>
      <div className="string" style={{"--string": 2} as StringProps}></div>
      <div className="string" style={{"--string": 3} as StringProps}></div>
      <div className="string" style={{"--string": 4} as StringProps}></div>
      <div className="string" style={{"--string": 5} as StringProps}></div>
      <div className="string" style={{"--string": 6} as StringProps}></div>
    </>
  )
}

function Note({string, fret}: {string: number, fret: number}) {

  return <div
    className="note"
    style={
      {
        "--string": string,
        "--fret": fret,
      } as NoteProps
    }
  ></div>
}
