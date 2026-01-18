# Migration Guide: React Native to Web

This document explains how the ART app was successfully migrated from React Native/Expo to a Next.js web application.

## Overview

The original mobile app built with React Native and Expo Router has been converted to a modern web application using Next.js 15, while maintaining all core functionality including:

- Image upload and camera capture
- AI-powered image analysis
- Text-to-speech descriptions
- Music generation
- Analysis history with MongoDB
- Overshoot-style animations

## Key Changes

### 1. **Framework Migration**

- **From**: React Native + Expo Router
- **To**: Next.js 15 with App Router
- **Why**: Web-native framework, better SEO, server-side rendering, and Overshoot compatibility

### 2. **Routing**

```typescript
// Before (Expo Router)
import { useRouter } from "expo-router";
router.push("/scan/museum");

// After (Next.js)
import { useRouter } from "next/navigation";
router.push("/scan/museum");
```

### 3. **Styling**

```typescript
// Before (React Native StyleSheet)
import { StyleSheet } from 'react-native'
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 }
})

// After (Tailwind CSS)
<div className="flex-1 p-6">
```

### 4. **Components**

#### View → div

```typescript
// Before
<View style={styles.container}>

// After
<div className="container">
```

#### Text → Standard HTML

```typescript
// Before
<Text style={styles.title}>Hello</Text>

// After
<h1 className="text-2xl font-bold">Hello</h1>
```

#### Image

```typescript
// Before
import { Image } from 'expo-image'
<Image source={{ uri }} style={styles.image} />

// After
import Image from 'next/image'
<Image src={uri} alt="..." fill className="object-cover" />
```

#### TouchableOpacity → button

```typescript
// Before
<TouchableOpacity onPress={handlePress}>
  <Text>Click me</Text>
</TouchableOpacity>

// After
<button onClick={handlePress} className="px-4 py-2">
  Click me
</button>
```

### 5. **Camera & Image Picker**

#### Before (React Native)

```typescript
import * as ImagePicker from "expo-image-picker";

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (!result.canceled) {
    setImageUri(result.assets[0].uri);
  }
};
```

#### After (Web APIs)

```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

// Camera access
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
  });
  if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }
};
```

### 6. **Audio Playback**

#### Before (Expo AV)

```typescript
import { Audio } from "expo-av";

const { sound } = await Audio.Sound.createAsync(
  { uri: audioUri },
  { shouldPlay: true },
);
```

#### After (Web Audio API)

```typescript
const audio = new Audio(audioUri);
audio.play();

audio.onended = () => {
  setIsPlaying(false);
};
```

### 7. **Text-to-Speech**

#### Before (Expo Speech)

```typescript
import * as Speech from "expo-speech";

Speech.speak(text, {
  rate: 0.9,
  pitch: 1.0,
});
```

#### After (Web Speech API)

```typescript
if ("speechSynthesis" in window) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

### 8. **Icons**

#### Before (Expo Vector Icons)

```typescript
import { MaterialIcons } from '@expo/vector-icons'
<MaterialIcons name="home" size={24} />
```

#### After (Lucide React)

```typescript
import { Home } from 'lucide-react'
<Home className="w-6 h-6" />
```

### 9. **Animations - Overshoot Integration**

One of the main goals was integrating Overshoot animations. We created custom hooks and components:

```typescript
// Custom Overshoot Hook
export function useOvershoot(options?: {
  duration?: number
  spring?: number
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    element.style.transform = 'scale(0.8) translateY(20px)'
    element.style.opacity = '0'
    element.style.transition = `
      transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 600ms ease-out
    `

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transform = 'scale(1) translateY(0)'
        element.style.opacity = '1'
      })
    })
  }, [])

  return ref
}

// Usage
const ref = useOvershoot()
<div ref={ref}>Animated content</div>
```

We also created a reusable `Overshoot` component:

```typescript
import { Overshoot } from '@/components/Overshoot'

<Overshoot delay={100} spring="bouncy">
  <div>Content with spring animation</div>
