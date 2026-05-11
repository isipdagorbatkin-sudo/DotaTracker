import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

const STEAM_API_KEY = process.env.STEAM_API_KEY || "A4F39BB226A06CDE5C52C47471E00A30"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.steamId = user.steamId
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.steamId = token.steamId as string
        session.user.avatar = token.avatar as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      id: "steam",
      name: "Steam",
      credentials: {
        steamId: { label: "Steam ID", type: "text" },
        name: { label: "Name", type: "text" },
        avatar: { label: "Avatar", type: "text" },
      },
      async authorize(credentials) {
        const steamId = credentials?.steamId as string
        if (!steamId) return null

        try {
          const res = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
          )
          const data = await res.json()
          const player = data?.response?.players?.[0]
          if (!player) return null

          const user = await prisma.user.upsert({
            where: { steamId },
            create: {
              steamId,
              name: player.personaname,
              avatar: player.avatarfull,
            },
            update: {
              name: player.personaname,
              avatar: player.avatarfull,
            },
          })

          return {
            id: user.steamId,
            steamId: user.steamId,
            name: user.name,
            avatar: user.avatar || undefined,
            image: user.avatar || undefined,
          }
        } catch {
          return null
        }
      },
    }),
  ],
})
