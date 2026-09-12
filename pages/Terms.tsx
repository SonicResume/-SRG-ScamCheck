import {
  ShieldCheck,
  FileText,
  CreditCard,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export default function Terms() {
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
            <FileText size={17} />
            Terms & Conditions
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-[#66586b]">
            Please review these terms before using SRG ScamCheck and its
            digital forensic intelligence services.
          </p>
        </div>

        <div className="space-y-6">
          {/* Acceptance */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <UserCheck size={21} />
              </div>

              <h2 className="text-2xl font-black">
                1. Acceptance of Terms
              </h2>
            </div>

            <p className="text-sm font-medium leading-7 text-[#66586b]">
              By accessing or using SRG ScamCheck, you agree to these Terms
              of Service. If you do not agree with these terms, you should
              not use the service.
            </p>
          </article>

          {/* Service */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <ShieldCheck size={21} />
              </div>

              <h2 className="text-2xl font-black">
                2. The Service
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                SRG ScamCheck provides tools designed to help users assess
                potentially suspicious websites, messages, payment details,
                voice content, businesses, and other digital information.
              </p>

              <p>
                Results are intended to provide risk indicators and
                investigative assistance. They should not be treated as a
                guarantee that a person, business, website, transaction, or
                communication is safe or fraudulent.
              </p>
            </div>
          </article>

          {/* No guarantee */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <AlertTriangle size={21} />
              </div>

              <h2 className="text-2xl font-black">
                3. No Guarantee of Accuracy
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                Scam detection and forensic analysis can produce false
                positives or false negatives. Information and risk scores may
                change as new information becomes available.
              </p>

              <p>
                You remain responsible for independently evaluating important
                decisions and obtaining professional advice where appropriate.
              </p>
            </div>
          </article>

          {/* Acceptable use */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <h2 className="mb-5 text-2xl font-black">
              4. Acceptable Use
            </h2>

            <ul className="space-y-3 text-sm font-medium leading-7 text-[#66586b]">
              <li>• Do not use the service for unlawful activities.</li>
              <li>• Do not attempt to interfere with or disrupt the service.</li>
              <li>• Do not attempt to gain unauthorized access to accounts or systems.</li>
              <li>• Do not misuse investigation results to harass, threaten, or harm others.</li>
              <li>• Do not submit information that you are not authorized to use.</li>
            </ul>
          </article>

          {/* Payments */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe5f7] text-[#7451a7]">
                <CreditCard size={21} />
              </div>

              <h2 className="text-2xl font-black">
                5. Subscriptions & Payments
              </h2>
            </div>

            <div className="space-y-4 text-sm font-medium leading-7 text-[#66586b]">
              <p>
                Paid plans are billed according to the pricing displayed at
                the time of purchase.
              </p>

              <p>
                Payments are processed through Stripe. SRG ScamCheck does not
                directly store your full payment card information.
              </p>

              <p>
                Subscription status, payment-related identifiers, and other
                information necessary to administer your subscription may be
                received from the payment provider.
              </p>
            </div>
          </article>

          {/* Accounts */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <h2 className="mb-5 text-2xl font-black">
              6. Accounts
            </h2>

            <p className="text-sm font-medium leading-7 text-[#66586b]">
              You are responsible for maintaining the security of your account
              credentials and for activity conducted through your account.
              Notify us promptly if you believe your account has been
              compromised.
            </p>
          </article>

          {/* Intellectual property */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <h2 className="mb-5 text-2xl font-black">
              7. Intellectual Property
            </h2>

            <p className="text-sm font-medium leading-7 text-[#66586b]">
              The SRG ScamCheck service, branding, software, interface,
              original content, and related materials are protected by
              applicable intellectual-property laws. You may not reproduce,
              modify, distribute, or commercially exploit these materials
              without appropriate authorization.
            </p>
          </article>

          {/* Limitation */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <h2 className="mb-5 text-2xl font-black">
              8. Limitation of Liability
            </h2>

            <p className="text-sm font-medium leading-7 text-[#66586b]">
              To the extent permitted by applicable law, SRG ScamCheck is not
              responsible for losses arising from reliance on automated
              analysis, risk scores, third-party information, service
              interruptions, or decisions made solely on the basis of results
              provided by the service.
            </p>
          </article>

          {/* Changes */}
          <article className="rounded-3xl border border-[#e7ddea] bg-white p-7 shadow-sm sm:p-9">
            <h2 className="mb-5 text-2xl font-black">
              9. Changes to These Terms
            </h2>

            <p className="text-sm font-medium leading-7 text-[#66586b]">
              We may update these Terms of Service from time to time. Updated
              terms will be made available through the service. Continued use
              of SRG ScamCheck after an update constitutes acceptance of the
              revised terms to the extent permitted by law.
            </p>
          </article>

          {/* Closing */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t border-[#7451a7]/10 pt-7 text-center text-sm font-semibold text-[#948596] sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2 text-[#7451a7]">
              <ShieldCheck size={16} />
              SRG ScamCheck
            </span>

            <span className="hidden sm:block">•</span>

            <span>Use responsibly</span>

            <span className="hidden sm:block">•</span>

            <span>Make safer decisions</span>
          </div>
        </div>
      </section>
    </main>
  );
}