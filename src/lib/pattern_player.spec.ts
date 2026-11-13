import {
  PatternPlayer,
  PlayerLoop,
  PlayerPosition,
} from "./pattern_player"

// FakeAudioContext stands in for the browser's audio, recording what is played when, on
// a clock the test moves on by hand.
class FakeAudioContext {
  static last: FakeAudioContext
  currentTime = 0
  destination = {}
  // the frequency of each sound started, and when
  started: {time: number, frequency: number}[] = []

  constructor() {
    FakeAudioContext.last = this
  }

  createGain() {
    const param = {value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}}
    return {gain: param, connect: (n: any) => n, disconnect() {}}
  }

  createOscillator() {
    const ctx = this
    const osc = {
      type: "sine",
      frequency: {value: 0},
      connect: (n: any) => n,
      start(time: number) { ctx.started.push({time: time, frequency: osc.frequency.value}) },
      stop() {},
    }
    return osc
  }

  // a suspended context's clock stands still
  suspended = false
  resume() { this.suspended = false; return Promise.resolve() }
  suspend() { this.suspended = true; return Promise.resolve() }
  close() { return Promise.resolve() }
}

describe("PatternPlayer", () => {

  let frames: (() => void)[]

  beforeEach(() => {
    jest.useFakeTimers()
    frames = []
    ;(global as any).AudioContext = FakeAudioContext
    ;(global as any).requestAnimationFrame = (f: () => void) => frames.push(f)
    ;(global as any).cancelAnimationFrame = () => {}
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // a bar of 2/4 in quavers, with a note on the first two quavers and a crotchet on the
  // second beat
  const loop: PlayerLoop = {
    slotsPerBeat: 2,
    beatsPerBar: 2,
    numBars: 1,
    notes: [[{midi: 60, slots: 1}], [{midi: 62, slots: 1}], [{midi: 64, slots: 2}], undefined],
  }

  // advance moves the audio clock and timers on, and draws the next frame
  const advance = (seconds: number) => {
    if (!FakeAudioContext.last.suspended) {
      FakeAudioContext.last.currentTime += seconds
    }
    jest.advanceTimersByTime(seconds * 1000)
    const due = frames
    frames = []
    due.forEach((f) => f())
  }

  async function startPlayer(options: {loopAt?: (n: number) => PlayerLoop, clickOn?: boolean} = {}) {
    const positions: (PlayerPosition | undefined)[] = []
    const player = new PatternPlayer({
      loopAt: options.loopAt ?? (() => loop),
      onPosition: (p) => positions.push(p),
      // a beat a second, so a quaver every half second
      tempo: 60,
      clickOn: options.clickOn ?? true,
      notesOn: true,
    })
    await player.play()
    return {player, positions}
  }

  it("clicks on the beat and plays the notes in their slots", async () => {
    await startPlayer()
    // far enough for the schedule to reach the next bar
    advance(2)

    const ctx = FakeAudioContext.last
    // the accented click starting the bar, the note, the second quaver, the click on
    // the second beat and the note there, then the next bar coming round
    expect(ctx.started.map((s) => [Number((s.time - 0.1).toFixed(2)), Math.round(s.frequency)])).toEqual([
      [0, 1760], [0, 262],
      [0.5, 294],
      [1, 1320], [1, 330],
      [2, 1760], [2, 262],
    ])
  })

  it("sounds the notes of a chord together", async () => {
    const chords: PlayerLoop = {
      slotsPerBeat: 1,
      beatsPerBar: 2,
      numBars: 1,
      notes: [[{midi: 60, slots: 2}, {midi: 64, slots: 2}, {midi: 67, slots: 2}], undefined],
    }
    await startPlayer({loopAt: () => chords, clickOn: false})
    advance(1)

    expect(FakeAudioContext.last.started
      .filter((s) => s.frequency < 1000)
      .map((s) => [Number((s.time - 0.1).toFixed(2)), Math.round(s.frequency)])).toEqual([
      [0, 262], [0, 330], [0, 392],
    ])
  })

  it("reports each slot as it is heard, going round again at the end", async () => {
    const {positions} = await startPlayer()
    advance(0.15)
    advance(0.5)
    advance(1.0)
    advance(0.5)

    expect(positions).toEqual([
      {loop: 0, slot: 0},
      {loop: 0, slot: 1},
      {loop: 0, slot: 3},
      {loop: 1, slot: 0},
    ])
  })

  it("asks for each time round as it plays it", async () => {
    const asked = new Set<number>()
    await startPlayer({loopAt: (n) => { asked.add(n); return loop }})
    advance(2.5)

    expect(Array.from(asked)).toEqual([0, 1])
  })

  it("reports nothing playing once stopped, and starts from the top again", async () => {
    const {player, positions} = await startPlayer()
    advance(1.2)
    player.stop()
    expect(positions[positions.length - 1]).toEqual(undefined)

    await player.play()
    advance(0.15)
    expect(positions[positions.length - 1]).toEqual({loop: 0, slot: 0})
  })

  it("carries on from where it was paused", async () => {
    const {player, positions} = await startPlayer()
    advance(0.65)
    expect(positions[positions.length - 1]).toEqual({loop: 0, slot: 1})

    await player.pause()
    advance(5)
    await player.play()
    advance(0.5)
    expect(positions[positions.length - 1]).toEqual({loop: 0, slot: 2})
  })

  it("starts from the top when stopped while paused", async () => {
    const {player, positions} = await startPlayer()
    advance(1.2)
    await player.pause()
    player.stop()

    await player.play()
    advance(0.15)
    expect(positions[positions.length - 1]).toEqual({loop: 0, slot: 0})
  })

  it("keeps one schedule going when played again before the audio has started", async () => {
    const player = new PatternPlayer({
      loopAt: () => loop, onPosition: () => {}, tempo: 60, clickOn: true, notesOn: true,
    })
    // the second play comes before the first has heard the audio start
    const first = player.play()
    player.pause()
    const second = player.play()
    await Promise.all([first, second])

    expect(jest.getTimerCount()).toEqual(1)
    player.dispose()
    expect(jest.getTimerCount()).toEqual(0)
  })

  it("keeps to the beat when the beat is divided differently part way through", async () => {
    let slotsPerBeat = 2
    const triplets: PlayerLoop = {
      slotsPerBeat: 3,
      beatsPerBar: 2,
      numBars: 1,
      notes: [undefined, undefined, [{midi: 67, slots: 1}], [{midi: 69, slots: 1}], undefined, undefined],
    }
    await startPlayer({loopAt: () => slotsPerBeat == 2 ? loop : triplets})
    // the first quaver has been scheduled, and the second is next, half a beat in
    advance(0.3)
    slotsPerBeat = 3
    advance(1.5)

    const ctx = FakeAudioContext.last
    const startedAt = (frequency: number) => ctx.started
      .filter((s) => Math.round(s.frequency) == frequency)
      .map((s) => Number((s.time - 0.1).toFixed(3)))
    // the triplet quaver two thirds of the way through the first beat, then the second
    // beat on time
    expect(startedAt(392)).toEqual([0.667])
    expect(startedAt(440)).toEqual([1])
    expect(startedAt(1320)).toEqual([1])
  })

  it("tells which time round it is scheduling, ahead of it being heard", async () => {
    const {player, positions} = await startPlayer()
    // the next time round starts at 2.1s, inside the time scheduled ahead
    advance(2.05)

    expect(player.scheduledLoop()).toEqual(1)
    expect(positions[positions.length - 1]?.loop).toEqual(0)
  })

  it("can be told what to play after it has been disposed of", async () => {
    const {player} = await startPlayer()
    player.dispose()

    player.setClickOn(false)
    player.setNotesOn(false)
  })
})
