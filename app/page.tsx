"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import Image from "next/image";
import AboutPanel from "@/components/about-panel";
import SiteNavbar from "@/components/site-navbar";
import { ABOUT_SECTIONS } from "@/lib/about-sections";
import { useScrollSound } from "@/hooks/use-scroll-sound";
import type { ScrollSoundPreset } from "@/hooks/use-scroll-sound";

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

const GALLERY_ASSETS = [
  "/gallery/1-01.webp",
  "/gallery/cosmos_1046876467.webp",
  "/gallery/cosmos_1051136214.webp",
  "/gallery/cosmos_114748657.webp",
  "/gallery/cosmos_1314984379.webp",
  "/gallery/cosmos_1315113271.gif",
  "/gallery/cosmos_1362023669.webp",
  "/gallery/cosmos_1461960497.mp4",
  "/gallery/cosmos_1462818484.webp",
  "/gallery/cosmos_1501491551.webp",
  "/gallery/cosmos_1563076197.mp4",
  "/gallery/cosmos_1608306540.webp",
  "/gallery/cosmos_1609525463.webp",
  "/gallery/cosmos_1688312940.webp",
  "/gallery/cosmos_1800600229.webp",
  "/gallery/cosmos_1854803108.webp",
  "/gallery/cosmos_1888286139.webp",
  "/gallery/cosmos_1896706248.webp",
  "/gallery/cosmos_1915980613.webp",
  "/gallery/cosmos_1926019146.webp",
  "/gallery/cosmos_2012909807.webp",
  "/gallery/cosmos_2036487314.webp",
  "/gallery/cosmos_206300164.webp",
  "/gallery/cosmos_227009253.webp",
  "/gallery/cosmos_398388872.webp",
  "/gallery/cosmos_413762843.webp",
  "/gallery/cosmos_423875682.mp4",
  "/gallery/cosmos_486115365.webp",
  "/gallery/cosmos_572350572.webp",
  "/gallery/cosmos_613355346.webp",
  "/gallery/cosmos_632303741.webp",
  "/gallery/cosmos_653052878.webp",
  "/gallery/cosmos_684854038.webp",
  "/gallery/cosmos_813296592.webp",
  "/gallery/cosmos_865140119.mp4",
  "/gallery/cosmos_993114485.webp",
];

// The page is rendered this many times and scroll position is wrapped back into the middle copy
const COPIES = 3;

// Slightly longer than the panel's 0.4s open tween so audio starts once the container is fully open
const READ_START_DELAY_MS = 450;

// "click" | "air" | "tick": see hooks/use-scroll-sound.ts
const SCROLL_SOUND_PRESET: ScrollSoundPreset = "click";

// Near-empty WAV used only to unlock an <audio> element inside the click gesture (see handleReadAloud)
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

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
    src: GALLERY_ASSETS[((rowNumber - 1) * count + i) % GALLERY_ASSETS.length],
  })),
});

