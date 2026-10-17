import type { Dispatch, RefObject, SetStateAction } from "react";
import HoverLabel from "@/components/hover-label";

interface MenuItem {
  label: string;
  href: string;
}

interface SiteNavbarProps {
  navRef: RefObject<HTMLElement | null>;
  menuPanelRef: RefObject<HTMLDivElement | null>;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  onOpenMenu: () => void;
  soundOn: boolean;
  setSoundOn: Dispatch<SetStateAction<boolean>>;
}

const MENU_ITEMS: MenuItem[] = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Speedrun", href: "#" },
];

export default function SiteNavbar({
  navRef,
  menuPanelRef,
  menuOpen,
  setMenuOpen,
  onOpenMenu,
  soundOn,
  setSoundOn,
}: SiteNavbarProps) {
  return (
    <nav
      ref={navRef}
      className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl bg-black/30 text-white shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3 px-2 py-2">
        <img
          src="/splash.svg"
          alt="splash"
          className="h-auto pl-4 w-20 object-contain"
        />

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOn((prev) => !prev)}
            aria-pressed={soundOn}
            className={`cursor-pointer rounded-full px-4 py-2 font-mono text-xs text-white transition-colors ${
              soundOn ? "bg-[#00e]" : "bg-black/50 hover:bg-[#00e]"
            }`}
          >
            <HoverLabel>[ Sound: {soundOn ? "On" : "Off"} ]</HoverLabel>
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
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

      <div
        ref={menuPanelRef}
        id="nav-menu"
        aria-hidden={!menuOpen}
        className="h-0 overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 pt-4">
          

          <a
            href="#"
            download="Splash-Cloud.dmg"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            aria-label="Download Splash Cloud for Mac"
            className="menu-item inline-flex cursor-disabled items-center gap-2 rounded-full bg-black uppercase font-mono font-medium px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 shrink-0"
            >
              <path d="M16.5 4.1c.6-.73 1.01-1.75.9-2.76-.88.04-1.95.59-2.58 1.31-.56.64-1.05 1.68-.92 2.68.98.08 1.99-.5 2.6-1.23ZM20.58 14.09c-.03.07-.37 1.27-1.22 2.5-.72 1.07-1.48 2.13-2.68 2.15-1.17.02-1.55-.69-2.89-.69-1.33 0-1.75.67-2.85.71-1.14.05-2.01-1.14-2.74-2.2-1.49-2.16-2.63-6.1-1.1-8.76.76-1.32 2.12-2.16 3.59-2.18 1.12-.02 2.18.76 2.86.76.69 0 1.99-.94 3.35-.8.57.02 2.17.22 3.2 1.72-.08.05-1.91 1.1-1.88 3.3.02 2.69 2.33 3.58 2.36 3.59Z" />
            </svg>
            <HoverLabel>cooming soon</HoverLabel>
          </a>
          <a
            href="#contact"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            className="menu-item rounded-full bg-black/50 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            <HoverLabel>[ Contact ]</HoverLabel>
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
                <HoverLabel>[ {item.label} ]</HoverLabel>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-co gap-1 px-4 pb-4 pt-3 font-mono text-[10px] uppercase text-white">
          <span>Splash Cloud™ — 2026</span>
          <span>ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </nav>
  );
}
