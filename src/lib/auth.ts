import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "./db";
import { UserRole } from "@/types/next-auth";

export const authOptions: NextAuthOptions = {
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

        const user = await findUserByEmail(credentials.email);

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          classYear: user.class_year,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.classYear = user.classYear;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.classYear = token.classYear;
      }
      return session;
    },
  },
};

// Helper to add new users (for registration)
export async function addUser(
  email: string,
  name: string,
  password: string,
  role: UserRole = "white",
  classYear?: string
) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await createUser(email, name, hashedPassword, role, classYear);
  return { id: String(newUser.id), email: newUser.email, name: newUser.name, role: newUser.role };
}
