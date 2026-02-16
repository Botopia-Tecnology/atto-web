"use client";

import { useState } from "react";
import Logo from "@/components/logo";
import SignUpModal from "@/components/signup-modal";
import WaitlistCounter from "@/components/waitlist-counter";

export default function Hero() {
  const [open, setOpen] = useState(false);
  const [signUpCount, setSignUpCount] = useState(0);

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
