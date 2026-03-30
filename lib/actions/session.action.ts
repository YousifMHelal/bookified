'use server'

import VoiceSession from "@/database/models/voice-session.model";
import { connectToDatabase } from "@/database/mongoose";
import { EndSessionResult, StartSessionResult } from "@/types";
import {
  getCurrentBillingPeriodStart,
  PLAN_LIMITS,
  resolvePlanFromMetadata,
} from "../subscription-constants";

export const startVoiceSession = async (clerkId : string, bookId: string  ): Promise<StartSessionResult> => {
  try {
    await connectToDatabase();

    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();

    if (!user || user.id !== clerkId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const plan = resolvePlanFromMetadata(user.publicMetadata);
    const limits = PLAN_LIMITS[plan];
    const billingPeriodStart = getCurrentBillingPeriodStart();

    const usage = await VoiceSession.aggregate([
      {
        $match: {
          clerkId,
          billingPeriodStart,
        },
      },
      {
        $group: {
          _id: null,
          totalDurationSeconds: { $sum: "$durationSeconds" },
        },
      },
    ]);

    const usedDurationSeconds = usage[0]?.totalDurationSeconds ?? 0;
    const usedMinutes = usedDurationSeconds / 60;

    if (usedMinutes >= limits.maxDurationMinutes) {
      return {
        success: false,
        error: `You have reached your monthly voice limit (${limits.maxDurationMinutes} minutes) for the ${plan} plan. Please upgrade to continue.`,
        isBillingError: true,
      };
    }

    const session = await VoiceSession.create({
      clerkId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart,
      durationSeconds: 0,
    });

    const remainingMinutes = Math.max(
      0,
      limits.maxDurationMinutes - Math.ceil(usedMinutes),
    );

    return {
      success: true,
      sessionId: session._id.toString(),
      maxDurationMinutes: remainingMinutes,
    };
  } catch (error) {
    console.error("Error starting voice session:", error);
    return {
      success: false,
      error: "An unexpected error occurred while starting the session."
    }
  }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
  try {
    await connectToDatabase();

    const result = await VoiceSession.findByIdAndUpdate(sessionId, {
      endedAt: new Date(),
      durationSeconds,
    });

    if (!result) return { success: false, error: 'Voice session not found.' }

    return { success: true }
  } catch (e) {
    console.error('Error ending voice session', e);
    return { success: false, error: 'Failed to end voice session. Please try again later.' }
  }
}
