"use client";

import { Camera, Home, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useOvershootVision } from "../../components/OvershootVision";
import { analyzeImage } from "../../lib/analyzeImage";

interface Detection {
  timestamp: string;
  type: "museum" | "monuments" | "landscape";
  confidence: number;
  description: string;
  analyzing?: boolean;
}

export default function RealtimeVisionPage() {
  const router = useRouter();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { initialize, start, stop, isInitialized } = useOvershootVision();

  const apiKey = process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY || "";
  const lastDetectionRef = useRef<string>("");
  const analyzingRef = useRef(false);

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const handleArtworkDetected = async (detection: {
    type: "museum" | "monuments" | "landscape";
    confidence: number;
    description: string;
  }) => {
    // Prevent duplicate analyses
    const detectionKey = `${detection.type}-${detection.description.slice(0, 50)}`;
    if (analyzingRef.current || lastDetectionRef.current === detectionKey) {
      return;
    }

    lastDetectionRef.current = detectionKey;
    analyzingRef.current = true;

    const newDetection: Detection = {
      timestamp: new Date().toLocaleTimeString(),
      ...detection,
      analyzing: true,
    };

    setDetections((prev) => [newDetection, ...prev.slice(0, 9)]);
    setIsAnalyzing(true);

    try {
      // Capture current frame
      const imageDataUrl = captureFrame();
      if (!imageDataUrl) {
        throw new Error("Failed to capture frame");
      }

      console.log(`🎨 Artwork detected! Type: ${detection.type}, analyzing...`);

      // Run full analysis pipeline
      const analysis = await analyzeImage(imageDataUrl, detection.type);

      // Navigate to results page with analysis
      const params = new URLSearchParams({
        imageUri: imageDataUrl,
        title: analysis.title,
        artist: analysis.artist,
        type: analysis.type,
        description: analysis.description,
        historicalPrompt: analysis.historicalPrompt || "",
        immersivePrompt: analysis.immersivePrompt || "",
        emotions: JSON.stringify(analysis.emotions),
        audioUri: analysis.audioUri || "",
        mode: detection.type,
      });

      router.push(`/result?${params.toString()}`);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze artwork. Please try again.");
      setDetections((prev) =>
        prev.map((d, i) => (i === 0 ? { ...d, analyzing: false } : d)),
      );
    } finally {
      setIsAnalyzing(false);
      analyzingRef.current = false;
      // Reset detection key after delay to allow re-detection
      setTimeout(() => {
        lastDetectionRef.current = "";
      }, 5000);
    }
  };

  const handleStart = async () => {
    if (!isInitialized) {
      const success = await initialize({
        apiKey,
        onArtworkDetected: handleArtworkDetected,
        onResult: (result) => {
          console.log("Overshoot scanning:", result.result);
        },
      });

      if (!success) {
        alert("Failed to initialize Overshoot. Please check your API key.");
        return;
      }
    }

    // Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access failed:", error);
      alert("Failed to access camera. Please grant camera permissions.");
      return;
    }

    await start();
    setIsActive(true);
  };

  const handleStop = async () => {
    await stop();
    setIsActive(false);

    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Real-Time Artwork Detection
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Point your camera at artwork for instant AI analysis
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Camera Feed */}
          <div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Live Camera Feed
                </h2>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                    isActive
                      ? "bg-green-500/20 text-green-300"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isActive
                    ? isAnalyzing
                      ? "Analyzing..."
                      : "Scanning"
                    : "Inactive"}
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-4">
                <button
                  onClick={isActive ? handleStop : handleStart}
                  disabled={isAnalyzing}
                  className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-400"
                      : "bg-green-500 hover:bg-green-600 text-white disabled:bg-green-400"
                  }`}
                >
                  {isActive ? (
                    <>
                      <Camera className="w-5 h-5" />
                      Stop Scanning
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Start Camera
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-300 font-semibold mb-2 text-sm">
                  📷 How it works
                </h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Point camera at artwork, monuments, or landscapes</li>
                  <li>• AI automatically detects and identifies art type</li>
                  <li>• Full analysis begins when artwork is detected</li>
                  <li>• Results open automatically with complete details</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Detections Panel */}
          <div>
            <div className="bg-gray-800 rounded-xl p-4 h-full">
              <h2 className="text-white font-semibold mb-4">
                Artwork Detections
              </h2>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {detections.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-1">
                      {isActive
                        ? "Scanning for artwork..."
                        : "Start the camera to detect artwork"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Point at paintings, sculptures, monuments, or landscapes
                    </p>
                  </div>
                ) : (
                  detections.map((detection, idx) => (
                    <div
                      key={idx}
                      className={`bg-gray-900 rounded-lg p-4 border ${
                        detection.analyzing
                          ? "border-blue-500 animate-pulse"
                          : "border-gray-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              detection.type === "museum"
                                ? "bg-purple-500/20 text-purple-300"
                                : detection.type === "monuments"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {detection.type === "museum"
                              ? "🎨 Museum"
                              : detection.type === "monuments"
                                ? "🏛️ Monument"
                                : "🌄 Landscape"}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {detection.confidence}% confident
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">
                          {detection.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {detection.description}
                      </p>
                      {detection.analyzing && (
                        <div className="flex items-center gap-2 text-blue-400 text-xs">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Running full analysis...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-300 font-semibold mb-2">
            🚀 Powered by Overshoot Real-Time Vision
          </h3>
          <p className="text-gray-300 text-sm">
            This feature uses Overshoot&apos;s real-time vision AI to
            continuously scan your camera feed for artwork, monuments, and
            landscapes. When detected, the full analysis pipeline runs
            automatically, providing historical context, descriptions, and audio
            narration. Detection happens in milliseconds with high accuracy.
          </p>
        </div>
      </main>
    </div>
  );
}
