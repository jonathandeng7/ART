import { Audio } from 'expo-av';
import Constants from 'expo-constants';

// Unreal Speech API configuration
const UNREAL_SPEECH_API_KEY = Constants.expoConfig?.extra?.unrealSpeechApiKey || '';
const UNREAL_SPEECH_API_URL = 'https://api.v7.unrealspeech.com/speech';

// Voice options for Unreal Speech
export type UnrealVoice = 'Scarlett' | 'Liv' | 'Dan' | 'Will' | 'Amy' | 'Daniel';

interface UnrealSpeechOptions {
  voice?: UnrealVoice;
  bitrate?: string; // '192k', '128k', '64k', '32k'
  speed?: number; // -1.0 to 1.0
  pitch?: number; // 0.5 to 1.5
}

let currentSound: Audio.Sound | null = null;

/**
 * Generate speech using Unreal Speech API and play it
 * @param text The text to convert to speech
 * @param options Voice and audio options
 * @param onDone Callback when speech finishes
 * @param onError Callback when an error occurs
 */
export async function speakWithUnrealSpeech(
  text: string,
  options?: UnrealSpeechOptions,
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<Audio.Sound | null> {
  try {
    // Stop any currently playing speech
    await stopUnrealSpeech();

    if (!UNREAL_SPEECH_API_KEY) {
      throw new Error('Unreal Speech API key not configured');
    }

    console.log('Making Unreal Speech API request...');
    console.log('Voice:', options?.voice || 'Scarlett');
    console.log('API Key present:', !!UNREAL_SPEECH_API_KEY);

    // Make API request to Unreal Speech
    const response = await fetch(UNREAL_SPEECH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UNREAL_SPEECH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Text: text,
        VoiceId: options?.voice || 'Scarlett',
        Bitrate: options?.bitrate || '192k',
        Speed: options?.speed !== undefined ? options.speed : 0,
        Pitch: options?.pitch !== undefined ? options.pitch : 1.0,
        TimestampType: 'sentence',
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Unreal Speech API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.OutputUri) {
      throw new Error('No audio URL returned from Unreal Speech');
    }

    // Load and play the audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: data.OutputUri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.didJustFinish) {
          onDone?.();
        }
      }
    );

    currentSound = sound;
    return sound;

  } catch (error) {
    console.error('Unreal Speech error:', error);
    onError?.(error as Error);
    return null;
  }
}

/**
 * Stop currently playing Unreal Speech audio
 */
export async function stopUnrealSpeech(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch (error) {
      console.warn('Error stopping Unreal Speech:', error);
    } finally {
      currentSound = null;
    }
  }
}

/**
 * Check if Unreal Speech is currently playing
 */
export async function isUnrealSpeechPlaying(): Promise<boolean> {
  if (!currentSound) return false;
  
  try {
    const status = await currentSound.getStatusAsync();
    return status.isLoaded && status.isPlaying;
  } catch {
    return false;
  }
}
