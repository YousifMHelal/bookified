import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) throw new Error('MONGODB_URI environment variable is required.');

declare global {
  var mongooseCash: {
    conn: typeof mongoose | null;
    promose: Promise<typeof mongoose> | null;
  }
}

const cashed = global.mongooseCash || (global.mongooseCash = { conn: null, promose: null });

export const connectToDatabase = async () => {
  if (cashed.conn) return cashed.conn;
  if (!cashed.promose) {
    cashed.promose = mongoose.connect(mongoUri, { bufferCommands: false })
  }

  try {
    cashed.conn = await cashed.promose;
    return cashed.conn;
  } catch (error) {
    cashed.promose = null;
    console.log(error)
    throw new Error('Failed to connect to database');
  }
}
