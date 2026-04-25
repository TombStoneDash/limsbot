"use client";

import { useState } from "react";
import Image from "next/image";

type VideoSectionProps = {
  videoId: string;
  heading: string;
  subheading?: string;
  caption?: string;
  posterSrc?: string;
  posterAlt?: string;
  sectionId?: string;
  background?: "default" | "muted";
};

export default function VideoSection({
  videoId,
  heading,
  subheading,
  caption,
  posterSrc,
  posterAlt = "Video poster",
  sectionId,
  background = "default",
}: VideoSectionProps) {
  const [activated, setActivated] = useState(false);
  const fallbackPoster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const bg = background === "muted" ? "bg-[#2C3E50]/10" : "";

  return (
    <section className={`py-20 px-6 ${bg}`} id={sectionId}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-[#F8F9FA]">
          {heading}
        </h2>
        {subheading && (
          <p className="text-[#F8F9FA]/60 text-center max-w-2xl mx-auto mb-10 text-sm">
            {subheading}
          </p>
        )}
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-[#1E3A5F]/30 bg-black"
          style={{ paddingBottom: "56.25%" }}
        >
          {activated ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={heading}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setActivated(true)}
              aria-label={`Play video: ${heading}`}
              className="absolute top-0 left-0 w-full h-full group cursor-pointer"
            >
              {posterSrc ? (
                <Image
                  src={posterSrc}
                  alt={posterAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 896px"
                  priority={false}
                />
              ) : (
                <Image
                  src={fallbackPoster}
                  alt={posterAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 896px"
                  unoptimized
                  priority={false}
                />
              )}
              <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center justify-center w-20 h-20 rounded-full bg-[#E67E22] shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-10 h-10 ml-1"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
        {caption && (
          <p className="text-center mt-4 text-sm italic text-[#F8F9FA]/40">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
