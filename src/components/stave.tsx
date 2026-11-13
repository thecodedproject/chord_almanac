import "./stave.css"

import {ReactElement} from "react"

import {
  Duration,
  KeySignature,
  Measure,
  beamsForDuration,
  keySignatureLetters,
  trebleStavePosition,
} from "../lib/notation"

// Everything is drawn in units of a tenth of the space between two stave lines. The top
// line of the stave is at y = 0 and the bottom line at y = 40.
const space = 10
const staveHeight = 4 * space

// the y of a position on the stave, counted in lines and spaces up from its bottom line
const positionY = (pos: number) => staveHeight - pos * space / 2

// the position of the middle line, which decides which way stems point
const middleLine = 4

const stemLength = 3.5 * space
const shortestStem = 2.5 * space
const beamThickness = 4.5
const beamGap = 7.5
// the most a beam slopes, in y per x
const steepestBeam = 0.25

const noteHeadHalfWidth = 6

// accidentalRoom is the room made before a note for an accidental, on top of the room
// its share of the beat gives it - so the accidental clears the note before it
const accidentalRoom = (accidental: number) => Math.abs(accidental) == 2 ? 12 : 8

// how far left of its note an accidental is centred
const accidentalOffset = (accidental: number) => Math.abs(accidental) == 2 ? 18 : 14

// the line a treble clef is drawn along, curling round the G line (y = 30), with the dot
// its tail ends in
const trebleClefLine: [number, number][] = [
  [3.5, 49], [6, 53.5], [10, 53.5], [12.5, 50], [12.5, 44], [12, 35], [11.5, 20],
  [11, 5], [11.5, -8], [13.5, -15], [16, -13], [16.5, -6], [13, 1], [7, 8], [3.5, 16],
  [3, 25], [5.5, 34], [11, 38.5], [17, 37], [19.5, 31], [17, 25.5], [12, 24],
  [8.5, 27], [8.5, 31.5], [12, 33.5],
]
const trebleClefWidth = 22

// the stave positions the treble clef writes each letter's sharp and flat at in a key
// signature, by letter from C up
const keySharpPositions = [5, 6, 7, 8, 9, 3, 4]
const keyFlatPositions = [5, 6, 7, 1, 2, 3, 4]
const keyAccidentalWidth = 9

// smoothPath draws a smooth curve through the points (a Catmull-Rom spline).
function smoothPath(points: [number, number][], dx: number, dy: number): string {
  const p = points.map(([x, y]) => [x + dx, y + dy])
  const f = (n: number) => n.toFixed(2)

  let d = `M${f(p[0][0])},${f(p[0][1])}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[Math.min(p.length - 1, i + 2)]
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)}`
      + ` ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)}`
      + ` ${f(p2[0])},${f(p2[1])}`
  }
  return d
}

function TrebleClef({x}: {x: number}) {
  return (
    <g className="clef">
      <path d={smoothPath(trebleClefLine, x, 0)} fill="none" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={x + 5.5} cy={49} r={3} />
    </g>
  )
}

