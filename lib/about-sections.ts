export interface AboutSection {
  index: string;
  label: string;
  body: string;
}

// Shared by the page (rendering) and /api/tts (synthesis) so the spoken text can never drift from what's on screen
export const ABOUT_SECTIONS: AboutSection[] = [
  {
    index: "01",
    label: "Problem",
    body: "Our digital lives are scattered across cloud drives, chat threads, note apps, email attachments and a dozen browser tabs. Every tool wants to be the home for something, so finding one file or one half-remembered idea means checking five places and still coming up empty. People lose hours every week to searching, re-uploading and re-explaining. The cost isn't only time: constant context switching breaks focus, work gets duplicated, good ideas get buried, and a quiet fatigue sets in that no single app has managed to fix.",
  },
  {
    index: "02",
    label: "Solution",
    body: "Moor Cloud brings everything into one calm place. What you save, write and share lives in a single searchable workspace that opens instantly on any device, with no folders to maintain and nothing to organise by hand. A minimal interface, fast search and quiet automation keep the software out of the way, so it feels less like another tool to manage and more like room to think. You stop hunting for things and start building on top of them.",
  },
  {
    index: "03",
    label: "Features",
    body: "Instant universal search reaches across files, notes, links and conversations, with results that appear as you type. Drop anything into Moor Cloud and it is tagged and filed automatically, so organising is never your job. Shared spaces let teams, classmates and friends collaborate in one place with simple, clear permissions. Offline access keeps your library available on a train or a plane and syncs the moment you reconnect, without conflicts or duplicates.",
  },
  {
    index: "04",
    label: "Principles",
    body: "Fast before fancy: every interaction should feel immediate, and a feature that slows the product down doesn't ship. Quiet by default: no feeds, no streaks, no badges and no notifications competing for your attention. Private by design: your data stays yours, encrypted in transit and at rest, never sold to advertisers, and always exportable in open formats so you are never locked in. Simple enough that nobody needs a tutorial to get started.",
  },
  {
    index: "05",
    label: "Platforms",
    body: "Moor Cloud is built web-first so it works on any laptop, tablet or phone with nothing to install, then extended with native desktop and mobile apps for the moments when speed and system integration matter most. Quick capture comes through share sheets and browser extensions, so saving something takes a single tap. One account and one library mean the experience is identical on every screen, and what you started on your phone is already waiting on your desktop.",
  },
  {
    index: "06",
    label: "Services",
    body: "Moor Labs designs and builds Moor Cloud end to end: product strategy, interface and interaction design, brand identity, web and mobile engineering, and motion design. Because the same small team owns every layer, the visual language, the animation and the code all grow together. The result is a product that feels like one coherent thing from the first tap, rather than a collection of screens stitched together late in the project.",
  },
  {
    index: "07",
    label: "Roadmap",
    body: "Phase one is the foundation: accounts, secure storage and fast search, released to a small group of early users for feedback. Phase two adds shared spaces, comments and collaboration tools. Phase three brings native desktop and mobile apps, an offline mode and a public API so Moor Cloud can connect to the tools people already use. Each phase ships only when it is solid, and early users help decide what comes next.",
  },
];
