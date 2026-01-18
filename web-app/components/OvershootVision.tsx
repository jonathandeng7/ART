"use client";

import { useEffect, useRef, useState } from "react";

interface OvershootVisionProps {
  apiKey: string;
  prompt: string;
  onResult: (result: {
    result: string;
    inference_latency_ms: number;
    total_latency_ms: number;
  }) => void;
  onError?: (error: Error) => void;
  mode?: "camera" | "image";
  className?: string;
}

export function OvershootVision({
  apiKey,
  prompt,
  onResult,
  onError,
  mode = "camera",
  className = "",
}: OvershootVisionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>("Ready");
  const visionRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Overshoot SDK
    const initOvershoot = async () => {
      try {
        const { RealtimeVision } = await import("@overshoot/sdk");

        visionRef.current = new RealtimeVision({
          apiUrl: "https://cluster1.overshoot.ai/api/v0.2",
          apiKey,
          prompt,
          source: { type: "camera", cameraFacing: "environment" },
          onResult: (result: any) => {
            setStatus("Processing...");
            onResult(result);
          },
        });

        setStatus("Initialized");
      } catch (error) {
        console.error("Failed to initialize Overshoot:", error);
        setStatus("Error initializing");
        if (onError) onError(error as Error);
      }
    };

    initOvershoot();

    return () => {
      if (visionRef.current) {
        visionRef.current.stop();
      }
    };
  }, [apiKey, prompt, onResult, onError]);

  const startVision = async () => {
    try {
      if (visionRef.current) {
        await visionRef.current.start();
        setIsActive(true);
        setStatus("Active");
      }
    } catch (error) {
      console.error("Failed to start vision:", error);
      setStatus("Error starting");
      if (onError) onError(error as Error);
    }
  };

  const stopVision = async () => {
    try {
      if (visionRef.current) {
        await visionRef.current.stop();
        setIsActive(false);
        setStatus("Stopped");
      }
    } catch (error) {
      console.error("Failed to stop vision:", error);
      if (onError) onError(error as Error);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-lg"
        />

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-white text-sm font-medium">{status}</span>
          </div>

          <button
            onClick={isActive ? stopVision : startVision}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isActive ? "Stop" : "Start"} Vision
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for using Overshoot for artwork detection
export function useOvershootVision() {
  const visionRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const initialize = async (config: {
    apiKey: string;
    videoElement?: HTMLVideoElement;
    onArtworkDetected: (detection: {
      type: "museum" | "monuments" | "landscape";
      confidence: number;
      description: string;
    }) => void;
    onResult: (result: any) => void;
  }) => {
    try {
      const { RealtimeVision } = await import("@overshoot/sdk");

      // Fixed prompt for artwork detection
      const artDetectionPrompt = `Analyze this image and determine:
1. Is there artwork visible? (painting, sculpture, monument, or landscape)
2. What type: museum artwork (painting/sculpture), historical monument/architecture, or natural landscape
3. Brief description of what you see

Respond in JSON format: {"hasArtwork": boolean, "type": "museum"|"monuments"|"landscape", "confidence": 0-100, "description": "brief description"}`;

      console.log("🔧 Initializing Overshoot SDK...");
      console.log(
        "   API Key:",
        config.apiKey ? `${config.apiKey.substring(0, 10)}...` : "MISSING",
      );
      console.log("   Model: Qwen/Qwen3-VL-30B-A3B-Instruct");
      console.log("   Source: camera (environment)");
      console.log(
        "   Video element:",
        config.videoElement ? "provided" : "not provided",
      );

      visionRef.current = new RealtimeVision({
        apiUrl: "https://cluster1.overshoot.ai/api/v0.2",
        apiKey: config.apiKey,
        model: "Qwen/Qwen3-VL-30B-A3B-Instruct",
        prompt: artDetectionPrompt,
        source: { type: "camera", cameraFacing: "environment" },
        processing: {
          clip_length_seconds: 1,
          delay_seconds: 1,
          fps: 30,
          sampling_ratio: 0.1,
        },
        outputSchema: {
          type: "object",
          properties: {
            hasArtwork: { type: "boolean" },
            type: {
              type: "string",
              enum: ["museum", "monuments", "landscape"],
            },
            confidence: { type: "number" },
            description: { type: "string" },
          },
          required: ["hasArtwork", "type", "confidence", "description"],
        },
        onResult: (result: any) => {
          console.log("📥 Raw Overshoot response:", result);
          console.log("   Result type:", typeof result.result);
          console.log(
            "   Inference latency:",
            result.inference_latency_ms,
            "ms",
          );
          console.log("   Total latency:", result.total_latency_ms, "ms");
          config.onResult(result);

          // Try to parse the result for artwork detection
          try {
            const parsed = JSON.parse(result.result);
            console.log("✅ Parsed JSON result:", parsed);
            if (parsed.hasArtwork && parsed.confidence > 70) {
              console.log("🎨 Artwork detected!", parsed);
              config.onArtworkDetected({
                type: parsed.type,
                confidence: parsed.confidence,
                description: parsed.description,
              });
            }
          } catch {
            console.log("⚠️ Non-JSON response, using keyword detection");
            // If not JSON, try to detect keywords
            const resultLower = result.result.toLowerCase();
            if (
              resultLower.includes("painting") ||
              resultLower.includes("artwork") ||
              resultLower.includes("sculpture")
            ) {
              console.log("🎨 Museum artwork detected by keyword");
              config.onArtworkDetected({
                type: "museum",
                confidence: 80,
                description: result.result,
              });
            } else if (
              resultLower.includes("monument") ||
              resultLower.includes("architecture") ||
              resultLower.includes("building")
            ) {
              console.log("🏛️ Monument detected by keyword");
              config.onArtworkDetected({
                type: "monuments",
                confidence: 80,
                description: result.result,
              });
            } else if (
              resultLower.includes("landscape") ||
              resultLower.includes("nature") ||
              resultLower.includes("scenery")
            ) {
              console.log("🌄 Landscape detected by keyword");
              config.onArtworkDetected({
                type: "landscape",
                confidence: 80,
                description: result.result,
              });
            }
          }
        },
        onError: (error: any) => {
          console.error("❌ Overshoot SDK error:", error);
          console.error("   Error type:", typeof error);
          if (error instanceof Error) {
            console.error("   Message:", error.message);
            console.error("   Stack:", error.stack);
          }
        },
      });

      setIsInitialized(true);
      console.log("✅ Overshoot initialized successfully");
      console.log("   Instance created:", !!visionRef.current);
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Overshoot:", error);
      if (error instanceof Error) {
        console.error("   Error name:", error.name);
        console.error("   Error message:", error.message);
        console.error("   Stack:", error.stack);
      }
      return false;
    }
  };

  const start = async () => {
    if (visionRef.current) {
      console.log("▶️ Starting Overshoot vision stream...");
      try {
        await visionRef.current.start();
        console.log("✅ Overshoot stream started successfully");
        console.log("   Stream should now be processing frames...");

        // Get camera stream from Overshoot
        // The SDK creates its own MediaStream, we need to access it
        setTimeout(() => {
          try {
            // Try to access the internal video element or stream
            if (visionRef.current._videoElement) {
              const stream = visionRef.current._videoElement.srcObject;
              if (stream) {
                videoStreamRef.current = stream;
                console.log("   ✅ Retrieved video stream from Overshoot");
              }
            }
          } catch (e) {
            console.log("   ⚠️ Could not access Overshoot's video stream");
          }
        }, 100);

        return videoStreamRef.current;
      } catch (error) {
        console.error("❌ Failed to start Overshoot:", error);
        throw error;
      }
    } else {
      console.error("❌ Cannot start: visionRef.current is null");
      return null;
    }
  };

  const stop = async () => {
    if (visionRef.current) {
      console.log("⏹️ Stopping Overshoot vision stream...");
      console.trace("Stop called from:"); // Show stack trace
      try {
        await visionRef.current.stop();
        console.log("✅ Overshoot stream stopped");
      } catch (error) {
        console.error("❌ Failed to stop Overshoot:", error);
      }
    }
  };

  return {
    initialize,
    start,
    stop,
    isInitialized,
    getVideoStream: () => videoStreamRef.current,
  };
}
