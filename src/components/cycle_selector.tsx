import "./selector_row.css"

import {
  DiatonicInterval,
} from "../lib/chord_anthology"

// the cycles a table of chords can be taken through, each named for the diatonic
// interval it climbs by
export const cycles: [DiatonicInterval, string][] = [
  [DiatonicInterval.Second, "Cycle 2"],
  [DiatonicInterval.Third, "Cycle 3"],
  [DiatonicInterval.Fourth, "Cycle 4"],
]

export function CycleSelector(
  {value, set}: {value: DiatonicInterval, set: (i: DiatonicInterval) => void}
) {

  return (
    <div className="selectorRow cycleSelector">
      <span>Cycle:</span>
      <select
        value={value}
        onChange={(event) => set(event.target.value as DiatonicInterval)}
      >
        {cycles.map(([interval, label]) => (
          <option key={interval} value={interval}>{label}</option>
        ))}
      </select>
    </div>
  )
}
