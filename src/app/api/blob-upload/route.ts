import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured.' }, { status: 503 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const lower = pathname.toLowerCase();
        const extension = ALLOWED_EXTENSIONS.find((item) => lower.endsWith(item));
        if (!extension) throw new Error('Only PDF, JPG, JPEG, and PNG files are allowed.');

        const payload = clientPayload ? JSON.parse(clientPayload) as { contentType?: string; size?: number } : {};
        const contentType = payload.contentType || (
          extension === '.pdf' ? 'application/pdf' :
          extension === '.png' ? 'image/png' : 'image/jpeg'
        );
        const size = Number(payload.size || 0);

        if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
          throw new Error('Unsupported file type.');
        }
        if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) {
          throw new Error('Files must be between 1 byte and 50 MB.');
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ size, contentType }),
        };
      },
      onUploadCompleted: async () => {
        // Database finalization happens in /api/upload after the browser
        // receives the Blob URL, so a failed database write can be retried.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not prepare upload.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
