"use client";

import Image from "next/image";
import Threads from "@/components/backgrounds/threads";

export default function Hero() {
  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Threads amplitude={1} distance={0} enableMouseInteraction />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center gap-6 px-4 pt-24 text-center">
        <Image
          src="https://res.cloudinary.com/dxzcutnlp/image/upload/v1771017624/Property_1_Variant4_vq9shb.png"
          alt="atto sound"
          width={400}
          height={120}
          priority
          className="w-64 sm:w-96"
        />
        <p className="max-w-md text-lg text-white/60">music production</p>
        <span className="mt-4 text-sm uppercase tracking-widest text-white/40">
          Coming Soon
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center translate-y-1/2">
        <Image
          src="https://res.cloudinary.com/dxzcutnlp/image/upload/v1771017381/Disen%CC%83o_sin_ti%CC%81tulo_nuvxfz.png"
          alt="atto sound app"
          width={800}
          height={600}
          className="w-[60%] max-w-md"
        />
      </div>
    </section>
  );
}
