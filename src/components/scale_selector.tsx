import {
  IState,
} from "../state"

import {
  Note,
} from "../lib/chord_anthology"

interface IScaleProps {
  rootNote: IState<Note>;
  pos: IState<number>;
}

export function ScaleSelector({props}: {props: IScaleProps}) {

  const handleRootClick = (n: Note) => {
    return (event: any) => {
      console.log("Root click:", n)

      props.rootNote.set(n)
      event.preventDefault()
    }
  }

  const handlePosClick = (pos: number) => {
    return (event: any) => {
      console.log("pos click", pos)

      props.pos.set(pos)

      event.preventDefault()
    }
  }

  console.log("ScaleSelector: current root:", props.rootNote.value, "pos:", props.pos.value)


  return (
    <div className="scaleSelector">

      <div className="rootSelector">
        <button onClick={handleRootClick(Note.C)}>C</button>
        <button onClick={handleRootClick(Note.Db)}>Db</button>
        <button onClick={handleRootClick(Note.D)}>D</button>
        <button onClick={handleRootClick(Note.Eb)}>Eb</button>
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
