import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./site_nav.css";

interface NavPage {
  path: string;
  label: string;
}

interface NavSection {
  id: string;
  title: string;
  pages: NavPage[];
  // leaves the section out of the sidebar, for an area not ready to show yet. Its pages
  // can still be reached by their address
  hidden?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "fingerCharts",
    title: "Guitar Finger Charts",
    pages: [
      {path: "/", label: "Guitar Scale"},
      {path: "/chord-inversions", label: "Chord Inversions"},
      {path: "/melodic-tetrads", label: "Melodic Tetrads"},
      {path: "/harmonic-tetrads", label: "Harmonic Tetrads"},
    ],
  },
  {
    id: "almanacs",
    title: "Mick Goodrick's Chord Almanacs",
    hidden: true, // not ready yet
    pages: [
      {path: "/chord-cycle", label: "Chord Cycle"},
    ],
  },
  {
    id: "practice",
    title: "Practice Routines",
    pages: [
      {path: "/scale-patterns", label: "Scale Patterns"},
      {path: "/lead-sheets", label: "Lead Sheet Player"},
    ],
  },
];

const OPEN_KEY = "chordAlmanac.sidebarOpen";

function storedOpen(): boolean | null {
  try {
    const stored = window.localStorage.getItem(OPEN_KEY);
    if (stored !== null) {
      return stored === "true";
    }
  } catch {
    // fall through to the default
  }
  return null;
}

// the sidebar is open as it was left on the last visit, or on a first visit, open only
// if the window is wide enough for it to sit beside the page without covering much
function initiallyOpen(): boolean {
  return storedOpen() ?? window.innerWidth >= 1500;
}

// on a first visit to a window too narrow for the sidebar to start open, it slides out
// and back again a moment after the page loads, so there is no missing that it's there
const PEEK_DELAY_MS = 600;
const PEEK_HOLD_MS = 1500;

function sectionOf(pathname: string): string | undefined {
  return NAV_SECTIONS.find(s => s.pages.some(p => p.path === pathname))?.id;
}

// the sidebar listing each area of the site. It runs the height of the window over the
// left of the page, and slides away behind the arrow on its edge. An area's pages show
// only once its heading has been clicked, except that the area of the page being looked
// at always starts open
export function SiteNav(): JSX.Element {
  const {pathname} = useLocation();
  const [shown, setShown] = useState(initiallyOpen);
  // read once, before the effect below stores the first visit's state
  const [peek, setPeek] = useState(() => storedOpen() === null && !initiallyOpen());

  useEffect(() => {
    if (!peek) {
      return;
    }
    const timers = [
      window.setTimeout(() => setShown(true), PEEK_DELAY_MS),
      window.setTimeout(() => {
        setShown(false);
        setPeek(false);
      }, PEEK_DELAY_MS + PEEK_HOLD_MS),
    ];
    return () => timers.forEach(t => window.clearTimeout(t));
  }, [peek]);

  useEffect(() => {
    try {
      window.localStorage.setItem(OPEN_KEY, String(shown));
    } catch {
      // it just won't be remembered
    }
  }, [shown]);

  const [open, setOpen] = useState<Set<string>>(() => new Set([sectionOf(pathname) ?? ""]));

  // arriving at a page some other way than the sidebar - a link, the back button - opens
  // its area so the page can be seen in the list
  useEffect(() => {
    const current = sectionOf(pathname);
    if (current) {
      setOpen(prev => prev.has(current) ? prev : new Set(prev).add(current));
    }
  }, [pathname]);

  const toggle = (id: string) => setOpen(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });

  return (
    <nav className={shown ? "siteNav shown" : "siteNav"} aria-label="Site">
      <button
        type="button"
        className="siteNavToggle"
        aria-expanded={shown}
        aria-controls="siteNavContents"
        aria-label={shown ? "Hide contents" : "Show contents"}
        title={shown ? "Hide contents" : "Show contents"}
        onClick={() => {
          // taking hold of it calls off the peek, leaving it where it was put
          setPeek(false);
          setShown(s => !s);
        }}
      >
        {shown ? "\u25C4" : "\u25BA"}
      </button>
      <div className="siteNavContents" id="siteNavContents">
        <div className="siteNavTitle">Contents</div>
        {NAV_SECTIONS.filter(section => !section.hidden).map(section => {
          const isOpen = open.has(section.id);
          const listId = "siteNav-" + section.id;
          return (
            <div className="navSection" key={section.id}>
              <button
                type="button"
                className="navSectionHeading"
                aria-expanded={isOpen}
                aria-controls={listId}
                onClick={() => toggle(section.id)}
              >
                <span className="navMarker" aria-hidden="true">[{isOpen ? "-" : "+"}]</span>
                <span>{section.title}</span>
              </button>
              <ul id={listId} hidden={!isOpen}>
                {section.pages.map(page =>
                  <li key={page.path}>
                    <NavLink to={page.path} end>{page.label}</NavLink>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