// Accidental draws a sharp, flat or natural (or a double sharp or flat) centred on (x, y).
function Accidental({accidental, x, y}: {accidental: number, x: number, y: number}) {

  const flat = (fx: number) => (
    <>
      <line x1={fx - 2.5} y1={y - 13} x2={fx - 2.5} y2={y + 4.5} strokeWidth={1.3} />
      <path
        d={`M${fx - 2.5},${y + 4.5} C${fx + 7},${y - 1} ${fx + 4},${y - 7} ${fx - 2.5},${y - 1.5}`
          + ` L${fx - 2.5},${y} C${fx + 2.5},${y - 4} ${fx + 4},${y - 1} ${fx - 2.5},${y + 4.5} z`}
        strokeWidth={0.6}
      />
    </>
  )

  switch(accidental) {
    case -2:
      return <g className="accidental">{flat(x - 3.5)}{flat(x + 3.5)}</g>
    case -1:
      return <g className="accidental">{flat(x)}</g>
    case 0:
      return (
        <g className="accidental">
          <line x1={x - 2.5} y1={y - 10} x2={x - 2.5} y2={y + 4.5} strokeWidth={1.2} />
          <line x1={x + 2.5} y1={y - 4.5} x2={x + 2.5} y2={y + 10} strokeWidth={1.2} />
          <line x1={x - 2.5} y1={y - 2.5} x2={x + 2.5} y2={y - 4} strokeWidth={2.6} />
          <line x1={x - 2.5} y1={y + 4} x2={x + 2.5} y2={y + 2.5} strokeWidth={2.6} />
        </g>
      )
    case 1:
      return (
        <g className="accidental">
          <line x1={x - 2} y1={y - 8.5} x2={x - 2} y2={y + 10} strokeWidth={1.2} />
          <line x1={x + 2} y1={y - 10} x2={x + 2} y2={y + 8.5} strokeWidth={1.2} />
          <line x1={x - 4.5} y1={y - 2} x2={x + 4.5} y2={y - 4.5} strokeWidth={2.6} />
          <line x1={x - 4.5} y1={y + 4.5} x2={x + 4.5} y2={y + 2} strokeWidth={2.6} />
        </g>
      )
    case 2:
      return (
        <g className="accidental">
          <line x1={x - 3.5} y1={y - 3.5} x2={x + 3.5} y2={y + 3.5} strokeWidth={1.4} />
          <line x1={x - 3.5} y1={y + 3.5} x2={x + 3.5} y2={y - 3.5} strokeWidth={1.4} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
            <rect key={sx + "," + sy} x={x + sx * 3.5 - 1.5} y={y + sy * 3.5 - 1.5} width={3} height={3} />
          ))}
        </g>
      )
    default:
      throw RangeError("cannot draw an accidental of " + accidental + " semitones")
  }
}

function Rest({duration, x}: {duration: Duration, x: number}) {
  switch(duration) {
    case Duration.Whole:
      // hangs from the fourth line
      return <rect className="rest" x={x - 6} y={space} width={12} height={5} />
    case Duration.Half:
      // sits on the middle line
      return <rect className="rest" x={x - 6} y={2 * space - 5} width={12} height={5} />
    case Duration.Quarter:
      return (
        <path
          className="rest"
          d={`M${x - 2},${5} L${x + 4},${13} L${x - 1},${19} L${x + 4},${26}`
            + ` C${x - 1},${24} ${x - 4},${28} ${x + 1},${33}`}
          fill="none"
          strokeWidth={2.6}
          strokeLinejoin="round"
        />
      )
    case Duration.Eighth:
    case Duration.Sixteenth: {
      const hooks = beamsForDuration(duration)
      return (
        <g className="rest">
          <path
            d={`M${x + 4},${14} L${x - 1 - (hooks - 1) * 2},${30 + (hooks - 1) * 7}`}
            fill="none"
            strokeWidth={1.4}
          />
          {[...Array(hooks)].map((_, i) => {
            const hx = x - i * 2
            const hy = 14 + i * 7
            return (
              <g key={i}>
                <path d={`M${hx - 3},${hy + 1} Q${hx},${hy + 4} ${hx + 4},${hy}`} fill="none" strokeWidth={1.4} />
                <circle cx={hx - 3} cy={hy} r={2.4} />
              </g>
            )
          })}
        </g>
      )
    }
    default:
      throw RangeError("cannot draw a rest of unknown duration: " + duration)
  }
}

// Flags draws the flags for an unbeamed note's stem, which ends at (x, y).
function Flags({count, x, y, up}: {count: number, x: number, y: number, up: boolean}) {
  const dir = up ? 1 : -1
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const fy = y + dir * i * beamGap
        return (
          <path
            key={i}
            className="flag"
            d={`M${x},${fy} C${x},${fy + dir * 6} ${x + 9},${fy + dir * 10} ${x + 7},${fy + dir * 20}`
              + ` C${x + 7},${fy + dir * 12} ${x + 3},${fy + dir * 10} ${x},${fy + dir * 8} z`}
            strokeWidth={0.8}
          />
        )
      })}
    </>
  )
}

