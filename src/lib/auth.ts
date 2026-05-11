import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        return {
          id: steamId,
          steamId,
          name: name || "Unknown",
          image: avatar || "",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.steamId = user.steamId as string
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.steamId = token.steamId as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/dashboard" },
  secret: process.env.AUTH_SECRET,
})
