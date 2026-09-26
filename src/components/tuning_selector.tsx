import "./selector_row.css"

import {
  Note,
} from "../lib/chord_anthology"

import {
  eightStringTuning,
  sevenStringTuning,
  sixStringTuning,
} from "../lib/guitar_notation"

// the tunings a chart can be drawn against, by the number of strings the guitar has
export const tuningsByNumStrings: Record<number, Note[]> = {
  6: sixStringTuning,
  7: sevenStringTuning,
  8: eightStringTuning,
}

export function NumStringsSelector(
  {value, set}: {value: number, set: (n: number) => void}
) {

  const handleClick = (n: number) => (event: any) => {
    set(n)
    event.preventDefault()
  }

  return (
    <div className="selectorRow numStringsSelector">
      <span>Strings:</span>
      {Object.keys(tuningsByNumStrings).map((n) => {
        const num = Number(n)
        return (
          <button
            key={num}
            onClick={handleClick(num)}
            disabled={num === value}
          >
            {num}
          </button>
        )
      })}
    </div>
  )
}

export function TuningDisplay({tuning}: {tuning: Note[]}) {

  // display from the highest string (1) down to the lowest, i.e. the reverse of the
  // tuning array
  const displayed = [...tuning].reverse()

  return (
    <div className="selectorRow tuningDisplay">
      <span>Tuning:</span>
      {displayed.map((note, i) => (
        <span className="tuningNote" key={i}>{note}</span>
      ))}
    </div>
  )
}
