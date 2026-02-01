import { NextResponse } from "next/server";
import { addUser, findUserByEmail } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, classYear } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = addUser(email, name, password, classYear);

    return NextResponse.json({
      message: "Account created successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
