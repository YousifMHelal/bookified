'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import {
  PLANS,
  PLAN_LIMITS,
  PlanType,
  resolvePlanFromMetadata,
} from "@/lib/subscription-constants";

export const useSubscription = () => {
  const { has, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  const isLoaded = isAuthLoaded && isUserLoaded;

  if (!isLoaded) {
    return {
      plan: PLANS.FREE,
      limits: PLAN_LIMITS[PLANS.FREE],
      isLoaded: false
    };
  }

  let plan: PlanType = PLANS.FREE;

  // 1. First check: supported Clerk authorization keys.
  if (has?.({ role: 'pro' }) || has?.({ permission: 'pro' })) {
    plan = PLANS.PRO;
  } else if (has?.({ role: 'standard' }) || has?.({ permission: 'standard' })) {
    plan = PLANS.STANDARD;
  }
  // 2. Second Check: Fallback to user public metadata if `has` fails (caching issue)
  else {
    const metadataPlan = resolvePlanFromMetadata(user?.publicMetadata);

    if (metadataPlan === PLANS.PRO) {
      plan = PLANS.PRO;
    } else if (metadataPlan === PLANS.STANDARD) {
      plan = PLANS.STANDARD;
    }
  }

  return {
    plan,
    limits: PLAN_LIMITS[plan],
    isLoaded: true
  };
};
