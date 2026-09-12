import { Facebook, Mail, ArrowLeft, Sparkles } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4ecdf] text-[#291f31]">
      <a
        href="/"
        className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 rounded-xl border border-[#d8c8e4] bg-white/80 px-5 py-3 text-sm font-black text-[#60408d] shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white lg:left-8 lg:top-8"
      >
        <ArrowLeft size={17} />
        Back to Home
      </a>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#a978d1]/30 blur-[90px]"
          style={{ animation: "floatA 9s ease-in-out infinite" }}
        />

        <div
          className="absolute -right-32 top-[15%] h-[500px] w-[500px] rounded-full bg-[#d7a9e8]/35 blur-[110px]"
          style={{ animation: "floatB 11s ease-in-out infinite" }}
        />

        <div
          className="absolute bottom-[-180px] left-[25%] h-[500px] w-[500px] rounded-full bg-[#8f6ab8]/20 blur-[120px]"
          style={{ animation: "floatC 13s ease-in-out infinite" }}
        />

        <div
          className="absolute left-[8%] top-[30%] h-24 w-24 rotate-12 rounded-[28px] border border-white/70 bg-white/25 backdrop-blur-xl"
          style={{ animation: "drift 8s ease-in-out infinite" }}
        />

        <div
          className="absolute right-[9%] top-[55%] h-32 w-32 rounded-full border border-white/70 bg-white/20 backdrop-blur-xl"
          style={{ animation: "driftReverse 10s ease-in-out infinite" }}
        />

        <div
          className="absolute bottom-[12%] right-[25%] h-16 w-16 rotate-45 rounded-2xl border border-white/70 bg-[#b895d6]/20 backdrop-blur-xl"
          style={{ animation: "spinSlow 16s linear infinite" }}
        />

        <div
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-[100px]"
          style={{ animation: "pulseGlow 5s ease-in-out infinite" }}
        />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#7451a7 1px, transparent 1px), linear-gradient(90deg, #7451a7 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-28">
        <div className="w-full max-w-3xl">
          <div className="mb-7 flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-white/65 text-[#7451a7] shadow-xl backdrop-blur-xl"
              style={{ animation: "iconFloat 4s ease-in-out infinite" }}
            >
              <Mail size={34} strokeWidth={1.8} />
            </div>
          </div>

          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8c8e4] bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#7451a7] shadow-sm backdrop-blur-xl">
              <Sparkles size={14} />
              Get in touch
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#291f31] sm:text-5xl lg:text-6xl">
              Let’s talk.
              <span className="block text-[#7451a7]">We’re listening.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#65596a] sm:text-lg">
              Have a question, business inquiry, partnership idea, or need
              help with -SRG-ScamCheck? Reach out and we’ll point you in the
              right direction.
            </p>
          </div>

          <div
            className="mx-auto mt-10 max-w-2xl rounded-[32px] border border-white/70 bg-white/55 p-7 shadow-2xl backdrop-blur-2xl sm:p-10"
            style={{ animation: "cardRise 0.8s ease-out both" }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="https://www.sonicresume.com/contact"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-[#7451a7] px-6 py-4 text-sm font-black text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#654395] hover:shadow-xl"
              >
                <Mail size={18} />
                Contact Business
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61585916721060"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-center gap-3 rounded-2xl border border-[#d8c8e4] bg-white/80 px-6 py-4 text-sm font-black text-[#60408d] shadow-md transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <Facebook size={18} />
                Facebook
              </a>
            </div>

            <div className="mt-8 border-t border-[#d8c8e4]/70 pt-7 text-center">
              <p className="text-sm leading-6 text-[#766b79]">
                For account, billing, or product questions, please include
                enough information for us to understand your request.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8c7d91]">
              -SRG-ScamCheck
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes floatA {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(70px, 45px, 0) scale(1.12);
          }
        }

        @keyframes floatB {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-80px, 60px, 0) scale(1.08);
          }
        }

        @keyframes floatC {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(80px, -50px, 0);
          }
        }

        @keyframes drift {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(12deg);
          }
          50% {
            transform: translate3d(35px, -30px, 0) rotate(25deg);
          }
        }

        @keyframes driftReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-35px, 25px, 0);
          }
        }

        @keyframes spinSlow {
          0% {
            transform: rotate(45deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate(135deg) translate3d(10px, -10px, 0);
          }
          100% {
            transform: rotate(405deg) translate3d(0, 0, 0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes cardRise {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
