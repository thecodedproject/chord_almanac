// Playing a run back: a metronome click on every beat, and the notes of the run on
// top, over and over, reporting which slot of which time round is sounding as it goes.
//
// Sounds are scheduled a little ahead on the audio clock, which keeps them in time
// however busy the page gets; the position is reported against that same clock as each
// slot is heard.

// PlayerNote is a note to play: its midi number, and how many slots it lasts.
export interface PlayerNote {
  midi: number
  slots: number
}

// PlayerLoop is one time round: the grid of slots it is played on, and the notes started
// in each slot - one for a melody, several sounded together for a chord (undefined or
// empty where there are none).
export interface PlayerLoop {
  slotsPerBeat: number
  beatsPerBar: number
  numBars: number
  notes: (PlayerNote[] | undefined)[]
}

export interface PlayerPosition {
  // how many times round the player has been since it was started
  loop: number
  slot: number
}

export type PlayerState = "stopped" | "playing" | "paused"

// how far ahead sounds are scheduled, and how often the schedule is topped up
const scheduleAhead = 0.12
const scheduleInterval = 25

export interface PlayerOptions {
  // the time round given; asked for every slot as it is scheduled, so that changes to
  // what is played are heard straight away. When the beat is divided differently from
  // one slot to the next, playing carries on from the same point in the beat.
  loopAt: (loop: number) => PlayerLoop
  onPosition: (position: PlayerPosition | undefined) => void
  tempo: number
  clickOn: boolean
  notesOn: boolean
}

export class PatternPlayer {

  private options: PlayerOptions
  private ctx?: AudioContext
  private clickGain?: GainNode
  private noteGain?: GainNode

  private state: PlayerState = "stopped"
  private timer?: ReturnType<typeof setInterval>
  private frame?: number

  // the next slot to schedule, when it is due, and how many slots the beat it is in was
  // divided into
  private next: PlayerPosition = {loop: 0, slot: 0}
  private nextTime = 0
  private slotsPerBeat?: number

  // counts each call to play, so that one left waiting for the audio to start can tell
  // that a later one has taken over from it
  private plays = 0

  // the slots scheduled but not yet heard, in order
  private pending: (PlayerPosition & {time: number})[] = []

  constructor(options: PlayerOptions) {
    this.options = options
  }

  getState(): PlayerState {
    return this.state
  }

  // scheduledLoop is the time round being scheduled - which near the end of one can
  // already be the next, a moment before it is heard
  scheduledLoop(): number {
    return this.next.loop
  }

  setTempo(bpm: number) {
    this.options.tempo = bpm
  }

  setClickOn(on: boolean) {
    this.options.clickOn = on
    if (this.ctx != undefined) {
      this.clickGain?.gain.setValueAtTime(on ? 1 : 0, this.ctx.currentTime)
    }
  }

  setNotesOn(on: boolean) {
    this.options.notesOn = on
    if (this.ctx != undefined) {
      this.noteGain?.gain.setValueAtTime(on ? 1 : 0, this.ctx.currentTime)
    }
  }

  // play starts playing from the top, or from where it was paused. It fails if the
  // browser has no audio to play through.
  async play() {
    if (this.state == "playing") {
      return
    }

    if (this.ctx == undefined) {
      this.ctx = newAudioContext()
      this.connectOutputs()
    }

    if (this.state == "stopped") {
      this.next = {loop: 0, slot: 0}
      this.slotsPerBeat = undefined
      // a moment's grace, so the first beat isn't clipped
      this.nextTime = this.ctx.currentTime + 0.1
    }

    // a paused context resumes with its clock where it stopped, so anything already
    // scheduled plays on just as it would have
    this.state = "playing"
    const play = ++this.plays
    await this.ctx.resume()
    // paused, stopped or played again while the audio started
    if (this.state != "playing" || play != this.plays) {
      return
    }
    this.stopTimers()
    this.schedule()
    this.timer = setInterval(() => this.schedule(), scheduleInterval)
    this.frame = requestAnimationFrame(() => this.track())
  }

  async pause() {
    if (this.state != "playing") {
      return
    }
    this.state = "paused"
    this.stopTimers()
    await this.ctx?.suspend()
  }

  stop() {
    this.state = "stopped"
    this.stopTimers()

    // cut off whatever is still scheduled by disconnecting it all
    this.clickGain?.disconnect()
    this.noteGain?.disconnect()
    if (this.ctx != undefined) {
      this.connectOutputs()
    }

    this.pending = []
    this.next = {loop: 0, slot: 0}
    this.options.onPosition(undefined)
  }

  // dispose stops the player for good, releasing the audio device
  dispose() {
    this.stop()
    this.ctx?.close()
    this.ctx = undefined
    this.clickGain = undefined
    this.noteGain = undefined
  }

