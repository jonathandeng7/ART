# 🎯 Quick Reference Card

## Start Everything

```bash
# Terminal 1: Backend
cd backend && python main.py

# Terminal 2: Web App
cd web-app && npm run dev
```

## URLs

- 🌐 Web App: http://localhost:3000
- 🔌 Backend API: http://localhost:8000
- 📖 API Docs: http://localhost:8000/docs

## Environment Setup

**backend/.env:**

```env
MONGODB_PASSWORD=your_password
```

**web-app/.env.local:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OVERSHOOT_API_KEY=your_overshoot_key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Test Commands

```bash
# Backend health check
curl http://localhost:8000/api/health

# Create test analysis
curl -X POST http://localhost:8000/api/image-analysis \
  -H "Content-Type: application/json" \
  -d '{"image_name":"Test","analysis_type":"museum","descriptions":["test"],"metadata":{}}'

# Web app build
cd web-app && npm run build
```

## Pages

| URL                | Purpose                    |
| ------------------ | -------------------------- |
| `/`                | Home - Select mode         |
| `/scan/museum`     | Upload & analyze artwork   |
| `/scan/monuments`  | Upload & analyze landmarks |
| `/scan/landscape`  | Upload & analyze nature    |
| `/result?...`      | View analysis results      |
| `/history`         | Browse past analyses       |
| `/realtime-vision` | Overshoot live demo        |

## Common Issues

**Backend error on start:**

```bash
# Solution: Lazy MongoDB connection already fixed
python main.py  # Should work now
```

**Web build fails:**

```bash
rm -rf node_modules .next
npm install
npm run build
```

**Camera not working:**

- Grant permissions in browser settings
- Use HTTPS in production
- Check Overshoot API key

## Overshoot Quick Start

```typescript
// Install
npm install @ovrsea/overshoot

// Use
import { RealtimeVision } from '@ovrsea/overshoot'

const vision = new RealtimeVision({
  apiUrl: 'https://cluster1.overshoot.ai/api/v0.2',
  apiKey: process.env.NEXT_PUBLIC_OVERSHOOT_API_KEY,
  prompt: 'Describe what you see',
  onResult: (result) => console.log(result.result)
})

await vision.start()
```

## API Quick Reference

```typescript
import { ArtBeyondSightAPI } from '@/lib/api'

// Create
await ArtBeyondSightAPI.createAnalysis({...})

// Read all
const all = await ArtBeyondSightAPI.getAllAnalyses()

// Read one
const one = await ArtBeyondSightAPI.getAnalysisById(id)

// Search
const results = await ArtBeyondSightAPI.searchAnalysesByName('starry')
```

## File Structure

```
web-app/
├── app/
│   ├── page.tsx                    # Home
│   ├── scan/[mode]/page.tsx       # Scan
│   ├── result/page.tsx            # Results
│   ├── history/page.tsx           # History
│   └── realtime-vision/page.tsx   # Overshoot
├── lib/
│   ├── api.ts                     # API client
│   └── analyzeImage.ts            # Analysis logic
└── components/
    └── OvershootVision.tsx        # Overshoot component
```

## Deployment

```bash
# Vercel (Frontend)
cd web-app && vercel

# Railway (Backend)
# 1. Push to GitHub
# 2. Connect repo to Railway
# 3. Set env vars
# 4. Deploy
```

## Status Check

✅ Backend API working
✅ Web app builds successfully
✅ Overshoot SDK integrated
✅ MongoDB connection fixed
✅ All pages created
✅ Documentation complete

## Get Help

- **Backend issues**: Check `backend/main.py` logs
- **Frontend issues**: Check browser console
- **API issues**: Visit http://localhost:8000/docs
- **Overshoot**: See OVERSHOOT_INTEGRATION.md
- **Testing**: See TESTING_CHECKLIST.md
