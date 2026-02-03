import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json({
        error: "No BLOB_READ_WRITE_TOKEN found",
        envKeys: Object.keys(process.env).filter(k => k.includes("BLOB")),
      });
    }

    // Try a simple upload
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const blob = await put("test-file.txt", testContent, {
      access: "public",
      token: token,
    });

    return NextResponse.json({
      success: true,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + "...",
      blobUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
