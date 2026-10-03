import "./selector_row.css"
import "./scale_degree_selector.css"

import {
  numTetradVoices,
} from "../lib/chord_anthology"

// ScaleDegreeSelector picks the degrees of the scale a chord is built from, up to the
// four a tetrad has room for.
export function ScaleDegreeSelector(
  {numScaleDegrees, value, set}: {
    numScaleDegrees: number,
    value: number[],
    set: (d: number[]) => void,
  }
) {

  const handleClick = (degree: number) => (event: any) => {
    set(
      value.includes(degree)
        ? value.filter((d) => d != degree)
        : [...value, degree].sort((a, b) => a-b),
    )
    event.preventDefault()
  }

  const degrees = [...Array(numScaleDegrees)].map((_, i) => i+1)

  return (
    <div className="selectorRow scaleDegreeSelector">
      <span>Scale degrees:</span>
      {degrees.map((degree) => {
        const selected = value.includes(degree)
        return (
          <button
            key={degree}
            onClick={handleClick(degree)}
            className={selected ? "selected" : undefined}
            // the table voices four notes, so no more than four can be chosen
            disabled={!selected && value.length >= numTetradVoices}
          >
            {degree}
          </button>
        )
      })}
    </div>
  )
}
