import {
  Interval,
  Note,
  scaleNotes,
  shiftNote,
} from "./chord_anthology"

import {
  findScalesFromRepeatedIntervals,
  findUniqueIntervalSets,
  numNotesFromRepeatedIntervals,
  repeatedIntervalsMakeScale,
  scaleFromRepeatedIntervals,
} from "./scale_exploration"

describe("scaleFromRepeatedIntervals", () => {

  // Scratch test for trying out the interface: change the root and intervals, then run
  //   yarn test -t scaleFromRepeatedIntervals
  it.each([
    [Interval.MinorSecond],
    [Interval.MajorSecond],
    [Interval.MinorThird],
    [Interval.MajorThird],
    [Interval.Fourth],
    [Interval.DiminishedFifth],
    [Interval.PerfectFifth],
    [Interval.AugmentedFifth],
    [Interval.Sixth],
    [Interval.MinorSeven],
    [Interval.MajorSeven],

    [Interval.Fourth, Interval.MinorThird],

    // a major scale, stacked in thirds over two octaves
    [
      Interval.MajorThird,
      Interval.MinorThird,
      Interval.MajorThird,
      Interval.MinorThird,
      Interval.MinorThird,
      Interval.MajorThird,
      Interval.MinorThird,
    ],

    // not a scale: passes through C, D and E twice (amongst others)
    [Interval.PerfectFifth, Interval.Fourth, Interval.MajorSecond],
  ])("logs the notes of the scale", (...intervals: Interval[]) => {
    const root = Note.C
    const minimise = true

    const scale = scaleFromRepeatedIntervals(root, intervals, minimise)

    if (scale === undefined) {
      console.log(
        "root: " + root + "\n" +
        "intervals: " + intervals.join(", ") + "\n" +
        "not a scale: the intervals land on a note more than once",
      )
      return
    }

    const notes = scaleNotes(scale)

    console.log(
      "root: " + root + "\n" +
      "intervals: " + intervals.join(", ") + "\n" +
      "scale intervals (" + scale.intervals.length + "): " + scale.intervals.join(", ") + "\n" +
      "notes (" + notes.length + "): " + notes.join(", "),
    )
  })
})

describe("repeatedIntervalsMakeScale and numNotesFromRepeatedIntervals", () => {

  // stepsUntilNotesRepeat walks through the notes the long way, to check the sums
  // against: it returns how many steps the intervals take before the notes start
  // repeating, or undefined if they pass through a note twice on the way.
  function stepsUntilNotesRepeat(intervals: Interval[]): number | undefined {
    const seen = new Set<Note>()
    let note = Note.C
    let steps = 0
    do {
      if (seen.has(note)) {
        return undefined
      }
      seen.add(note)
      note = shiftNote(note, intervals[steps%intervals.length])
      steps++
    } while (!(note === Note.C && intervalsRepeatFrom(steps)))
    return steps

    // the notes only repeat from a step if the intervals to come do too
    function intervalsRepeatFrom(step: number): boolean {
      return intervals.every((interval, i) => interval === intervals[(step+i)%intervals.length])
    }
  }

  it("agrees with walking through the notes, for every set of up to four intervals", () => {
    const allIntervals = Object.values(Interval)

    let intervalSets: Interval[][] = [[]]
    for (let length = 1; length <= 4; length++) {
      intervalSets = intervalSets.flatMap((s) => allIntervals.map((i) => [...s, i]))

      for (const intervals of intervalSets) {
        const steps = stepsUntilNotesRepeat(intervals)

        expect([intervals, numNotesFromRepeatedIntervals(intervals)]).toEqual([intervals, steps])
        expect([intervals, repeatedIntervalsMakeScale(intervals)]).toEqual([intervals, steps !== undefined])
      }
    }
  })

  it("counts all twelve notes for a perfect fifth", () => {
    expect(repeatedIntervalsMakeScale([Interval.PerfectFifth])).toBe(true)
    expect(numNotesFromRepeatedIntervals([Interval.PerfectFifth])).toEqual(12)
  })

  it("counts three notes for a major third, however many times it is passed", () => {
    expect(numNotesFromRepeatedIntervals([Interval.MajorThird])).toEqual(3)
    expect(numNotesFromRepeatedIntervals([
      Interval.MajorThird,
      Interval.MajorThird,
      Interval.MajorThird,
      Interval.MajorThird,
    ])).toEqual(3)
  })

  it("counts eight notes for a major second then a minor second", () => {
    expect(numNotesFromRepeatedIntervals([Interval.MajorSecond, Interval.MinorSecond])).toEqual(8)
  })

  it("rejects intervals which pass through a note twice", () => {
    const intervals = [Interval.PerfectFifth, Interval.Fourth, Interval.MajorSecond]

    expect(repeatedIntervalsMakeScale(intervals)).toBe(false)
    expect(numNotesFromRepeatedIntervals(intervals)).toBeUndefined()
    expect(scaleFromRepeatedIntervals(Note.C, intervals)).toBeUndefined()
  })

  it("throws when passed no intervals", () => {
    expect(() => repeatedIntervalsMakeScale([])).toThrow(RangeError)
    expect(() => numNotesFromRepeatedIntervals([])).toThrow(RangeError)
  })
})

