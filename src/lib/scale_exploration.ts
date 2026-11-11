import {
  Interval,
  Note,
  Scale,
  intervalBetweenNotesUpwards,
  scaleNotes,
  semiTonesBetweenNotesUpwards,
  semiTonesInInterval,
} from "./chord_anthology"


function greatestCommonDivisor(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a%b]
  }
  return a
}

// shortestRepeatingIntervals returns the shortest run of intervals which, repeated,
// gives the intervals passed. e.g. four major thirds are just a major third repeated.
function shortestRepeatingIntervals(intervals: readonly Interval[]): Interval[] {

  for (let length = 1; length < intervals.length; length++) {
    if (intervals.length%length !== 0) {
      continue
    }
    if (intervals.every((interval, i) => interval === intervals[i%length])) {
      return intervals.slice(0, length)
    }
  }

  return [...intervals]
}

// A RepeatedIntervalPattern is what repeating a set of intervals comes down to, which
// is all we need to know how the scale it traces out will turn out.
interface RepeatedIntervalPattern {

  // the shortest run of intervals which, repeated, gives the intervals passed
  intervals: Interval[]

  // Each run of the intervals starts some number of semitones above the last, so the
  // starting notes of the runs are evenly spaced. This is the number of semitones
  // between neighbouring ones once we have been through them all: the greatest common
  // divisor of the semitones in a run and the 12 semitones in an octave.
  semiTonesBetweenRuns: number
}

function repeatedIntervalPattern(intervals: readonly Interval[]): RepeatedIntervalPattern {

  if (intervals.length === 0) {
    throw new RangeError("cannot build a scale from no intervals")
  }

  const pattern = shortestRepeatingIntervals(intervals)

  let semiTones = 0
  for (const i of pattern) {
    semiTones += semiTonesInInterval(i)
  }

  return {
    intervals: pattern,
    semiTonesBetweenRuns: greatestCommonDivisor(semiTones, 12),
  }
}

// numRunsOfRepeatedIntervalPattern returns how many runs of the intervals it takes to
// land back on the root. This is the order of the semitones in a run, in the group of
// integers under addition modulo 12.
function numRunsOfRepeatedIntervalPattern(p: RepeatedIntervalPattern): number {
  return 12 / p.semiTonesBetweenRuns
}

// repeatedIntervalPatternMakesScale works out whether the intervals reach a different
// note at every step, without stepping through the notes.
//
// Every run of the intervals reaches the same notes as the first run, moved up by a
// multiple of the semitones between runs. So two steps of the run land on the same note
// in some pair of runs exactly when they are a multiple of the semitones between runs
// apart - and the notes are all different when no two steps of the run are.
function repeatedIntervalPatternMakesScale(p: RepeatedIntervalPattern): boolean {

  // there are only as many places to be as there are semitones between runs
  if (p.intervals.length > p.semiTonesBetweenRuns) {
    return false
  }

  const seen: boolean[] = []
  let semiTones = 0
  for (const i of p.intervals) {
    const position = semiTones%p.semiTonesBetweenRuns
    if (seen[position]) {
      return false
    }
    seen[position] = true
    semiTones += semiTonesInInterval(i)
  }

  return true
}

// repeatedIntervalsMakeScale returns whether stacking the intervals over and over
// traces out a scale, which it does so long as it never passes through a note twice
// before the notes start repeating.
//
// This is worked out from the intervals alone, so is cheap enough to sift through a
// great many sets of intervals with.
export function repeatedIntervalsMakeScale(intervals: Interval[]): boolean {
  return repeatedIntervalPatternMakesScale(repeatedIntervalPattern(intervals))
}

