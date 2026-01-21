"use client";

import { Component as GradientButton } from "@/components/ui/button-1";
import { HoverButton } from "@/components/ui/hover-button";
import { SplineScene } from "@/components/ui/spline";
import { Spotlight } from "@/components/ui/spotlight";
import { TextRevealByWord } from "@/components/ui/text-reveal";
import { useOvershootStagger } from "@/hooks/useOvershoot";
import { Building2Icon, ImageIcon, TreesIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Mode = "museum" | "monuments" | "landscape";

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const itemsRef = useOvershootStagger(150);

  const modes = [
    {
      id: "museum" as Mode,
      name: "Museum Mode",
      description:
        "Analyze artwork and paintings with AI-generated descriptions and music",
      icon: ImageIcon,
      color: "bg-museum",
      hoverColor: "hover:bg-blue-600",
    },
    {
      id: "monuments" as Mode,
      name: "Monuments Mode",
      description:
        "Explore historical monuments and landmarks with detailed context",
      icon: Building2Icon,
      color: "bg-monuments",
      hoverColor: "hover:bg-amber-800",
    },
    {
      id: "landscape" as Mode,
      name: "Landscape Mode",
      description: "Discover natural landscapes with immersive descriptions",
      icon: TreesIcon,
      color: "bg-landscape",
      hoverColor: "hover:bg-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-gray-900 tracking-tight">
                @rt
              </h1>
            </div>
            <nav className="flex gap-3 items-center">
              <GradientButton href="/realtime-vision">
                🎥 Real-Time Vision
              </GradientButton>
              <Link
                href="/history"
                className="px-5 py-2.5 rounded-full bg-gray-200 backdrop-blur-sm text-gray-900 hover:bg-gray-300 transition-all duration-300 text-sm font-medium border border-gray-400"
              >
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* 3D Background Robot - Full viewport behind everything */}
        <div className="fixed inset-0 z-0 grayscale">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full opacity-20"
          />
          {/* Light overlay to ensure readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-gray-50/40 to-gray-100/60 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 py-20 pointer-events-none">
          <div className="max-w-6xl mx-auto pointer-events-auto">
            {/* Hero Section */}
            <div className="text-center mb-8 animate-fade-in">
              <Spotlight
                className="-top-40 left-1/2 -translate-x-1/2"
                fill="rgba(0, 0, 0, 0.03)"
              />
              <h2 className="text-5xl md:text-6xl font-display mb-4 text-gray-900 tracking-tight font-light">
                Choose Your Experience
              </h2>
              <div className="max-w-2xl mx-auto">
                <TextRevealByWord
                  text="@rt will change the way you perceive art"
                  className="h-auto"
                />
              </div>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {modes.map((mode, index) => {
                const Icon = mode.icon;
                return (
                  <div
                    key={mode.id}
                    ref={(el) => {
                      if (el) itemsRef.current.set(index, el);
                    }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`
                      group relative overflow-hidden rounded-2xl p-8 cursor-pointer
                      backdrop-blur-md border-2 transition-all duration-500 transform hover:scale-105
                      ${
                        selectedMode === mode.id
                          ? "bg-gray-900 border-gray-800 shadow-2xl"
                          : "bg-white/60 border-gray-300 hover:bg-white/80 hover:border-gray-400 hover:shadow-xl"
                      }
                    `}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100/0 to-gray-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`mb-6 p-5 rounded-2xl transition-all duration-300 ${
                          selectedMode === mode.id
                            ? "bg-gray-800 scale-110"
                            : "bg-gray-200 group-hover:bg-gray-300 group-hover:scale-110"
                        }`}
                      >
                        <Icon
                          className={`w-10 h-10 ${
                            selectedMode === mode.id
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-xl font-display mb-3 tracking-normal font-normal ${
                          selectedMode === mode.id
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {mode.name}
                      </h3>
                      <p
                        className={`leading-relaxed font-body mb-6 text-sm ${
                          selectedMode === mode.id
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {mode.description}
                      </p>

                      {/* Hover Button */}
                      <Link href={`/scan/${mode.id}`}>
                        <HoverButton className="w-full">
                          Explore {mode.name.replace(" Mode", "")}
                        </HoverButton>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Button - Keep for selected state */}
            {selectedMode && (
              <div className="text-center animate-fade-in">
                <Link href={`/scan/${selectedMode}`}>
                  <HoverButton className="text-lg px-12 py-6">
                    Continue to {modes.find((m) => m.id === selectedMode)?.name}
                  </HoverButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-300 mt-32 py-8 backdrop-blur-sm bg-white/80">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm tracking-wide">
            © 2026 Art Beyond Sight - Making art accessible to everyone
          </p>
        </div>
      </footer>
    </div>
  );
}
