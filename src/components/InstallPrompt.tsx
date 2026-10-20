"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { KuppuAvatar } from "@/components/KuppuGuide";

// Chrome's install event (not in the TypeScript DOM types yet)
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "curiosity_install_dismissed_at";
const SNOOZE_DAYS = 7;

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && navigator.maxTouchPoints > 1);
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

/** Shown only after the student has finished a test, so it never gets in the way of the first visit. */
function hasFinishedATest() {
  try {
    const raw = localStorage.getItem("curiosity_mock_tests_results");
    if (!raw) return false;
    return Object.values(JSON.parse(raw) as Record<string, { completed?: boolean }>).some((r) => r?.completed);
  } catch {
    return false;
  }
}

function snoozed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * "Add Curiosity to your phone" card on the dashboard. Android/Chrome gets a
 * real install button; iPhone Safari gets the Share → Add to Home Screen
 * steps. "Not now" hides it for a week.
 */
export function InstallPrompt() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  // The page the card is allowed to appear on, set a moment after arriving there
  const [settledOn, setSettledOn] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  // Catch Chrome's install event on any page, so it is ready by the time the dashboard shows.
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setClosed(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Wait a moment so the card slides in after the dashboard has settled.
  useEffect(() => {
    const timer = window.setTimeout(() => setSettledOn(pathname), 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Only checked after the timer, so this runs in the browser
  const eligible =
    !closed &&
    settledOn === pathname &&
    pathname === "/dashboard" &&
    !isStandalone() &&
    !snoozed() &&
    hasFinishedATest();
  const mode = !eligible ? "hidden" : installEvent ? "android" : isIosSafari() ? "ios" : "hidden";
  if (mode === "hidden") return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setClosed(true);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);
    if (choice?.outcome !== "accepted") dismiss();
    setInstallEvent(null);
    setClosed(true);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="install-title"
      className="sheet-up fixed z-[60] left-3 right-3 bottom-20 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4"
    >
      <div className="flex items-start gap-3">
        <KuppuAvatar size={48} mood="happy" />
        <div className="min-w-0 flex-1">
          <p id="install-title" className="text-sm font-black text-[#143867]">
            {t.install.title}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {mode === "ios" ? (
              <>
                <span className="material-symbols-outlined text-sm align-middle text-[#143867]" aria-hidden>
                  ios_share
                </span>{" "}
                {t.install.ios}
              </>
            ) : (
              t.install.body
            )}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={dismiss}
          className="flex-1 min-h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold"
        >
          {t.install.not_now}
        </button>
        {mode === "android" && (
          <button
            type="button"
            onClick={install}
            className="flex-1 min-h-[44px] rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-black shadow-[0_4px_0_0_#9a3412] active:translate-y-1 active:shadow-none transition-all"
          >
            {t.install.add}
          </button>
        )}
      </div>
    </div>
  );
}
