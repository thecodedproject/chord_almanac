import {
  useEffect,
  useRef,
} from "react"

// useSpaceToggle has the space bar start and pause playback while the focus is on
// nothing in particular, or on a button or slider (which pressing it would otherwise
// press again, or do nothing to). Elsewhere the space keeps its usual job - ticking a
// checkbox, say, or typing a space.
export function useSpaceToggle(toggle: () => void) {

  // the toggle is new each render, and the listeners stay the same throughout
  const latest = useRef(toggle)
  latest.current = toggle

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
        latest.current()
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
}
