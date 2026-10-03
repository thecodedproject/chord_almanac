# Chord Almanac

## Further work

- **Verify the compact chord tabbing.** `tabNotesForVoicingCompact` in
  `src/lib/guitar_notation.ts` was added alongside the original `tabNotesForVoicing`,
  and the whole app now uses it. The original sounds every voice of a voicing at its
  exact pitch, which on strings with a gap can strand a note far from the rest of the
  shape (the drop 2 Dm7 in 2nd inversion on strings 6 5 4 1 put its F on the 1st fret,
  with the rest of the chord at the 10th to 12th). The compact version plays each voice
  in whichever octave gives the smallest stretch, keeping only the order the voicing
  stacks its chord tones in. To do:
  - check the charts it draws look right across the chord inversions and harmonic
    tetrads pages - it also changes which string sets the harmonic tetrads page shows
    as playable;
  - check it causes no performance problems. It searches every octave of every voice,
    so it is slower: tabbing every tetrad voicing of every mode of a scale on every set
    of four strings took about 43ms, against about 2ms for the original. The harmonic
    tetrads page does a sixth of that on each render;
  - then remove whichever of the two functions is no longer wanted.
