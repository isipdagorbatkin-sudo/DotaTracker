import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

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
        const name = credentials?.name as string
        const avatar = credentials?.avatar as string
        if (!steamId) return null

        try {
          await prisma.user.upsert({
            where: { steamId },
            create: { steamId, name, avatar },
            update: { name, avatar },
          }).catch(() => {})
        } catch {}

        return {
          id: steamId,
          steamId,
          name: name || "Unknown Player",
          avatar: avatar || undefined,
          image: avatar || undefined,
        }
      },
    }),
  ],
})
