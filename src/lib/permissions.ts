import { UserRole } from "@/types/next-auth";

// Permission definitions for each role
// Admin: Full access to everything including system management
// Tiger: Full access to all archives
// Maroon: Access to everything except Yearbooks
// White: Same as Maroon (subject to future changes)

export type Permission =
  | "view:yearbooks"
  | "view:photos"
  | "view:history"
  | "view:dashboard"
  | "admin:users"
  | "admin:content"
  | "admin:system";

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "view:yearbooks",
    "view:photos",
    "view:history",
    "view:dashboard",
    "admin:users",
    "admin:content",
    "admin:system",
  ],
  tiger: [
    "view:yearbooks",
    "view:photos",
    "view:history",
    "view:dashboard",
  ],
  maroon: [
    "view:photos",
    "view:history",
    "view:dashboard",
  ],
  white: [
    "view:history",
    "view:dashboard",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canAccessYearbooks(role: UserRole | undefined): boolean {
  return hasPermission(role, "view:yearbooks");
}

export function canAccessPhotos(role: UserRole | undefined): boolean {
  return hasPermission(role, "view:photos");
}

export function canAccessHistory(role: UserRole | undefined): boolean {
  return hasPermission(role, "view:history");
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "admin";
}

export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "tiger":
      return "bg-orange-100 text-orange-800";
    case "maroon":
      return "bg-red-100 text-red-800";
    case "white":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "tiger":
      return "Tiger";
    case "maroon":
      return "Maroon";
    case "white":
      return "White";
    default:
      return role;
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Full access to all content and system administration";
    case "tiger":
      return "Full access to all archives including yearbooks";
    case "maroon":
      return "Access to photos, history, and community content";
    case "white":
      return "Access to history and community content";
    default:
      return "";
  }
}
