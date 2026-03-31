import { PricingTable, Show, SignInButton } from "@clerk/nextjs";

const SubscriptionsPage = () => {
  return (
    <main className="clerk-subscriptions">
      <h1 className="page-title">Choose your plan</h1>
      <p className="page-description max-w-2xl text-(--text-secondary)">
        Upgrade for more books, more sessions, and longer voice conversations.
      </p>

      <div className="mt-10 w-full clerk-pricing-table-wrapper">
        <Show when="signed-in">
          <PricingTable />
        </Show>

        <Show when="signed-out">
          <div className="mx-auto max-w-lg rounded-2xl border border-(--border-subtle) bg-white p-8 text-center shadow-soft">
            <p className="text-lg text-(--text-secondary)">
              Sign in to view plans and manage billing.
            </p>
            <div className="mt-5">
              <SignInButton mode="modal">
                <button className="btn-primary cursor-pointer">Sign in to continue</button>
              </SignInButton>
            </div>
          </div>
        </Show>
      </div>
    </main>
  );
};

export default SubscriptionsPage;
