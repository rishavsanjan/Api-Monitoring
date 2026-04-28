"use client"
import { useUser } from "@/context/UserContext";
import { useState, useRef, KeyboardEvent, ClipboardEvent, useEffect } from "react";

const DIGIT_COUNT = 6;

export default function OtpVerification() {
  const [digits, setDigits] = useState<string[]>(Array(DIGIT_COUNT).fill(""));
  const [countdown, setCountdown] = useState<number>(59);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const {user} = useUser();
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = sanitized;
    setDigits(updated);
    if (sanitized && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGIT_COUNT);
    if (!pasted) return;
    const updated = [...digits];
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    setDigits(updated);
    const nextFocus = Math.min(pasted.length, DIGIT_COUNT - 1);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(59);
    setCanResend(false);
    setDigits(Array(DIGIT_COUNT).fill(""));
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = async () => {
    if (digits.some((d) => !d)) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsVerifying(false);
    alert(`OTP submitted: ${digits.join("")}`);
  };

  const filled = digits.filter(Boolean).length;
  const progress = (filled / DIGIT_COUNT) * 100;

  return (
    <div className="min-h-screen bg-[#101722] font-sans text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(51,65,85,0.15) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Ambient blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#101722]/50 backdrop-blur-xl border-b border-slate-800/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter text-slate-100">Midnight Pulse</span>
        </div>
        <button className="text-slate-400 hover:text-blue-400 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 pt-16 pb-12 relative z-10">
        <div className="w-full max-w-[480px]">
          {/* Card */}
          <div className="bg-[#131c29] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden relative border border-white/5">
            {/* Top gradient bar with progress */}
            <div className="h-1 w-full bg-slate-800 relative">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-6 ring-1 ring-blue-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3c83f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h1 className="text-[28px] font-bold text-slate-100 leading-tight tracking-tight mb-3">
                  Verify your email
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[320px] mx-auto">
                  We've sent a 6-digit verification code to{" "}
                  <span className="text-slate-200 font-semibold">{user?.email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              <div className="space-y-8">
                <div
                  className={`flex justify-between gap-2 md:gap-3 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
                  style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
                >
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      placeholder="0"
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      className={[
                        "w-full h-14 md:h-16 text-center text-2xl font-bold font-mono rounded-xl transition-all duration-150 outline-none border",
                        "bg-[#0f151f] text-slate-100 placeholder-slate-700",
                        digit
                          ? "border-blue-500/60 shadow-sm shadow-blue-500/10"
                          : "border-slate-700/40 hover:border-slate-600/60",
                        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      ].join(" ")}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isVerifying}
                    className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify Account
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-sm text-slate-400">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleResend}
                        disabled={!canResend}
                        className={`font-semibold ml-1 transition-all ${
                          canResend
                            ? "text-blue-400 hover:underline decoration-2 underline-offset-4 cursor-pointer"
                            : "text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {canResend ? "Resend code" : `Resend (0:${String(countdown).padStart(2, "0")})`}
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Back to login */}
              <div className="mt-12 flex justify-center">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Login
                </a>
              </div>
            </div>

            {/* Glass ring overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-white/5 ring-inset" />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-col items-center gap-4 opacity-40">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure TLS 1.3</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}