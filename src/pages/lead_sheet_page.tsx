import "./lead_sheet_page.css"

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  BarTools,
  ChordInput,
  ChordPalette,
  EditKeys,
  EditMove,
} from "../components/chord_editor"

import {
  LeadSheetChart,
  barsPerLine,
} from "../components/lead_sheet_chart"

import {
  TransportControls,
} from "../components/transport_controls"

import {
  useSpaceToggle,
} from "../components/use_space_toggle"

import {
  normaliseChord,
  parseChord,
} from "../lib/chord_parser"

import {
  LeadSheet,
  chordAtBeat,
  exampleSheet,
  newId,
  newSheet,
  repeatChord,
  sheetChords,
  sheetLoop,
} from "../lib/lead_sheet"

import {
  At,
  Moved,
  addChordToBar,
  barAbove,
  barBelow,
  chordAt,
  deleteBar,
  insertBar,
  nextBar,
  nextChord,
  nextChordInBar,
  previousChord,
  removeChord,
  setBeatsPerBar,
  setSection,
  tidyBar,
  trimEnd,
  withChord,
} from "../lib/lead_sheet_edit"

import {
  SheetSummary,
  deleteSheet,
  exportSheet,
  importSheetFile,
  lastOpenedId,
  listSheets,
  loadSheet,
  saveSheet,
  setLastOpenedId,
  sheetFileExtension,
} from "../lib/lead_sheet_store"

import {
  PatternPlayer,
  PlayerLoop,
  PlayerPosition,
  PlayerState,
} from "../lib/pattern_player"

// how long after a change the sheet is saved, so that a run of changes is saved once
const saveDelay = 300

// the sheet to open on arriving at the page: the one open last time, or failing that the
// one changed most recently, or on a first visit an example to play
function firstSheet(): LeadSheet {
  const last = lastOpenedId()
  const opened = last == undefined ? undefined : loadSheet(last)
  if (opened != undefined) {
    return opened
  }
  for (const summary of listSheets()) {
    const sheet = loadSheet(summary.id)
    if (sheet != undefined) {
      return sheet
    }
  }
  const example = exampleSheet()
  saveSheet(example)
  return example
}

// a name for a new sheet that none of the others has
function unusedName(base: string, sheets: SheetSummary[]): string {
  const names = new Set(sheets.map((s) => s.name))
  let name = base
  for (let n = 2; names.has(name); n++) {
    name = base + " " + n
  }
  return name
}

type SaveStatus = "saved" | "saving" | "failed"

const couldNotSave = (sheet: LeadSheet) =>
  `“${sheet.name}” couldn't be saved: the browser's storage may be full, or turned off for this site.`

