import {
  Note,
  semiTonesBetweenNotesUpwards,
} from './chord_anthology'

export interface TabNote {
  string: number
  fret: number
}

export enum TabNotesDirection {
  Ascending = "ascending",
  Descending = "descending",
}

export function tabNotesNPerString(
  notes: Note[],
  notesPerString: number = 3,
  startingString: number = 6,
): TabNote[] {

  // standard guitar tuning
  const tuning: Note[] = [
    Note.E,
    Note.A,
    Note.D,
    Note.G,
    Note.B,
    Note.E,
  ]

  let currentString = startingString
  let currentStringPreviousFret = 0
  let iCurrentStringNote = 0

  var retVal = notes.map((n, i) => {

    if (currentString == 1 && iCurrentStringNote > 0) {
      iCurrentStringNote++
    } else {
      iCurrentStringNote = i%notesPerString

      if (i>0 && iCurrentStringNote==0) {
        currentString--
        currentStringPreviousFret = 0
      }
    }

    const currentStringOpenNote = tuning[tuning.length - currentString]

    let fret = semiTonesBetweenNotesUpwards(currentStringOpenNote, n)

    if (iCurrentStringNote > 0 && fret <= currentStringPreviousFret) {
      if (fret == 0 && currentStringPreviousFret >= 12) {
        fret += 24
      } else if (currentStringPreviousFret == 24) {
        throw new RangeError("cannot tab next note (" + n + ") as it would be off the fret board (at fret " + (fret + 24) + ")")
      } else {
        fret += 12
      }
    }

    //console.log("*** calced next fret", i, n, currentStringPreviousFret, currentString, fret)

    currentStringPreviousFret = fret

    return {
      string: currentString,
      fret: fret,
    }
  })

  //console.log("*** returned val:", retVal)

  return retVal
}
