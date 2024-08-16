import {
  IState,
} from "../state"

import {
  Note,
  ScaleType,
} from "../lib/chord_anthology"

interface IScaleProps {
  rootNote: IState<Note>;
  pos: IState<number>;
  type: IState<ScaleType>;
}

export function ScaleSelector({props}: {props: IScaleProps}) {

  const handleRootClick = (n: Note) => {
    return (event: any) => {
      props.rootNote.set(n)
      event.preventDefault()
    }
  }

  const handlePosClick = (pos: number) => {
    return (event: any) => {
      props.pos.set(pos)
      event.preventDefault()
    }
  }

  const handleTypeClick = (scaleType: ScaleType) => {
    return (event: any) => {
      props.type.set(scaleType)
      event.preventDefault()
    }
  }

  return (
    <div className="scaleSelector">

      <div className="typeSelector">
        <button onClick={handleTypeClick(ScaleType.Major)}>Major</button>
        <button onClick={handleTypeClick(ScaleType.MelodicMinor)}>Melodic minor</button>
        <button onClick={handleTypeClick(ScaleType.HarmonicMinor)}>Harmonic minor</button>
      </div>

      <div className="rootSelector">
        <button onClick={handleRootClick(Note.C)}>C</button>
        <button onClick={handleRootClick(Note.Db)}>Db</button>
        <button onClick={handleRootClick(Note.D)}>D</button>
        <button onClick={handleRootClick(Note.Eb)}>Eb</button>
        <button onClick={handleRootClick(Note.E)}>E</button>
        <button onClick={handleRootClick(Note.F)}>F</button>
        <button onClick={handleRootClick(Note.Gb)}>Gb</button>
        <button onClick={handleRootClick(Note.G)}>G</button>
        <button onClick={handleRootClick(Note.Ab)}>Ab</button>
        <button onClick={handleRootClick(Note.A)}>Ab</button>
        <button onClick={handleRootClick(Note.Bb)}>Bb</button>
        <button onClick={handleRootClick(Note.B)}>B</button>
      </div>

      <div className="positionSelector">
        <span>Pos:</span>
        <button onClick={handlePosClick(1)}>I</button>
        <button onClick={handlePosClick(2)}>II</button>
        <button onClick={handlePosClick(3)}>III</button>
        <button onClick={handlePosClick(4)}>IV</button>
        <button onClick={handlePosClick(5)}>V</button>
        <button onClick={handlePosClick(6)}>VI</button>
        <button onClick={handlePosClick(7)}>VII</button>
      </div>
    </div>
  )
}
