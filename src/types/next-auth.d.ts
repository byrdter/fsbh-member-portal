import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export type UserRole = "admin" | "tiger" | "maroon" | "white";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      classYear?: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    classYear?: string;
    firstName?: string;
    lastName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    classYear?: string;
    firstName?: string;
    lastName?: string;
  }
}
