/**
 * ElevenLabs Text-to-Speech Integration
 * Provides natural-sounding voice synthesis
 */

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Popular voice IDs from ElevenLabs
export const VOICES = {
  rachel: "21m00Tcm4TlvDq8ikWAM", // Calm, narration
  adam: "pNInz6obpgDQGcFmaJgB", // Deep, narrative
  bella: "EXAVITQu4vr4xnSDxMaL", // Warm, friendly
  antoni: "ErXwobaYiN019PkySvjV", // Well-rounded
  elli: "MF3mGyEYCl7XYWbV9V6O", // Emotional, expressive
  josh: "TxGEqnHWrfWFTfGW9XjX", // Young, articulate
  arnold: "VR6AewLTigWG4xSOukaG", // Crisp, authoritative
  sam: "yoZ06aMxZJJ28mfd3POQ", // Dynamic, raspy
};

export interface ElevenLabsOptions {
  voiceId?: string;
  stability?: number; // 0-1
  similarityBoost?: number; // 0-1
  style?: number; // 0-1
  useSpeakerBoost?: boolean;
}

/**
 * Convert text to speech using ElevenLabs API
 * @param text - The text to convert to speech
 * @param options - Voice and quality options
 * @returns Audio URL (blob URL)
 */
export async function textToSpeech(
  text: string,
  options: ElevenLabsOptions = {},
): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not found, falling back to browser TTS");
    throw new Error("ElevenLabs API key not configured");
  }

  const {
    voiceId = VOICES.rachel,
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0,
    useSpeakerBoost = true,
  } = options;

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `ElevenLabs API error: ${error.detail || response.statusText}`,
      );
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error("ElevenLabs TTS failed:", error);
    throw error;
  }
}

/**
 * Play text using ElevenLabs TTS
 * @param text - Text to speak
 * @param options - Voice options
 * @returns Audio element that can be controlled
 */
export async function speak(
  text: string,
  options: ElevenLabsOptions = {},
): Promise<HTMLAudioElement> {
  const audioUrl = await textToSpeech(text, options);
  const audio = new Audio(audioUrl);

  // Clean up blob URL after audio ends
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
  };

  await audio.play();
  return audio;
}

/**
 * Fallback to browser's native speech synthesis
 */
export function fallbackSpeak(
  text: string,
  options: { rate?: number; pitch?: number; volume?: number } = {},
): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    window.speechSynthesis.speak(utterance);
  }
}