  private connectOutputs() {
    const ctx = this.ctx!
    this.clickGain = ctx.createGain()
    this.clickGain.gain.value = this.options.clickOn ? 1 : 0
    this.clickGain.connect(ctx.destination)

    this.noteGain = ctx.createGain()
    this.noteGain.gain.value = this.options.notesOn ? 1 : 0
    this.noteGain.connect(ctx.destination)
  }

  private stopTimers() {
    if (this.timer != undefined) {
      clearInterval(this.timer)
      this.timer = undefined
    }
    if (this.frame != undefined) {
      cancelAnimationFrame(this.frame)
      this.frame = undefined
    }
  }

  // schedule sounds every slot due before the schedule next gets topped up
  private schedule() {
    const ctx = this.ctx
    if (ctx == undefined) {
      return
    }

    // slots are only let go of as they are seen to be heard, which never happens while
    // the page is hidden; any long gone by are let go of here instead
    const stale = this.pending.findIndex((p) => p.time > ctx.currentTime - 1)
    this.pending.splice(0, stale == -1 ? this.pending.length : stale)

    while (this.nextTime < ctx.currentTime + scheduleAhead) {
      const loop = this.options.loopAt(this.next.loop)

      // the beat has been divided differently: carry on from the next slot of the new
      // division, at the time it falls in the beat
      if (this.slotsPerBeat != undefined && this.slotsPerBeat != loop.slotsPerBeat) {
        const beats = this.next.slot / this.slotsPerBeat
        const slot = Math.ceil(beats * loop.slotsPerBeat - 1e-9)
        this.nextTime += (slot / loop.slotsPerBeat - beats) * 60 / this.options.tempo
        this.next = {loop: this.next.loop, slot: slot}
      }
      this.slotsPerBeat = loop.slotsPerBeat

      const slotsPerBar = loop.slotsPerBeat * loop.beatsPerBar
      if (this.next.slot >= slotsPerBar * loop.numBars) {
        this.next = {loop: this.next.loop + 1, slot: 0}
        continue
      }

      const slot = this.next.slot
      const slotLength = 60 / this.options.tempo / loop.slotsPerBeat

      if (slot % loop.slotsPerBeat == 0) {
        this.click(this.nextTime, slot % slotsPerBar == 0)
      }
      const notes = loop.notes[slot] ?? []
      // the notes of a chord share the loudness of a single note between them, near
      // enough, so a chord isn't heard much louder than a melody
      const level = 1 / Math.sqrt(Math.max(1, notes.length))
      for (const note of notes) {
        this.note(this.nextTime, note.midi, note.slots * slotLength, level)
      }

      this.pending.push({...this.next, time: this.nextTime})
      this.next = {loop: this.next.loop, slot: slot + 1}
      this.nextTime += slotLength
    }
  }

  // track reports each slot as it is heard
  private track() {
    if (this.ctx == undefined) {
      return
    }
    const now = this.ctx.currentTime

    const unheard = this.pending.findIndex((p) => p.time > now)
    const numHeard = unheard == -1 ? this.pending.length : unheard
    if (numHeard > 0) {
      const heard = this.pending[numHeard - 1]
      this.pending.splice(0, numHeard)
      this.options.onPosition({loop: heard.loop, slot: heard.slot})
    }

    if (this.state == "playing") {
      this.frame = requestAnimationFrame(() => this.track())
    }
  }

  // click sounds the metronome, higher on the first beat of the bar
  private click(time: number, accent: boolean) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const env = ctx.createGain()

    osc.frequency.value = accent ? 1760 : 1320
    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(accent ? 0.5 : 0.3, time + 0.002)
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    osc.connect(env).connect(this.clickGain!)
    osc.start(time)
    osc.stop(time + 0.06)
  }

  // note sounds a note, at the given share of full loudness, for most of the time it is played for, leaving a gap before the
  // next so that repeated notes are heard as two
  private note(time: number, midi: number, length: number, level: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const end = time + length * 0.9
    const gain = 0.35 * level

    osc.type = "triangle"
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12)
    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(gain, time + 0.005)
    env.gain.setValueAtTime(gain, end - 0.02)
    env.gain.linearRampToValueAtTime(0, end)

    osc.connect(env).connect(this.noteGain!)
    osc.start(time)
    osc.stop(end + 0.01)
  }
}

// newAudioContext opens the browser's audio - under the older name Safari gave it, where
// that is the only one it has.
function newAudioContext(): AudioContext {
  const Context = typeof AudioContext != "undefined"
    ? AudioContext
    : typeof window != "undefined" ? (window as any).webkitAudioContext : undefined
  if (Context == undefined) {
    throw new Error("this browser cannot play audio")
  }
  return new Context()
}
