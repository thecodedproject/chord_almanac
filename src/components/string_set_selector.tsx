import "./selector_row.css"
import "./string_set_selector.css"

import {isEqual} from "lodash"

import {
  Playability,
} from "../lib/guitar_chords"

// the class each set of strings takes for how playable it is
const playabilityClasses: Record<Playability, string | undefined> = {
  [Playability.Playable]: "playable",
  [Playability.PossiblyPlayable]: undefined,
  [Playability.Unplayable]: undefined,
}

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

// the sets of three strings a triad is conventionally voiced on, each given from its
// lowest sounding string up. The last three skip a string, which gives the open voicings
// the room they need.
export const triadStringSets: number[][] = [
  [6,5,4],
  [5,4,3],
  [4,3,2],
  [3,2,1],
  [6,4,3],
  [5,3,2],
  [4,2,1],
]

// allStringSets lists every set of four strings on a guitar with the given number of
// strings, each from its lowest sounding string up, starting from the lowest strings.
export function allStringSets(numStrings = 6, setSize = 4): number[][] {

  if (setSize == 0) {
    return [[]]
  }

  const sets: number[][] = []
  for (let lowest = numStrings; lowest >= setSize; lowest--) {
    for (const rest of allStringSets(lowest - 1, setSize - 1)) {
      sets.push([lowest, ...rest])
    }
  }

  return sets
}

// StringSetSelector offers the given sets of strings to voice a chord on. Given how
// playable each set is, it picks out the playable ones, along with a key saying what
// that means.
export function StringSetSelector(
  {value, set, options = stringSets, playabilityOf}: {
    value: number[],
    set: (s: number[]) => void,
    options?: number[][],
    playabilityOf?: (strings: number[]) => Playability,
  }
) {

  const handleClick = (strings: number[]) => (event: any) => {
    set(strings)
    event.preventDefault()
  }

  return (
    <div className="stringSetSelector">
      <div className="selectorRow">
        <span>Strings:</span>
        <div className="stringSets">
          {options.map((strings) => (
            <button
              key={strings.join()}
              onClick={handleClick(strings)}
              disabled={isEqual(strings, value)}
              className={
                playabilityOf == undefined
                  ? undefined
                  : playabilityClasses[playabilityOf(strings)]
              }
            >
              {strings.join(" ")}
            </button>
          ))}
        </div>
      </div>
      {playabilityOf != undefined && (
        <div className="playableKey">
          <span className="playableSwatch"></span> = playable
        </div>
      )}
    </div>
  )
}
