'use server';

import BookSegment from "@/database/models/book-segment.model";
import Book from "@/database/models/book.model";
import { connectToDatabase } from "@/database/mongoose";
import { escapeRegex, generateSlug, serializeData } from "@/lib/utils";
import { CreateBook, TextSegment } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import mongoose from "mongoose";
import { getUserPlan } from "../subscription/server";
import PendingUpload from "@/database/models/pending-upload.model";

const BLOB_TOKEN = process.env.BOOKIFIED_READ_WRITE_TOKEN;

const deleteBlobs = async (blobKeys: string[]) => {
  const uniqueBlobKeys = [...new Set(blobKeys.filter((key) => typeof key === 'string' && key.length > 0))];

  if (uniqueBlobKeys.length === 0) {
    return;
  }

  if (!BLOB_TOKEN) {
    throw new Error('Missing required BOOKIFIED_READ_WRITE_TOKEN for blob cleanup.');
  }

  try {
    await del(uniqueBlobKeys, { token: BLOB_TOKEN });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to cleanup blobs during rollback: ${message}`);
  }
};

export const registerPendingUpload = async (blobKey: string) => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!blobKey || typeof blobKey !== 'string') {
      return { success: false, error: 'Invalid blob key' };
    }

    await PendingUpload.findOneAndUpdate(
      { clerkId: userId, blobKey },
      { clerkId: userId, blobKey },
      { upsert: true, new: true },
    );

    return { success: true };
  } catch (e) {
    console.error('Error registering pending upload', e);
    return { success: false, error: e };
  }
};

export const getAllBooks = async (search?: string) => {
  try {
    await connectToDatabase();

    let query = {};
    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
      const escapedSearch = escapeRegex(normalizedSearch);
      const regex = new RegExp(escapedSearch, 'i');
      query = {
        $or: [
          { title: { $regex: regex } },
          { author: { $regex: regex } },
        ]
      };
    }

    const books = await Book.find(query).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books)
    }
  } catch (e) {
    console.error('Error connecting to database', e);
    return {
      success: false, error: e
    }
  }
}

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook)
      }
    }

    return {
      exists: false,
    }
  } catch (e) {
    console.error('Error checking book exists', e);
    return {
      exists: false, error: e
    }
  }
}

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();

    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      }
    }

    const { PLAN_LIMITS } = await import("@/lib/subscription-constants");
    const { userId } = await auth();

    if (!userId || userId !== data.clerkId) {
      return { success: false, error: "Unauthorized" };
    }

    const plan = await getUserPlan();
    const limits = PLAN_LIMITS[plan];

    const bookCount = await Book.countDocuments({ clerkId: userId });

    if (bookCount >= limits.maxBooks) {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");

      return {
        success: false,
        error: `You have reached the maximum number of books allowed for your ${plan} plan (${limits.maxBooks}). Please upgrade to add more books.`,
        isBillingError: true,
      };
    }

    const book = await Book.create({ ...data, clerkId: userId, slug, totalSegments: 0 });

    return {
      success: true,
      data: serializeData(book),
    }
  } catch (e) {
    console.error('Error creating a book', e);

    return {
      success: false,
      error: e,
    }
  }
}

export const getBookBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const book = await Book.findOne({ slug }).lean();

    if (!book) {
      return { success: false, error: 'Book not found' };
    }

    return {
      success: true,
      data: serializeData(book)
    }
  } catch (e) {
    console.error('Error fetching book by slug', e);
    return {
      success: false, error: e
    }
  }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
  return saveBookSegmentsChunk(bookId, clerkId, segments, segments.length);
}

export const saveBookSegmentsChunk = async (
  bookId: string,
  clerkId: string,
  segments: TextSegment[],
  totalSegments?: number,
) => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId || userId !== clerkId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (segments.length === 0) {
      return { success: true, data: { segmentsCreated: 0 } };
    }

    const bookObjectId = new mongoose.Types.ObjectId(bookId);
    const ownedBook = await Book.findOne({ _id: bookObjectId, clerkId: userId })
      .select('_id')
      .lean();

    if (!ownedBook) {
      return { success: false, error: 'Unauthorized' };
    }

    const bulkOperations = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
      updateOne: {
        filter: { clerkId: userId, bookId: bookObjectId, segmentIndex },
        update: {
          $set: {
            clerkId: userId,
            bookId: bookObjectId,
            content: text,
            segmentIndex,
            pageNumber,
            wordCount,
          },
        },
        upsert: true,
      },
    }));

    await BookSegment.bulkWrite(bulkOperations, { ordered: false });

    const finalTotalSegments =
      typeof totalSegments === 'number'
        ? totalSegments
        : await BookSegment.countDocuments({ clerkId: userId, bookId: bookObjectId });

    await Book.findByIdAndUpdate(bookId, { totalSegments: finalTotalSegments });

    return {
      success: true,
      data: { segmentsCreated: segments.length },
    }
  } catch (e) {
    console.error('Error saving book segments chunk', e);

    return {
      success: false,
      error: e,
    }
  }
}

export const rollbackBookCreation = async (
  bookId: string,
) => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const book = await Book.findById(bookId).lean();
    if (!book) {
      return { success: false, error: 'Book not found for rollback.' };
    }

    if (book.clerkId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await BookSegment.deleteMany({ bookId: book._id, clerkId: userId });
    await PendingUpload.deleteMany({ clerkId: userId, blobKey: { $in: [book.fileBlobKey, book.coverBlobKey].filter(Boolean) } });
    await Book.findByIdAndDelete(book._id);

    await deleteBlobs([
      book.fileBlobKey,
      book.coverBlobKey ?? '',
    ]);

    return { success: true };
  } catch (e) {
    console.error('Error rolling back book creation', e);

    return {
      success: false,
      error: e,
    }
  }
}

export const cleanupUploadedBlobs = async (blobKeys: string[]) => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const normalizedBlobKeys = [...new Set(blobKeys.filter((key) => typeof key === 'string' && key.length > 0))];

    if (normalizedBlobKeys.length === 0) {
      return { success: true };
    }

    const pendingUploads = await PendingUpload.find({
      clerkId: userId,
      blobKey: { $in: normalizedBlobKeys },
    })
      .select('blobKey')
      .lean();

    const verifiedBlobKeys = pendingUploads
      .map((upload) => upload.blobKey)
      .filter((key): key is string => typeof key === 'string' && key.length > 0);

    if (verifiedBlobKeys.length !== normalizedBlobKeys.length) {
      return { success: false, error: 'Unauthorized blob cleanup request.' };
    }

    await deleteBlobs(verifiedBlobKeys);
    await PendingUpload.deleteMany({ clerkId: userId, blobKey: { $in: verifiedBlobKeys } });

    return { success: true };
  } catch (e) {
    console.error('Error cleaning uploaded blobs', e);

    return {
      success: false,
      error: e,
    }
  }
}

// Searches book segments using MongoDB text search with regex fallback
export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
  try {
    await connectToDatabase();

    console.log(`Searching for: "${query}" in book ${bookId}`);

    const bookObjectId = new mongoose.Types.ObjectId(bookId);

    // Try MongoDB text search first (requires text index)
    let segments: Record<string, unknown>[] = [];
    try {
      segments = await BookSegment.find({
        bookId: bookObjectId,
        $text: { $search: query },
      })
        .select('_id bookId content segmentIndex pageNumber wordCount')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();
    } catch {
      // Text index may not exist — fall through to regex fallback
      segments = [];
    }

    // Fallback: regex search matching ANY keyword
    if (segments.length === 0) {
      const keywords = query.split(/\s+/).filter((k) => k.length > 2);
      const pattern = keywords.map(escapeRegex).join('|');

      segments = await BookSegment.find({
        bookId: bookObjectId,
        content: { $regex: pattern, $options: 'i' },
      })
        .select('_id bookId content segmentIndex pageNumber wordCount')
        .sort({ segmentIndex: 1 })
        .limit(limit)
        .lean();
    }

    console.log(`Search complete. Found ${segments.length} results`);

    return {
      success: true,
      data: serializeData(segments),
    };
  } catch (error) {
    console.error('Error searching segments:', error);
    return {
      success: false,
      error: (error as Error).message,
      data: [],
    };
  }
};
