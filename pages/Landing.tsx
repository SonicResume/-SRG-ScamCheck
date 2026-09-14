import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  CircleHelp,
  Globe2,
  Link2,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Mic,
  ScanSearch,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";

type LandingProps = {
  onStart: (page?: string) => void;
  onLogin?: () => void;
};

const Landing = ({ onStart, onLogin }: LandingProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clueIndex, setClueIndex] = useState(0);

  const clues = [
    {
      label: "URGENT",
      title: "Pressure tactics",
      text: "“Act now or your account will be closed.”",
      icon: AlertTriangle,
    },
    {
      label: "MONEY",
      title: "Payment request",
      text: "“Send the verification fee immediately.”",
      icon: Banknote,
    },
    {
      label: "LINK",
      title: "Suspicious destination",
      text: "A look-alike website is waiting behind the button.",
      icon: Link2,
    },
    {
      label: "IDENTITY",
      title: "Impersonation",
      text: "Someone may be pretending to be a person you trust.",
      icon: UserRound,
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClueIndex((current) => (current + 1) % clues.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const investigate = () => onStart("login");

  const scrollToWhy = () => {
    document.getElementById("why")?.scrollIntoView({ behavior: "smooth" });
  };

  const clue = clues[clueIndex];
  const ClueIcon = clue.icon;

  return (
    <div className="min-h-screen overflow-hidden bg-[#f3eadc] text-[#241d2d]">
      <style>{`
        @keyframes floatOne {
          0%,100% { transform: translate3d(0,0,0) rotate(-8deg); }
          50% { transform: translate3d(18px,-25px,0) rotate(4deg); }
        }
        @keyframes floatTwo {
          0%,100% { transform: translate3d(0,0,0) rotate(7deg); }
          50% { transform: translate3d(-20px,22px,0) rotate(-5deg); }
        }
        @keyframes floatThree {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(10px,-18px,0) scale(1.05); }
        }
        @keyframes morph {
          0% { border-radius:38% 62% 65% 35% / 45% 35% 65% 55%; transform:rotate(0deg) scale(1); }
          50% { border-radius:62% 38% 35% 65% / 60% 65% 35% 40%; transform:rotate(8deg) scale(1.04); }
          100% { border-radius:38% 62% 65% 35% / 45% 35% 65% 55%; transform:rotate(0deg) scale(1); }
        }
        @keyframes lens {
          0%,100% { transform:translate3d(0,0,0) rotate(-10deg); }
          50% { transform:translate3d(20px,-12px,0) rotate(-3deg); }
        }
        @keyframes scanLine {
          0% { transform:translateY(-100%); opacity:0; }
          20% { opacity:1; }
          80% { opacity:1; }
          100% { transform:translateY(300%); opacity:0; }
        }
        @keyframes moneyFall {
          0% { transform:translateY(-20px) rotate(0deg); opacity:0; }
          20% { opacity:1; }
          100% { transform:translateY(150px) rotate(25deg); opacity:0; }
        }
        @keyframes pulseSoft {
          0%,100% { transform:scale(1); opacity:.5; }
          50% { transform:scale(1.15); opacity:.85; }
        }
        @keyframes shimmer {
          0% { transform:translateX(-120%); }
          100% { transform:translateX(180%); }
        }
        .glass-morph { animation:morph 8s ease-in-out infinite; }
        .glass-one { animation:floatOne 7s ease-in-out infinite; }
        .glass-two { animation:floatTwo 9s ease-in-out infinite; }
        .glass-three { animation:floatThree 6s ease-in-out infinite; }
        .lens-float { animation:lens 5s ease-in-out infinite; }
        .money-fall { animation:moneyFall 3.5s ease-in infinite; }
        .scan-line { animation:scanLine 3s linear infinite; }
        .pulse-soft { animation:pulseSoft 3s ease-in-out infinite; }
        .shimmer { animation:shimmer 2.8s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-[#b89be8]/20 blur-[100px]" />
        <div className="absolute right-[-10rem] top-[25rem] h-[32rem] w-[32rem] rounded-full bg-[#d7b6ef]/30 blur-[120px]" />
        <div className="absolute bottom-[-12rem] left-[35%] h-[30rem] w-[30rem] rounded-full bg-white/70 blur-[100px]" />
      </div>

      <header className="relative z-50 border-b border-[#8d719e]/15 bg-[#f8f2e9]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => onStart()} className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-[14px] p-1.5 shadow-lg">
              <img src="/logo.png" alt="SRG ScamCheck" className="h-full w-full object-contain" />
            </div>
            <div className="text-left">
              <div className="text-[17px] font-black tracking-[-0.03em]">
                SRG <span className="text-[#7451a7]">ScamCheck</span>
              </div>
              <div className="text-[8px] font-bold uppercase tracking-[0.26em] text-[#907f93]">
                Look closer
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={scrollToWhy} className="text-sm font-bold text-[#62576a] transition hover:text-[#7451a7]">
              Why ScamCheck
            </button>
            <button onClick={() => window.location.pathname = "/pricing"} className="text-sm font-bold text-[#62576a] transition hover:text-[#7451a7]">
              Pricing
            </button>
            <button onClick={() => onStart("history")} className="text-sm font-bold text-[#62576a] transition hover:text-[#7451a7]">
              My checks
            </button>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            {onLogin && (
              <button onClick={() => window.location.pathname = "/login"} className="rounded-xl px-4 py-2.5 text-sm font-black text-[#493d50] transition hover:bg-white">
                Login
              </button>
            )}
            <button
              onClick={() => window.location.pathname = "/pricing"}
              className="rounded-xl bg-[#291f31] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#291f31]/15 transition hover:-translate-y-0.5 hover:bg-[#7451a7]"
            >
              Pricing
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-xl p-2 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
  <div className="border-t border-[#8d719e]/15 bg-[#f8f2e9] p-5 md:hidden">
    <div className="mx-auto flex max-w-7xl flex-col gap-2">
      <button
        onClick={() => {
          setMenuOpen(false);
          scrollToWhy();
        }}
        className="rounded-xl p-3 text-left font-bold"
      >
        Why ScamCheck
      </button>

      <button
        onClick={() => {
          setMenuOpen(false);
          window.location.pathname = "/pricing";
        }}
        className="rounded-xl p-3 text-left font-bold"
      >
        Pricing
      </button>

      {onLogin && (
        <button
          onClick={() => {
            setMenuOpen(false);
            window.location.pathname = "/login";
          }}
          className="rounded-xl bg-[#291f31] p-3 text-left font-bold text-white"
        >
          Login
        </button>
      )}
    </div>
  </div>
)}

        </header>
      <main className="relative">
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative z-20">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#8d719e]/20 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7451a7] shadow-sm backdrop-blur">
                <ShieldAlert size={13} />
                Don't trust the feeling. Check it.
              </div>

              <h1 className="max-w-2xl text-[4rem] font-black leading-[.9] tracking-[-0.065em] text-[#291f31] sm:text-[5.4rem] lg:text-[6.2rem]">
                Scam
                <span className="block text-[#7451a7]">detective.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base font-medium leading-7 text-[#675b69] sm:text-lg">
                A weird message. A suspicious payment request. A link that feels almost right.
                <span className="font-black text-[#291f31]"> Put it under the magnifying glass.</span>
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={investigate}
                  className="group flex items-center gap-3 rounded-2xl bg-[#7451a7] px-6 py-4 text-sm font-black text-white shadow-xl shadow-[#7451a7]/25 transition hover:-translate-y-1 hover:bg-[#624294]"
                >
                  Investigate something
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={scrollToWhy}
                  className="flex items-center gap-2 rounded-2xl border border-[#8d719e]/20 bg-white/60 px-6 py-4 text-sm font-black text-[#493d50] backdrop-blur hover:bg-white"
                >
                  Why try it?
                  <CircleHelp size={16} />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[#857687]">
                {[MessageSquareText, Banknote, Globe2].map((Icon, index) => (
                  <span key={index} className="flex items-center gap-2">
                    <Icon size={14} className="text-[#7451a7]" />
                    {["Messages", "Payments", "Websites"][index]}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[560px] lg:min-h-[650px]">
              <div className="glass-one absolute right-[8%] top-[8%] h-40 w-40 rounded-[45%] border border-white/80 bg-white/30 shadow-2xl shadow-[#7451a7]/10 backdrop-blur-xl" />
              <div className="glass-two absolute bottom-[10%] left-[4%] h-48 w-48 rounded-[45%] border border-white/80 bg-white/25 shadow-2xl backdrop-blur-xl" />
              <div className="glass-three absolute bottom-[8%] right-[18%] h-24 w-24 rounded-full border border-white/80 bg-[#cdb5eb]/30 backdrop-blur-xl" />
              <div className="absolute left-[25%] top-[20%] h-72 w-72 rounded-full bg-[#9d76ce]/25 blur-[70px]" />

              <div className="lens-float absolute right-[0%] top-[27%] z-20">
                <div className="relative h-[285px] w-[285px] sm:h-[340px] sm:w-[340px]">
                  <div className="absolute left-0 top-0 h-[235px] w-[235px] rounded-full border-[18px] border-[#3a2d42] bg-[#cbb4df]/25 shadow-[0_30px_70px_rgba(51,34,62,.22)] backdrop-blur-[2px] sm:h-[280px] sm:w-[280px]">
                    <div className="absolute inset-[18px] overflow-hidden rounded-full border border-white/70 bg-white/10">
                      <div className="scan-line absolute left-0 top-0 h-1/4 w-full bg-gradient-to-b from-transparent via-white/70 to-transparent blur-sm" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full border border-[#7451a7]/30 bg-white/20 px-5 py-3 text-center backdrop-blur">
                          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7451a7]">Inspection</div>
                          <div className="mt-1 text-sm font-black text-[#291f31]">Look closer.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-[205px] top-[215px] h-[150px] w-[38px] origin-top rotate-[-43deg] rounded-full bg-gradient-to-r from-[#291f31] via-[#49394f] to-[#291f31] shadow-2xl sm:left-[245px] sm:top-[255px]" />
                  <div className="absolute left-[54px] top-[45px] h-20 w-8 rotate-[-30deg] rounded-full bg-white/45 blur-md" />
                </div>
              </div>

              <div className="money-fall absolute bottom-[5%] left-[30%] z-30 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-[#7451a7] shadow-xl backdrop-blur">
                <Banknote size={24} />
              </div>
              <div
                className="money-fall absolute bottom-[8%] left-[43%] z-30 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-[#7451a7] shadow-xl backdrop-blur"
                style={{ animationDelay: "1.2s" }}
              >
                <Banknote size={20} />
              </div>

              <div className="glass-two absolute bottom-[4%] right-[3%] z-30 w-[245px] rounded-[24px] border border-white/80 bg-[#291f31]/90 p-5 text-white shadow-2xl backdrop-blur-xl sm:w-[280px]">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#c9afe5]">
                  <ScanSearch size={13} />
                  Clue found
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <ClueIcon size={22} className="mt-1 shrink-0 text-[#d7bdf0]" />
                  <div>
                    <div className="text-xs font-black">{clue.title}</div>
                    <div className="mt-1 text-[10px] font-medium leading-4 text-white/60">{clue.text}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-1">
                  {clues.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all ${
                        index === clueIndex ? "w-7 bg-[#c9afe5]" : "w-2 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pulse-soft absolute bottom-[18%] left-[3%] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-[#a34e68] shadow-lg backdrop-blur">
                <AlertTriangle size={20} />
              </div>
              <div
                className="pulse-soft absolute right-[8%] top-[5%] flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-[#7451a7] shadow-lg backdrop-blur"
                style={{ animationDelay: "1s" }}
              >
                <Link2 size={18} />
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="relative border-y border-[#8d719e]/15 bg-[#fbf8f3]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#7451a7]">Why people use it</div>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Because scammers count on you
                <span className="text-[#7451a7]"> moving too fast.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-[#746878]">
                ScamCheck gives you a moment to stop, inspect the details and understand what is actually happening.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                [ScanSearch, "Catch the little things", "Small wording changes, unfamiliar links, pressure tactics and unexpected payment requests can reveal important warning signs."],
                [CircleHelp, "Make the confusing clearer", "Turn a wall of suspicious details into a simple picture of what deserves your attention."],
                [CheckCircle2, "Think before you act", "The goal isn't to scare you. It's to give you enough information to make a better decision."],
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="group rounded-[30px] border border-[#8d719e]/15 bg-white p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#7451a7]/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee4f5] text-[#7451a7] transition group-hover:rotate-3 group-hover:scale-105">
                    {(() => { const C = Icon as typeof ScanSearch; return <C size={24} />; })()}
                  </div>
                  <h3 className="mt-7 text-xl font-black">{String(title)}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#756878]">{String(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-[38px] bg-[#291f31] px-7 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
            <div className="absolute right-[-100px] top-[-120px] h-80 w-80 rounded-full bg-[#7451a7]/40 blur-[80px]" />
            <div className="absolute bottom-[-150px] left-[20%] h-80 w-80 rounded-full bg-[#a87bc9]/20 blur-[90px]" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#d8c1eb]">
                  <ShieldAlert size={13} />
                  Common warning signs
                </div>
                <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                  Make you panic
                  <span className="block text-[#c9a9e6]">before you think.</span>
                </h2>
                <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/60">
                  
                  
                  “Your job offer expires today.”<br />
                  “Send the money now.”
                </p>
                <button
                  onClick={investigate}
                  className="mt-7 flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#291f31] transition hover:bg-[#f0e4f7]"
                >
                  Put it under the glass
                  <ScanSearch size={16} />
                </button>
              </div>

              <div className="relative min-h-[310px]">
                <div className="absolute left-[5%] top-[8%] w-[280px] rotate-[-5deg] rounded-3xl border border-white/10 bg-white/[.08] p-5 shadow-2xl backdrop-blur-xl sm:w-[330px]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7451a7]">
                      <Banknote size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black">WARNING SIGN</div>
                      <div className="text-[9px] text-white/40">received moments ago</div>
                    </div>
                  </div>
                  <div className="mt-5 text-2xl font-black">$1,250</div>
                  <div className="mt-2 text-xs text-white/50">Review the details carefully before taking action.</div>
                  <div className="mt-5 rounded-xl bg-[#a34e68]/20 px-3 py-2 text-[10px] font-black text-[#e9b6c6]">
                    ⚠ Pressure + money request
                  </div>
                </div>

                <div className="lens-float absolute right-[3%] top-[15%] z-10">
                  <div className="h-[205px] w-[205px] rounded-full border-[13px] border-[#d9c8e4] bg-[#c7aee0]/20 shadow-[0_25px_70px_rgba(0,0,0,.35)] backdrop-blur-sm">
                    <div className="flex h-full items-center justify-center rounded-full">
                      <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#d9c4ea]">Suspicious</div>
                        <div className="mt-1 text-xs font-black">Look closer</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute right-[1%] top-[56%] h-[120px] w-8 rotate-[-43deg] rounded-full bg-[#17121b]" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#eee4f5]">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#7451a7]">Pick your investigation</div>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                  Whatever looks suspicious,<br />bring it here.
                </h2>
              </div>
              <button onClick={investigate} className="flex items-center gap-2 text-sm font-black text-[#7451a7]">
                Start checking <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["login", MessageSquareText, "Messages", "Texts, emails & DMs"],
                ["upi", Banknote, "Payments", "Payment IDs & requests"],
                ["website", Globe2, "Websites", "Links & domains"],
                ["voice", Mic, "Voice", "Suspicious recordings"],
              ].map(([id, Icon, title, text]) => (
                <button
                  key={String(id)}
                  onClick={() => onStart(String(id))}
                  className="group rounded-3xl border border-[#8d719e]/15 bg-white p-6 text-left transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7451a7]/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#291f31] text-white transition group-hover:bg-[#7451a7]">
                      {(() => { const C = Icon as typeof MessageSquareText; return <C size={20} />; })()}
                    </div>
                    <ArrowRight size={17} className="text-[#b1a3b5] transition group-hover:translate-x-1 group-hover:text-[#7451a7]" />
                  </div>
                  <div className="mt-7 text-lg font-black">{String(title)}</div>
                  <div className="mt-1 text-xs font-bold text-[#877989]">{String(text)}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-[40px] border border-[#8d719e]/15 bg-white px-7 py-14 text-center shadow-xl shadow-[#7451a7]/5 sm:px-12">
            <div className="absolute left-1/2 top-[-100px] h-72 w-72 -translate-x-1/2 rounded-full bg-[#cdb4e5]/35 blur-[80px]" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#291f31] text-white shadow-xl">
                <ScanSearch size={27} />
              </div>
              <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Something doesn't add up?
                <span className="block text-[#7451a7]">Let's look closer.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-6 text-[#756878]">
                Don't let urgency make the decision for you. Run a check, inspect the clues and take back the moment.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={investigate}
                  className="group flex items-center gap-3 rounded-2xl bg-[#7451a7] px-7 py-4 text-sm font-black text-white shadow-xl shadow-[#7451a7]/20 transition hover:-translate-y-1 hover:bg-[#624294]"
                >
                  Try ScamCheck
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => window.location.pathname = "/pricing"}
                  className="rounded-2xl border border-[#8d719e]/20 bg-[#f8f2e9] px-7 py-4 text-sm font-black text-[#493d50] hover:bg-[#eee4f5]"
                >
                  View pricing
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#8d719e]/15 bg-[#f8f2e9]">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl p-1">
                <img src="/logo.png" alt="SRG ScamCheck" className="h-full w-full object-contain" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-[#291f31]">
                  SRG <span className="text-[#7451a7]">ScamCheck</span>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#958698]">
                  Look closer. Think smarter.
                </div>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#675b69]">
              Look closer. Think smarter. ScamCheck helps you pause, verify, and make safer decisions before you trust, click, pay, or share.
            </p>

            <nav className="mt-5 flex items-center gap-6 text-xs font-bold text-[#675b69]">
              <button onClick={() => onStart("privacy")} className="transition hover:text-[#7451a7]">
                Privacy Policy
              </button>
              <button onClick={() => onStart("terms")} className="transition hover:text-[#7451a7]">
                Terms of Service
              </button>
          
              <button
                onClick={() => onStart("contact")}
                className="transition hover:text-[#7451a7]"
             >
               Contact
             </button>
            </nav>

            <div className="mt-8 w-full border-t border-[#8d719e]/10 pt-5">
              <div className="flex flex-col items-center gap-2 text-xs font-bold text-[#877989]">
                <span>© {new Date().getFullYear()} SonicResume Group. All rights reserved.</span>
                <span className="flex items-center gap-2">
                  <LockKeyhole size={13} />
                  Built for safer decisions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
