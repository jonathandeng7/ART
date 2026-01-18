# Art Beyond Sight - Web Application

A web-based accessibility platform for analyzing artwork, monuments, and landscapes using AI. This app provides audio descriptions, historical context, and even generates music inspired by the artwork.

## Features

### 🎨 Museum Mode

- Analyze artwork and paintings
- Get historical context and descriptions
- AI-generated music based on the artwork's mood
- Text-to-speech descriptions with ElevenLabs integration

### 🏛️ Monuments Mode

- Explore historical monuments and landmarks
- Detailed architectural and historical context
- Accessibility-focused descriptions

### 🌄 Landscape Mode

- Discover natural landscapes
- Immersive descriptions of nature scenes
- Environmental context and details

### 🎯 Core Features

- Image upload or camera capture
- AI-powered analysis
- Text-to-speech narration (Web Speech API)
- Analysis history with search
- Beautiful animations with Overshoot
- Responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Custom Overshoot implementation
- **Icons**: Lucide React
- **Backend API**: FastAPI (Python) with MongoDB
- **AI Services**:
  - Image analysis (Navigator AI)
  - Music generation (Suno API)
  - Text-to-speech (ElevenLabs / Web Speech API)

## Setup

### Prerequisites

- Node.js 18+
- Python 3.13+
- MongoDB database

### Installation

1. **Install web dependencies:**

   ```bash
   cd web-app
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local` in the `web-app` directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key_here
   ```

3. **Set up the backend:**

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Configure backend environment:**
   Create `.env` in the `backend` directory:
   ```env
   MONGODB_PASSWORD=your_mongodb_password
   ```

### Running the Application

1. **Start the backend API:**

   ```bash
   cd backend
   python main.py
   ```

   The API will run on `http://localhost:8000`

2. **Start the web app:**

   ```bash
   cd web-app
   npm run dev
   ```

   The app will run on `http://localhost:3000`

3. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
web-app/
├── app/
│   ├── scan/[mode]/      # Image scanning and upload
│   ├── result/           # Analysis results display
│   ├── history/          # Analysis history
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/
│   ├── api.ts            # API client for backend
│   └── analyzeImage.ts   # Image analysis logic
├── hooks/
│   └── useOvershoot.ts   # Overshoot animation hooks
└── public/               # Static assets
```

## API Endpoints

### Backend (FastAPI)

- `POST /api/image-analysis` - Create/update analysis
- `GET /api/image-analysis` - Get all analyses
- `GET /api/image-analysis/{id}` - Get analysis by ID
- `GET /api/image-analysis/search/{name}` - Search analyses
- `GET /api/health` - Health check

## Features in Detail

### Image Analysis Pipeline

1. User uploads or captures image
2. Image is processed and analyzed by AI
3. Results include:
   - Title and artist identification
   - Historical context
   - Immersive description
   - Emotional tones
   - Generated music (for museum mode)
4. Analysis is saved to database
5. Results displayed with audio playback

### Accessibility Features

- Text-to-speech for all descriptions
- High contrast design
- Keyboard navigation support
- Screen reader friendly
- Audio descriptions

### Overshoot Animations

- Smooth spring-based animations
- Staggered entrance animations
- Hover effects with natural physics
- Page transitions

## Development

### Building for Production

```bash
cd web-app
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This project was built as part of a prework assignment demonstrating:

- React Native to Web migration
- Full-stack development
- AI integration
- Accessibility-first design
- Modern web technologies

## License

Private project for educational purposes.

## Acknowledgments

- OpenAI for AI capabilities
- ElevenLabs for text-to-speech
- Suno for music generation
- MongoDB for database services
