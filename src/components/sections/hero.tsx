"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/logo";
import SignUpModal from "@/components/signup-modal";
import WaitlistCounter from "@/components/waitlist-counter";

function useHeartbeatSound() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  function toggle() {
    if (on) {
      if (timerRef.current) clearInterval(timerRef.current);
      ctxRef.current?.close();
      ctxRef.current = null;
      setOn(false);
    } else {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      function playBeat() {
        if (ctx.state === "closed") return;
        const t = ctx.currentTime;

        // S1 — lub
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = "sine";
        o1.frequency.value = 50;
        g1.gain.setValueAtTime(0, t);
        g1.gain.linearRampToValueAtTime(0.12, t + 0.02);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o1.connect(g1).connect(ctx.destination);
        o1.start(t);
        o1.stop(t + 0.15);

        // S2 — dub
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = "sine";
        o2.frequency.value = 40;
        g2.gain.setValueAtTime(0, t + 0.2);
        g2.gain.linearRampToValueAtTime(0.08, t + 0.22);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o2.connect(g2).connect(ctx.destination);
        o2.start(t + 0.2);
        o2.stop(t + 0.35);
      }

      playBeat();
      timerRef.current = setInterval(playBeat, 1200);
      setOn(true);
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return { on, toggle };
}

export default function Hero() {
  const [open, setOpen] = useState(false);
  const [signUpCount, setSignUpCount] = useState(0);
  const sound = useHeartbeatSound();

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-[40%] flex -translate-y-1/2 justify-center">
        <Logo className="w-48 sm:w-64" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end gap-4 pb-10">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80 sm:px-6 sm:text-base"
        >
          Sign Up
        </button>

        <div className="flex items-center gap-5">
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

          <button
            onClick={sound.toggle}
            className="text-white transition-opacity hover:opacity-70"
            aria-label={sound.on ? "Mute heartbeat" : "Play heartbeat"}
          >
            {sound.on ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
        </div>

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
