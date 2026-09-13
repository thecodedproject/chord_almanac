import "./selector_row.css"

import {isEqual} from "lodash"

// the sets of four strings a tetrad is conventionally voiced on, each given from its
// lowest sounding string up. The last two skip a string, which gives the wider voicings
// the room they need.
export const stringSets: number[][] = [
  [6,5,4,3],
  [5,4,3,2],
  [4,3,2,1],
  [6,4,3,2],
  [5,3,2,1],
]

export function StringSetSelector(
  {value, set}: {value: number[], set: (s: number[]) => void}
) {

  const handleClick = (strings: number[]) => (event: any) => {
    set(strings)
    event.preventDefault()
  }

  return (
    <div className="selectorRow stringSetSelector">
      <span>Strings:</span>
      {stringSets.map((strings) => (
        <button
          key={strings.join()}
          onClick={handleClick(strings)}
          disabled={isEqual(strings, value)}
        >
          {strings.join(" ")}
        </button>
      ))}
    </div>
  )
}
