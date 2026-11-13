import "./scale_patterns_page.css"

import {
  SetStateAction,
  useEffect,
  useRef,
} from "react"

import {
  newState,
} from "../state"

import {
  modeLabels,
} from "../components/music_labels"

import {
  ScalePatternSelector,
} from "../components/scale_pattern_selector"

import {
  ScaleSelector,
} from "../components/scale_selector"

import {
  Stave,
} from "../components/stave"

import {
  TransportControls,
} from "../components/transport_controls"

import {
  Note,
  ScaleType,
  modeForScale,
  scaleFromIonianRoot,
} from "../lib/chord_anthology"

import {
  midiNumber,
  spellScale,
  spelledNoteName,
} from "../lib/notation"

import {
  PatternPlayer,
  PlayerLoop,
  PlayerNote,
  PlayerPosition,
  PlayerState,
} from "../lib/pattern_player"

import {
  Direction,
  Rhythm,
  ScaleChoice,
  ScalePattern,
  keyAfter,
  nextKey,
  notesPerBeat,
  runBars,
  writeBasePattern,
  writeRun,
} from "../lib/scale_patterns"

// scaleName names the mode a scale choice starts from, after its tonic: "D Dorian"
function scaleName(choice: ScaleChoice): string {
  const tonic = spellScale(choice.ionianRoot, choice.type, choice.pos).notes[0]
  const mode = modeForScale(scaleFromIonianRoot(choice.ionianRoot, choice.type, choice.pos))
  return spelledNoteName(tonic) + " " + modeLabels[mode]
}

// how wide a beat of the run is drawn, giving the notes room for their accidentals
const beatWidth = (slotsPerBeat: number) => Math.max(70, slotsPerBeat * 20)

