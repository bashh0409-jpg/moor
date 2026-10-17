import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";
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
          src="/komma.avif"
          alt="Komma"
          className="h-auto w-30 object-contain"
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
            href="#work"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
            className="menu-item rounded-full bg-black/50 px-3 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            <HoverLabel>[ Work ]</HoverLabel>
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
          <span>Moor Cloud™ — 2026</span>
          <span>ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </nav>
  );
}
