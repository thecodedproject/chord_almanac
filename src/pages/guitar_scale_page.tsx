import {
  newState,
} from "../state"

import {
  GuitarFingerChart,
} from "../components/guitar_finger_chart"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  Note,
  ScaleType,
  scaleFromIonianRoot,
  scaleNotes,
} from "../lib/chord_anthology"

import {
  eightStringTuning,
  sevenStringTuning,
  sixStringTuning,
  tabNotesNPerString,
} from "../lib/guitar_notation"

const tuningsByNumStrings: Record<number, Note[]> = {
  6: sixStringTuning,
  7: sevenStringTuning,
  8: eightStringTuning,
}

export function GuitarScalePage() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    },
    numStrings: newState(6),
  }

  const tuning = tuningsByNumStrings[props.numStrings.value]

  const scale = scaleFromIonianRoot(
    props.scale.rootNote.value,
    props.scale.type.value,
    props.scale.pos.value,
  )
  const notes = scaleNotes(scale, 4)

  const scaleTab = tabNotesNPerString(
    notes,
    {
      notesPerString: 3,
      trimExcess: true,
      tuning: tuning,
    },
  )


  return (
    <>
      <h2>Guitar finger chart</h2>
        <GuitarFingerChart tabNotes={scaleTab} numStrings={tuning.length}/>
      <br />
      <NumStringsSelector
        value={props.numStrings.value}
        set={props.numStrings.set}
      />
      <TuningDisplay tuning={tuning} />
      <ScaleSelector props={props.scale}/>
    </>
  )
}

function NumStringsSelector(
  {value, set}: {value: number, set: (n: number) => void}
) {
  const handleClick = (n: number) => (event: any) => {
    set(n)
    event.preventDefault()
  }

  return (
    <div className="numStringsSelector">
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

function TuningDisplay({tuning}: {tuning: Note[]}) {
  // display from highest string (1) to lowest, i.e. reverse of the tuning array
  const displayed = [...tuning].reverse()
  return (
    <div className="tuningDisplay">
      <span>Tuning:</span>
      {displayed.map((note, i) => (
        <span className="tuningNote" key={i}>{note}</span>
      ))}
    </div>
  )
}
