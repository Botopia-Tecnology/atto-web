"use client";

import Image from "next/image";
import Threads from "@/components/backgrounds/threads";

export default function Hero() {
  return (
    <section className="relative h-dvh w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <Threads amplitude={1} distance={0} enableMouseInteraction />
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <Image
          src="https://res.cloudinary.com/dxzcutnlp/image/upload/v1771017624/Property_1_Variant4_vq9shb.png"
          alt="atto sound"
          width={200}
          height={60}
          priority
          className="w-24"
        />
      </div>
    </section>
  );
}
