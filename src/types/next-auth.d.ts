import "next-auth"

declare module "next-auth" {
  interface User {
    steamId?: string
  }
  interface Session {
    user: {
      steamId?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    steamId?: string
  }
}
