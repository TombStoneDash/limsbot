"use client";

import { useEffect, useRef } from "react";

type FullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void | Promise<void>;
  webkitRequestFullscreen?: () => void | Promise<void>;
};

export default function DemoLoopVideo() {
  const videoRef = useRef<FullscreenVideo>(null);

  async function enterFullscreen() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if (video.webkitEnterFullscreen) await video.webkitEnterFullscreen();
      else if (video.webkitRequestFullscreen) await video.webkitRequestFullscreen();
    } catch {
      // Fullscreen can be unavailable or denied by the browser.
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      void (async () => {
        try {
          await video?.play();
        } catch {
          // Native controls remain available if autoplay is denied.
        }
      })();
    }

    async function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "f" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.closest("input, textarea, select") || target.isContentEditable ||
        target.closest('[contenteditable]:not([contenteditable="false"])')
      )) return;

      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await enterFullscreen();
      } catch {
        // Ignore browser fullscreen restrictions.
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div
        className="relative w-full overflow-hidden rounded-lg border border-[#1E3A5F]/30 bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full"
          src="/videos/lims-box-product-demo.mp4"
          poster="/images/branded-newcase.jpg"
          muted
          loop
          playsInline
          preload="auto"
          controls
          aria-label="LIMS BOX 84-second product demo (loop)"
        />
      </div>
      <button
        type="button"
        className="block mx-auto mt-3 min-h-[44px] px-4 text-sm rounded-lg border border-[#1E3A5F]/60 text-[#F8F9FA]"
        onClick={enterFullscreen}
      >
        Full screen
      </button>
    </>
  );
}
