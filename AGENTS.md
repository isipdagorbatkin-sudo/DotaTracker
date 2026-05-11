# Dota2Tracker Development Guide

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Build Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Routes
- `GET /api/dota/heroes` - All heroes
- `GET /api/dota/randomize?position=pos1` - Random hero for position
- `GET /api/dota/meta?position=all&sort=winrate` - Meta heroes
- `POST /api/dota/draft` - Draft analysis

## Vercel Deployment

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/dota2tracker.git
   git push -u origin main
   ```

2. Import repo to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. No environment variables needed (no auth, no database).

## Tech Stack
- Next.js 16 + TypeScript
- Tailwind CSS + Framer Motion
- Recharts
- OpenDota API
