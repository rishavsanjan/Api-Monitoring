"use client"
import { useState, useEffect, useRef, JSX } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface LogEntry {
  time: string;
  level: "info" | "success" | "error" | "fatal" | "alert";
  message: string;
  highlight?: boolean;
}

interface ActivityItem {
  icon: JSX.Element;
  iconBg: string;
  title: string;
  description: JSX.Element | string;
  timeAgo: string;
}

interface NodeStatus {
  region: string;
  latency: string | null;
  pct: number;
  isDown: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const LOGS: LogEntry[] = [
  {
    time: "14:32:01",
    level: "info",
    message: `Initializing health check request to https://api.midnight.pulse/v1/status`,
  },
  {
    time: "14:32:02",
    level: "success",
    message: `DNS resolution completed in 12ms. Resolved to IP 172.67.142.23`,
  },
  {
    time: "14:32:04",
    level: "error",
    message: `TLS Handshake initiated... Peer closed connection prematurely. Retrying...`,
  },
  {
    time: "14:32:34",
    level: "fatal",
    message: `Request timed out after 30000ms. Upstream server failed to respond. HTTP 504.`,
    highlight: true,
  },
  {
    time: "14:33:01",
    level: "alert",
    message: `Incident rule L1-CRIT-TIMEOUT triggered. Notifications dispatched.`,
  },
];

const NODES: NodeStatus[] = [
  { region: "San Francisco", latency: "22ms", pct: 98, isDown: false },
  { region: "London", latency: "88ms", pct: 95, isDown: false },
  { region: "Singapore", latency: null, pct: 0, isDown: true },
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const Ic = {
  pulse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  warning: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>,
  services: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  logs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>,
  schedule: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  timer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="13" r="8" /><polyline points="12 9 12 13 15 14" /><path d="M5 3l2 2M22 13h-1M4 13H3M12 5V4M18.4 6.6l-.7.7" /></svg>,
  trendUp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 inline"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  robot: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M9 11V7a3 3 0 016 0v4" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  escalate: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  call: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91A16 16 0 0016.09 17.1l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  cloud: <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12" /></svg>,
  checkToast: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><polyline points="20 6 9 17 4 12" /></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  login: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>,
};

// ── Log level helpers ─────────────────────────────────────────────────────────

const LOG_STYLES: Record<LogEntry["level"], { label: string; color: string; icon: JSX.Element }> = {
  info: {
    label: "[info]",
    color: "text-blue-400",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#3c83f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  },
  success: {
    label: "[success]",
    color: "text-emerald-400",
    icon: <svg viewBox="0 0 24 24" fill="#10b981" className="w-4 h-4 mt-0.5 shrink-0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>,
  },
  error: {
    label: "[error]",
    color: "text-red-400",
    icon: <svg viewBox="0 0 24 24" fill="#ef4444" className="w-4 h-4 mt-0.5 shrink-0"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>,
  },
  fatal: {
    label: "[fatal]",
    color: "text-red-400",
    icon: <svg viewBox="0 0 24 24" fill="#ef4444" className="w-4 h-4 mt-0.5 shrink-0"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" /></svg>,
  },
  alert: {
    label: "[alert]",
    color: "text-slate-400",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-8 right-8 flex items-center gap-4 bg-[#064e3b] text-emerald-300 px-6 py-4 rounded-2xl border border-emerald-500/20 shadow-2xl z-[100] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {Ic.checkToast}
      <div className="flex flex-col">
        <span className="font-bold text-sm">Action Confirmed</span>
        <span className="text-xs opacity-90">{message}</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IncidentDetail() {
  const [activeNav, setActiveNav] = useState("incidents");
  const [resolved, setResolved] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [elapsedSeconds, setElapsedSeconds] = useState(14 * 60 + 32);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log to bottom on mount
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, []);

  // Live duration counter
  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDuration = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handleRetry = () => showToast("Dispatching manual health check...");

  const handleResolve = () => {
    setResolved(true);
    showToast("Incident status updated to RESOLVED.");
  };

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: Ic.dashboard },
    { id: "incidents", label: "Incidents", icon: Ic.warning },
    { id: "services", label: "Services", icon: Ic.services },
    { id: "logs", label: "Logs", icon: Ic.logs },
    { id: "settings", label: "Settings", icon: Ic.settings },
  ];

  const ACTIVITY: ActivityItem[] = [
    {
      icon: Ic.robot,
      iconBg: "bg-blue-500",
      title: "Incident Detected",
      description: "System identified 3 consecutive failures.",
      timeAgo: "14m ago",
    },
    {
      icon: Ic.chat,
      iconBg: "bg-[#1e293b] border border-[#334155]",
      title: "Slack Alert Sent",
      description: <span>Dispatched to <span className="text-blue-400">#sre-team</span></span>,
      timeAgo: "12m ago",
    },
    {
      icon: Ic.mail,
      iconBg: "bg-[#1e293b] border border-[#334155]",
      title: "Email Escalation",
      description: "Alert sent to system administrators.",
      timeAgo: "10m ago",
    },
    {
      icon: Ic.escalate,
      iconBg: "bg-[#7f1d1d]",
      title: "Escalated to L2",
      description: "Automatic escalation due to critical impact.",
      timeAgo: "5m ago",
    },
  ];

  return (
    <div className="bg-[#101722] text-slate-100 min-h-screen font-sans flex">
      

      {/* ── Main ── */}
      <main className="p-8 min-h-screen flex-1">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
              {Ic.services}
              <span>Main API Gateway</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-500">INC-9421-A</span>
            </div>
            <h1 className="text-[30px] font-bold tracking-tight text-slate-100 leading-tight">
              API Gateway Connection Timeout
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="px-2.5 py-1 bg-[#7f1d1d] text-red-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full bg-red-500 ${!resolved ? "animate-pulse" : ""}`} />
                {resolved ? "RESOLVED" : "DOWN"}
              </span>
              <span className="px-2.5 py-1 bg-[#334155] text-slate-100 text-xs font-bold rounded-md border border-[#1e293b]">
                CRITICAL
              </span>
              <div className="h-4 w-px bg-[#334155] mx-1" />
              <span className="text-slate-400 text-sm flex items-center gap-1.5">
                {Ic.schedule} Started 14m ago
              </span>
              <span className="text-slate-400 text-sm flex items-center gap-1.5">
                {Ic.timer} Duration: {formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-slate-100 font-semibold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              {Ic.refresh} Retry Check
            </button>
            <button
              onClick={handleResolve}
              disabled={resolved}
              className={`px-6 py-2.5 font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                resolved
                  ? "bg-emerald-600 text-white shadow-emerald-500/20 cursor-default"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
              }`}
            >
              {Ic.check} {resolved ? "Resolved" : "Resolve Incident"}
            </button>
          </div>
        </header>

        {/* Grid layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* ── Left column ── */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Status Code", value: "504", sub: "Gateway Timeout", subColor: "text-slate-400" },
                { label: "Response Time", value: "30.0s", sub: <span className="text-red-400 flex items-center gap-1">{Ic.trendUp} +2850% vs avg</span>, subColor: "" },
                { label: "Region", value: "US-East-1", sub: "AWS N. Virginia", subColor: "text-slate-400" },
                { label: "Uptime (30d)", value: "99.98%", valueColor: "text-emerald-400", sub: "Impact: Minor", subColor: "text-slate-400" },
              ].map((card, i) => (
                <div key={i} className="glass-card p-5 rounded-xl bg-[#131c29]/40 backdrop-blur-md border border-white/[0.03]">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${i === 0 ? "text-red-400" : i === 3 ? "text-emerald-400" : "text-slate-100"}`}>{card.value}</p>
                  <p className={`text-[11px] mt-1 ${card.subColor}`}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-[#131c29]/40 backdrop-blur-md border border-white/[0.03] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3c83f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  Response Latency (ms)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-tight">Real-time Stream</span>
                </div>
              </div>
              <div className="h-64 relative px-4 pt-6">
                {/* grid lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-20">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="w-full h-px bg-slate-500" />)}
                </div>
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cg" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3c83f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3c83f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 150 L100 145 L200 160 L300 140 L400 155 L500 120 L600 30 L700 25 L800 20 L800 200 L0 200 Z" fill="url(#cg)" />
                  <path d="M0 150 L100 145 L200 160 L300 140 L400 155 L500 120 L600 30 L700 25 L800 20" fill="none" stroke="#3c83f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="600" cy="30" r="4" fill="#3c83f6" />
                  <text x="610" y="25" fill="#f87171" fontFamily="monospace" fontSize="10" fontWeight="bold">SPIKE: 30,000ms</text>
                </svg>
              </div>
            </div>

            {/* Log stream */}
            <div className="bg-[#131c29]/40 backdrop-blur-md rounded-xl overflow-hidden border border-blue-500/10">
              <div className="bg-[#0f151f] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-slate-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                  </div>
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest ml-4">Incident Log Stream</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">CONNECTED: Sentinel-Node-US-E1</span>
              </div>
              <div ref={logRef} className="max-h-[400px] overflow-y-auto font-mono text-sm leading-relaxed">
                {LOGS.map((log, i) => {
                  const s = LOG_STYLES[log.level];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-4 px-6 py-3 border-b border-[#1e293b]/30 hover:bg-slate-900/40 transition-colors ${
                        log.highlight ? "bg-[#7f1d1d]/10" : ""
                      }`}
                    >
                      <span className={`shrink-0 whitespace-nowrap text-xs ${log.highlight ? "font-bold text-slate-300" : "text-slate-500"}`}>{log.time}</span>
                      {s.icon}
                      <span className="text-slate-400 text-xs">
                        <span className={`font-bold ${s.color}`}>{s.label}</span>{" "}
                        {log.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Request / Response */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#131c29]/40 backdrop-blur-md border border-white/[0.03] p-6 rounded-xl">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  {Ic.logout} Request Context
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">URL</p>
                    <p className="text-sm font-mono text-slate-100 break-all">https://api.midnight.pulse/v1/auth/token</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Method</p>
                      <p className="text-sm font-bold text-emerald-400">POST</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Content-Type</p>
                      <p className="text-sm font-mono text-slate-100">application/json</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#131c29]/40 backdrop-blur-md border border-white/[0.03] p-6 rounded-xl">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="text-red-400">{Ic.login}</span> Response Payload
                </h4>
                <div className="bg-[#080b11] p-3 rounded-lg border border-[#1e293b]/20 font-mono text-xs text-slate-400">
                  <pre className="whitespace-pre-wrap">{`{
  "error": "gateway_timeout",
  "message": "upstream service 0x221 failed",
  "trace_id": "pulse_f42a1882bc",
  "timestamp": 1723459200
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Activity feed */}
            <div className="bg-[#131c29]/40 backdrop-blur-md border border-white/[0.03] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#1e293b]">
                <h3 className="font-bold text-slate-100">System Activity</h3>
              </div>
              <div className="p-6">
                <div className="relative space-y-8">
                  {/* timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-[#1e293b]" />
                  {ACTIVITY.map((item, i) => (
                    <div key={i} className="relative pl-10">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center ring-4 ring-[#101722] text-slate-300`}>
                        {item.icon}
                      </div>
                      <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{item.timeAgo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            

            
          </div>
        </div>
      </main>

      <Toast visible={toast.visible} message={toast.message} />

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}