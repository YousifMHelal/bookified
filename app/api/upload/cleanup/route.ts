import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

const getVercelAccessToken = () => {
  const token = process.env.BOOKIFIED_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing required environment variable: BOOKIFIED_READ_WRITE_TOKEN.");
  }

  return token;
};

export async function POST(request: Request) {
  try {
    const vercelAccessToken = getVercelAccessToken();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const blobKeys = Array.isArray(body?.blobKeys)
      ? body.blobKeys.filter((key: unknown): key is string => typeof key === "string" && key.length > 0)
      : [];

    if (blobKeys.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    await del(blobKeys, { token: vercelAccessToken });

    return NextResponse.json({ success: true, deleted: blobKeys.length });
  } catch (error) {
    console.error("Upload cleanup error", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
