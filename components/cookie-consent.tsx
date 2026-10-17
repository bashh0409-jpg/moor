"use client";

import { useState, useSyncExternalStore } from "react";

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

  return (
    <>
      {choice === null || choice === "unavailable" ? (
        <section
          aria-label="Cookie preferences"
          className="fixed bottom-4 z-[70] mx-auto max-w-xs rounded-xl bg-black text-white shadow-2xl backdrop-blur-md sm:inset-x-6 sm:bottom-6"
        >
          <div className="flex flex-row items-center gap-5 p-2.5">
            <p className="m-0 flex-1 p-0 text-sm leading-none font-normal tracking-normal text-white">
              We use cookies to personalize content, run ads, and analyze
              traffic.
            </p>
            <div className="flex shrink-0 items-center justify-center">
              <button
                type="button"
                onClick={() => saveChoice("all")}
                className="h-auto w-auto cursor-pointer appearance-none rounded-md border-0 bg-[#eee] p-2.5 font-mono text-sm geist font-normal leading-none text-[#444]"
              >
                OK
              </button>
            </div>
          </div>
          {(storageError || choice === "unavailable") && (
            <p role="alert" className="px-2.5 pb-2.5 text-xs text-red-600">
              Your choice could not be saved. Check your browser storage
              settings and try again.
            </p>
          )}
        </section>
      ) : (
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.removeItem(CONSENT_KEY);
              setStorageError(false);
              window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
            } catch {
              setStorageError(true);
            }
          }}
          className="fixed bottom-4 left-4 z-[70] rounded-full border border-white/15 bg-neutral-950/90 px-3 py-2 font-mono text-[10px] text-white/65 shadow-lg backdrop-blur-md transition-colors hover:text-white sm:bottom-6 sm:left-6"
        >
          Privacy settings
        </button>
      )}
    </>
  );
}
