"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import gsap from "gsap";
import Image from "next/image";

interface MenuItem {
  label: string;
  href: string;
}

interface AboutSection {
  index: string;
  label: string;
  body: string;
}

interface GalleryItem {
  id: string;
  src: string;
}

interface GalleryRow {
  id: string;
  direction: "left" | "right";
  // Horizontal px travelled per vertical px scrolled; varying it per row gives a parallax feel
  speed: number;
  items: GalleryItem[];
}

const GALLERY_IMAGES = [
  "/gallery/1-01.webp",
  "/gallery/cosmos_1046876467.webp",
  "/gallery/cosmos_114748657.webp",
  "/gallery/cosmos_1314984379.webp",
  "/gallery/cosmos_1315113271.gif",
  "/gallery/cosmos_1462818484.webp",
  "/gallery/cosmos_1501491551.webp",
  "/gallery/cosmos_1854803108.webp",
  "/gallery/cosmos_1888286139.webp",
  "/gallery/cosmos_1608306540.webp",
  "/gallery/cosmos_1688312940.webp",
  "/gallery/cosmos_1800600229.webp",
  "/gallery/cosmos_1896706248.webp",
  "/gallery/cosmos_1926019146.webp",
  "/gallery/cosmos_2012909807.webp",
  "/gallery/cosmos_2036487314.webp",
  "/gallery/cosmos_227009253.webp",
  "/gallery/cosmos_398388872.webp",
  "/gallery/cosmos_413762843.webp",
  "/gallery/cosmos_486115365.webp",
  "/gallery/cosmos_572350572.webp",
  "/gallery/cosmos_653052878.webp",
  "/gallery/cosmos_684854038.webp",
];

// The page is rendered this many times and scroll position is wrapped back into the middle copy
const COPIES = 3;

const MENU_ITEMS: MenuItem[] = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Speedrun", href: "#" },
];

const makeRow = (
  rowNumber: number,
  direction: GalleryRow["direction"],
  speed: number,
  count: number,
): GalleryRow => ({
  id: `row-${rowNumber}`,
  direction,
  speed,
  items: Array.from({ length: count }, (_, i) => ({
    id: `${rowNumber}-${String(i + 1).padStart(2, "0")}`,
    src: GALLERY_IMAGES[((rowNumber - 1) * count + i) % GALLERY_IMAGES.length],
  })),
});

// Five rows so one cycle is taller than any viewport, which the wrap logic relies on
const ROWS: GalleryRow[] = [
  makeRow(1, "left", 0.5, 6),
  makeRow(2, "right", 0.8, 6),
  makeRow(3, "left", 0.65, 6),
  makeRow(4, "right", 0.9, 6),
  makeRow(5, "left", 0.55, 6),
];

const INTRO =
  "Moor Cloud is one calm place for everything you save, write and share, a searchable workspace that gets out of the way so you can think.";

