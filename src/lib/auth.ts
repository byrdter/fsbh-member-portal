import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserRole } from "@/types/next-auth";

// User type with role
interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  classYear?: string;
}

// In production, this would be a database
// For now, we'll use a simple in-memory store
const users: StoredUser[] = [
  {
    id: "1",
    email: "admin@fsbhtiger.com",
    name: "Admin User",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin",
  },
  {
    id: "2",
    email: "tiger@fsbhtiger.com",
    name: "Tiger Member",
    password: bcrypt.hashSync("tiger123", 10),
    role: "tiger",
    classYear: "1965",
  },
  {
    id: "3",
    email: "maroon@fsbhtiger.com",
    name: "Maroon Member",
    password: bcrypt.hashSync("maroon123", 10),
    role: "maroon",
    classYear: "1960",
  },
  {
    id: "4",
    email: "white@fsbhtiger.com",
    name: "White Member",
    password: bcrypt.hashSync("white123", 10),
    role: "white",
    classYear: "1955",
  },
  {
    id: "5",
    email: "demo@fsbhtiger.com",
    name: "Demo Member",
    password: bcrypt.hashSync("demo123", 10),
    role: "tiger", // Demo user has full access
    classYear: "1965",
  },
];

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

        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          classYear: user.classYear,
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
export function addUser(
  email: string,
  name: string,
  password: string,
  role: UserRole = "white", // New users start as white (lowest tier)
  classYear?: string
) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: StoredUser = {
    id: String(users.length + 1),
    email,
    name,
    password: hashedPassword,
    role,
    classYear,
  };
  users.push(newUser);
  return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
}

export function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}

// Get all users (for admin)
export function getAllUsers() {
  return users.map(({ password, ...user }) => user);
}

// Update user role (admin only)
export function updateUserRole(userId: string, newRole: UserRole) {
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.role = newRole;
    return true;
  }
  return false;
}