// where a note is drawn, and where its stem ends
interface NoteLayout {
  x: number
  y: number
  pos: number
  up: boolean
  stemX: number
  stemEnd: number
}

// Beam is a straight line, from x1 to x2, along which stems end.
interface Beam {
  x1: number
  x2: number
  y1: number
  slope: number
  up: boolean
  count: number
}

const beamY = (b: Beam, x: number) => b.y1 + b.slope * (x - b.x1)

// layoutBeam lines a group of notes' stems up under a beam: pointing the way most of the
// group needs, sloping with the notes (but not too steeply) and keeping every stem at
// least a little long.
function layoutBeam(notes: NoteLayout[], count: number): Beam {

  const meanPos = notes.reduce((sum, n) => sum + n.pos, 0) / notes.length
  const up = meanPos < middleLine
  const dir = up ? -1 : 1

  for (const n of notes) {
    n.up = up
    n.stemX = n.x + (up ? 1 : -1) * (noteHeadHalfWidth - 0.4)
  }

  const first = notes[0]
  const last = notes[notes.length - 1]
  const run = last.stemX - first.stemX
  const rawSlope = run == 0 ? 0 : (last.y - first.y) / run
  const slope = Math.max(-steepestBeam, Math.min(steepestBeam, rawSlope))

  // start the beam a stem's length from the first note, then push it out from the
  // notes until none of their stems is too short
  let y1 = first.y + dir * stemLength
  for (const n of notes) {
    const reach = n.y + dir * (shortestStem + (count - 1) * beamGap) - slope * (n.stemX - first.stemX)
    y1 = up ? Math.min(y1, reach) : Math.max(y1, reach)
  }

  const beam = {x1: first.stemX, x2: last.stemX, y1: y1, slope: slope, up: up, count: count}
  for (const n of notes) {
    n.stemEnd = beamY(beam, n.stemX)
  }
  return beam
}

// the y each tuplet's number is written at, and whether it needs a bracket (when its
// notes are not beamed together, the bracket shows which notes it takes in)
interface TupletLayout {
  x1: number
  x2: number
  y: number
  bracket: boolean
}

interface StaveProps {
  measures: Measure[]
  keySignature: KeySignature
  // left out to leave the time signature unwritten
  timeSignature?: [number, number]
  slotsPerBeat: number
  // how wide a beat is drawn
  beatWidth?: number
  // the id of the note to pick out, as the one playing say
  highlight?: number
  // the barline that ends the stave: a repeat, a final barline, or a plain one
  endBarline?: "repeat" | "final" | "plain"
  className?: string
}

