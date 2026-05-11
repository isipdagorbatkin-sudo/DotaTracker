# Dota2Tracker Development Guide

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Supabase database:
   - Go to https://supabase.com → Create project
   - Go to Project Settings → Database → Connection string
   - Copy the URI connection string

3. Configure `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:6543/postgres?pgbouncer=true"
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_REF.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   AUTH_SECRET="random-secret-32-chars-min"
   NEXTAUTH_URL="http://localhost:3000"
   STEAM_API_KEY="A4F39BB226A06CDE5C52C47471E00A30"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Build Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema to DB
- `npm run db:studio` - Open Prisma Studio

## Steam Auth
Steam OpenID login is implemented via custom API routes:
- `/api/auth/steam` - Initiates Steam login
- `/api/auth/steam/callback` - Handles Steam callback
- Uses NextAuth v5 (credentials provider) for session management
- Users are stored in Supabase (via Prisma)

## API Routes
- `GET /api/dota/heroes` - All heroes
- `GET /api/dota/randomize?position=pos1` - Random hero for position
- `GET /api/dota/meta?position=all&sort=winrate` - Meta heroes
- `POST /api/dota/draft` - Draft analysis
- `GET /api/user/stats` - User stats (auth required)
- `GET /api/user/mmr-history` - MMR history (auth required)
- `GET /api/user/fun-stats` - Fun stats (auth required)

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

3. Set environment variables in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://postgres:password@db.ref.supabase.co:6543/postgres?pgbouncer=true
   NEXT_PUBLIC_SUPABASE_URL=https://ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   AUTH_SECRET=<random-secret-string>
   NEXTAUTH_URL=https://your-domain.vercel.app
   STEAM_API_KEY=A4F39BB226A06CDE5C52C47471E00A30
   ```

4. Run migrations (in Vercel terminal or locally after deploy):
   ```bash
   npx prisma migrate deploy
   ```

5. Update NEXTAUTH_URL in Vercel:
   - Set it to your production URL: `https://your-app.vercel.app`
   - Steam OpenID uses this for the callback redirect

## How Multi-User Works

1. User clicks "Sign in via Steam" → redirected to Steam login
2. Steam redirects back with user's Steam ID
3. Server fetches Steam profile (avatar, name) via Steam API
4. User is created/updated in Supabase via Prisma
5. NextAuth creates a JWT session
6. All API routes check `auth()` to get the current user's Steam ID
7. OpenDota API is queried with the user's Steam ID for personalized stats

## Tech Stack
- Next.js 16 + TypeScript
- Tailwind CSS + Framer Motion
- Prisma 7 + Supabase PostgreSQL
- NextAuth v5 (JWT sessions)
- Recharts
- OpenDota API + Steam API
