"use client";

import { useState, useSyncExternalStore } from "react";
import HoverLabel from "@/components/hover-label";

type ConsentChoice = "all" | "essential";
type ConsentSnapshot = ConsentChoice | "unavailable" | null;

const CONSENT_KEY = "moor-cookie-consent";
const CONSENT_CHANGE_EVENT = "moor-consent-change";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  };
};

const getSnapshot = (): ConsentSnapshot => {
  try {
    const savedChoice = window.localStorage.getItem(CONSENT_KEY);

    return savedChoice === "all" || savedChoice === "essential"
      ? savedChoice
      : null;
  } catch {
    return "unavailable";
  }
};

const getServerSnapshot = (): ConsentSnapshot => null;

export default function CookieConsent() {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [storageError, setStorageError] = useState(false);

  const saveChoice = (nextChoice: ConsentChoice) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, nextChoice);
      setStorageError(false);
      window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
    } catch {
      setStorageError(true);
    }
  };

  if (choice !== null && choice !== "unavailable") {
    return null;
  }

  return (
    <section
      aria-label="Cookie preferences"
      className="fixed bottom-4 right-4 z-[70] w-[calc(100%-2rem)] max-w-xs rounded-xl bg-black text-white shadow-2xl backdrop-blur-md sm:bottom-6 sm:right-6"
    >
      <div className="flex flex-row items-center gap-5 p-2.5">
        <p className="m-0 flex-1 p-0 text-sm leading-none font-normal tracking-normal text-white">
          We use cookies to personalize content, run ads, and analyze traffic.
        </p>

        <div className="flex shrink-0 items-center justify-center">
          <button
            type="button"
            onClick={() => saveChoice("all")}
            className="h-auto w-auto cursor-pointer appearance-none rounded-md border-0 bg-[#eee] p-2.5  text-xs font-medium tracking-tight leading-none text-[#444] transition-colors hover:bg-white"
          >
            <HoverLabel>OK</HoverLabel>
          </button>
        </div>
      </div>

      {(storageError || choice === "unavailable") && (
        <p role="alert" className="px-2.5 pb-2.5 text-xs text-red-400">
          Your choice could not be saved. Check your browser storage settings
          and try again.
        </p>
      )}
    </section>
  );
}
