"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/moving-border";

const SparklesPreview = () => {
  const pathname = usePathname();
  const courseName = pathname.split("/").pop()?.replace(/-/g, " ");
  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      {/* Background Sparkles */}
      <div className="absolute inset-0">
        <SparklesCore
          id="sparkles-background"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          particleColor="#FFFFFF"
          className="w-full h-full fixed"
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative flex items-center justify-center z-10 w-full px-8 space-x-8">
        {/* Left Side - Transparent Image */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="https://img.freepik.com/free-photo/texture-treble-clef-dark-background-isolated-generative-ai_169016-29581.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1722643200&semt=sph"
            alt="Transparent Image"
            width={500}
            height={500}
            className="rounded-xl object-contain fixed"
            style={{ backgroundColor: "transparent" }}
          />
        </div>

        {/* Right Side - Details */}
        <div className="flex-1 flex flex-col space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold ">
            {courseName
              ? courseName.charAt(0).toUpperCase() + courseName.slice(1)
              : "Course Name"}
          </h1>
          <p className="text-lg text-gray-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique. Duis cursus, mi quis
            viverra ornare, eros dolor interdum nulla, ut commodo diam libero
            vitae erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Suspendisse varius enim in eros elementum tristique. Duis cursus, mi
            quis viverra ornare, eros dolor interdum nulla, ut commodo diam
            libero vitae erat. Lorem ipsum dolor sit amet, consectetur
            adipiscing Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>

          <Button
            borderRadius="1.75rem"
            className="font-bold bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
          >
            Buy now →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SparklesPreview;
