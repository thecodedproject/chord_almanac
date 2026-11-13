import "./lead_sheet_chart.css"

import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
} from "react"

import {
  parseChord,
} from "../lib/chord_parser"

import {
  LeadSheet,
  chordBeats,
  repeatChord,
} from "../lib/lead_sheet"

import {
  At,
} from "../lib/lead_sheet_edit"

// how many bars make a line of the chart, as in a real book
export const barsPerLine = 4

// withAccidentals sets the sharps and flats in a name apart, to be drawn closer to the
// letters they follow than the fonts chords are written in would put them
function withAccidentals(name: string): ReactNode {
  return name.split(/([♭♯𝄫𝄪])/).map((part, i) =>
    i % 2 == 1 ? <span key={i} className="accidental">{part}</span> : part,
  )
}

// ChordSymbol writes a chord as charts do, its quality raised beside its root. A chord
// that can't be read is written as it was typed, marked as wrong.
export function ChordSymbol(props: {text: string}) {
  const text = props.text.trim()
  if (text == "") {
    return null
  }
  if (text == repeatChord) {
    return <span className="chordSymbol repeat" title="Repeat">%</span>
  }
  const chord = parseChord(text)
  if (chord == undefined) {
    return <span className="chordSymbol unreadable" title="Not a chord this can play">{text}</span>
  }
  return (
    <span className="chordSymbol">
      <span className="root">{withAccidentals(chord.rootName)}</span>
      {chord.suffix != "" && <span className="suffix">{withAccidentals(chord.suffix)}</span>}
      {chord.bassName != undefined && <span className="bass">/{withAccidentals(chord.bassName)}</span>}
    </span>
  )
}

interface ChartProps {
  sheet: LeadSheet
  // the chord being heard, if playing
  playing?: At
  // while the chart is being edited: the chord being written, and the box to write it in
  selected?: At
  onSelect?: (at: At) => void
  editor?: ReactNode
}

const same = (a: At | undefined, b: At) => a != undefined && a.bar == b.bar && a.index == b.index

// LeadSheetChart sets out a sheet's chords bar by bar, four bars to a line, each chord
// taking a share of its bar as wide as the beats it lasts. While it is being edited each
// chord can be picked to be written over.
export function LeadSheetChart(props: ChartProps) {
  const editing = props.onSelect != undefined
  const chart = useRef<HTMLDivElement>(null)

  // the chord playing is kept in view
  useEffect(() => {
    if (props.playing == undefined) {
      return
    }
    const cell = chart.current?.querySelector(".chord.playing")
    if (cell instanceof HTMLElement && typeof cell.scrollIntoView == "function") {
      cell.scrollIntoView({block: "nearest"})
    }
  }, [props.playing?.bar])

  const onCellKey = (event: KeyboardEvent, at: At) => {
    if (event.key == "Enter") {
      event.preventDefault()
      props.onSelect?.(at)
    }
  }

  return (
    <div className={"leadSheetChart" + (editing ? " editing" : "")} ref={chart}>
      {props.sheet.bars.map((bar, b) => {
        const beats = chordBeats(bar.chords.length, props.sheet.beatsPerBar)
        return (
          <div
            key={b}
            className={"bar" + (props.playing?.bar == b ? " current" : "") + (b % barsPerLine == 0 ? " lineStart" : "")}
            data-bar={b}
          >
            {bar.section != undefined && <span className="section">{bar.section}</span>}
            {bar.chords.map((text, i) => {
              const at = {bar: b, index: i}
              const isSelected = editing && same(props.selected, at)
              // a chord the bar has no beat left for, after the time signature was
              // changed, is kept but not played
              const unplayed = i >= beats.length
              const className = "chord"
                + (same(props.playing, at) ? " playing" : "")
                + (isSelected ? " selected" : "")
                + (unplayed ? " unplayed" : "")
              const style = {flexGrow: beats[i] ?? 1}
              if (isSelected) {
                return <div key={i} className={className} style={style}>{props.editor}</div>
              }
              if (editing) {
                return (
                  <button
                    key={i}
                    type="button"
                    className={className}
                    style={style}
                    aria-label={`Bar ${b + 1}, chord ${i + 1}: ${text.trim() == "" ? "empty" : text}`}
                    onClick={() => props.onSelect?.(at)}
                    onKeyDown={(event) => onCellKey(event, at)}
                  >
                    <ChordSymbol text={text} />
                  </button>
                )
              }
              return (
                <div key={i} className={className} style={style}>
                  <ChordSymbol text={text} />
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