// numNotesFromRepeatedIntervals returns the number of notes in the scale traced out by
// stacking the intervals over and over, or undefined where they do not make a scale.
//
// Like repeatedIntervalsMakeScale this is worked out from the intervals alone: it is
// the number of intervals in a run, times the number of runs it takes to land back on
// the root.
export function numNotesFromRepeatedIntervals(intervals: Interval[]): number | undefined {

  const pattern = repeatedIntervalPattern(intervals)

  if (!repeatedIntervalPatternMakesScale(pattern)) {
    return undefined
  }

  return pattern.intervals.length * numRunsOfRepeatedIntervalPattern(pattern)
}

// scaleFromRepeatedIntervals builds the scale traced out by stacking the intervals
// on top of the root over and over, until the notes start repeating.
//
// The notes only repeat once a whole run of the intervals lands back on the root, so
// the scale's intervals are the intervals passed repeated as many times as that takes.
// e.g. a major third lands back on the root after three steps (C, E, Ab), whilst a
// perfect fifth has to pass through all twelve notes first.
//
// Where the intervals passed are themselves a shorter run repeated, the scale is built
// from the shorter run - so it can come out shorter than the intervals passed.
//
// A scale never lists a note twice, so intervals which pass through a note more than
// once before the notes start repeating do not make a scale, and we return undefined.
//
// The scale's notes are in the order the intervals reach them, not in pitch order. To
// get them in pitch order ask for the scale to be minimised: the scale then has the
// same notes, but its intervals are the steps from each note up to the next within a
// single octave. e.g. stacking thirds through a major scale takes two octaves (C, E, G,
// B, D, F, A), whilst minimised it is the major and minor seconds of C, D, E, F, G, A, B.
export function scaleFromRepeatedIntervals(
  rootNote: Note,
  intervals: Interval[],
  minimise: boolean = false,
): Scale | undefined {

  const pattern = repeatedIntervalPattern(intervals)

  if (!repeatedIntervalPatternMakesScale(pattern)) {
    return undefined
  }

  const scaleIntervals: Interval[] = []
  for (let r = 0; r < numRunsOfRepeatedIntervalPattern(pattern); r++) {
    scaleIntervals.push(...pattern.intervals)
  }

  const scale = {
    root: rootNote,
    intervals: scaleIntervals,
  }

  return minimise ? minimiseScale(scale) : scale
}

// minimiseScale returns the scale with the same root and notes, but with the notes in
// pitch order going up from the root - so its intervals span a single octave.
function minimiseScale(s: Scale): Scale {

  const notes = scaleNotes(s).sort((a, b) => {
    return semiTonesBetweenNotesUpwards(s.root, a) - semiTonesBetweenNotesUpwards(s.root, b)
  })

  // the last interval takes us from the top note back up to the root
  const intervals = notes.map((note, i) => {
    return intervalBetweenNotesUpwards(note, notes[(i+1)%notes.length])
  })

  return {
    root: s.root,
    intervals: intervals,
  }
}

// findUniqueIntervalSets lists every set of the allowed lengths, made from the allowed
// intervals, which repeats into something different - for passing to
// scaleFromRepeatedIntervals.
//
// Two sets of intervals repeat into the same thing if one is the other started from a
// different point (repeated, a major then a minor second is no different to a minor
// then a major second), or if one is the other repeated. So of all the ways of starting
// a set of intervals we only list the one that comes first when ordered smallest
// interval first, and we do not list sets which are a shorter set repeated.
//
// These are known as Lyndon words, and rather than building every set of intervals
// and throwing away the ones we have seen before, Duval's algorithm steps straight
// from each one to the next. The sets come out ordered smallest interval first.
//
// Not every set listed makes a scale: see repeatedIntervalsMakeScale.
export function findUniqueIntervalSets(
  allowedLengths: number[],
  allowedIntervals: Interval[],
): Interval[][] {

  for (const length of allowedLengths) {
    if (!Number.isInteger(length) || length < 1) {
      throw new RangeError("cannot find sets of intervals of length:" + length)
    }
  }

  if (allowedIntervals.length === 0) {
    return []
  }

  // each allowed interval once, smallest first
  const intervals = allowedIntervals.filter((interval, i) => {
    return allowedIntervals.indexOf(interval) === i
  }).sort((a, b) => {
    return semiTonesInInterval(a) - semiTonesInInterval(b)
  })
  const largest = intervals.length - 1
  const maxLength = Math.max(0, ...allowedLengths)

  const intervalSets: Interval[][] = []

  // the set we are on, as the position of each of its intervals in intervals
  const current: number[] = [-1]
  while (current.length > 0) {

    current[current.length-1]++

    if (allowedLengths.includes(current.length)) {
      intervalSets.push(current.map((i) => intervals[i]))
    }

    // The next set starts out as this one repeated up to the longest length we want...
    const length = current.length
    while (current.length < maxLength) {
      current.push(current[current.length-length])
    }

    // ...less any intervals on the end we cannot make larger, ready to make its last
    // interval larger when we come back round.
    while (current.length > 0 && current[current.length-1] === largest) {
      current.pop()
    }
  }

  return intervalSets
}

