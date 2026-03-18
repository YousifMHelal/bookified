'use server'

import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

type ErrorWithCode = {
  code?: string;
  message?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
}

const getBookifiedErrorMessage = (error: unknown): string => {
  const errorCode = (error as ErrorWithCode)?.code;
  const message = getErrorMessage(error);

  if (
    errorCode === 'ECONNREFUSED'
    || errorCode === 'ENOTFOUND'
    || /querySrv|mongodb\._tcp|Server selection timed out/i.test(message)
  ) {
    return 'Unable to reach MongoDB. Check your internet/DNS and verify MONGODB_URI uses valid Atlas hosts.';
  }

  return message;
}

export const getAllBooks = async () => {
  try {
    await connectToDatabase();
    const books = await Book.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books)
    }
  } catch (error) {
    console.error(  'Error fetching books:', error);
    return {
      success: false, error: error
    }
  }
}

export const checkBookExists = async (title: string) => {
  try {
    await connectToDatabase()

    const slug = generateSlug(title)
    const existingBook = await Book.findOne({ slug }).lean();
    if (existingBook) {
      return {
        exists: true,
        book: serializeData(existingBook)
      }
    }

    return {
      exists: false
    }

  } catch (error) {
    console.error('Error checking if book exists:', error)
    const message = getBookifiedErrorMessage(error)
    return {
      exists: false,
      error: error,
      message,
    }
  }
}

export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase()

    const slug = generateSlug(data.title)
    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        elreadyExists: true
      }
    }

    const book = await Book.create({ ...data, slug, totalSegments: 0 })
    return {
      success: true,
      data: serializeData(book)
    }
  } catch (error) {
    console.log('Error creating a book.', error)
    const message = getBookifiedErrorMessage(error)
    return {
      success: false,
      error: error,
      message,
    }
  }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
  try {

    await connectToDatabase()

    console.log(`Saving ${segments.length} segments for book ${bookId} and clerk ${clerkId}`)

    const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
      clerkId, bookId, content: text, segmentIndex, pageNumber, wordCount
    }));

    await BookSegment.insertMany(segmentsToInsert)
    await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length })

    console.log(`Successfully saved ${segments.length} segments for book ${bookId} and clerk ${clerkId}`)

    return {
      success: true,
      data: { segmentsCreated: segments.length }
    }

  } catch (error) {
    console.error('Error saving book segments:', error);
    await BookSegment.deleteMany({ bookId })
    await Book.findByIdAndDelete(bookId)
    console.log('Deleted book segments and book due to failure to save segments.')
    const message = getBookifiedErrorMessage(error)

    return {
      success: false,
      error: error,
      message,
    }
  }
}

