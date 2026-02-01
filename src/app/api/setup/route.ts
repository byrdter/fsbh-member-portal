import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initializeDatabase, seedDefaultUsers } from "@/lib/db";

export async function GET() {
  try {
    // Initialize database tables
    await initializeDatabase();

    // Hash passwords for default users
    const hashedPasswords = {
      admin: bcrypt.hashSync("admin123", 10),
      tiger: bcrypt.hashSync("tiger123", 10),
      maroon: bcrypt.hashSync("maroon123", 10),
      white: bcrypt.hashSync("white123", 10),
      demo: bcrypt.hashSync("demo123", 10),
    };

    // Seed default users
    await seedDefaultUsers(hashedPasswords);

    return NextResponse.json({
      success: true,
      message: "Database initialized and users seeded successfully",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
