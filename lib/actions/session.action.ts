'use server';

import VoiceSession from "@/database/models/voice-session.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "../subscription/server";

export const startVoiceSession = async (bookId: string): Promise<StartSessionResult> => {
  try {
    await connectToDatabase();

    // Limits/Plan to see whether a session is allowed.
    const { PLAN_LIMITS, getCurrentBillingPeriodStart } = await import("@/lib/subscription-constants");

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized. Please sign in to start a session.' };
    }

    const plan = await getUserPlan();
    const limits = PLAN_LIMITS[plan];
    const billingPeriodStart = getCurrentBillingPeriodStart();

    const sessionCount = await VoiceSession.countDocuments({
      clerkId: userId,
      billingPeriodStart,
      status: 'started',
    });

    if (sessionCount >= limits.maxSessionsPerMonth) {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");

      return {
        success: false,
        error: `You have reached the monthly session limit for your ${plan} plan (${limits.maxSessionsPerMonth}). Please upgrade for more sessions.`,
        isBillingError: true,
      };
    }

    const session = await VoiceSession.create({
      clerkId: userId,
      bookId,
      status: 'pending',
      billingPeriodStart,
      durationSeconds: 0,
    });

    return {
      success: true,
      sessionId: session._id.toString(),
      maxSessionMinutes: limits.maxDurationPerSession,
    }
  } catch (e) {
    console.error('Error starting voice session', e);
    return { success: false, error: 'Failed to start voice session. Please try again later.' }
  }
}

export const markVoiceSessionStarted = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await VoiceSession.findOneAndUpdate(
      { _id: sessionId, clerkId: userId, status: 'pending' },
      {
        status: 'started',
        startedAt: new Date(),
        durationSeconds: 0,
      },
      { new: true },
    );

    if (!result) {
      const existing = await VoiceSession.findOne({ _id: sessionId, clerkId: userId });
      if (existing?.status === 'started') {
        return { success: true };
      }
      return { success: false, error: 'Voice session not found or already cancelled.' };
    }

    return { success: true };
  } catch (e) {
    console.error('Error marking voice session as started', e);
    return { success: false, error: 'Failed to mark session as started.' };
  }
}

export const cancelVoiceSession = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await VoiceSession.findOneAndUpdate(
      { _id: sessionId, clerkId: userId, status: 'pending' },
      {
        status: 'cancelled',
        endedAt: new Date(),
        durationSeconds: 0,
      },
    );

    return { success: true };
  } catch (e) {
    console.error('Error cancelling voice session', e);
    return { success: false, error: 'Failed to cancel voice session.' };
  }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
  try {
    await connectToDatabase();

    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const session = await VoiceSession.findOne({ _id: sessionId, clerkId: userId });

    if (!session) return { success: false, error: 'Voice session not found.' }

    session.endedAt = new Date();
    session.durationSeconds = durationSeconds;
    if (session.status === 'pending') {
      session.status = 'cancelled';
    }

    await session.save();

    return { success: true }
  } catch (e) {
    console.error('Error ending voice session', e);
    return { success: false, error: 'Failed to end voice session. Please try again later.' }
  }
}