// ScaleCriteria picks out the scales a search should return.
export interface ScaleCriteria {

  // the numbers of notes a scale may have
  numNotes: number[]
}

// A FoundScale is a scale turned up by a search, along with every way the search found
// of making it.
export interface FoundScale {

  // The scale, minimised (see scaleFromRepeatedIntervals) and started from the note
  // which puts its smallest intervals first.
  scale: Scale

  // each set of intervals which repeats into the notes of the scale, in some order
  intervalSets: Interval[][]
}

// smallestRotation returns the intervals started from whichever point puts them first
// when ordered smallest interval first.
function smallestRotation(intervals: readonly Interval[]): Interval[] {

  let smallest = [...intervals]
  for (let start = 1; start < intervals.length; start++) {
    const rotation = [...intervals.slice(start), ...intervals.slice(0, start)]

    for (let i = 0; i < rotation.length; i++) {
      const difference = semiTonesInInterval(rotation[i]) - semiTonesInInterval(smallest[i])
      if (difference < 0) {
        smallest = rotation
      }
      if (difference !== 0) {
        break
      }
    }
  }

  return smallest
}

// findScalesFromRepeatedIntervals searches every set of the allowed lengths, made from
// the allowed intervals, for those which repeat into a scale meeting the criteria.
//
// Many sets of intervals repeat into the same notes in a different order, so the sets
// are grouped by the scale they make once minimised, and each scale is returned once.
//
// Each set of intervals is only tried from one starting point (see
// findUniqueIntervalSets), and which note of a scale that leaves it starting from is
// neither here nor there. So scales which are one another started from a different
// note - the modes of a scale - are grouped together too, and returned started from the
// note which puts their smallest intervals first.
export function findScalesFromRepeatedIntervals(
  rootNote: Note,
  allowedLengths: number[],
  allowedIntervals: Interval[],
  criteria: ScaleCriteria,
): FoundScale[] {

  const foundScales: FoundScale[] = []
  const foundScalesByIntervals: {[intervals: string]: FoundScale} = {}

  for (const intervals of findUniqueIntervalSets(allowedLengths, allowedIntervals)) {

    // we can count the notes without building the scale, so only build the ones we want
    const numNotes = numNotesFromRepeatedIntervals(intervals)
    if (numNotes === undefined || !criteria.numNotes.includes(numNotes)) {
      continue
    }

    const scale = scaleFromRepeatedIntervals(rootNote, intervals, true)
    if (scale === undefined) {
      throw new Error("could not build a scale from intervals which make one:" + intervals)
    }

    const scaleIntervals = smallestRotation(scale.intervals)
    const key = scaleIntervals.join(",")

    if (foundScalesByIntervals[key] === undefined) {
      foundScalesByIntervals[key] = {
        scale: {
          root: rootNote,
          intervals: scaleIntervals,
        },
        intervalSets: [],
      }
      foundScales.push(foundScalesByIntervals[key])
    }
    foundScalesByIntervals[key].intervalSets.push(intervals)
  }

  return foundScales
}
