import mongoose from 'mongoose';
import dns from 'node:dns';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DNS_SERVERS = process.env.MONGODB_DNS_SERVERS;

if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

let dnsConfigured = false;

const configureMongoDnsServers = () => {
  if (dnsConfigured || !MONGODB_DNS_SERVERS) return;

  const servers = MONGODB_DNS_SERVERS
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) return;

  try {
    dns.setServers(servers);
    dnsConfigured = true;
    console.log('Custom DNS servers configured for MongoDB:', servers.join(', '));
  } catch (error) {
    console.warn('Invalid MONGODB_DNS_SERVERS value. Skipping custom DNS config.', error);
  }
};

export const connectToDatabase = async () => {
  console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);
  configureMongoDnsServers();
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  console.info('Connected to MongoDB');
  return cached.conn;
}
