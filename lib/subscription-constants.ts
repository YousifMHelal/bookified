export const PLANS = {
  FREE: 'free',
  STANDARD: 'standard',
  PRO: 'pro',
} as const;

export type PlanType = (typeof PLANS)[keyof typeof PLANS];

export type PlanLimits = {
  maxBooks: number;
  maxDurationMinutes: number;
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PLANS.FREE]: {
    maxBooks: 3,
    maxDurationMinutes: 30,
  },
  [PLANS.STANDARD]: {
    maxBooks: 15,
    maxDurationMinutes: 180,
  },
  [PLANS.PRO]: {
    maxBooks: 100,
    maxDurationMinutes: 600,
  },
};

type PlanMetadataLike = {
  plan?: unknown;
  billingPlan?: unknown;
};

export const resolvePlanFromMetadata = (
  metadata?: PlanMetadataLike | null,
): PlanType => {
  const metadataPlan = (metadata?.plan || metadata?.billingPlan)
    ?.toString()
    .toLowerCase();

  if (metadataPlan === PLANS.PRO) return PLANS.PRO;
  if (metadataPlan === PLANS.STANDARD) return PLANS.STANDARD;
  return PLANS.FREE;
};

export const getCurrentBillingPeriodStart = (): Date => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
};
