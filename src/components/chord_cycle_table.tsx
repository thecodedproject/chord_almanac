import "./chord_cycle_table.css"
import {
  Note,
} from "../lib/chord_anthology"

export function ChordCycleTable() {

  const notes = [Note.A, Note.B, Note.C, Note.Db]

  return (
    <div className="chordCycleTable">

      <div className="Body">

        <TableRow notes={notes}/>

        <div className="TriadRow">
          <div className="NoteLabel Elem_1_3">A</div>
          <div className="NoteLabel Elem_2_3">B</div>
          <div className="NoteLabel Elem_3_3">C</div>
          <div className="NoteLabel Elem_1_5">d</div>
          <div className="NoteLabel Elem_2_5">e</div>
          <div className="NoteLabel Elem_3_5">f</div>
          <div className="NoteLabel Elem_1_7">A</div>
          <div className="NoteLabel Elem_2_7">B</div>
          <div className="NoteLabel Elem_3_7">C</div>
          <div className="NoteLabel Elem_1_9">d</div>
          <div className="NoteLabel Elem_2_9">e</div>
          <div className="NoteLabel Elem_3_9">f</div>
          <div className="NoteLabel Elem_1_11">d</div>
          <div className="NoteLabel Elem_2_11">e</div>
          <div className="NoteLabel Elem_3_11">f</div>
          <div className="NoteLabel Elem_1_13">A</div>
          <div className="NoteLabel Elem_2_13">B</div>
          <div className="NoteLabel Elem_3_13">C</div>
          <div className="NoteLabel Elem_1_15">d</div>
          <div className="NoteLabel Elem_2_15">e</div>
          <div className="NoteLabel Elem_3_15">f</div>


          <div className="EndRepeat">
            <div className="Line"></div>
            <div className="UpperDot"></div>
            <div className="LowerDot"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableRow({notes}: {notes: Note[]}) {

  const row = notes.map((n, i) => {
    const iRow = 2*i+3
    const iCol = 1
    const key = iCol + "_" + iRow
    const cl = "NoteLabel Elem_1_" + iRow
    return <div className={cl} key={key}>{n}</div>
  })

  return (
    <div className="TriadRow">

      <div className="StartRepeat">
        <div className="Line"></div>
        <div className="UpperDot"></div>
        <div className="LowerDot"></div>
      </div>

      {row}
    </div>
  )
}
