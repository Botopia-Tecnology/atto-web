"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Threads from "@/components/backgrounds/threads";

export default function Hero() {
  const morphRef = useRef(0);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    function syncLogo() {
      if (logoRef.current) {
        // Show logo when threads are active (morph high), hide during faders
        const morph = morphRef.current;
        let opacity = (morph - 0.3) / 0.4;
        opacity = Math.max(0, Math.min(1, opacity));
        logoRef.current.style.opacity = String(opacity);
      }
      raf = requestAnimationFrame(syncLogo);
    }
    raf = requestAnimationFrame(syncLogo);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction
          enableMorph
          morphProgressRef={morphRef}
        />
      </div>

      {/* Logo appears at bottom when threads (waves) are active */}
      <div
        ref={logoRef}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center sm:bottom-8"
        style={{ opacity: 0 }}
      >
        <Image
          src="https://res.cloudinary.com/dxzcutnlp/image/upload/v1771017624/Property_1_Variant4_vq9shb.png"
          alt="atto sound"
          width={96}
          height={32}
          className="w-16 sm:w-20 md:w-24"
          priority
        />
      </div>
    </section>
  );
}