// Five rows so one cycle is taller than any viewport, which the wrap logic relies on
const ROWS: GalleryRow[] = [
  makeRow(1, "left", 0.5, 7),
  makeRow(2, "right", 0.8, 7),
  makeRow(3, "left", 0.65, 7),
  makeRow(4, "right", 0.9, 7),
  makeRow(5, "left", 0.55, 8),
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
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [reading, setReading] = useState<boolean>(false);
  const introRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Smoothed, unbounded scroll distance written every frame by the scroll ticker and read by the
  // audio ticker; a ref avoids re-renders
  const scrollDistanceRef = useRef<number>(0);
  const readTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readAudioRef = useRef<HTMLAudioElement | null>(null);
  // Incremented on every start/stop so a cancelled run's late audio events can't affect a newer run
  const readRunRef = useRef<number>(0);

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

  useScrollSound(soundOn, scrollDistanceRef, SCROLL_SOUND_PRESET);

  const stopReading = useCallback((): void => {
    readRunRef.current += 1;
    if (readTimerRef.current) clearTimeout(readTimerRef.current);
    readTimerRef.current = null;

    const audio = readAudioRef.current;
    if (audio) {
      // Detach handlers before clearing src: emptying src fires an `error` event in some browsers
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    readAudioRef.current = null;
    setReading(false);
  }, []);

  // Plays section `i`, then chains to the next on `ended`. The run id guards against stale callbacks.
  const playSection = useCallback(
    (audio: HTMLAudioElement, i: number, run: number): void => {
      if (readRunRef.current !== run) return;
      if (i >= ABOUT_SECTIONS.length) {
        stopReading();
        return;
      }

      audio.onended = () => playSection(audio, i + 1, run);
      audio.onerror = () => {
        if (readRunRef.current === run) stopReading();
      };
      audio.src = `/audio/section-${i}.mp3`;
      audio.play().catch((error: unknown) => {
        console.error("Read aloud playback failed", error);
        if (readRunRef.current === run) stopReading();
      });
    },
    [stopReading],
  );

  const handleReadAloud = (): void => {
    if (reading) {
      stopReading();
      return;
    }

    // Open the container first, then play once the animation has finished
    setMenuOpen(false);
    setAboutOpen(true);
    setReading(true);

    // Playing a silent clip synchronously inside the click marks this element as user-approved,
    // so the delayed play() below isn't blocked by Safari/iOS autoplay rules
    const audio = new Audio(SILENT_WAV);
    void audio.play().catch(() => undefined); // best-effort unlock; real errors surface in playSection
    readAudioRef.current = audio;

    const run = ++readRunRef.current;
    readTimerRef.current = setTimeout(() => {
      playSection(audio, 0, run);
    }, READ_START_DELAY_MS);
  };

  // Closing the panel (button or Escape) should also silence the reader
  useEffect(() => {
    if (!aboutOpen) stopReading();
  }, [aboutOpen, stopReading]);

  // Audio keeps playing after unmount/navigation unless stopped explicitly
  useEffect(() => stopReading, [stopReading]);

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
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      anchors: true,
    });
    const measure = (): void => {
      cycle = content.getBoundingClientRect().height / COPIES;
      tracks.forEach((track) => {
        track.setWidth = track.el.scrollWidth / 2;
      });
    };

    // Maps any scroll position into the middle copy [cycle, 2 * cycle)
    const normalize = (y: number): number => cycle + mod(y - cycle, cycle);

    measure();
    let lastY = normalize(lenis.scroll);
    lenis.scrollTo(lastY, { immediate: true, force: true });

    // `target` counts every pixel the user has scrolled, never reset, so row motion survives the wrap
    let target = 0;
    let current = 0;
    let autoPosition = 0;
    let scrollBoost = 0;

    const onScroll = (): void => {
      const y = lenis.scroll;
      const scrollDelta = y - lastY;
      target += scrollDelta;
      scrollBoost = Math.min(scrollBoost + Math.abs(scrollDelta) * 0.025, 12);
      lastY = y;

      // Reposition instantly at copy boundaries so the loop stays seamless.
      if (y >= cycle * 2 || y < cycle) {
        const wrapped = normalize(y);
        lenis.scrollTo(wrapped, { immediate: true, force: true });
        lastY = wrapped;
      }
    };

    const tick = (_time: number, deltaTime: number): void => {
      current += (target - current) * 0.12; // lerp for a gliding feel
      if (Math.abs(target - current) < 0.05) current = target;

      // Unbounded and wrap-safe (it never jumps when the scroll position wraps), and it follows the
      // eased motion, so the sound lines up with what's on screen rather than the raw scroll event
      scrollDistanceRef.current = current;

      const elapsedFrames = Math.min(deltaTime, 50) / (1000 / 60);
      autoPosition += (0.18 + scrollBoost) * elapsedFrames;
      scrollBoost *= Math.exp(-Math.min(deltaTime, 50) / 800);
      if (!reduceMotion) {
        tracks.forEach((track) => {
          const shift = mod(autoPosition * track.speed, track.setWidth);
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
          mod(lenis.scroll - previousCycle, previousCycle) / previousCycle;
        const y = cycle + fraction * cycle;
        lenis.scrollTo(y, { immediate: true, force: true });
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
      lenis.destroy();
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
    const videos = root.querySelectorAll<HTMLVideoElement>(".gallery-video");
    const videoObserver =
      !reduceMotion && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                if (entry.isIntersecting) {
                  video.play().catch((error: unknown) => {
                    if (
                      error instanceof DOMException &&
                      error.name === "AbortError"
                    ) {
                      return;
                    }
                    console.error("Gallery video playback failed:", error);
                  });
                } else {
                  video.pause();
                }
              });
            },
            { rootMargin: "100% 0px" },
          )
        : null;
    videos.forEach((video) => videoObserver?.observe(video));

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
            scale: 1,
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
      videoObserver?.disconnect();
      videos.forEach((video) => video.pause());
      ctx.revert();
    };
  }, []);

  return (
    <main className="bg-neutral-950">
      <SiteNavbar
        navRef={navRef}
        menuPanelRef={menuPanelRef}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onOpenMenu={() => {
          const nextOpen = !menuOpen;
          setMenuOpen(nextOpen);
          if (nextOpen) setAboutOpen(false);
        }}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
      />

      {/* Logo pinned to the middle of the screen; pointer-events-none so it never blocks scrolling or taps */}
      <div className="pointer-events-none w-full h-full bg-black/40  fixed inset-0 z-40 flex items-center justify-center">
        <div className="absolute h-40 w-64 rounded-full " />
        <img
          src="/komma.avif"
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
                        {item.src.endsWith(".mp4") ? (
                          <video
                            src={item.src}
                            aria-hidden="true"
                            muted
                            loop
                            playsInline
                            preload="none"
                            className="gallery-image gallery-video absolute inset-0 h-full w-full object-cover will-change-transform"
                          />
                        ) : (
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
                        )}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0  via-neutral-900/20 to-black/30"
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

      <AboutPanel
        aboutRef={aboutRef}
        aboutPanelRef={aboutPanelRef}
        introRef={introRef}
        aboutOpen={aboutOpen}
        reading={reading}
        onToggleAbout={() => {
          const nextOpen = !aboutOpen;
          setAboutOpen(nextOpen);
          if (nextOpen) setMenuOpen(false);
        }}
        onReadAloud={handleReadAloud}
      />
    </main>
  );
};

export default Page;

/*
 * Design note
 * - Scroll sound lives in hooks/use-scroll-sound.ts so you can iterate on it without touching this file.
 *   It reads the lerped scroll distance (not raw scrollY), so it never spikes on the endless-scroll wrap
 *   and stays in sync with the row motion on screen.
 * - Read Aloud plays pre-generated MP3s from /public/audio, chained on `ended`. Static files mean
 *   no runtime API, key or cost, and identical audio everywhere. One file per section lets Stop cut in between.
 * - After editing ABOUT_SECTIONS, delete the matching section-N.mp3 and re-run scripts/generate-audio.ts,
 *   otherwise the audio will still speak the old text.
 */