// Copy lives in data so you can swap it once the real product positioning is settled
const ABOUT_SECTIONS: AboutSection[] = [
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

interface TrackState {
  el: HTMLElement;
  setX: (value: number) => void;
  goesLeft: boolean;
  speed: number;
  // Width of one full set of tiles; the track holds two identical sets
  setWidth: number;
}

const mod = (n: number, m: number): number => ((n % m) + m) % m;

const Page = () => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const introRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Endless scroll: vertical position wraps, horizontal row offset follows an unbounded counter
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const tracks: TrackState[] = Array.from(
      content.querySelectorAll<HTMLElement>(".gallery-track"),
    ).map((el) => ({
      el,
      setX: gsap.quickSetter(el, "x", "px") as (value: number) => void,
      goesLeft: el.dataset.direction === "left",
      speed: Number(el.dataset.speed),
      setWidth: 0,
    }));

    let cycle = 0; // height of one copy of the page
    const measure = (): void => {
      cycle = content.getBoundingClientRect().height / COPIES;
      tracks.forEach((track) => {
        track.setWidth = track.el.scrollWidth / 2;
      });
    };

    // Maps any scroll position into the middle copy [cycle, 2 * cycle)
    const normalize = (y: number): number => cycle + mod(y - cycle, cycle);

    measure();
    let lastY = normalize(window.scrollY);
    window.scrollTo({ top: lastY, left: 0, behavior: "instant" });

    // `target` counts every pixel the user has scrolled, never reset, so row motion survives the wrap
    let target = 0;
    let current = 0;
    let applied = Number.NaN;

    const onScroll = (): void => {
      const y = window.scrollY;
      target += y - lastY;
      lastY = y;

      // The copies are identical, so reposition instantly. `instant` prevents global
      // scroll-behavior: smooth from animating the wrap and creating a visible bounce.
      if (y >= cycle * 2 || y < cycle) {
        const wrapped = normalize(y);
        window.scrollTo({ top: wrapped, left: 0, behavior: "instant" });
        lastY = wrapped;
      }
    };

    const tick = (): void => {
      current += (target - current) * 0.12; // lerp for a gliding feel
      if (Math.abs(target - current) < 0.05) current = target;
      if (current === applied) return;
      applied = current;

      if (!reduceMotion) {
        tracks.forEach((track) => {
          const shift = mod(current * track.speed, track.setWidth);
          // Both directions stay inside [-setWidth, 0], so the duplicate set always fills the gap
          track.setX(track.goesLeft ? -shift : shift - track.setWidth);
        });
      }

    };

    // Only width changes alter the cycle (tiles are sized in vw), so mobile toolbar resizes don't fire this
    const resizeObserver = new ResizeObserver(() => {
      const previousCycle = cycle;
      measure();
      if (previousCycle > 0 && cycle !== previousCycle) {
        const fraction =
          mod(window.scrollY - previousCycle, previousCycle) / previousCycle;
        const y = cycle + fraction * cycle;
        window.scrollTo({ top: y, left: 0, behavior: "instant" });
        lastY = y;
      }
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    gsap.ticker.add(tick);
    resizeObserver.observe(content);

    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
    };
  }, []);

  // One restrained entrance and lightweight hover feedback make the page feel intentional
  // without adding scroll-triggered work to every gallery tile.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = gsap.context(() => {
      const tracks = gsap.utils.toArray<HTMLElement>(".gallery-track");
      const figures = gsap.utils.toArray<HTMLElement>("figure");

      if (!reduceMotion) {
        gsap.fromTo(
          tracks,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "opacity,visibility",
            delay: 0.08,
          },
        );
      }

      figures.forEach((figure) => {
        const image = figure.querySelector<HTMLElement>(".gallery-image");
        if (!image || reduceMotion) return;

        const enter = () =>
          gsap.to(image, {
            scale: 1.045,
            duration: 0.65,
            ease: "power2.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(image, {
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            overwrite: "auto",
          });

        figure.addEventListener("pointerenter", enter);
        figure.addEventListener("pointerleave", leave);
        // Store cleanup directly on the node so listeners never accumulate.
        (
          figure as HTMLElement & { __galleryCleanup?: () => void }
        ).__galleryCleanup = () => {
          figure.removeEventListener("pointerenter", enter);
          figure.removeEventListener("pointerleave", leave);
        };
      });
    }, root);

    return () => {
      root.querySelectorAll<HTMLElement>("figure").forEach((figure) => {
        (
          figure as HTMLElement & { __galleryCleanup?: () => void }
        ).__galleryCleanup?.();
      });
      ctx.revert();
    };
  }, []);

  return (
    <main className="bg-neutral-950">
      <nav
        ref={navRef}
        className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl bg-black/30 text-white shadow-lg backdrop-blur-md"
      >
        {/* Navbar header */}
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <img
            src="komma.avif"
            alt="Komma"
            className="h-auto w-30 object-contain"
          />

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="rounded-full bg-[#00e] px-4 py-2 font-mono text-xs text-white"
            >
              [ Connect ]
            </button>

            <button
              type="button"
              onClick={() => {
                const nextOpen = !menuOpen;
                setMenuOpen(nextOpen);
                if (nextOpen) setAboutOpen(false);
              }}
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
                  className="block rounded-full px-2 py-2 font-mono text-xs text-white/60 transition-colors hover:text-white"
                >
                  [ {item.label} ]
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col uppercase gap-1 px-4 pb-4 pt-3 font-mono text-[10px] text-white">
            <span>Moor Cloud™ — 2026</span>
            <span>ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </nav>

      {/* Logo pinned to the middle of the screen; pointer-events-none so it never blocks scrolling or taps */}
      <div className="pointer-events-none w-full h-full bg-black/40  fixed inset-0 z-40 flex items-center justify-center">
        <div className="absolute h-40 w-64 rounded-full " />
        <img
          src="komma.avif"
          alt="Komma"
          className="relative mix-blend-difference h-auto w-50 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Endless rows: COPIES identical stacks, so wrapping the scroll position by one cycle is invisible */}
      <div ref={contentRef} id="work">
        {Array.from({ length: COPIES }, (_, copy) => (
          <div key={copy} aria-hidden={copy > 0}>
            {ROWS.map((row) => (
              // pb-1 (not flex gap) so every copy has exactly the same height
              <div key={`${copy}-${row.id}`} className="overflow-hidden pb-1">
                <div
                  data-direction={row.direction}
                  data-speed={row.speed}
                  className="gallery-track flex w-max will-change-transform"
                >
                  {/* Two identical sets so the track can loop horizontally without a seam */}
                  {[0, 1].flatMap((dup) =>
                    row.items.map((item) => (
                      <figure
                        key={`${item.id}-${dup}`}
                        // mr-1 (not flex gap) so one set's width is exactly n * (tile + 4px)
                        className="relative mr-1 aspect-4/5 w-[60vw] shrink-0 overflow-hidden bg-neutral-900 [contain:paint] sm:w-[38vw] lg:w-[24vw]"
                      >
                        <Image
                          src={item.src}
                          alt=""
                          aria-hidden="true"
                          fill
                          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 38vw, 60vw"
                          loading="lazy"
                          unoptimized={item.src.endsWith(".gif")}
                          className="gallery-image object-cover will-change-transform"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#00e]/50 via-neutral-900/20 to-black/30"
                        />
                        <figcaption className="absolute bottom-3 left-3 font-mono text-[10px] text-white/70">
                          [ {item.id} ]
                        </figcaption>
                      </figure>
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom nav: pinned to bottom-4, so opening grows it upward */}
      <aside
        ref={aboutRef}
        className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-[2rem] bg-black/30 text-white shadow-lg backdrop-blur-md"
      >
        <div className="flex w-full items-center justify-between rounded-full p-4 py-4 px-6 font-mono">
          <img src="komma.avif" alt="" className="h-auto w-25 object-contain" />
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextOpen = !aboutOpen;
                setAboutOpen(nextOpen);
                if (nextOpen) setMenuOpen(false);
              }}
              aria-expanded={aboutOpen}
              aria-controls="about-panel"
              className="cursor-pointer rounded-full min-w-40 bg-black/50 hover:bg-[#00e] px-3 py-2 font-mono text-xs text-white/80 transition-colors"
            >
              [ {aboutOpen ? "Close" : "More Info"} ]
            </button>
          </div>
        </div>

        {/* Dark container: capped height, flex column so the button row never scrolls away */}
        <div className="flex max-h-[60vh] flex-col overflow-hidden rounded-[2rem] py-4 bg-black/50">
          {/* Only this region scrolls */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-2 [scrollbar-width:thin]">
            {/* Intro: visible while collapsed, animates away when About opens */}
            <div
              ref={introRef}
              aria-hidden={aboutOpen}
              className="overflow-hidden"
            >
              <p className="mb-2  text-sm hidden md:inline-flex font-medium leading-4  tracking-tight text-white">
                {INTRO}
              </p>
            </div>

            <div
              ref={aboutPanelRef}
              id="about-panel"
              aria-hidden={!aboutOpen}
              className="h-0 overflow-hidden"
            >
              <div className="mb-2 flex flex-col gap-5 py-2">
                {ABOUT_SECTIONS.map((section) => (
                  <div
                    key={section.index}
                    className="about-item grid grid-cols-1 gap-2 text-[10px] tracking-tight md:grid-cols-4 md:gap-4"
                  >
                    <p className="font-mono font-medium uppercase">
                      {section.index} [ {section.label} ]
                    </p>
                    <p className="text-xs leading-4 font-medium tracking-tight text-white md:col-span-3">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Always visible: sits outside the scroll region and the collapsing panel */}
          <div className=" w-full shrink-0 items-center justify-between gap-2 px-6 pb-2 pt-2">
            
            <div className="flex shrink-0 w-full justify-between items-center gap-2">
              
              <a
                href="mailto:info@thewisestudio.xyz"
                aria-controls="about-panel"
                className="cursor-pointer rounded-full  items-center flex justify-center bg-white/10 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-[#00e]"
              >
                [ Sponsor ]
              </a>
              <a
                href="mailto:info@thewisestudio.xyz"
                aria-controls="about-panel"
                className="cursor-pointer rounded-full min-w-40 items-center flex justify-center bg-[#00e] px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-[#00e]"
              >
                [ Question? ]
              </a>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Page;