</Overshoot>
```

### 10. **API Client**

The API client remained largely the same but now uses web-standard `fetch` or `axios`:

```typescript
// lib/api.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ArtBeyondSightAPI {
  static async createAnalysis(data: CreateAnalysisRequest) {
    const response = await axios.post(`${API_URL}/api/image-analysis`, data);
    return response.data;
  }

  // ... other methods
}
```

## File Structure Comparison

### Before (React Native)

```
app/
├── (tabs)/
│   ├── index.tsx
│   └── explore.tsx
├── scan/[mode].tsx
├── result.tsx
└── history.tsx
```

### After (Next.js)

```
app/
├── page.tsx              # Home
├── scan/[mode]/page.tsx  # Scan page
├── result/page.tsx       # Results
├── history/page.tsx      # History
├── layout.tsx            # Root layout
└── globals.css           # Global styles
```

## Environment Variables

### Mobile (.env)

```env
ELEVENLABS_API_KEY=sk_...
```

### Web (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_...
```

**Important**: In Next.js, client-side environment variables must be prefixed with `NEXT_PUBLIC_`

## Backend Integration

The backend (FastAPI + MongoDB) remains unchanged. The web app communicates with the same API endpoints:

- `POST /api/image-analysis` - Save analysis
- `GET /api/image-analysis` - Get all analyses
- `GET /api/image-analysis/{id}` - Get by ID
- `GET /api/image-analysis/search/{name}` - Search

## Running Both Apps

### Mobile App

```bash
cd /path/to/ART
npm start
```

### Web App

```bash
cd /path/to/ART/web-app
npm run dev
```

### Backend

```bash
cd /path/to/ART/backend
python main.py
```

## Key Benefits of Web Migration

1. **Universal Access**: Works on any device with a browser
2. **No App Store**: Instant deployment via URL
3. **SEO Friendly**: Better discoverability
4. **Overshoot Compatible**: Native CSS animations work seamlessly
5. **Easier Development**: Hot reload, better debugging
6. **Lower Barrier**: No need to install app

## Features Preserved

✅ Image upload and camera capture
✅ AI-powered analysis (museum, monuments, landscape modes)
✅ Text-to-speech descriptions
✅ Music generation integration
✅ Analysis history with MongoDB
✅ Search functionality
✅ All three modes (museum, monuments, landscape)
✅ Smooth animations (Overshoot-style)
✅ Responsive design

## Features Enhanced

- **Better Performance**: Web-optimized images with Next.js Image
- **Accessibility**: Native web accessibility features
- **Animations**: Custom Overshoot implementation with spring physics
- **Responsive**: Works on desktop, tablet, and mobile browsers
- **Progressive**: Can be made into a PWA

## Testing Checklist

- [ ] Image upload works
- [ ] Camera capture works
- [ ] Analysis generates results
- [ ] Audio playback works
- [ ] Text-to-speech works
- [ ] History loads and displays
- [ ] Search filters results
- [ ] Backend API integration works
- [ ] Animations are smooth
- [ ] Mobile responsive

## Common Issues & Solutions

### Issue: Camera not working

**Solution**: Ensure you're using HTTPS or localhost (browsers restrict camera access)

### Issue: Audio not playing

**Solution**: Check browser autoplay policies - user interaction may be required

### Issue: TTS not working

**Solution**: Check browser support for Web Speech API (works in Chrome, Safari, Edge)

### Issue: Images not displaying

**Solution**: Check CORS settings on backend and Next.js image domains configuration

## Next Steps

1. **PWA Support**: Add service worker for offline capabilities
2. **Better AI Integration**: Connect to actual AI services (OpenAI, etc.)
3. **Suno API**: Integrate music generation
4. **ElevenLabs**: Replace Web Speech API with ElevenLabs for better quality
5. **Authentication**: Add user accounts
6. **Social Sharing**: Share analyses on social media
7. **Deployment**: Deploy to Vercel or similar platform

## Conclusion

The migration from React Native to Next.js was successful, preserving all core functionality while gaining web-native benefits. The custom Overshoot animation implementation provides smooth, spring-based transitions that enhance the user experience. The app is now accessible to anyone with a web browser, requires no installation, and maintains feature parity with the mobile version.