export function LeadSheetPage() {

  const [sheet, setSheet] = useState<LeadSheet>(firstSheet)
  const [sheets, setSheets] = useState<SheetSummary[]>(listSheets)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved")
  const [message, setMessage] = useState<string>()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // while editing: the chord being written, and what has been typed for it so far
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<At>()
  const [draft, setDraft] = useState("")

  const [playerState, setPlayerState] = useState<PlayerState>("stopped")
  const [position, setPosition] = useState<PlayerPosition>()
  const [clickOn, setClickOnState] = useState(true)
  const [notesOn, setNotesOnState] = useState(true)

  // ---- saving

  // Changes are saved a moment after they are made, and straight away on leaving the
  // page or opening another sheet.
  const current = useRef(sheet)
  current.current = sheet
  const unsaved = useRef(false)

  // save saves the sheet if it has changed, telling whether it is saved. A sheet that
  // couldn't be saved stays to be saved, and is tried again with the next change.
  const save = (): boolean => {
    if (!unsaved.current) {
      return true
    }
    const saved = saveSheet(current.current)
    unsaved.current = !saved
    setSaveStatus(saved ? "saved" : "failed")
    setSheets(listSheets())
    if (!saved) {
      setMessage(couldNotSave(current.current))
    }
    return saved
  }
  const saveNow = useRef(save)
  saveNow.current = save

  useEffect(() => {
    if (!unsaved.current) {
      return
    }
    const timer = setTimeout(() => saveNow.current(), saveDelay)
    return () => clearTimeout(timer)
  }, [sheet])

  useEffect(() => {
    const onLeave = () => saveNow.current()
    window.addEventListener("pagehide", onLeave)
    return () => {
      window.removeEventListener("pagehide", onLeave)
      onLeave()
    }
  }, [])

  useEffect(() => {
    setLastOpenedId(sheet.id)
  }, [sheet.id])

  // change makes a change to the sheet, to be saved
  const change = (next: LeadSheet) => {
    if (next == sheet) {
      return
    }
    unsaved.current = true
    setSaveStatus("saving")
    setSheet({...next, updatedAt: Date.now()})
  }

  // ---- playing

  const player = useRef<PatternPlayer>()

  // the player runs outside of rendering, so reads what to play from here - kept up to
  // date with every render, so that changes are heard as soon as they are seen. It asks
  // for every beat it plays, so the chords are only voiced again when they change.
  const loopCache = useRef<{key: string, loop: PlayerLoop}>()
  const loopAt = (): PlayerLoop => {
    const s = current.current
    const key = JSON.stringify([s.bars, s.beatsPerBar])
    if (loopCache.current?.key != key) {
      loopCache.current = {key: key, loop: sheetLoop(s)}
    }
    return loopCache.current.loop
  }

  useEffect(() => {
    player.current = new PatternPlayer({
      loopAt: loopAt,
      onPosition: setPosition,
      tempo: sheet.tempo,
      clickOn: clickOn,
      notesOn: notesOn,
    })
    return () => player.current?.dispose()
  }, [])

  const play = () => {
    // the page goes back to stopped if there is no audio to play through
    player.current?.play().catch(() => stop())
    setPlayerState("playing")
  }

  const pause = () => {
    player.current?.pause()
    setPlayerState("paused")
  }

  const stop = () => {
    player.current?.stop()
    setPlayerState("stopped")
  }

  useSpaceToggle(() => playerState == "playing" ? pause() : play())

  // the tempo the sheet is played at is saved with it, to start at next time
  const setTempo = (bpm: number) => {
    player.current?.setTempo(bpm)
    change({...sheet, tempo: bpm})
  }

  const setClickOn = (on: boolean) => {
    player.current?.setClickOn(on)
    setClickOnState(on)
  }

  const setNotesOn = (on: boolean) => {
    player.current?.setNotesOn(on)
    setNotesOnState(on)
  }

  const chords = useMemo(() => sheetChords(sheet), [sheet])
  const heardBeat = playerState == "stopped" ? undefined : position?.slot
  const playing = heardBeat == undefined ? undefined : chordAtBeat(chords, heardBeat)

  // ---- editing

  const select = (at: At | undefined, s: LeadSheet) => {
    setSelected(at)
    setDraft(at == undefined ? "" : chordAt(s, at))
  }

  // what is typed goes straight onto the sheet, so that it is heard (and saved) as it is
  // written; it is put into the site's spelling on moving on from it
  const type = (text: string) => {
    setDraft(text)
    if (selected != undefined) {
      change(withChord(sheet, selected, text))
    }
  }

  // withDraft is the sheet with the chord being written written in
  const withDraft = (text: string = draft): LeadSheet =>
    selected == undefined ? sheet : withChord(sheet, selected, normaliseChord(text))

  // goTo writes in the chord being written and moves to another, tidying away any empty
  // chords left behind in the bar it leaves - and, on stopping writing, any empty bars
  // left at the end
  const goTo = (s: LeadSheet, at: At | undefined) => {
    if (selected != undefined && (at == undefined || at.bar != selected.bar)) {
      s = tidyBar(s, selected.bar)
    }
    if (at == undefined) {
      s = trimEnd(s)
    }
    change(s)
    select(at, s)
  }

  const moveBy = (move: EditMove, text: string = draft) => {
    if (selected == undefined) {
      return
    }
    const s = withDraft(text)
    const to = (m: Moved) => goTo(m.sheet, m.at)
    switch (move) {
      case "nextInBar": return to(nextChordInBar(s, selected))
      case "nextBar": return to(nextBar(s, selected))
      case "next": return to(nextChord(s, selected))
      case "previous": return goTo(s, previousChord(s, selected))
      case "up": return goTo(s, barAbove(s, selected, barsPerLine))
      case "down": return goTo(s, barBelow(s, selected, barsPerLine))
      case "done": return goTo(s, undefined)
      case "remove": {
        const m = removeChord(s, selected)
        change(m.sheet)
        return select(m.at, m.sheet)
      }
    }
  }

  const pick = (at: At) => goTo(withDraft(), at)

  const startEditing = () => {
    setEditing(true)
    setConfirmingDelete(false)
    select({bar: 0, index: 0}, sheet)
  }

  const stopEditing = () => {
    goTo(withDraft(), undefined)
    setEditing(false)
  }

  // the palette: a root, keeping whatever quality the chord had, then a quality, which
  // writes the chord in and moves on to the next
  const draftChord = parseChord(draft)
  const slashBass = draftChord?.bassName == undefined ? "" : "/" + draftChord.bassName
  const onRoot = (root: string) => type(root + (draftChord?.suffix ?? "") + slashBass)
  const onQuality = (suffix: string) => {
    if (draftChord != undefined) {
      moveBy("next", draftChord.rootName + suffix + slashBass)
    }
  }

  const onClear = () => type("")

  const changeBar = (m: Moved) => {
    change(m.sheet)
    select(m.at, m.sheet)
  }

  // ---- the sheets kept

  // finished is the sheet as it is left when writing stops: with the chord being written
  // written in, and the empty chords and bars left behind tidied away
  const finished = (): LeadSheet => editing && selected != undefined
    ? trimEnd(tidyBar(withDraft(), selected.bar))
    : sheet

  // leave finishes with the sheet open, saving it, before another is opened. It tells
  // whether it could: a sheet that couldn't be saved is kept open, so as not to lose it.
  const leave = (): boolean => {
    const s = finished()
    if (s != sheet) {
      current.current = {...s, updatedAt: Date.now()}
      unsaved.current = true
    }
    return save()
  }

  // show shows a sheet in place of the one open, which has been left (or deleted)
  const show = (s: LeadSheet) => {
    stop()
    player.current?.setTempo(s.tempo)
    setSheet(s)
    setSaveStatus("saved")
    setConfirmingDelete(false)
    if (editing) {
      select({bar: 0, index: 0}, s)
    }
  }

  const open = (s: LeadSheet): boolean => {
    if (!leave()) {
      return false
    }
    show(s)
    return true
  }

  const onOpen = (event: ChangeEvent<HTMLSelectElement>) => {
    const s = loadSheet(event.target.value)
    if (s == undefined) {
      setMessage("That sheet couldn't be read.")
      return
    }
    setMessage(undefined)
    open(s)
  }

  // a sheet just made or brought in is saved straight away, to be in the list - and if
  // it can't be, it isn't opened, as it would be lost
  const showNew = (s: LeadSheet): boolean => {
    if (!saveSheet(s)) {
      setMessage(couldNotSave(s))
      return false
    }
    setSheets(listSheets())
    show(s)
    return true
  }

  const openNew = (s: LeadSheet): boolean => leave() && showNew(s)

  const onNew = () => {
    const s = newSheet(unusedName("Untitled", sheets))
    if (openNew(s)) {
      setEditing(true)
      select({bar: 0, index: 0}, s)
      setMessage(undefined)
    }
  }

  const onDuplicate = () => {
    const copy = {...finished(), id: newId(), name: unusedName(sheet.name + " (copy)", sheets), updatedAt: Date.now()}
    if (openNew(copy)) {
      setMessage(undefined)
    }
  }

  const onExport = () => exportSheet(finished())

  const fileInput = useRef<HTMLInputElement>(null)
  const onImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // so that choosing the same file again imports it again
    event.target.value = ""
    if (file == undefined) {
      return
    }
    importSheetFile(file)
      .then((s) => {
        if (openNew(s)) {
          setMessage(`Imported “${s.name}”.`)
        }
      })
      .catch(() => setMessage(`“${file.name}” isn't a lead sheet that can be read here.`))
  }

  const onDelete = () => {
    unsaved.current = false
    deleteSheet(sheet.id)
    const remaining = listSheets()
    const next = remaining.length > 0 ? loadSheet(remaining[0].id) : undefined
    setMessage(`Deleted “${sheet.name}”.`)
    // the sheet deleted is not left, as leaving would save it again
    if (next != undefined) {
      setSheets(remaining)
      show(next)
    } else {
      showNew(newSheet("Untitled"))
    }
  }

  // the sheet open is always in the list, even before it has been saved
  const listed = sheets.some((s) => s.id == sheet.id) ? sheets : [sheet, ...sheets]

  const selectedBar = selected == undefined ? undefined : sheet.bars[selected.bar]

  return (
    <div className="leadSheetPage">
      <h2>Lead sheet player</h2>

      <div className="sheetLibrary">
        <label>
          Lead sheet:
          <select value={sheet.id} onChange={onOpen}>
            {listed.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={onNew}>New</button>
        <button type="button" onClick={onDuplicate}>Duplicate</button>
        <button type="button" onClick={onExport} title="Save a copy as a file">Export</button>
        <button type="button" onClick={() => fileInput.current?.click()} title="Open a lead sheet file">
          Import…
        </button>
        <input
          ref={fileInput}
          className="importFile"
          type="file"
          accept={sheetFileExtension + ",.json,application/json"}
          aria-label="Lead sheet file to import"
          onChange={onImport}
          hidden
        />
        {confirmingDelete ? (
          <span className="confirmDelete" role="group" aria-label="Confirm delete">
            Delete “{sheet.name}”?
            <button type="button" className="danger" onClick={onDelete}>Delete</button>
            <button type="button" onClick={() => setConfirmingDelete(false)}>Cancel</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmingDelete(true)}>Delete…</button>
        )}
        <span className={"saveStatus " + saveStatus} role="status">
          {saveStatus == "saved" ? "Saved" : saveStatus == "saving" ? "Saving…" : "Couldn't save"}
        </span>
      </div>

      {message != undefined && <p className="sheetMessage" role="status">{message}</p>}

      <div className="sheetTitle">
        {editing ? (
          <input
            className="sheetName"
            type="text"
            aria-label="Name"
            value={sheet.name}
            onChange={(event) => change({...sheet, name: event.target.value})}
          />
        ) : (
          <h3 className="sheetName">{sheet.name}</h3>
        )}
        {editing
          ? <button type="button" className="editToggle" onClick={stopEditing}>Done</button>
          : <button type="button" className="editToggle" onClick={startEditing}>Edit chords</button>}
      </div>

      {editing && selected != undefined && selectedBar != undefined && (
        <div className="sheetEditor">
          <ChordPalette
            root={draftChord?.rootName}
            onRoot={onRoot}
            onQuality={onQuality}
            onRepeat={() => moveBy("next", repeatChord)}
            onClear={onClear}
          />
          <BarTools
            bar={selected.bar}
            section={selectedBar.section ?? ""}
            onSection={(section) => change(setSection(withDraft(), selected.bar, section))}
            canAddChord={selectedBar.chords.length < sheet.beatsPerBar}
            onAddChord={() => changeBar(addChordToBar(withDraft(), selected))}
            onInsertBar={() => changeBar(insertBar(tidyBar(withDraft(), selected.bar), selected.bar))}
            onDeleteBar={() => changeBar(deleteBar(sheet, selected.bar))}
            beatsPerBar={sheet.beatsPerBar}
            onBeatsPerBar={(beats) => {
              const s = setBeatsPerBar(withDraft(), beats)
              changeBar({sheet: s, at: {bar: selected.bar, index: Math.min(selected.index, beats - 1)}})
            }}
          />
        </div>
      )}

      <LeadSheetChart
        sheet={sheet}
        playing={playing}
        selected={editing ? selected : undefined}
        onSelect={editing ? pick : undefined}
        editor={<ChordInput value={draft} onChange={type} onMove={moveBy} />}
      />

      {editing && <EditKeys />}

      <TransportControls
        state={playerState}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        tempo={sheet.tempo}
        setTempo={setTempo}
        clickOn={clickOn}
        setClickOn={setClickOn}
        notesOn={notesOn}
        setNotesOn={setNotesOn}
        notesLabel="Chords"
      />
    </div>
  )
}