// Stave draws bars of music on a treble stave, beginning with the clef, key signature
// and (if there is one) time signature.
export function Stave(
  {
    measures,
    keySignature,
    timeSignature,
    slotsPerBeat,
    beatWidth = 70,
    highlight,
    endBarline = "plain",
    className,
  }: StaveProps
) {

  const elements: ReactElement[] = []
  const highlighted: ReactElement[] = []

  // the top and bottom of everything drawn, to fit the picture around
  let top = -18
  let bottom = 58
  const reach = (...ys: number[]) => {
    top = Math.min(top, ...ys)
    bottom = Math.max(bottom, ...ys)
  }

  let x = 6
  elements.push(<TrebleClef key="clef" x={x} />)
  x += trebleClefWidth + 6

  const keyLetters = keySignatureLetters(keySignature)
  keyLetters.forEach((letter, i) => {
    const pos = (keySignature > 0 ? keySharpPositions : keyFlatPositions)[letter]
    elements.push(
      <Accidental
        key={"key" + i}
        accidental={Math.sign(keySignature)}
        x={x + 4 + i * keyAccidentalWidth}
        y={positionY(pos)}
      />,
    )
  })
  x += keyLetters.length * keyAccidentalWidth + (keyLetters.length > 0 ? 6 : 0)

  if (timeSignature != undefined) {
    elements.push(
      <g key="time" className="timeSignature">
        <text x={x + 10} y={19}>{timeSignature[0]}</text>
        <text x={x + 10} y={39}>{timeSignature[1]}</text>
      </g>,
    )
    x += 26
  }

  const slotWidth = beatWidth / slotsPerBeat
  const measurePadding = 8

  measures.forEach((measure, m) => {

    // the room made for accidentals up to and including each event, which pushes it and
    // everything after it along
    let room = 0
    const roomUpTo = measure.events.map((e) => {
      room += e.accidental == undefined ? 0 : accidentalRoom(e.accidental)
      return room
    })

    const measureX = x
    const measureWidth = measurePadding + measure.numBeats * beatWidth + 4 + room
    const eventX = (i: number) => {
      const e = measure.events[i]
      return e.duration == Duration.Whole
        ? measureX + measureWidth / 2
        : measureX + measurePadding + e.start * beatWidth + slotWidth / 2 + roomUpTo[i]
    }

    // lay out the notes, then line their stems up under any beams
    const notes = new Map<number, NoteLayout>()
    measure.events.forEach((e, i) => {
      if (e.pitch == undefined) {
        return
      }
      const pos = trebleStavePosition(e.pitch)
      const nx = eventX(i)
      const ny = positionY(pos)
      const up = pos < middleLine
      const stemEnd = up
        ? Math.min(ny - stemLength, positionY(middleLine))
        : Math.max(ny + stemLength, positionY(middleLine))
      notes.set(i, {
        x: nx,
        y: ny,
        pos: pos,
        up: up,
        stemX: nx + (up ? 1 : -1) * (noteHeadHalfWidth - 0.4),
        stemEnd: stemEnd,
      })
    })

    const beamedEvents = new Set<number>()
    measure.beams.forEach((group, g) => {
      const count = beamsForDuration(measure.events[group[0]].duration)
      const beam = layoutBeam(group.map((i) => notes.get(i)!), count)
      group.forEach((i) => beamedEvents.add(i))

      const dir = beam.up ? 1 : -1
      for (let b = 0; b < beam.count; b++) {
        const offset = dir * b * beamGap
        const y1 = beamY(beam, beam.x1) + offset
        const y2 = beamY(beam, beam.x2) + offset
        const thickness = dir * beamThickness
        elements.push(
          <polygon
            key={`beam${m}-${g}-${b}`}
            className="beam"
            points={`${beam.x1 - 0.6},${y1} ${beam.x2 + 0.6},${y2} ${beam.x2 + 0.6},${y2 + thickness} ${beam.x1 - 0.6},${y1 + thickness}`}
          />,
        )
        reach(y1, y2, y1 + thickness, y2 + thickness)
      }
    })

    measure.events.forEach((e, i) => {
      const ex = eventX(i)
      const isHighlighted = e.id != undefined && e.id === highlight
      const drawn = isHighlighted ? highlighted : elements
      const key = `${m}-${i}`

      if (e.pitch == undefined) {
        drawn.push(<Rest key={"rest" + key} duration={e.duration} x={ex} />)
        return
      }

      const n = notes.get(i)!
      const parts: ReactElement[] = []

      // ledger lines, for notes above or below the stave
      const ledgers: number[] = []
      for (let p = -2; p >= n.pos; p -= 2) {
        ledgers.push(p)
      }
      for (let p = 10; p <= n.pos; p += 2) {
        ledgers.push(p)
      }
      for (const p of ledgers) {
        parts.push(
          <line
            key={"ledger" + p}
            className="ledger"
            x1={n.x - noteHeadHalfWidth - 3.5}
            x2={n.x + noteHeadHalfWidth + 3.5}
            y1={positionY(p)}
            y2={positionY(p)}
          />,
        )
      }

      if (e.accidental != undefined) {
        parts.push(<Accidental key="accidental" accidental={e.accidental} x={n.x - accidentalOffset(e.accidental)} y={n.y} />)
      }

      parts.push(
        <ellipse
          key="head"
          className="noteHead"
          cx={n.x}
          cy={n.y}
          rx={noteHeadHalfWidth}
          ry={4.3}
          transform={`rotate(-20 ${n.x} ${n.y})`}
        />,
      )
      parts.push(
        <line
          key="stem"
          className="stem"
          x1={n.stemX}
          x2={n.stemX}
          y1={n.y + (n.up ? -1 : 1)}
          y2={n.stemEnd}
        />,
      )
      if (!beamedEvents.has(i)) {
        parts.push(
          <Flags key="flags" count={beamsForDuration(e.duration)} x={n.stemX} y={n.stemEnd} up={n.up} />,
        )
      }
      reach(n.y - 6, n.y + 6, n.stemEnd)

      drawn.push(
        <g
          key={"note" + key}
          className={"note" + (isHighlighted ? " highlighted" : "")}
          data-id={e.id}
        >
          {parts}
        </g>,
      )
    })

    measure.tuplets.forEach((t, i) => {
      const inTuplet = measure.events.slice(t.first, t.last + 1).map((_, j) => t.first + j)
      const beam = measure.beams.find(
        (group) => group.length == inTuplet.length && group.every((e, j) => e == inTuplet[j]),
      )

      let layout: TupletLayout
      if (beam != undefined) {
        // the number goes by the middle of the beam, on the side away from the notes
        const first = notes.get(beam[0])!
        const last = notes.get(beam[beam.length - 1])!
        const midStemEnd = (first.stemEnd + last.stemEnd) / 2
        layout = {
          x1: first.stemX,
          x2: last.stemX,
          y: first.up ? midStemEnd - 6 : midStemEnd + 14,
          bracket: false,
        }
      } else {
        // a bracket over the top, clear of the notes and the stave
        const x1 = eventX(t.first) - 5
        const x2 = eventX(t.last) + 5
        const highest = Math.min(
          -6,
          ...inTuplet.map((e) => notes.get(e)).filter((n) => n != undefined)
            .map((n) => Math.min(n!.y - 8, n!.stemEnd)),
        )
        layout = {x1: x1, x2: x2, y: highest - 6, bracket: true}
      }

      const mid = (layout.x1 + layout.x2) / 2
      elements.push(
        <g key={`tuplet${m}-${i}`} className="tuplet">
          {layout.bracket && (
            <path
              d={`M${layout.x1},${layout.y + 1} L${layout.x1},${layout.y - 4} L${mid - 6},${layout.y - 4}`
                + ` M${mid + 6},${layout.y - 4} L${layout.x2},${layout.y - 4} L${layout.x2},${layout.y + 1}`}
              fill="none"
            />
          )}
          <text x={mid} y={layout.y}>3</text>
        </g>,
      )
      reach(layout.y - 12, layout.y + 2)
    })

    x += measureWidth

    // the barline closing the bar
    const isLast = m == measures.length - 1
    const style = isLast ? endBarline : "plain"
    if (style == "plain") {
      elements.push(<line key={"bar" + m} className="barline" x1={x} x2={x} y1={0} y2={staveHeight} />)
    } else {
      elements.push(
        <g key={"bar" + m} className="barline">
          <line x1={x - 6} x2={x - 6} y1={0} y2={staveHeight} />
          <rect x={x - 3} y={0} width={4} height={staveHeight} />
          {style == "repeat" && (
            <>
              <circle cx={x - 11} cy={15} r={1.8} />
              <circle cx={x - 11} cy={25} r={1.8} />
            </>
          )}
        </g>,
      )
      x += 1
    }
  })

  const width = x + 2
  const viewTop = top - 4
  const height = bottom - top + 8

  return (
    <svg
      className={"stave" + (className ? " " + className : "")}
      viewBox={`0 ${viewTop} ${width} ${height}`}
      width={width}
      height={height}
    >
      <g className="staveLines">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={0} x2={width - 2} y1={i * space} y2={i * space} />
        ))}
      </g>
      {elements}
      {/* drawn last, so that they show over anything they overlap */}
      {highlighted}
    </svg>
  )
}
