import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "amir03115794492@gmail.com";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = credentials.email.trim().toLowerCase();
        // Rate-limit-style guard: look up user
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          // Generic error (no enumeration)
          return null;
        }
        if (user.banned) {
          return null;
        }
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          // log failed login attempt
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN_FAILED",
              details: "Invalid password",
            },
          }).catch(() => null);
          return null;
        }
        // Determine role: admin if email matches OR role field is ADMIN
        const isAdmin = user.role === "ADMIN" || email === ADMIN_EMAIL;
        // ensure admin role persisted
        if (isAdmin && user.role !== "ADMIN") {
          await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } }).catch(() => null);
        }
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN_SUCCESS",
            details: isAdmin ? "admin" : "user",
          },
        }).catch(() => null);
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          role: isAdmin ? "ADMIN" : "USER",
          country: user.country ?? "",
          city: user.city ?? "",
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
        token.country = (user as any).country ?? "";
        token.city = (user as any).city ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).country = token.country;
        (session.user as any).city = token.city;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
