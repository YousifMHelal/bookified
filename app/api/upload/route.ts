import { NextResponse } from "next/server";
import { handleUpload, HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";
import { MAX_FILE_SIZE } from "@/lib/constants";

const getVercelAccessToken = () => {
  const token = process.env.BOOKIFIED_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      'Missing required environment variable: BOOKIFIED_READ_WRITE_TOKEN. ' +
      'handleUpload requires a valid token to process file uploads.'
    );
  }

  return token;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const vercelAccessToken = getVercelAccessToken();
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      token: vercelAccessToken,
      body,
      request,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth();

        if (!userId) {
          throw new Error('Unauthorized: User not authenticated');
        }

        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({ userId })
        }
      }
    });

    return NextResponse.json(jsonResponse)
  } catch (e) {
    const message = e instanceof Error ? e.message : "An unknown error occurred";
    // Detect status from error object, fall back to 500
    const status = typeof (e as any)?.status === 'number' ? (e as any).status : typeof (e as any)?.statusCode === 'number' ? (e as any).statusCode : 401;
    const clientMessage = status === 401 ? 'Unauthorized' : 'Upload failed';
    console.error('Upload error', e);
    return NextResponse.json({ error: clientMessage }, { status });
  }
}
