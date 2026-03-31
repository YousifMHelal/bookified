import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required to run voice session status migration.');
}

const voiceSessionSchema = new mongoose.Schema(
  {
    clerkId: String,
    bookId: mongoose.Schema.Types.ObjectId,
    status: String,
    startedAt: Date,
    endedAt: Date,
    billingPeriodStart: Date,
  },
  { timestamps: true, strict: false },
);

const VoiceSession =
  mongoose.models.VoiceSession ||
  mongoose.model('VoiceSession', voiceSessionSchema, 'voicesessions');

const getCurrentBillingPeriodStartUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
};

const run = async () => {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const billingPeriodStart = getCurrentBillingPeriodStartUtc();
  const missingStatusFilter = {
    $or: [{ status: { $exists: false } }, { status: null }, { status: '' }],
  };

  const startedResult = await VoiceSession.updateMany(
    {
      ...missingStatusFilter,
      billingPeriodStart,
      startedAt: { $exists: true, $ne: null },
      $or: [
        { endedAt: { $exists: false } },
        { endedAt: null },
        { $expr: { $gt: ['$endedAt', '$startedAt'] } },
      ],
    },
    { $set: { status: 'started' } },
  );

  const pendingResult = await VoiceSession.updateMany(
    {
      ...missingStatusFilter,
      $or: [{ startedAt: { $exists: false } }, { startedAt: null }],
    },
    { $set: { status: 'pending' } },
  );

  const cancelledResult = await VoiceSession.updateMany(
    {
      ...missingStatusFilter,
    },
    { $set: { status: 'cancelled' } },
  );

  console.log('VoiceSession status migration complete');
  console.log('started:', startedResult.modifiedCount);
  console.log('pending:', pendingResult.modifiedCount);
  console.log('cancelled:', cancelledResult.modifiedCount);
};

run()
  .catch((error) => {
    console.error('VoiceSession status migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