export function ScalePatternsPage() {

  const props = {
    scale: {
      rootNote: newState(Note.C),
      pos: newState(1),
      type: newState(ScaleType.Major),
    },
    pattern: {
      degrees: newState([1, 2, 3]),
      rhythm: newState(Rhythm.Triplets),
      direction: newState(Direction.Ascending),
      beatsPerBar: newState(4),
    },
    tempo: newState(80),
    clickOn: newState(true),
    notesOn: newState(true),
    cycleKeys: newState(true),
    playerState: newState<PlayerState>("stopped"),
    position: newState<PlayerPosition | undefined>(undefined),
  }

  const choice: ScaleChoice = {
    ionianRoot: props.scale.rootNote.value,
    type: props.scale.type.value,
    pos: props.scale.pos.value,
  }
  const pattern: ScalePattern = {
    degrees: props.pattern.degrees.value,
    rhythm: props.pattern.rhythm.value,
    direction: props.pattern.direction.value,
  }
  const beatsPerBar = props.pattern.beatsPerBar.value
  const slotsPerBeat = notesPerBeat(pattern.rhythm)

  const base = writeBasePattern(choice, pattern, beatsPerBar)
  const run = writeRun(choice, pattern, beatsPerBar)

  // The player runs outside of rendering, so reads what to play from here - kept up to
  // date with every render, so that changes are heard as soon as they are seen.
  const live = useRef({choice: choice, pattern: pattern, beatsPerBar: beatsPerBar, cycleKeys: props.cycleKeys.value})
  live.current = {choice: choice, pattern: pattern, beatsPerBar: beatsPerBar, cycleKeys: props.cycleKeys.value}

  const player = useRef<PatternPlayer>()

  // the time round being heard, and the key the cycle of fourths is counted on from
  // (the key chosen, and the time round it was chosen on)
  const heardLoop = useRef(0)
  const cycleFrom = useRef({loop: 0, root: choice.ionianRoot})
  const restartCycle = (root: Note) => {
    // from the time round being scheduled, which near the end of one is already the
    // next - so that the next is played in the key chosen too
    const scheduled = player.current?.scheduledLoop() ?? 0
    cycleFrom.current = {loop: Math.max(heardLoop.current, scheduled), root: root}
  }

  const keyAt = (loop: number) => live.current.cycleKeys
    ? keyAfter(cycleFrom.current.root, Math.max(0, loop - cycleFrom.current.loop))
    : live.current.choice.ionianRoot

  // the player asks for every slot it plays, so the time round is only worked out again
  // when something about it changes
  const loopCache = useRef<{key: string, loop: PlayerLoop}>()
  const loopAt = (loop: number): PlayerLoop => {
    const {pattern, beatsPerBar} = live.current
    const loopChoice = {...live.current.choice, ionianRoot: keyAt(loop)}
    const key = JSON.stringify([loopChoice, pattern, beatsPerBar])
    if (loopCache.current?.key != key) {
      const notes: (PlayerNote | undefined)[] = []
      for (const n of writeRun(loopChoice, pattern, beatsPerBar).notes) {
        notes[n.slot] = {midi: midiNumber(n.pitch), slots: n.length ?? 1}
      }
      loopCache.current = {
        key: key,
        loop: {
          slotsPerBeat: notesPerBeat(pattern.rhythm),
          beatsPerBar: beatsPerBar,
          numBars: runBars,
          notes: notes,
        },
      }
    }
    return loopCache.current.loop
  }

  const onPosition = (position: PlayerPosition | undefined) => {
    if (position != undefined && position.loop != heardLoop.current) {
      heardLoop.current = position.loop
      // the score moves on to the key now being played
      if (live.current.cycleKeys) {
        props.scale.rootNote.set(keyAt(position.loop))
      }
    }
    props.position.set(position)
  }

  // the player calls back through these, which are new each render
  const callbacks = useRef({loopAt: loopAt, onPosition: onPosition})
  callbacks.current = {loopAt: loopAt, onPosition: onPosition}

  useEffect(() => {
    player.current = new PatternPlayer({
      loopAt: (loop) => callbacks.current.loopAt(loop),
      onPosition: (position) => callbacks.current.onPosition(position),
      tempo: props.tempo.value,
      clickOn: props.clickOn.value,
      notesOn: props.notesOn.value,
    })
    return () => player.current?.dispose()
  }, [])

  // choosing a key by hand starts the cycle of fourths again from it
  const rootNote = {
    value: props.scale.rootNote.value,
    set: (action: SetStateAction<Note>) => {
      const root = typeof action == "function" ? action(props.scale.rootNote.value) : action
      restartCycle(root)
      props.scale.rootNote.set(root)
    },
  }

  const play = () => {
    if (props.playerState.value == "stopped") {
      heardLoop.current = 0
      restartCycle(props.scale.rootNote.value)
    }
    // the page goes back to stopped if there is no audio to play through
    player.current?.play().catch(() => stop())
    props.playerState.set("playing")
  }

  const pause = () => {
    player.current?.pause()
    props.playerState.set("paused")
  }

  const stop = () => {
    player.current?.stop()
    props.playerState.set("stopped")
  }

  const setTempo = (bpm: number) => {
    player.current?.setTempo(bpm)
    props.tempo.set(bpm)
  }

  const setClickOn = (on: boolean) => {
    player.current?.setClickOn(on)
    props.clickOn.set(on)
  }

  const setNotesOn = (on: boolean) => {
    player.current?.setNotesOn(on)
    props.notesOn.set(on)
  }

  const setCycleKeys = (on: boolean) => {
    restartCycle(props.scale.rootNote.value)
    props.cycleKeys.set(on)
  }

  // The space bar starts and pauses playback while the focus is on nothing in
  // particular, or on a button or slider (which pressing it would otherwise press again,
  // or do nothing to). Elsewhere the space keeps its usual job - ticking a checkbox, say.
  const togglePlay = useRef(() => {})
  togglePlay.current = () => props.playerState.value == "playing" ? pause() : play()
  useEffect(() => {
    const spaceToggles = (event: KeyboardEvent) => {
      const target = event.target
      return event.code == "Space"
        && !event.defaultPrevented
        && !(event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
        && (
          target == document.body
          || target == document.documentElement
          || target instanceof HTMLButtonElement
          || (target instanceof HTMLInputElement && target.type == "range")
        )
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!spaceToggles(event)) {
        return
      }
      // keeps a focused button from being pressed by the space too
      event.preventDefault()
      if (!event.repeat) {
        togglePlay.current()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (spaceToggles(event)) {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  // the note sounding, which is held through the slots it lasts
  const heardSlot = props.playerState.value == "stopped" ? undefined : props.position.value?.slot
  const highlight = heardSlot == undefined ? undefined : run.notes.find(
    (n) => n.slot <= heardSlot && heardSlot < n.slot + (n.length ?? 1),
  )?.slot

  return (
    <div className="scalePatterns">
      <h2>Scale patterns</h2>

      <section className="basePattern">
        <div className="basePatternScore">
          <h3>Pattern</h3>
          <Stave
            className="basePatternStave"
            measures={base.measures}
            keySignature={base.keySignature}
            slotsPerBeat={slotsPerBeat}
            beatWidth={beatWidth(slotsPerBeat)}
            endBarline="final"
          />
        </div>
        <ScalePatternSelector props={props.pattern} />
      </section>

      <section className="run">
        <h3>
          {scaleName(choice)}
          {props.cycleKeys.value && (
            <span className="nextKey">
              next: {scaleName({...choice, ionianRoot: nextKey(choice.ionianRoot)})}
            </span>
          )}
        </h3>
        <Stave
          className="runStave"
          measures={run.measures}
          keySignature={run.keySignature}
          timeSignature={[beatsPerBar, 4]}
          slotsPerBeat={slotsPerBeat}
          beatWidth={beatWidth(slotsPerBeat)}
          highlight={highlight}
          endBarline="repeat"
        />
      </section>

      <ScaleSelector
        props={{rootNote: rootNote, pos: props.scale.pos, type: props.scale.type}}
        choosePositionAs="mode"
      />

      <TransportControls
        state={props.playerState.value}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        tempo={props.tempo.value}
        setTempo={setTempo}
        clickOn={props.clickOn.value}
        setClickOn={setClickOn}
        notesOn={props.notesOn.value}
        setNotesOn={setNotesOn}
        cycleKeys={props.cycleKeys.value}
        setCycleKeys={setCycleKeys}
      />
    </div>
  )
}
