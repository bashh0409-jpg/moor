"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import gsap from "gsap";

interface MenuItem {
  label: string;
  href: string;
}

interface AboutSection {
  index: string;
  label: string;
  body: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Speedrun", href: "#" },
];

const INTRO =
  "Space is one calm place for everything you save, write and share, a searchable workspace that gets out of the way so you can think.";

// Copy lives in data so you can swap it once the real product positioning is settled
const ABOUT_SECTIONS: AboutSection[] = [
  {
    index: "01",
    label: "Problem",
    body: "Our digital lives are scattered across drives, chat threads, notes and browser tabs. Every tool wants its own home, so finding a single file or idea means searching five places. The result is constant context switching, lost work, and a quiet fatigue that no single app has fixed.",
  },
  {
    index: "02",
    label: "Solution",
    body: "Space brings everything into one calm place. What you save, write and share lives in a single searchable workspace that opens instantly on any device. A minimal interface, fast search and quiet automation keep it out of the way, so it feels less like software and more like room to think.",
  },
  {
    index: "03",
    label: "Features",
    body: "Instant universal search across files, notes and links. Drop anything in and it's organised for you. Shared spaces for teams and friends, with simple permissions. Offline access that syncs the moment you reconnect.",
  },
  {
    index: "04",
    label: "Principles",
    body: "Fast before fancy: every interaction should feel immediate. Quiet by default: no feeds, no badges, no noise. Your data stays yours, encrypted in transit and at rest, and exportable at any time.",
  },
  {
    index: "05",
    label: "Platforms",
    body: "Built web-first so it works anywhere, with native desktop and mobile apps to follow. One account, one library, the same experience on every screen.",
  },
  {
    index: "06",
    label: "Services",
    body: "Product design, brand identity, web and mobile development, and motion design, built together so Space feels like one coherent product from the first tap.",
  },
  {
    index: "07",
    label: "Roadmap",
    body: "Foundations first: accounts, storage and search. Then shared spaces and collaboration, followed by native apps and an API so Space can plug into the tools you already use.",
  },
];

interface CollapsiblePanel {
  rootRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
}

// Shared by both navs: expands `panelRef` on `open`, staggers its items, closes on Escape.
// Optional `hideRef` is the inverse: it collapses while the panel expands and returns on close.
const useCollapsiblePanel = (
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  itemSelector: string,
  hideRef?: RefObject<HTMLDivElement | null>,
): CollapsiblePanel => {
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;

    const items = root.querySelectorAll<HTMLElement>(itemSelector);
    const hidden = hideRef?.current ?? null;

    const panelTween = gsap.to(panel, {
      height: open ? panel.scrollHeight : 0,
      duration: 0.4,
      ease: "power3.inOut",
      overwrite: "auto",
      // Release the pixel height after opening so the panel can reflow on resize
      onComplete: () => {
        if (open) gsap.set(panel, { height: "auto" });
      },
    });

    // GSAP can tween to "auto" by measuring, so the intro returns at its natural height
    const hideTween = hidden
      ? gsap.to(hidden, {
          height: open ? 0 : "auto",
          autoAlpha: open ? 0 : 1,
          duration: 0.4,
          ease: "power3.inOut",
          overwrite: "auto",
        })
      : null;

    if (open) {
      gsap.fromTo(
        items,
        { y: -6, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.25,
          stagger: 0.05,
          delay: 0.1,
          ease: "power2.out",
          overwrite: "auto",
        },
      );
    }

    return () => {
      panelTween.kill();
      hideTween?.kill();
      gsap.killTweensOf(items);
    };
  }, [open, itemSelector, hideRef]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  return { rootRef, panelRef };
};

