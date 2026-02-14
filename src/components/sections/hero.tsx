"use client";

import Image from "next/image";
import Threads from "@/components/backgrounds/threads";

export default function Hero() {
  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction
          enableMorph
        />
      </div>

      {/* Logo appears at bottom when faders (procedural logo) are active */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center animate-[logoFade_12s_ease-in-out_infinite] sm:bottom-8">
        <Image
          src="https://res.cloudinary.com/dxzcutnlp/image/upload/v1771017624/Property_1_Variant4_vq9shb.png"
          alt="atto sound"
          width={96}
          height={32}
          className="w-16 sm:w-20 md:w-24"
          priority
        />
      </div>

      <style jsx global>{`
        @keyframes logoFade {
          0% { opacity: 1; }
          17% { opacity: 1; }
          33% { opacity: 0; }
          75% { opacity: 0; }
          92% { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
