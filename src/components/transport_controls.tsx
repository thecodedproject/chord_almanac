import "./transport_controls.css"

import {
  PlayerState,
} from "music-lib/audio"

export const minTempo = 30
export const maxTempo = 240

interface TransportProps {
  state: PlayerState
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  tempo: number
  setTempo: (bpm: number) => void
  clickOn: boolean
  setClickOn: (on: boolean) => void
  notesOn: boolean
  setNotesOn: (on: boolean) => void
  // what the notes played over the metronome are called: "Notes", or "Chords"
  notesLabel?: string
  // left out where there are no keys to move round
  cycleKeys?: boolean
  setCycleKeys?: (on: boolean) => void
}

// TransportControls starts, pauses and stops playback, and sets how it is played: its
// tempo, whether the metronome and the notes are heard, and (where it can) whether each
// time round moves on to the next key.
export function TransportControls(props: TransportProps) {

  const clampTempo = (bpm: number) => Math.max(minTempo, Math.min(maxTempo, Math.round(bpm)))

  return (
    <div className="transportControls">

      <div className="transportButtons">
        {props.state == "playing"
          ? <button className="pause" onClick={props.onPause}>❚❚ Pause</button>
          : <button className="play" onClick={props.onPlay}>▶ Play</button>}
        <button className="stop" onClick={props.onStop} disabled={props.state == "stopped"}>
          ■ Stop
        </button>
      </div>

      <div className="tempo">
        <label htmlFor="tempo">Tempo:</label>
        <button aria-label="Slower" onClick={() => props.setTempo(clampTempo(props.tempo - 5))}>−</button>
        <input
          id="tempo"
          type="range"
          min={minTempo}
          max={maxTempo}
          value={props.tempo}
          onChange={(event) => props.setTempo(clampTempo(Number(event.target.value)))}
        />
        <button aria-label="Faster" onClick={() => props.setTempo(clampTempo(props.tempo + 5))}>+</button>
        <span className="bpm">{props.tempo} bpm</span>
      </div>

      <div className="toggles">
        <label>
          <input
            type="checkbox"
            className="clickOn"
            checked={props.clickOn}
            onChange={(event) => props.setClickOn(event.target.checked)}
          />
          Metronome
        </label>
        <label>
          <input
            type="checkbox"
            className="notesOn"
            checked={props.notesOn}
            onChange={(event) => props.setNotesOn(event.target.checked)}
          />
          {props.notesLabel ?? "Notes"}
        </label>
        {props.setCycleKeys != undefined && (
          <label>
            <input
              type="checkbox"
              className="cycleKeys"
              checked={props.cycleKeys ?? false}
              onChange={(event) => props.setCycleKeys?.(event.target.checked)}
            />
            Move round the cycle of fourths
          </label>
        )}
      </div>
    </div>
  )
}