const Page = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const introRef = useRef<HTMLDivElement>(null);

  const { rootRef: navRef, panelRef: menuPanelRef } = useCollapsiblePanel(
    menuOpen,
    setMenuOpen,
    ".menu-item",
  );
  const { rootRef: aboutRef, panelRef: aboutPanelRef } = useCollapsiblePanel(
    aboutOpen,
    setAboutOpen,
    ".about-item",
    introRef,
  );

  return (
    <main>
      <nav
        ref={navRef}
        className="absolute left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl bg-black/30 text-white shadow-lg backdrop-blur-md"
      >
        {/* Navbar header */}
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <img
            src="komma.avif"
            alt="Komma"
            className="h-auto w-30 object-contain"
          />

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#work"
              className="rounded-full bg-[#00e] px-4 py-2 font-mono text-xs text-white"
            >
              [ Work ]
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="cursor-pointer rounded-full bg-black/50 p-2 px-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
                className={`h-4 w-4 transition-transform duration-200 ${
                  menuOpen ? "rotate-45" : "hover:rotate-90"
                }`}
              >
                <path d="M450-450H220v-60h230v-230h60v230h230v60H510v230h-60v-230Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Animated menu panel; h-0 avoids a flash of open content before GSAP runs */}
        <div
          ref={menuPanelRef}
          id="nav-menu"
          aria-hidden={!menuOpen}
          className="h-0 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 pt-4">
            <a
              href="#work"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="menu-item rounded-full bg-black/50 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
            >
              [ Work ]
            </a>

            <a
              href="#contact"
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="menu-item rounded-full bg-black/50 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
            >
              [ Contact ]
            </a>
          </div>

          <ul className="flex flex-wrap items-center gap-x-1 px-3 pt-2">
            {MENU_ITEMS.map((item) => (
              <li key={item.label} className="menu-item">
                <a
                  href={item.href}
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full px-2 py-2 font-mono text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  [ {item.label} ]
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-1 px-4 pb-4 pt-3 font-mono text-[10px] text-white">
            <span>Ovyon Labs® — 2026</span>
            <span>ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <section className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black/20 py-2">
        <img src="komma.avif" alt="" className="h-auto w-50 object-contain" />
      </section>

      {/* Bottom nav: pinned to bottom-4, so opening grows it upward */}
      <aside
        ref={aboutRef}
        className="absolute bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-3xl bg-black/30 text-white shadow-lg backdrop-blur-md"
      >
        <div className="flex w-full items-center justify-between rounded-full p-2 px-4 font-mono">
          <img src="komma.avif" alt="" className="h-auto w-25 object-contain" />
          <button
            type="button"
            onClick={() => setAboutOpen((prev) => !prev)}
            aria-expanded={aboutOpen}
            aria-controls="about-panel"
            className="cursor-pointer rounded-full bg-black/50 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            [ About ]
          </button>
        </div>

        {/* max-h caps the dark container; content scrolls inside instead of pushing the nav off-screen */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain rounded-2xl bg-black/50 p-2 px-4 [scrollbar-width:thin]">
          {/* Intro: visible while collapsed, animates away when About opens */}
          <div
            ref={introRef}
            aria-hidden={aboutOpen}
            className="overflow-hidden"
          >
            <p className="mb-2 text-xs leading-3 tracking-tight text-white">
              {INTRO}
            </p>
          </div>

          <div
            ref={aboutPanelRef}
            id="about-panel"
            aria-hidden={!aboutOpen}
            className="h-0 overflow-hidden"
          >
            <div className="mb-2 flex flex-col gap-4 py-2">
              {ABOUT_SECTIONS.map((section) => (
                <div
                  key={section.index}
                  className="about-item grid grid-cols-1 gap-2 text-xs tracking-tight md:grid-cols-4 md:gap-4"
                >
                  <p className="font-mono uppercase">
                    {section.index} [ {section.label} ]
                  </p>
                  <p className="text-xs leading-4 tracking-tight text-white md:col-span-3">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-2 pb-2">
            <button
              type="button"
              className="rounded-full bg-white/10 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/20"
            >
              0%
            </button>
            <button
              type="button"
              className="rounded-full bg-[#00e] px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-[#00e]/80"
            >
              [ Explore More ]
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Page;

/*
  Design note
  - Only content changed: INTRO now describes Space, and ABOUT_SECTIONS grew from 3 to 7 topics
    (Features, Principles, Platforms, Roadmap added; Services moved to 06). Layout and animation
    logic are untouched.
  - With 7 sections the content will exceed max-h-[60vh] on most screens, so the dark container
    scrolls internally while the nav keeps its capped height.
  - The about-item stagger is 0.05s per section, so the full cascade takes about 0.6s with the delay;
    drop the stagger value if it feels slow with this many rows.
*/
