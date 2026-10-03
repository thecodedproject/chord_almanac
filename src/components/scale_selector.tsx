import "./scale_selector.css"

import {
  IState,
} from "../state"

import {
  Note,
  ScaleType,
  modeForScale,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

import {
  modeLabels,
} from "./music_labels"

interface IScaleProps {
  rootNote: IState<Note>;
  // left out by a page with no use for a position, which hides the row choosing it
  pos?: IState<number>;
  type: IState<ScaleType>;
}

const scaleTypes: [ScaleType, string][] = [
  [ScaleType.Major, "Major"],
  [ScaleType.MelodicMinor, "Melodic minor"],
  [ScaleType.HarmonicMinor, "Harmonic minor"],
  [ScaleType.HarmonicMajor, "Harmonic major"],
]

const rootNotes: Note[] = [
  Note.C, Note.Db, Note.D, Note.Eb, Note.E, Note.F,
  Note.Gb, Note.G, Note.Ab, Note.A, Note.Bb, Note.B,
]

const positions = ["I", "II", "III", "IV", "V", "VI", "VII"]

// ScaleSelector picks a scale: its type, its root and the degree of it to start from.
// That degree is offered either as a position, numbered, or as the mode of the scale
// starting there, named.
export function ScaleSelector(
  {props, choosePositionAs = "position"}: {
    props: IScaleProps,
    choosePositionAs?: "position" | "mode",
  }
) {

  const handleRootClick = (n: Note) => {
    return (event: any) => {
      props.rootNote.set(n)
      event.preventDefault()
    }
  }

  const handlePosClick = (pos: number) => {
    return (event: any) => {
      props.pos?.set(pos)
      event.preventDefault()
    }
  }

  const handleTypeClick = (scaleType: ScaleType) => {
    return (event: any) => {
      props.type.set(scaleType)
      event.preventDefault()
    }
  }

  // the modes of the chosen scale type, from the one starting on its first degree
  const modeNames = positions.map((_, i) => modeLabels[modeForScale(
    scaleFromIonianRoot(props.rootNote.value, props.type.value, i+1),
  )])

  // the class that picks out the button for whatever is currently chosen
  const selectedIf = (selected: boolean) => selected ? "selected" : undefined

  return (
    <div className="scaleSelector">

      <div className="typeSelector">
        {scaleTypes.map(([scaleType, label]) => (
          <button
            key={scaleType}
            onClick={handleTypeClick(scaleType)}
            className={selectedIf(scaleType === props.type.value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rootSelector">
        {rootNotes.map((n) => (
          <button
            key={n}
            onClick={handleRootClick(n)}
            className={selectedIf(n === props.rootNote.value)}
          >
            {n}
          </button>
        ))}
      </div>

      {props.pos != undefined && (
        <div className="positionSelector">
          <span>{choosePositionAs == "mode" ? "Mode:" : "Pos:"}</span>
          {(choosePositionAs == "mode" ? modeNames : positions).map((label, i) => (
            <button
              key={label}
              onClick={handlePosClick(i+1)}
              className={selectedIf(i+1 === props.pos?.value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
