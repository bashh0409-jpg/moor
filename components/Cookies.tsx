"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useSyncExternalStore } from "react";
import HoverLabel from "./hover-label";

const consentStorageKey = "splash-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const getStoredChoice = (): ConsentChoice | null => {
  const storedChoice = window.localStorage.getItem(consentStorageKey);

  return storedChoice === "accepted" || storedChoice === "rejected"
    ? storedChoice
    : null;
};

const subscribeToChoice = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(consentStorageKey, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(consentStorageKey, onChange);
  };
};

const Cookies = () => {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const choice = useSyncExternalStore(
    subscribeToChoice,
    getStoredChoice,
    () => null,
  );

  const saveChoice = (nextChoice: ConsentChoice) => {
    window.localStorage.setItem(consentStorageKey, nextChoice);
    window.dispatchEvent(new Event(consentStorageKey));
  };

  return (
    <>
      {choice === "accepted" ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}

      {isHydrated && choice === null ? (
        <aside
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 rounded-3xl z-[60]  bg-white p-3 shadow-[0_18px_60px_rgb(0_0_0/18%)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm"
        >
          <p className="text-sm mon leading-4 geist tracking-tight font-medium uppercas text-[#999]">
            We use necessary{" "}
            <a href="legal/#cookies" className="text-blue-600 underline">
              cookies
            </a>{" "}
            to keep the site working. With your permission, we also use
            privacy-friendly analytics to improve it.
          </p>
          <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
            <span className="gap-1 flex">
              <button
                type="button"
                onClick={() => saveChoice("accepted")}
                className="w-fit  geist cursor-pointer items-center flex capitalize max-h-7 rounded-3xl border border-black/10 bg-black/[0.03] px-2 py-1 text-sm font-medium leading-4 tracking-tight text-[#333] [overflow-wrap:anywhere]"
              >
                <HoverLabel>Accept</HoverLabel>
              </button>
              <button
                type="button"
                onClick={() => saveChoice("rejected")}
                className="w-fit  geist flex items-center  cursor-pointer capitalize max-h-7 rounded-3xl border border-black/10 bg-black/[0.03] px-2 py-1 text-sm font-medium leading-4 tracking-tight text-[#333] [overflow-wrap:anywhere]"
              >
                <HoverLabel> Decline</HoverLabel>
              </button>
            </span>
          </div>
        </aside>
      ) : null}
    </>
  );
};

export default Cookies;
