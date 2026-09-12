import { useState } from "react";
import { auth } from "../lib/firebase";
import {
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

type Plan = {
  name: string;
  planKey: "free" | "pro" | "business" | "premium";
  price: number;
  desc: string;
  stripePriceId: string | null;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Free",
    planKey: "free",
    price: 0,
    desc: "Essential scam protection for getting started.",
    stripePriceId: null,
    features: [
      "20 AI scam checks",
      "Basic scam detection",
      "Website verification",
      "UPI risk checks",
      "Basic threat insights",
    ],
  },
  {
    name: "Pro",
    planKey: "pro",
    price: 19,
    desc: "Advanced protection for people who want deeper scam intelligence.",
    stripePriceId: "price_1TbF9BPE4wCsfg732ScUJfmc",
    features: [
      "Unlimited scam checks",
      "Advanced AI threat analysis",
      "Website & URL verification",
      "UPI fraud detection",
      "Voice scam analysis",
      "Investigation history",
    ],
  },
  {
    name: "Business",
    planKey: "business",
    price: 29,
    desc: "Digital forensic intelligence for professionals and organizations.",
    stripePriceId: "price_1TnzrFPE4wCsfg73xSOMZNuH",
    features: [
      "Everything in Pro",
      "Unlimited forensic investigations",
      "Ghost firm detection",
      "Advanced threat intelligence",
      "Priority analysis",
      "Detailed investigation reports",
    ],
  },
  {
    name: "Premium",
    planKey: "premium",
    price: 49,
    desc: "Maximum protection with comprehensive digital forensic intelligence.",
    stripePriceId: "price_1TGwAJPE4wCsfg73gMQlv8Ph",
    features: [
      "Everything in Business",
      "Advanced forensic intelligence",
      "Deep scam investigation",
      "Voice & identity analysis",
      "Comprehensive threat reports",
      "Priority security support",
    ],
  },
];

function getPlanIcon(planKey: Plan["planKey"]) {
  if (planKey === "premium") return <Crown size={22} />;
  if (planKey === "business") return <Sparkles size={22} />;
  if (planKey === "pro") return <Zap size={22} />;
  return <ShieldCheck size={22} />;
}

export default function PricingPage() {
  const [loading, setLoading] = useState<Plan["planKey"] | null>(null);

  async function checkout(plan: Plan) {
    if (plan.planKey === "free") {
      window.location.href = "/login";
      return;
    }

    if (!plan.stripePriceId) {
      return;
    }

    const billingUrl = import.meta.env.VITE_BILLING_URL;

    if (!billingUrl) {
      alert("Billing service is not configured.");
      return;
    }

    setLoading(plan.planKey);

    try {
      const response = await fetch(billingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_id: plan.stripePriceId,
          email: auth.currentUser?.email || "test@example.com",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.error || "Checkout failed"
        );
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong starting checkout.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#291f31]">
  <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">

    <a
      href="/"
      className="mb-10 inline-flex items-center gap-2 font-bold text-[#7451a7] transition hover:text-[#60408d]"
    >
      ← Back to Home
    </a>

    {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#7451a7]/20 bg-white px-4 py-2 text-sm font-bold text-[#7451a7] shadow-sm">
            <ShieldCheck size={17} />
            Digital Forensic Intelligence
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Choose Your Level of
            <span className="mt-2 block text-[#7451a7]">
              Scam Protection
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-7 text-[#66586b] sm:text-lg">
            Protect yourself, your business, and your digital identity with
            AI-powered scam detection and forensic intelligence.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const featured = plan.planKey === "business";
            const isLoading = loading === plan.planKey;

            return (
              <article
                key={plan.planKey}
                className={
                  featured
                    ? "relative flex flex-col overflow-hidden rounded-3xl border border-[#7451a7]/60 bg-[#291f31] text-white shadow-xl"
                    : "relative flex flex-col overflow-hidden rounded-3xl border border-[#e7ddea] bg-white text-[#291f31] shadow-lg"
                }
              >
                {featured && (
                  <div className="flex items-center justify-center gap-2 bg-[#7451a7] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">
                    <Sparkles size={14} />
                    Most Popular
                  </div>
                )}

                <div className="flex flex-1 flex-col p-7">
                  {/* Icon */}
                  <div
                    className={
                      featured
                        ? "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#d7bdf0]"
                        : "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]"
                    }
                  >
                    {getPlanIcon(plan.planKey)}
                  </div>

                  <h2 className="text-2xl font-black">
                    {plan.name}
                  </h2>

                  <p
                    className={
                      featured
                        ? "mt-3 min-h-[72px] text-sm font-medium leading-6 text-white/65"
                        : "mt-3 min-h-[72px] text-sm font-medium leading-6 text-[#766879]"
                    }
                  >
                    {plan.desc}
                  </p>

                  {/* Price */}
                  <div className="mt-7 flex items-end gap-1">
                    <span className="text-5xl font-black">
                      ${plan.price}
                    </span>

                    <span
                      className={
                        featured
                          ? "mb-1 text-sm font-bold text-white/50"
                          : "mb-1 text-sm font-bold text-[#948596]"
                      }
                    >
                      /month
                    </span>
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    onClick={() => checkout(plan)}
                    disabled={loading !== null}
                    className={
                      featured
                        ? "mt-7 w-full rounded-2xl bg-white px-4 py-4 text-sm font-black text-[#49304f] transition hover:bg-[#f3eafa] disabled:cursor-not-allowed disabled:opacity-60"
                        : "mt-7 w-full rounded-2xl bg-[#7451a7] px-4 py-4 text-sm font-black text-white transition hover:bg-[#60408d] disabled:cursor-not-allowed disabled:opacity-60"
                    }
                  >
                    {isLoading
                      ? "Processing..."
                      : plan.planKey === "free"
                        ? "Start Free"
                        : "Upgrade Now"}
                  </button>

                  {/* Features */}
                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3"
                      >
                        <span
                          className={
                            featured
                              ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7451a7] text-[#e7d7f3]"
                              : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#efe5f7] text-[#7451a7]"
                          }
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>

                        <span
                          className={
                            featured
                              ? "text-sm font-semibold text-white/75"
                              : "text-sm font-semibold text-[#66586b]"
                          }
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Trust */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center text-sm font-semibold text-[#948596] sm:flex-row sm:gap-6">
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#7451a7]" />
            Secure payments powered by Stripe
          </span>

          <span className="hidden sm:block">•</span>

          <span>Cancel anytime</span>

          <span className="hidden sm:block">•</span>

          <span>No hidden fees</span>
        </div>
      </section>
    </main>
  );
}