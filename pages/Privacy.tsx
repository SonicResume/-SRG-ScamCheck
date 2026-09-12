import {
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  Database,
  Eye,
  UserCheck,
} from "lucide-react";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#291f31]">
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">

       <a
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-bold text-[#7451a7] transition hover:text-[#60408d]"
        >
          ← Back to Home
        </a>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#7451a7]/20 bg-white px-4 py-2 text-sm font-bold text-[#7451a7] shadow-sm">
            <ShieldCheck size={17} />
            Privacy & Security
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-[#66586b]">
            SRG ScamCheck is designed to help you make safer digital
            decisions while treating your information responsibly.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Information We Collect */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <Database size={21} />
              </div>

              <h2 className="text-2xl font-black">
                Information We Collect
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                Depending on how you use SRG ScamCheck, we may collect
                information such as your name, email address, account
                information, investigation history, and information you
                voluntarily submit for scam or threat analysis.
              </p>

              <p>
                We may also collect basic technical information required to
                operate, secure, and improve the service.
              </p>
            </div>
          </article>

          {/* How We Use Information */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <Eye size={21} />
              </div>

              <h2 className="text-2xl font-black">
                How We Use Information
              </h2>
            </div>

            <ul className="space-y-3 text-sm font-medium leading-7 text-[#66586b]">
              <li>• Provide scam detection and digital verification services.</li>
              <li>• Maintain your investigation and account history.</li>
              <li>• Improve reliability, security, and service performance.</li>
              <li>• Respond to support requests and service communications.</li>
              <li>• Detect misuse, abuse, fraud, or security threats.</li>
            </ul>
          </article>

          {/* Payments */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <CreditCard size={21} />
              </div>

              <h2 className="text-2xl font-black">
                Payments & Stripe
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                Paid subscriptions and checkout payments are processed
                through Stripe.
              </p>

              <p>
                SRG ScamCheck does not directly process or store your full
                payment card details on our servers. Payment information is
                handled by Stripe in accordance with Stripe&apos;s applicable
                privacy and security practices.
              </p>

              <p>
                We may receive limited payment-related information, such as
                subscription status or transaction identifiers, that is
                necessary to manage your account and subscription.
              </p>
            </div>
          </article>

          {/* Data Sharing */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <UserCheck size={21} />
              </div>

              <h2 className="text-2xl font-black">
                Data Sharing
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                We do not sell your personal information.
              </p>

              <p>
                Information may be shared with service providers that help us
                operate the platform, process payments, maintain infrastructure,
                provide security, or deliver requested services.
              </p>

              <p>
                Information may also be disclosed where required by law,
                legal process, or where reasonably necessary to protect the
                rights, safety, and security of users and the service.
              </p>
            </div>
          </article>

          {/* Security */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <LockKeyhole size={21} />
              </div>

              <h2 className="text-2xl font-black">
                Security
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                We use reasonable technical and organizational safeguards
                designed to protect information against unauthorized access,
                misuse, alteration, or disclosure.
              </p>

              <p>
                No internet-based service can guarantee absolute security,
                so users should also take reasonable steps to protect their
                accounts and credentials.
              </p>
            </div>
          </article>

          {/* Your Choices */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <ShieldCheck size={21} />
              </div>

              <h2 className="text-2xl font-black">
                Your Choices
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                You may request information about the personal information
                associated with your account and may request correction or
                deletion where applicable.
              </p>

              <p>
                You can also stop using the service at any time. Certain
                information may need to be retained where required by law,
                security requirements, dispute resolution, or legitimate
                business purposes.
              </p>
            </div>
          </article>

          {/* Trust footer */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t border-[#7451a7]/10 pt-7 text-center text-sm font-semibold text-[#948596] sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2 text-[#7451a7]">
              <ShieldCheck size={16} />
              Secure payments powered by Stripe
            </span>

            <span className="hidden sm:block">•</span>

            <span>Your privacy matters</span>

            <span className="hidden sm:block">•</span>

            <span>Built for safer decisions</span>
          </div>
        </div>
      </section>
    </main>
  );
}