import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type AuthToken = JWT & { role?: string };
type SessionUserWithRole = Session["user"] & { role?: string };
type AuthSession = Session & { user?: SessionUserWithRole };

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as AuthToken;
      if (user && "role" in user) {
        authToken.role = (user as { role?: string }).role;
      }
      return authToken;
    },
    async session({ session, token }) {
      const authSession = session as AuthSession;
      const authToken = token as AuthToken;
      if (authSession.user) {
        authSession.user.role = authToken.role;
      }
      return authSession;
    },
  },
  pages: { signIn: "/login" },
};