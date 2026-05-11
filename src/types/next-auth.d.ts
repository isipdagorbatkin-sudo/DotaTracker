import "next-auth"

declare module "next-auth" {
  interface User {
    steamId?: string
    avatar?: string
  }

  interface Session {
    user: {
      steamId?: string
      avatar?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    steamId?: string
    accessToken?: string
  }
}
