"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import LoginPage from "../components/layout/Login";
import { IconPulse } from "../components/icons/icons";
import SignupPage from "../components/layout/Signup";
import Background from "../components/ui/BackGround";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = "login" | "signup";



// ─── Icons (inline SVG to avoid dependency) ───────────────────────────────────



// ─── Background ───────────────────────────────────────────────────────────────



export default function AuthPage() {
  const params = useSearchParams();
  const tab = params.get("tab")
  const [activeTab, setActiveTab] = useState<AuthMode>(() => tab === "signup" ? "signup" : 'login');

  return (
    <div className="min-h-screen flex flex-col text-white">
      <Background />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 md:px-10 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-blue-400">
          <IconPulse />
          <h2 className="text-white text-xl font-bold tracking-tight">UptimePulse</h2>
        </div>
        <p className="hidden md:block text-sm text-slate-500">Reliable monitoring for modern APIs.</p>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        {activeTab === "login" ? (
          <LoginPage onSwitch={() => setActiveTab("signup")} />
        ) : (
          <SignupPage onSwitch={() => setActiveTab("login")} />
        )}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease both; }
      `}</style>
    </div>
  );
}