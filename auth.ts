import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { authConfig } from './auth.config'
import prisma from '@/lib/prisma'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})
