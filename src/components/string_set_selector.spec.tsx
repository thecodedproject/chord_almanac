import {
  allStringSets,
} from './string_set_selector'

describe("allStringSets", () => {
  it("lists every set of four of the six strings, from the lowest strings up", () => {
    const sets = allStringSets()

    expect(sets).toHaveLength(15)
    expect(sets[0]).toEqual([6,5,4,3])
    expect(sets[1]).toEqual([6,5,4,2])
    expect(sets[sets.length-1]).toEqual([4,3,2,1])
  })
})
