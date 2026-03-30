import { searchBookSegments } from '@/lib/actions/book.action';
import { NextResponse } from 'next/server';

const SEARCH_BOOK_SHARED_SECRET =
  process.env.VAPI_SEARCH_BOOK_SHARED_SECRET || process.env.VAPI_SHARED_SECRET;

function isAuthorizedRequest(request: Request): boolean {
  if (!SEARCH_BOOK_SHARED_SECRET) {
    return false;
  }

  const providedSecret = request.headers.get('x-shared-secret');
  return providedSecret === SEARCH_BOOK_SHARED_SECRET;
}

// Helper function to process book search logic
async function processBookSearch(bookId: unknown, query: unknown) {
  // Validate inputs before conversion to prevent null/undefined becoming "null"/"undefined" strings
  if (bookId == null || query == null || query === '') {
    return { result: 'Missing bookId or query' };
  }

  // Convert bookId to string
  const bookIdStr = String(bookId);
  const queryStr = String(query).trim();

  // Additional validation after conversion
  if (!bookIdStr || bookIdStr === 'null' || bookIdStr === 'undefined' || !queryStr) {
    return { result: 'Missing bookId or query' };
  }

  // Execute search
  const searchResult = await searchBookSegments(bookIdStr, queryStr, 3);

  // Return results
  if (!searchResult.success || !searchResult.data?.length) {
    return { result: 'No information found about this topic in the book.' };
  }

  const combinedText = searchResult.data
    .map((segment) => (segment as { content: string }).content)
    .join('\n\n');

  return { result: combinedText };
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

// Parse tool arguments that may arrive as a JSON string or an object
function parseArgs(args: unknown): Record<string, unknown> {
  if (!args) return {};
  if (typeof args === 'string') {
    try { return JSON.parse(args); } catch { return {}; }
  }
  return args as Record<string, unknown>;
}

export async function POST(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const toolCallList = body?.message?.toolCallList || body?.message?.toolCalls;
    console.log('Vapi search-book request metadata:', {
      timestamp: new Date().toISOString(),
      hasFunctionCall: !!body?.message?.functionCall,
      toolCallCount: Array.isArray(toolCallList) ? toolCallList.length : 0,
      contentLength: request.headers.get('content-length') || 'unknown',
    });

    // Support multiple Vapi formats
    const functionCall = body?.message?.functionCall;

    // Handle single functionCall format
    if (functionCall) {
      const { name, parameters } = functionCall;
      const parsed = parseArgs(parameters);

      if (name === 'searchBook') {
        const result = await processBookSearch(parsed.bookId, parsed.query);
        return NextResponse.json(result);
      }

      return NextResponse.json({ result: `Unknown function: ${name}` });
    }

    // Handle toolCallList format (array of calls)
    if (!toolCallList || toolCallList.length === 0) {
      return NextResponse.json({
        results: [{ result: 'No tool calls found' }],
      });
    }

    const results = [];

    for (const toolCall of toolCallList) {
      const { id, function: func } = toolCall;
      const name = func?.name;
      const args = parseArgs(func?.arguments);

      if (name === 'searchBook') {
        const searchResult = await processBookSearch(args.bookId, args.query);
        results.push({ toolCallId: id, ...searchResult });
      } else {
        results.push({ toolCallId: id, result: `Unknown function: ${name}` });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Vapi search-book error:', error);
    return NextResponse.json({
      results: [{ result: 'Error processing request' }],
    });
  }
}
