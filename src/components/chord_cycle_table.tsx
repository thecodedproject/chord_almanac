import { Fragment } from "react"

import "./chord_cycle_table.css"
import {
  DiatonicInterval,
  Mode,
  Note,
  VoiceLeadingChord,
  createCycle,
  diatonicScale,
  semiTonesBetweenNotesUpwards,
  vlChordNotes,
} from "../lib/chord_anthology"

const CHORDS_PER_ROW = 7

type ArrowDir = "up" | "down" | "flat"

// Picks the shortest direction between two notes, since voice leading
// resolves an enum-only Note to the closest available pitch.
function voiceDirection(from: Note, to: Note): ArrowDir {
  const upDistance = semiTonesBetweenNotesUpwards(from, to)
  if (upDistance === 0) return "flat"
  if (upDistance <= 6) return "up"
  return "down"
}

export function ChordCycleTable() {

  const startingChord: VoiceLeadingChord = {
    scale: diatonicScale(Note.C, Mode.Ionian),
    tones: [1, 3, 5],
  }

  const cycle = createCycle(
    startingChord,
    DiatonicInterval.Second,
    new Map<number, number>([
      [1, 5],
      [3, 1],
      [5, 3],
    ]),
  )

  // Stack chord notes top-down by reversing the tones order so the
  // highest-voice tone appears at the top of each column.
  const chordsTopDown: Note[][] = cycle.map(
    (c) => [...vlChordNotes(c)].reverse(),
  )

  const transitions: ArrowDir[][] = chordsTopDown.map((notes, i) => {
    const next = chordsTopDown[(i + 1) % chordsTopDown.length]
    return notes.map((n, v) => voiceDirection(n, next[v]))
  })

  const rows: number[][] = []
  for (let i = 0; i < cycle.length; i += CHORDS_PER_ROW) {
    rows.push(
      Array.from(
        { length: Math.min(CHORDS_PER_ROW, cycle.length - i) },
        (_, k) => i + k,
      ),
    )
  }

  return (
    <div className="chordCycle">
      {rows.map((chordIdxs, rowIdx) => {
        const isFirstRow = rowIdx === 0
        const isLastRow = rowIdx === rows.length - 1
        const leadingTransitionIdx =
          (chordIdxs[0] - 1 + cycle.length) % cycle.length

        return (
          <div className="cycleRow" key={rowIdx}>
            {isFirstRow ? <RepeatMark side="start" /> : <EdgeSpacer />}
            <ArrowColumn dirs={transitions[leadingTransitionIdx]} />
            {chordIdxs.map((cIdx) => (
              <Fragment key={cIdx}>
                <NoteColumn notes={chordsTopDown[cIdx]} />
                <ArrowColumn dirs={transitions[cIdx]} />
              </Fragment>
            ))}
            {isLastRow ? <RepeatMark side="end" /> : <EdgeSpacer />}
          </div>
        )
      })}
    </div>
  )
}

function NoteColumn({ notes }: { notes: Note[] }) {
  return (
    <div className="noteCol">
      {notes.map((n, i) => (
        <div className="note" key={i}>{n}</div>
      ))}
    </div>
  )
}

function ArrowColumn({ dirs }: { dirs: ArrowDir[] }) {
  return (
    <div className="arrowCol">
      {dirs.map((d, i) => (
        <div className="arrowCell" key={i}>
          {d === "flat" ? <Dash /> : <Arrow dir={d} />}
        </div>
      ))}
    </div>
  )
}

function Arrow({ dir }: { dir: "up" | "down" }) {
  const yStart = dir === "up" ? 13 : 3
  const yEnd = dir === "up" ? 3 : 13
  return (
    <svg
      viewBox="0 0 30 16"
      className="arrowSvg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1={yStart}
        x2="23"
        y2={yEnd}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polygon
        points={`30,${yEnd} 22,${yEnd - 5} 22,${yEnd + 5}`}
        fill="currentColor"
      />
    </svg>
  )
}

function Dash() {
  return <div className="dash" />
}

function RepeatMark({ side }: { side: "start" | "end" }) {
  return (
    <div className={`repeatMark repeatMark-${side}`}>
      <div className="repeatThickLine" />
      <div className="repeatThinLine" />
      <div className="repeatDot repeatDot-upper" />
      <div className="repeatDot repeatDot-lower" />
    </div>
  )
}

function EdgeSpacer() {
  return <div className="edgeSpacer" />
}
