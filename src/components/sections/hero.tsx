"use client";

import { useState } from "react";
import Threads from "@/components/backgrounds/threads";
import SignUpModal from "@/components/signup-modal";

export default function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Threads color={[1, 1, 1]} />
      </div>

      <button
        onClick={() => setOpen(true)}
        className="absolute right-4 top-4 z-10 rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80 sm:right-6 sm:top-6 sm:px-6 sm:text-base"
      >
        Sign Up
      </button>

      <SignUpModal open={open} onOpenChange={setOpen} />
    </section>
  );
}