describe("findUniqueIntervalSets", () => {

  const allIntervals = Object.values(Interval)

  // rotations returns the intervals started from each point in turn
  function rotations(intervals: Interval[]): Interval[][] {
    return intervals.map((_, i) => [...intervals.slice(i), ...intervals.slice(0, i)])
  }

  it("lists each interval on its own for a length of one", () => {
    expect(findUniqueIntervalSets([1], allIntervals)).toEqual(allIntervals.map((i) => [i]))
  })

  it("lists the same sets as building every set and throwing away the repeats", () => {

    // every set we have listed, along with every other way of starting it
    const seen = new Set<string>()
    const expected: Interval[][] = []

    let intervalSets: Interval[][] = [[]]
    for (let length = 1; length <= 4; length++) {
      intervalSets = intervalSets.flatMap((s) => allIntervals.map((i) => [...s, i]))

      for (const intervals of intervalSets) {
        const starts = rotations(intervals).map((r) => r.join(","))

        // a set which is a shorter set repeated is the same started from another point
        const isShorterSetRepeated = new Set(starts).size < starts.length

        if (isShorterSetRepeated || seen.has(starts[0])) {
          continue
        }
        starts.forEach((s) => seen.add(s))
        expected.push(intervals)
      }
    }

    const found = findUniqueIntervalSets([1, 2, 3, 4], allIntervals)

    expect(found.map((s) => s.join(",")).sort()).toEqual(expected.map((s) => s.join(",")).sort())
    expect(found.length).toEqual(12 + 66 + 572 + 5148)
  })

  it("lists only sets of the allowed lengths", () => {
    const found = findUniqueIntervalSets([2, 4], allIntervals)

    expect(found.length).toEqual(66 + 5148)
    expect(found.every((s) => s.length === 2 || s.length === 4)).toBe(true)
  })

  it("starts each set from its smallest interval", () => {
    const found = findUniqueIntervalSets([2], allIntervals).map((s) => s.join(","))

    expect(found).toContain("MinorSecond,MajorSecond")
    expect(found).not.toContain("MajorSecond,MinorSecond")
  })

  it("makes sets from only the allowed intervals", () => {
    const allButUnison = allIntervals.filter((i) => i !== Interval.Unison)

    const found = findUniqueIntervalSets([1, 2, 3], allButUnison)

    expect(found.length).toEqual(11 + 55 + 440)
    expect(found.some((s) => s.includes(Interval.Unison))).toBe(false)
  })

  it("lists the same sets whatever order the allowed intervals are passed in, or if passed twice", () => {
    const thirds = [Interval.MinorThird, Interval.MajorThird]

    expect(
      findUniqueIntervalSets([1, 2], [Interval.MajorThird, Interval.MinorThird, Interval.MajorThird]),
    ).toEqual(
      findUniqueIntervalSets([1, 2], thirds),
    )
    expect(findUniqueIntervalSets([1, 2], thirds)).toEqual([
      [Interval.MinorThird],
      [Interval.MinorThird, Interval.MajorThird],
      [Interval.MajorThird],
    ])
  })

  it("lists no sets when no intervals are allowed", () => {
    expect(findUniqueIntervalSets([1, 2], [])).toEqual([])
  })

  it("lists no sets when no lengths are allowed", () => {
    expect(findUniqueIntervalSets([], allIntervals)).toEqual([])
  })

  it("throws for a length which is not a whole number of at least one", () => {
    expect(() => findUniqueIntervalSets([0], allIntervals)).toThrow(RangeError)
    expect(() => findUniqueIntervalSets([1.5], allIntervals)).toThrow(RangeError)
  })
})

describe("findScalesFromRepeatedIntervals", () => {

  // Scratch test for trying out the search: change the lengths and criteria, then run
  //   yarn test -t findScalesFromRepeatedIntervals
  it("logs the number of scales found", () => {
    const root = Note.B
    const allowedLengths = [8]
    const allowedIntervals = Object.values(Interval).filter((i) => i !== Interval.Unison)
    const criteria = {
      numNotes: [8],
    }

    const foundScales = findScalesFromRepeatedIntervals(root, allowedLengths, allowedIntervals, criteria)

    let numIntervalSets = 0
    for (const found of foundScales) {
      numIntervalSets += found.intervalSets.length
    }

    console.log(
      "lengths of interval sets: " + allowedLengths.join(", ") + "\n" +
      "numbers of notes: " + criteria.numNotes.join(", ") + "\n" +
      "scales found: " + foundScales.length + "\n" +
      "sets of intervals making them: " + numIntervalSets + "\n\n" +
      foundScales.map((found) => {
        return scaleNotes(found.scale).join(" ") + "  (" + found.intervalSets.length + " sets of intervals)"
      }).join("\n"),
    )
  })
})
