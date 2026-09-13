// The names the music enums are conventionally written under, kept together here so
// that every table labels the same thing the same way.

import {
  Mode,
  TetradVoicing,
} from "../lib/chord_anthology"

export const voicingLabels: Record<TetradVoicing, string> = {
  [TetradVoicing.Close]: "Close",
  [TetradVoicing.Drop2]: "Drop 2",
  [TetradVoicing.Drop3]: "Drop 3",
  [TetradVoicing.Drop2And3]: "Drop 2+3",
  [TetradVoicing.Drop2And4]: "Drop 2+4",
  [TetradVoicing.Spread]: "Spread",
}

// there is one inversion per chord voice; the first is the chord in root position
export const inversionLabels = ["Root", "1st", "2nd", "3rd"]

// the modes of the major scale keep their own names; the modes of the other scales are
// named for the major scale mode they alter, and the degree they alter it at
export const modeLabels: Record<Mode, string> = {

  [Mode.Ionian]: "Ionian",
  [Mode.Dorian]: "Dorian",
  [Mode.Phrygian]: "Phrygian",
  [Mode.Lydian]: "Lydian",
  [Mode.Mixolydian]: "Mixolydian",
  [Mode.Aeolian]: "Aeolian",
  [Mode.Locrian]: "Locrian",

  [Mode.Ionian_b3]: "Ionian ♭3",
  [Mode.Dorian_b2]: "Dorian ♭2",
  [Mode.Phrygian_b1]: "Phrygian ♭1",
  [Mode.Lydian_b7]: "Lydian ♭7",
  [Mode.Mixolydian_b6]: "Mixolydian ♭6",
  [Mode.Aeolian_b5]: "Aeolian ♭5",
  [Mode.Locrian_b4]: "Locrian ♭4",

  [Mode.Ionian_sharp5]: "Ionian ♯5",
  [Mode.Dorian_sharp4]: "Dorian ♯4",
  [Mode.Phrygian_natural3]: "Phrygian ♮3",
  [Mode.Lydian_sharp2]: "Lydian ♯2",
  [Mode.Mixolydian_sharp1]: "Mixolydian ♯1",
  [Mode.Aeolian_natural7]: "Aeolian ♮7",
  [Mode.Locrian_natural6]: "Locrian ♮6",

  [Mode.Ionian_b6]: "Ionian ♭6",
  [Mode.Dorian_b5]: "Dorian ♭5",
  [Mode.Phrygian_b4]: "Phrygian ♭4",
  [Mode.Lydian_b3]: "Lydian ♭3",
  [Mode.Mixolydian_b2]: "Mixolydian ♭2",
  [Mode.Aeolian_b1]: "Aeolian ♭1",
  [Mode.Locrian_bb7]: "Locrian ♭♭7",
}
