import type { RefObject } from "react";
import HoverLabel from "@/components/hover-label";
import { ABOUT_SECTIONS } from "@/lib/about-sections";

interface AboutPanelProps {
  aboutRef: RefObject<HTMLElement | null>;
  aboutPanelRef: RefObject<HTMLDivElement | null>;
  introRef: RefObject<HTMLDivElement | null>;
  aboutOpen: boolean;
  reading: boolean;
  onToggleAbout: () => void;
  onReadAloud: () => void;
}

const INTRO =
  "Splash puts cloud file storage first, combining a simple, web-first experience with a vision for seamless access across devices. No unnecessary complexity—just a more straightforward way to store, access and manage your files.";

export default function AboutPanel({
  aboutRef,
  aboutPanelRef,
  introRef,
  aboutOpen,
  reading,
  onToggleAbout,
  onReadAloud,
}: AboutPanelProps) {
  return (
    <aside
      ref={aboutRef}
      className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-[2rem] bg-[#0006] text-white shadow-lg backdrop-blur-lg"
    >
      <div className="flex w-full items-center justify-between rounded-full px-6 py-4 font-mono">
        <img src="/splash.svg" alt="" className="h-auto w-18 object-contain" />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleAbout}
            aria-expanded={aboutOpen}
            aria-controls="about-panel"
            className="min-w-40 cursor-pointer rounded-full bg-black/50 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-[#00e]"
          >
            <HoverLabel>[ {aboutOpen ? "Close" : "More Info"} ]</HoverLabel>
          </button>
        </div>
      </div>

      <div className="flex max-h-[60dvh] flex-col overflow-hidden rounded-[2rem] bg-[#0000004d] pt-1 backdrop-blur-lg sm:rounded-[2rem]">
        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1 sm:px-6"
        >
          <div
            ref={introRef}
            aria-hidden={aboutOpen}
            className="overflow-hidden"
          >
            <p className="mb-2 hidden text-xs  leading-4 tracking-tight text-white md:inline-flex">
              {INTRO}
            </p>
          </div>

          <div
            ref={aboutPanelRef}
            id="about-panel"
            aria-hidden={!aboutOpen}
            className="h-0 overflow-hidden"
          >
            <div className="mb-3 flex flex-col gap-5 py-3">
              {ABOUT_SECTIONS.map((section) => (
                <div
                  key={section.index}
                  className="about-item grid grid-cols-1 gap-2 text-[10px] tracking-tight md:grid-cols-4 md:gap-4"
                >
                  <p className="font-mono font-medium uppercase leading-4 text-white/70">
                    {section.index} [ {section.label} ]
                  </p>

                  <p className="text-xs font-medium leading-5 tracking-tight text-white md:col-span-3">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center px-3 pb-3 pt-2 sm:px-6 sm:pb-4">
          <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onReadAloud}
              aria-pressed={reading}
              className={`flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full px-3 py-3 font-mono text-[11px] leading-none text-white transition-colors duration-200 sm:px-5 sm:text-xs ${
                reading ? "bg-[#00e]" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <HoverLabel>{reading ? "Stop Reading" : "Read Aloud"}</HoverLabel>
            </button>

            <a
              href="mailto:info@thewisestudio.xyz"
              className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#00e] px-3 py-3 font-mono text-[11px] leading-none text-white transition-colors duration-200 hover:bg-[#2222ff] sm:px-5 sm:text-xs"
            >
              <HoverLabel>[ Question? ]</HoverLabel>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
