"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/logo";
import SignUpModal from "@/components/signup-modal";
import WaitlistCounter from "@/components/waitlist-counter";

/** Starts heartbeat audio on first user interaction (iOS Safari compatible). */
function useHeartbeatSound() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let timer: ReturnType<typeof setInterval>;
    const abort = new AbortController();

    function thump(ac: AudioContext, time: number, gain: number) {
      // Low tone with frequency sweep for body
      const lo = ac.createOscillator();
      const loG = ac.createGain();
      lo.type = "sine";
      lo.frequency.setValueAtTime(150, time);
      lo.frequency.exponentialRampToValueAtTime(40, time + 0.1);
      loG.gain.setValueAtTime(gain, time);
      loG.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      lo.connect(loG).connect(ac.destination);
      lo.start(time);
      lo.stop(time + 0.2);

      // Higher harmonic for mobile speaker presence
      const hi = ac.createOscillator();
      const hiG = ac.createGain();
      hi.type = "sine";
      hi.frequency.setValueAtTime(300, time);
      hi.frequency.exponentialRampToValueAtTime(80, time + 0.08);
      hiG.gain.setValueAtTime(gain * 0.4, time);
      hiG.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      hi.connect(hiG).connect(ac.destination);
      hi.start(time);
      hi.stop(time + 0.15);
    }

    function playBeat() {
      if (!ctx || ctx.state === "closed") return;
      const t = ctx.currentTime;
      thump(ctx, t, 0.35);        // S1 — lub
      thump(ctx, t + 0.22, 0.2);  // S2 — dub
    }

    function start() {
      abort.abort();
      // Create AudioContext INSIDE the gesture handler — Safari requires this
      const AC = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      playBeat();
      timer = setInterval(playBeat, 1200);
    }

    const opts = { signal: abort.signal };
    document.addEventListener("click", start, opts);
    document.addEventListener("touchstart", start, opts);

    return () => {
      clearInterval(timer);
      abort.abort();
      ctx?.close();
    };
  }, []);
}

export default function Hero() {
  const [open, setOpen] = useState(false);
  const [signUpCount, setSignUpCount] = useState(0);
  useHeartbeatSound();

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-[40%] flex -translate-y-1/2 justify-center">
        <Logo className="w-64 sm:w-80" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end gap-4 pb-10">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80 sm:px-6 sm:text-base"
        >
          Sign Up
        </button>

        <a
          href="https://www.instagram.com/attosound_?igsh=Mm1pNmhkOTlxNHd4&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white transition-opacity hover:opacity-70"
          aria-label="Instagram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>

        <WaitlistCounter increment={signUpCount} />
      </div>

      <SignUpModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => setSignUpCount((c) => c + 1)}
      />
    </section>
  );
}
