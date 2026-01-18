// Real-time image analysis using Navigator API and Suno
// This integrates with your existing backend pipeline

import { analyzeArtwork } from "./navigator";
import { generateMusic } from "./suno";

export interface AnalyzeImageResult {
  imageUri: string;
  title: string;
  artist: string;
  type: string;
  description: string;
  historicalPrompt?: string;
  immersivePrompt?: string;
  emotions: string[];
  audioUri: string | null;
  analysisId?: string;
}

export async function analyzeImage(
  imageDataUrl: string,
  mode: "museum" | "monuments" | "landscape",
): Promise<AnalyzeImageResult> {
  console.log(`🎯 Starting ${mode} analysis...`);

  try {
    if (mode === "museum") {
      return await analyzeMuseumMode(imageDataUrl);
    } else if (mode === "monuments") {
      return await analyzeMonumentsMode(imageDataUrl);
    } else if (mode === "landscape") {
      return await analyzeLandscapeMode(imageDataUrl);
    } else {
      throw new Error(`Unsupported mode: ${mode}`);
    }
  } catch (error) {
    console.error(`❌ Analysis failed for ${mode} mode:`, error);
    throw error;
  }
}

async function analyzeMuseumMode(
  imageDataUrl: string,
): Promise<AnalyzeImageResult> {
  console.log("🎨 Museum Mode: Starting Navigator AI analysis...");

  try {
    // Step 1: Analyze artwork with Navigator API
    const analysis = await analyzeArtwork(imageDataUrl, "museum");

    console.log("✅ Navigator analysis complete:", analysis.title);

    // Step 2: Generate music with Suno (in parallel, optional)
    let audioUri: string | null = null;
    try {
      console.log("🎵 Generating music with Suno...");
      const musicPrompt = `Create an ambient classical instrumental piece that evokes ${analysis.emotions.join(", ")} feelings, inspired by ${analysis.title}. The music should be contemplative and immersive.`;

      const musicResult = await generateMusic({
        prompt: musicPrompt,
        style: "Classical",
        negativeTags: "Heavy Metal, Upbeat Drums, Rock",
        instrumental: true,
      });

      audioUri = musicResult.audioUrl;
      console.log("✅ Music generated successfully");
    } catch (musicError) {
      console.warn(
        "Music generation failed (continuing without music):",
        musicError,
      );
      // Continue without music - not critical
    }

    const result: AnalyzeImageResult = {
      imageUri: imageDataUrl,
      title: analysis.title,
      artist: analysis.artist,
      type: analysis.type,
      description: analysis.description,
      historicalPrompt: analysis.historicalContext || analysis.description,
      immersivePrompt:
        analysis.styleAnalysis ||
        `Imagine standing before ${analysis.title}, taking in every detail of this ${analysis.type.toLowerCase()}. ${analysis.description}`,
      emotions: analysis.emotions,
      audioUri,
    };

    return result;
  } catch (error) {
    console.error("Navigator AI analysis failed:", error);
    // Fallback to placeholder
    return {
      imageUri: imageDataUrl,
      title: "Artwork Analysis",
      artist: "Unknown Artist",
      type: "Painting",
      description:
        "This artwork displays remarkable composition and technique.",
      historicalPrompt:
        "Created during a pivotal period in art history, this piece reflects the cultural and social dynamics of its time.",
      immersivePrompt:
        "Imagine standing before this masterpiece, feeling the energy and emotion that the artist poured into every brushstroke.",
      emotions: ["contemplative", "serene", "powerful"],
      audioUri: null,
    };
  }
}

async function analyzeMonumentsMode(
  imageDataUrl: string,
): Promise<AnalyzeImageResult> {
  console.log("🏛️ Monuments Mode: Starting Navigator AI analysis...");

  try {
    const analysis = await analyzeArtwork(imageDataUrl, "monuments");

    return {
      imageUri: imageDataUrl,
      title: analysis.title,
      artist: analysis.artist,
      type: analysis.type,
      description: analysis.description,
      historicalPrompt: analysis.historicalContext || analysis.description,
      emotions: analysis.emotions,
      audioUri: null,
    };
  } catch (error) {
    console.error("Navigator AI analysis failed:", error);
    return {
      imageUri: imageDataUrl,
      title: "Historical Monument",
      artist: "Architect Unknown",
      type: "Architecture",
      description:
        "This monument stands as a testament to human ingenuity and cultural heritage.",
      emotions: ["majestic", "historical", "inspiring"],
      audioUri: null,
    };
  }
}

async function analyzeLandscapeMode(
  imageDataUrl: string,
): Promise<AnalyzeImageResult> {
  console.log("🌄 Landscape Mode: Starting Navigator AI analysis...");

  try {
    const analysis = await analyzeArtwork(imageDataUrl, "landscape");

    return {
      imageUri: imageDataUrl,
      title: analysis.title,
      artist: analysis.artist,
      type: analysis.type,
      description: analysis.description,
      emotions: analysis.emotions,
      audioUri: null,
    };
  } catch (error) {
    console.error("Navigator AI analysis failed:", error);
    return {
      imageUri: imageDataUrl,
      title: "Natural Landscape",
      artist: "Nature",
      type: "Landscape",
      description:
        "A breathtaking natural scene showcasing the beauty of our planet.",
      emotions: ["peaceful", "vast", "awe-inspiring"],
      audioUri: null,
    };
  }
}

export function extractEmotions(text: string): string[] {
  // Simple emotion extraction (you can enhance this with NLP)
  const emotionKeywords: Record<string, string[]> = {
    joy: ["happy", "joyful", "cheerful", "delightful"],
    sadness: ["sad", "melancholy", "somber", "mournful"],
    calm: ["peaceful", "serene", "tranquil", "calm"],
    power: ["powerful", "strong", "bold", "intense"],
    mystery: ["mysterious", "enigmatic", "cryptic"],
  };

  const foundEmotions: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      foundEmotions.push(emotion);
    }
  }

  return foundEmotions.length > 0 ? foundEmotions : ["neutral"];
}
