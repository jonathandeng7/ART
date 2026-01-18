"use client";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Art Beyond Sight
              </h1>
              <p className="text-gray-400 mt-1">
                AI-powered accessibility for art and culture
              </p>
            </div>
            <nav className="flex gap-4">
              <Link
                href="/realtime-vision"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Real-Time Vision
              </Link>
              <Link
                href="/history"
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Experience
            </h2>
            <p className="text-gray-400 text-lg">
              Select a mode to begin analyzing images with AI
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
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
                    relative overflow-hidden rounded-xl p-6 cursor-pointer
                    transition-all duration-300 transform hover:scale-105
                    ${
                      selectedMode === mode.id
                        ? `${mode.color} ring-4 ring-white`
                        : "bg-gray-800/50 hover:bg-gray-800"
                    }
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-4 rounded-full bg-white/10">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {mode.name}
                    </h3>
                    <p className="text-gray-300 text-sm">{mode.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Button */}
          {selectedMode && (
            <div className="text-center animate-fade-in">
              <Link
                href={`/scan/${selectedMode}`}
                className={`
                  inline-flex items-center gap-2 px-8 py-4 rounded-lg
                  text-white font-semibold text-lg
                  ${modes.find((m) => m.id === selectedMode)?.color}
                  ${modes.find((m) => m.id === selectedMode)?.hoverColor}
                  transition-all duration-300 transform hover:scale-105
                  shadow-lg hover:shadow-xl
                `}
              >
                Continue to {modes.find((m) => m.id === selectedMode)?.name}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2026 Art Beyond Sight - Making art accessible to everyone</p>
        </div>
      </footer>
    </div>
  );
}
