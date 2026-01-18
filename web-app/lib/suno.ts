/**
 * Suno AI Music Generation Integration
 * Generates music based on mood, genre, and description
 */

const SUNO_API_KEY = process.env.NEXT_PUBLIC_SUNO_API_KEY;
const SUNO_BASE_URL = "https://api.sunoapi.org"; // Correct Suno API base URL

export interface MusicGenerationOptions {
  prompt: string;
  style?: string;
  negativeTags?: string;
  instrumental?: boolean;
}

export interface MusicGenerationResult {
  id: string;
  audioUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
  duration?: number;
}

/**
 * Generate music using Suno AI
 * Temporarily disabled - returns mock data
 */
export async function generateMusic(
  options: MusicGenerationOptions,
): Promise<MusicGenerationResult> {
  // Temporarily disable music generation
  console.warn("⚠️ Music generation temporarily disabled");
  return {
    id: "mock-task-id",
    audioUrl: "",
    status: "completed",
  };

  /* Original implementation - re-enable when ready
  if (!SUNO_API_KEY || SUNO_API_KEY === "your-suno-api-key-here") {
    console.warn("Suno API key not configured.");
    throw new Error("Suno API key not configured");
  }

  const {
    prompt,
    style = "Classical",
    negativeTags = "Heavy Metal, Upbeat Drums, Rock",
    instrumental = true,
  } = options;

  try {
    const response = await fetch(`${SUNO_BASE_URL}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUNO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        customMode: false,
        instrumental,
        style,
        negativeTags,
        model: "V4_5",
        audioWeight: 0.65,
        callBackUrl:
          "https://webhook.site/#!/view/00000000-0000-0000-0000-000000000000",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.code !== 200) {
      throw new Error(`Suno API Error (${result.code}): ${result.msg}`);
    }

    const taskId = result.data?.taskId;
    if (!taskId) {
      throw new Error("No taskId returned");
    }

    const audioUrl = await pollMusicGeneration(taskId);

    return {
      id: taskId,
      audioUrl: audioUrl || "",
      status: "completed",
      duration: result.duration,
    };
  } catch (error) {
    console.error("Suno music generation failed:", error);
    throw error;
  }
  */
}

/**
 * Poll for music generation completion
 */
/*
async function pollMusicGeneration(
  id: string,
  maxAttempts: number = 60,
): Promise<MusicGenerationResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

    try {
      const response = await fetch(`${SUNO_BASE_URL}/generate/${id}`, {
        headers: {
          Authorization: `Bearer ${SUNO_API_KEY}`,
        },
      });

      if (!response.ok) continue;

      const result = await response.json();

      if (result.status === "completed") {
        return {
          id: result.id,
          audioUrl: result.audio_url || result.url,
          status: "completed",
          duration: result.duration,
        };
      }

      if (result.status === "failed") {
        throw new Error("Music generation failed");
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
    }
  }

  throw new Error("Music generation timeout");
}
*/

/**
 * Generate music prompt from artwork analysis
 */
export function createMusicPrompt(
  title: string,
  emotions: string[],
  genre?: string,
): string {
  const emotionText = emotions.join(", ");
  return `Create an ${genre || "ambient"} instrumental piece that evokes ${emotionText} feelings, inspired by ${title}. The music should be contemplative and immersive.`;
}
