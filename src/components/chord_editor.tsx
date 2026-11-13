import "./chord_editor.css"

import {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
} from "react"

import {
  parseChord,
} from "../lib/chord_parser"

import {
  repeatChord,
} from "../lib/lead_sheet"

// the ways of moving on from the chord being written
export type EditMove =
  | "nextInBar"   // space: the next chord in the bar, making room for one if there's a beat
  | "nextBar"     // enter or |: the first chord of the next bar
  | "next"        // tab or →: the next chord, wherever it is
  | "previous"    // shift-tab or ←: the chord before
  | "up"          // ↑: the bar a line up
  | "down"        // ↓: the bar a line down
  | "remove"      // backspace, with nothing written: take the chord away
  | "done"        // escape: stop writing

interface ChordInputProps {
  value: string
  onChange: (text: string) => void
  onMove: (move: EditMove) => void
}

// ChordInput is the box a chord is written into on the chart. It takes the focus as it
// appears, with what is already written selected so that typing writes over it, and
// moves on from chord to chord at the touch of a key, so that a tune can be typed in as
// fast as it is read: "Dm7 G7 | Cmaj7 |".
export function ChordInput(props: ChordInputProps) {
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const target = event.currentTarget
    const atStart = target.selectionStart == 0 && target.selectionEnd == 0
    const atEnd = target.selectionStart == target.value.length && target.selectionEnd == target.value.length
    const modified = event.ctrlKey || event.metaKey || event.altKey

    let move: EditMove | undefined = undefined
    if (event.key == " " && !modified) {
      move = "nextInBar"
    } else if (event.key == "Enter" || event.key == "|") {
      move = "nextBar"
    } else if (event.key == "Tab") {
      move = event.shiftKey ? "previous" : "next"
    } else if (event.key == "ArrowRight" && atEnd && !event.shiftKey) {
      move = "next"
    } else if (event.key == "ArrowLeft" && atStart && !event.shiftKey) {
      move = "previous"
    } else if (event.key == "ArrowUp") {
      move = "up"
    } else if (event.key == "ArrowDown") {
      move = "down"
    } else if (event.key == "Backspace" && target.value == "") {
      move = "remove"
    } else if (event.key == "Escape") {
      move = "done"
    }

    if (move != undefined) {
      event.preventDefault()
      props.onMove(move)
    }
  }

  const text = props.value.trim()
  const readable = text == "" || text == repeatChord || parseChord(text) != undefined

  return (
    <input
      ref={input}
      className={"chordInput" + (readable ? "" : " unreadable")}
      type="text"
      aria-label="Chord"
      aria-invalid={!readable}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  )
}

// the roots offered, spelled as they most often are in jazz charts
export const paletteRoots = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"]

// the qualities offered, by how they are labelled and the suffix written for them
export const paletteQualities: [string, string][] = [
  ["maj7", "maj7"],
  ["7", "7"],
  ["m7", "m7"],
  ["m7♭5", "m7♭5"],
  ["dim7", "dim7"],
  ["mMaj7", "mMaj7"],
  ["6", "6"],
  ["m6", "m6"],
  ["7sus4", "7sus4"],
  ["7alt", "7alt"],
  ["maj", ""],
  ["m", "m"],
  ["dim", "dim"],
  ["+", "+"],
]

interface PaletteProps {
  // the root of the chord being written, if it has one, to show it chosen
  root?: string
  onRoot: (root: string) => void
  onQuality: (suffix: string) => void
  onRepeat: () => void
  onClear: () => void
}

// buttons on the palette keep the focus where it was, in the box the chord is written in,
// so that typing can carry on after a click
const keepFocus = (event: MouseEvent) => event.preventDefault()

// ChordPalette writes a chord with the mouse: a root, then a quality.
export function ChordPalette(props: PaletteProps) {
  return (
    <div className="chordPalette">
      <div className="paletteRow roots" role="group" aria-label="Root">
        {paletteRoots.map((root) => (
          <button
            key={root}
            type="button"
            className={props.root == root ? "selected" : ""}
            onMouseDown={keepFocus}
            onClick={() => props.onRoot(root)}
          >
            {root}
          </button>
        ))}
      </div>
      <div className="paletteRow qualities" role="group" aria-label="Quality">
        {paletteQualities.map(([label, suffix]) => (
          <button
            key={label}
            type="button"
            aria-label={"Quality " + label}
            disabled={props.root == undefined}
            onMouseDown={keepFocus}
            onClick={() => props.onQuality(suffix)}
          >
            {label}
          </button>
        ))}
        <span className="paletteGap" />
        <button type="button" title="On its own in a bar, the bar before again; beside other chords, the chord before" onMouseDown={keepFocus} onClick={props.onRepeat}>%</button>
        <button type="button" title="No chord" onMouseDown={keepFocus} onClick={props.onClear}>Clear</button>
      </div>
    </div>
  )
}

interface BarToolsProps {
  bar: number
  section: string
  onSection: (section: string) => void
  canAddChord: boolean
  onAddChord: () => void
  onInsertBar: () => void
  onDeleteBar: () => void
  beatsPerBar: number
  onBeatsPerBar: (beats: number) => void
}

// BarTools changes the bar being written in, and the sheet's time signature
export function BarTools(props: BarToolsProps) {
  return (
    <div className="barTools">
      <span className="barNumber">Bar {props.bar + 1}</span>
      <button type="button" onMouseDown={keepFocus} onClick={props.onAddChord} disabled={!props.canAddChord}>
        + Chord in bar
      </button>
      <button type="button" onMouseDown={keepFocus} onClick={props.onInsertBar}>+ Bar after</button>
      <button type="button" onMouseDown={keepFocus} onClick={props.onDeleteBar}>Delete bar</button>
      <label>
        Section:
        <input
          className="sectionInput"
          type="text"
          maxLength={3}
          value={props.section}
          placeholder="–"
          onChange={(event) => props.onSection(event.target.value)}
        />
      </label>
      <span className="timeSignature" role="group" aria-label="Time signature">
        {[3, 4].map((beats) => (
          <button
            key={beats}
            type="button"
            className={props.beatsPerBar == beats ? "selected" : ""}
            onMouseDown={keepFocus}
            onClick={() => props.onBeatsPerBar(beats)}
          >
            {beats}/4
          </button>
        ))}
      </span>
    </div>
  )
}

// the keys, as a reminder of them
export function EditKeys() {
  return (
    <p className="editKeys">
      <kbd>Space</kbd> next chord in the bar · <kbd>Enter</kbd> or <kbd>|</kbd> next bar ·
      {" "}<kbd>Tab</kbd> / <kbd>⇧Tab</kbd> next / previous · <kbd>↑</kbd><kbd>↓</kbd> line up / down ·
      {" "}<kbd>⌫</kbd> on an empty chord removes it · <kbd>%</kbd> repeats the bar before (or, beside other chords, the chord before) ·
      {" "}<kbd>Esc</kbd> done
    </p>
  )
}
