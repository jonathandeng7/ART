import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { AccessibilityInfo, Platform } from 'react-native';

const SETTINGS_KEY = '@app_accessibility_settings';

type TTSSettings = {
  rate: number;
  pitch: number;
  syncWithVoiceOver?: boolean;
};

let isScreenReaderEnabled = false;
let isTTSEnabled = true; // Controls in-app TTS
let syncWithVoiceOver = false; // Whether to mirror VoiceOver defaults
let defaultTTSSettings: TTSSettings = {
  rate: 0.6,
  pitch: 2.0,
};

const VOICEOVER_DEFAULTS = {
  rate: 0.6,
  pitch: 2.0,
};

// Cache available voices
let cachedVoices: Speech.Voice[] = [];

/**
 * AccessibilityService
 * Unified VoiceOver/TalkBack, TTS, and haptics control.
 * 
 * - Uses VoiceOver announcements when enabled
 * - Uses custom TTS when VoiceOver is off
 * - Auto-selects premium voices when available
 * - Supports persistent user settings and audio mixing
 */

async function init() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      defaultTTSSettings.rate = parsed.rate ?? defaultTTSSettings.rate;
      defaultTTSSettings.pitch = parsed.pitch ?? defaultTTSSettings.pitch;
      isTTSEnabled = parsed.ttsEnabled ?? true;
      syncWithVoiceOver = parsed.syncWithVoiceOver ?? false;
    }
  } catch (e) {
    console.warn('Accessibility init: failed to load settings', e);
  }

  try {
    const enabled = await AccessibilityInfo.isScreenReaderEnabled();
    isScreenReaderEnabled = enabled;

    if (enabled && syncWithVoiceOver) {
      defaultTTSSettings = { ...VOICEOVER_DEFAULTS };
    }
  } catch {
    isScreenReaderEnabled = false;
  }

  try {
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled: boolean) => {
      isScreenReaderEnabled = enabled;

      if (enabled && syncWithVoiceOver) {
        defaultTTSSettings = { ...VOICEOVER_DEFAULTS };
      }
    });
  } catch {
    // Ignore for RN version differences
  }
}

function getScreenReaderEnabled() {
  return isScreenReaderEnabled;
}

function getTTSEnabled() {
  return isTTSEnabled;
}

function getSyncWithVoiceOver() {
  return syncWithVoiceOver;
}

function setDefaultSpeechSettings(settings: Partial<TTSSettings>) {
  if (settings.rate !== undefined) defaultTTSSettings.rate = settings.rate;
  if (settings.pitch !== undefined) defaultTTSSettings.pitch = settings.pitch;
}

async function getAvailableVoices(preferredLang = 'en-US') {
  try {
    if (cachedVoices.length === 0) {
      cachedVoices = await Speech.getAvailableVoicesAsync();
      console.log(
        'Available voices:',
        cachedVoices.map(v => ({
          name: v.name,
          id: v.identifier,
          lang: v.language,
          quality: v.quality,
        }))
      );
    }

    // Return null to use system default voice
    return null;
  } catch (e) {
    console.warn('getAvailableVoices error', e);
    return null;
  }
}

async function speak(text: string, options?: Partial<Speech.SpeechOptions>) {
  if (!isTTSEnabled) return;

  try {
    try {
      if (Platform.OS === 'ios' && isScreenReaderEnabled) {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } else if (Platform.OS === 'android') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (audioErr) {
      console.warn('TTS: failed to set audio mode', audioErr);
    }

    await Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      pitch: options?.pitch ?? defaultTTSSettings.pitch,
      rate: options?.rate ?? defaultTTSSettings.rate,
      ...options,
    });

    console.log('Speaking with default system voice');
  } catch (err) {
    console.warn('TTS speak error', err);
    try {
      await Speech.stop();
      Speech.speak(text);
    } catch {}
  }
}

function announceForAccessibility(text: string) {
  try {
    AccessibilityInfo.announceForAccessibility(text);
  } catch (e) {
    console.warn('announceForAccessibility error', e);
  }
}

function announceOrSpeak(text: string, speakOptions?: Partial<Speech.SpeechOptions>) {
  if (isScreenReaderEnabled) {
    announceForAccessibility(text);
  } else if (isTTSEnabled) {
    speak(text, speakOptions);
  }
}

async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    const mapping: any = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(mapping[style]);
  } catch (e) {
    console.warn('hapticImpact error', e);
  }
}

async function saveSettings(rate: number, pitch: number, ttsEnabled = true, sync = false) {
  try {
    const payload = { rate, pitch, ttsEnabled, syncWithVoiceOver: sync };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    setDefaultSpeechSettings({ rate, pitch });
    isTTSEnabled = ttsEnabled;
    syncWithVoiceOver = sync;

    if (sync && isScreenReaderEnabled) {
      defaultTTSSettings = { ...VOICEOVER_DEFAULTS };
    }
  } catch (e) {
    console.warn('saveSettings error', e);
  }
}

async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getVoiceOverDefaults() {
  return { ...VOICEOVER_DEFAULTS };
}

export default {
  init,
  getScreenReaderEnabled,
  getTTSEnabled,
  getSyncWithVoiceOver,
  setDefaultSpeechSettings,
  speak,
  announceForAccessibility,
  announceOrSpeak,
  hapticImpact,
  saveSettings,
  loadSettings,
  getVoiceOverDefaults,
  getAvailableVoices,
};

export {
  announceForAccessibility,
  announceOrSpeak, getAvailableVoices, getScreenReaderEnabled,
  getSyncWithVoiceOver,
  getTTSEnabled,
  getVoiceOverDefaults,
  hapticImpact,
  init as initAccessibility,
  loadSettings,
  saveSettings,
  setDefaultSpeechSettings,
  SETTINGS_KEY,
  speak
};

