import { useState } from "react";
import { Home } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";

type Mode = "login" | "signup" | "reset";

type LoginProps = {
  onAuthSuccess: () => void;
  onBack: () => void;
};

export default function AuthPage({
  onAuthSuccess,
  onBack,
}: LoginProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (mode !== "reset" && !password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        onAuthSuccess();
      }

      if (mode === "signup") {
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        onAuthSuccess();
      }

      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email.trim());

        setMessage(
          "Password reset instructions have been sent to your email."
        );
      }
    } catch (err: any) {
      const code = err?.code || "";

      if (code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/user-not-found") {
        setError("No account was found with this email.");
      } else {
        setError(
          err?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(
          err?.message || "Google sign-in failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const title =
    mode === "login"
      ? "Welcome back"
      : mode === "signup"
        ? "Create your account"
        : "Reset your password";

  const subtitle =
    mode === "login"
      ? "Protect yourself before the scam reaches you."
      : mode === "signup"
        ? "Your personal shield against digital scams."
        : "We'll send you a secure reset link.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8d8c6] px-5 py-8 text-[#43265f]">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="morph morph-one" />
        <div className="morph morph-two" />
        <div className="morph morph-three" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_55%)]" />
      </div>

      {/* Top navigation */}
      <div className="relative z-20 mx-auto flex max-w-6xl items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-full bg-white/55 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#66388a] shadow-sm backdrop-blur-md transition hover:bg-white hover:-translate-y-0.5"
        >
          <Home size={15} />
          Home
        </button>

        <div className="text-xs font-black uppercase tracking-[0.28em] text-[#66388a]">
          SRG-ScamCheck
        </div>
      </div>

      {/* Login area */}
      <div className="relative z-10 flex min-h-[calc(100vh-90px)] items-center justify-center py-10">
        <section className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-7 flex flex-col items-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-white/70 p-4 shadow-[0_20px_60px_rgba(84,42,105,0.15)] backdrop-blur-xl">
              <img
                src="/logo.png"
                alt="SRG-ScamCheck"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <h1 className="text-center text-3xl font-black tracking-tight text-[#5d3480]">
              {title}
            </h1>

            <p className="mt-2 max-w-xs text-center text-sm font-medium leading-6 text-[#76517f]">
              {subtitle}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[34px] border border-white/70 bg-white/75 p-6 shadow-[0_30px_90px_rgba(79,43,95,0.18)] backdrop-blur-2xl sm:p-8">
            {/* Mode selector */}
            <div className="mb-6 flex rounded-2xl bg-[#f4e4dc] p-1">
              {(["login", "signup", "reset"] as Mode[]).map((item) => {
                const label =
                  item === "login"
                    ? "Login"
                    : item === "signup"
                      ? "Sign up"
                      : "Reset";

                const active =
                  mode === item
                    ? "bg-white text-[#703b94] shadow-sm"
                    : "text-[#987c9f] hover:text-[#703b94]";

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeMode(item)}
                    className={
                      "flex-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition " +
                      active
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Email */}
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#70477f]">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mb-4 w-full rounded-2xl border border-[#e8cfc3] bg-[#fffaf7] px-4 py-4 text-sm font-semibold text-[#43265f] outline-none transition placeholder:text-[#bba5b8] focus:border-[#8651a8] focus:ring-4 focus:ring-[#8651a8]/10"
            />

            {/* Password */}
            {mode !== "reset" && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#70477f]">
                    Password
                  </label>

                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => changeMode("reset")}
                      className="text-[10px] font-black uppercase tracking-widest text-[#8651a8] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                  className="w-full rounded-2xl border border-[#e8cfc3] bg-[#fffaf7] px-4 py-4 text-sm font-semibold text-[#43265f] outline-none transition placeholder:text-[#bba5b8] focus:border-[#8651a8] focus:ring-4 focus:ring-[#8651a8]/10"
                />
              </>
            )}

            {/* Confirm password */}
            {mode === "signup" && (
              <>
                <label className="mb-2 mt-4 block text-[10px] font-black uppercase tracking-widest text-[#70477f]">
                  Confirm password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-[#e8cfc3] bg-[#fffaf7] px-4 py-4 text-sm font-semibold text-[#43265f] outline-none transition placeholder:text-[#bba5b8] focus:border-[#8651a8] focus:ring-4 focus:ring-[#8651a8]/10"
                />
              </>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs font-bold leading-5 text-[#70418c]">
                {message}
              </div>
            )}

            {/* Main button */}
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-[#713b94] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(113,59,148,0.28)] transition hover:-translate-y-0.5 hover:bg-[#633181] hover:shadow-[0_18px_35px_rgba(113,59,148,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Enter SRG-ScamCheck"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </button>

            {/* Google */}
            {mode !== "reset" && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e7d5cf]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#ae96aa]">
                    or
                  </span>
                  <div className="h-px flex-1 bg-[#e7d5cf]" />
                </div>

                <button
                  type="button"
                  onClick={googleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#e3d3cf] bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#513260] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fffaf7] disabled:opacity-60"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black">
                    G
                  </span>
                  Continue with Google
                </button>
              </>
            )}

            {mode === "reset" && (
              <button
                type="button"
                onClick={() => changeMode("login")}
                className="mt-4 w-full py-2 text-[10px] font-black uppercase tracking-widest text-[#805093] hover:underline"
              >
                Back to login
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#8d6b8d]">
            Your digital safety starts here.
          </p>
        </section>
      </div>

      <style>{`
        .morph {
          position: absolute;
          width: 38rem;
          height: 38rem;
          border-radius: 43% 57% 63% 37% / 47% 41% 59% 53%;
          filter: blur(3px);
          opacity: 0.34;
          will-change: transform, border-radius;
        }

        .morph-one {
          left: -12rem;
          top: -12rem;
          background: rgba(119, 65, 151, 0.34);
          animation: morphOne 16s ease-in-out infinite alternate;
        }

        .morph-two {
          right: -13rem;
          bottom: -13rem;
          width: 34rem;
          height: 34rem;
          background: rgba(135, 75, 163, 0.28);
          animation: morphTwo 19s ease-in-out infinite alternate;
        }

        .morph-three {
          left: 42%;
          top: 36%;
          width: 25rem;
          height: 25rem;
          background: rgba(255, 255, 255, 0.38);
          animation: morphThree 13s ease-in-out infinite alternate;
        }

        @keyframes morphOne {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            border-radius: 43% 57% 63% 37% / 47% 41% 59% 53%;
          }

          50% {
            transform: translate3d(7rem, 5rem, 0) rotate(35deg) scale(1.12);
            border-radius: 63% 37% 42% 58% / 59% 55% 45% 41%;
          }

          100% {
            transform: translate3d(15rem, 1rem, 0) rotate(70deg) scale(0.94);
            border-radius: 32% 68% 55% 45% / 39% 61% 44% 56%;
          }
        }

        @keyframes morphTwo {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            border-radius: 58% 42% 35% 65% / 52% 37% 63% 48%;
          }

          50% {
            transform: translate3d(-8rem, -5rem, 0) rotate(-30deg) scale(1.1);
            border-radius: 38% 62% 59% 41% / 63% 45% 55% 37%;
          }

          100% {
            transform: translate3d(-2rem, -10rem, 0) rotate(-65deg) scale(0.92);
            border-radius: 68% 32% 46% 54% / 41% 58% 42% 59%;
          }
        }

        @keyframes morphThree {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            border-radius: 52% 48% 61% 39% / 44% 63% 37% 56%;
          }

          50% {
            transform: translate3d(-6rem, 4rem, 0) rotate(45deg) scale(1.2);
            border-radius: 39% 61% 43% 57% / 62% 38% 58% 42%;
          }

          100% {
            transform: translate3d(6rem, -5rem, 0) rotate(90deg) scale(0.8);
            border-radius: 65% 35% 56% 44% / 35% 65% 45% 55%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .morph {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
