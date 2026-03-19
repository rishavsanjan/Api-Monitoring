"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckStatus = "healthy" | "failed" | "degraded";
type TimeRange = "1h" | "24h" | "7d";

interface CheckRecord {
    id: number;
    status: CheckStatus;
    timestamp: string;
    responseTime: string;
    statusCode: string;
    location: string;
}

interface StatCardProps {
    label: string;
    value: string;
    delta: string;
    deltaPositive: boolean | null;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconAnalytics = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconDashboard = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
const IconMonitors = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const IconIncidents = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const IconSettings = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const IconChevronRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const IconTrendUp = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);
const IconTrendDown = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
);
const IconPlay = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
const IconEdit = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHECK_HISTORY: CheckRecord[] = [
    { id: 1, status: "healthy", timestamp: "Oct 24, 2023  14:30:05", responseTime: "118ms", statusCode: "200 OK", location: "San Francisco, US" },
    { id: 2, status: "healthy", timestamp: "Oct 24, 2023  14:29:05", responseTime: "132ms", statusCode: "200 OK", location: "London, UK" },
    { id: 3, status: "failed", timestamp: "Oct 24, 2023  14:28:05", responseTime: "5002ms", statusCode: "504 Timeout", location: "Tokyo, JP" },
    { id: 4, status: "healthy", timestamp: "Oct 24, 2023  14:27:05", responseTime: "125ms", statusCode: "200 OK", location: "San Francisco, US" },
    { id: 5, status: "healthy", timestamp: "Oct 24, 2023  14:26:05", responseTime: "121ms", statusCode: "200 OK", location: "Frankfurt, DE" },
];

const CHART_PATHS: Record<TimeRange, { line: string; area: string }> = {
    "1h": {
        line: "M0,160 Q80,150 160,155 T320,140 T480,148 T640,135 T800,142 T1000,138",
        area: "M0,160 Q80,150 160,155 T320,140 T480,148 T640,135 T800,142 T1000,138 L1000,200 L0,200 Z",
    },
    "24h": {
        line: "M0,150 Q100,140 200,160 T400,120 T600,145 T800,110 T1000,130",
        area: "M0,150 Q100,140 200,160 T400,120 T600,145 T800,110 T1000,130 L1000,200 L0,200 Z",
    },
    "7d": {
        line: "M0,130 Q120,155 240,140 T480,160 T640,110 T820,135 T1000,120",
        area: "M0,130 Q120,155 240,140 T480,160 T640,110 T820,135 T1000,120 L1000,200 L0,200 Z",
    },
};

const TIME_LABELS: Record<TimeRange, string[]> = {
    "1h": ["0m", "15m", "30m", "45m", "Now"],
    "24h": ["12:00 AM", "06:00 AM", "12:00 PM", "06:00 PM", "Now"],
    "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: CheckStatus }) => {
    const cfg = {
        healthy: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Healthy" },
        failed: { dot: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", label: "Failed" },
        degraded: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Degraded" },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, delta, deltaPositive }: StatCardProps) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-white">{value}</p>
            <span
                className={`flex items-center gap-0.5 text-sm font-semibold ${deltaPositive === null ? "text-slate-500" : deltaPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
            >
                {deltaPositive !== null && (deltaPositive ? <IconTrendUp /> : <IconTrendDown />)}
                {delta}
            </span>
        </div>
    </div>
);

// ─── Response Time Chart ──────────────────────────────────────────────────────

const ResponseChart = () => {
    const [range, setRange] = useState<TimeRange>("24h");
    const { line, area } = CHART_PATHS[range];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-white">Response Time</h3>
                <div className="flex gap-1.5">
                    {(["1h", "24h", "7d"] as TimeRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${range === r
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 pt-4 pb-8 relative h-64">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {[50, 100, 150].map((y) => (
                        <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="#1e293b" strokeDasharray="6" />
                    ))}
                    <path d={area} fill="url(#chartGrad)" />
                    <path d={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="1000" cy="130" r="5" fill="#3b82f6" />
                    <circle cx="1000" cy="130" r="10" fill="#3b82f6" fillOpacity="0.15" />
                </svg>

                {/* Y labels */}
                <div className="absolute left-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
                    {["300ms", "200ms", "100ms"].map((l) => (
                        <span key={l} className="text-[10px] text-slate-600 font-mono">{l}</span>
                    ))}
                </div>

                {/* X labels */}
                <div className="absolute bottom-1 left-6 right-6 flex justify-between">
                    {TIME_LABELS[range].map((l) => (
                        <span key={l} className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">{l}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── History Table ────────────────────────────────────────────────────────────

const HistoryTable = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white">Recent Check History</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-slate-800">
                    <tr>
                        {["Status", "Timestamp", "Response Time", "Status Code", "Location"].map((h) => (
                            <th key={h} className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {CHECK_HISTORY.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-300 whitespace-nowrap">{row.timestamp}</td>
                            <td className="px-6 py-4 text-sm text-slate-300 font-mono">{row.responseTime}</td>
                            <td className="px-6 py-4">
                                <span className={`font-mono text-sm ${row.status === "failed" ? "text-rose-400" : "text-emerald-400"}`}>
                                    {row.statusCode}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{row.location}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-800 text-center">
            <button className="text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                View Full History →
            </button>
        </div>
    </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type NavItem = { label: string; icon: React.ReactNode; active?: boolean };

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", icon: <IconDashboard /> },
    { label: "Monitors", icon: <IconMonitors />, active: true },
    { label: "Incidents", icon: <IconIncidents /> },
    { label: "Settings", icon: <IconSettings /> },
];

const Sidebar = () => (
    <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-[#101722] p-4 gap-6">
        <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <IconUser />
            </div>
            <div>
                <p className="text-sm font-semibold text-white">DevOps Admin</p>
                <p className="text-xs text-slate-500">Premium Plan</p>
            </div>
        </div>
        <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
                <a
                    key={item.label}
                    href="#"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${item.active ? "bg-blue-500/10 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                </a>
            ))}
        </nav>
    </aside>
);

// ─── Topbar ───────────────────────────────────────────────────────────────────

const Topbar = () => (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-[#101722]">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <IconAnalytics />
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">Monitor Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:flex relative w-56">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><IconSearch /></span>
                <input
                    type="text"
                    placeholder="Search monitors…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
            </div>
            {([<IconBell key="bell" />, <IconUser key="user" />]).map((icon, i) => (
                <button key={i} className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                    {icon}
                </button>
            ))}
        </div>
    </header>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MonitorDetailPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#101722] text-white">
            <Topbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-[#0d131e]">
                    <div className="p-6 lg:px-10 max-w-5xl">

                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
                            <a href="#" className="hover:text-blue-400 transition-colors">Monitors</a>
                            <IconChevronRight />
                            <span className="text-white font-medium">User Auth API</span>
                        </nav>

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-3">
                                    User Auth API
                                </h1>
                                <div className="flex items-center gap-2.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                                    </span>
                                    <span className="text-slate-400 text-sm font-medium">
                                        Endpoint:{" "}
                                        <code className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-blue-400 font-mono text-xs">
                                            /v1/auth/login
                                        </code>
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors">
                                    <IconEdit />
                                    Edit Monitor
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                                    <IconPlay />
                                    Run Check Now
                                </button>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                            <StatCard label="Uptime (24h)" value="99.9%" delta="+0.05%" deltaPositive={true} />
                            <StatCard label="Avg. Latency" value="124ms" delta="+12ms" deltaPositive={false} />
                            <StatCard label="Total Checks" value="1,440" delta="Scheduled" deltaPositive={null} />
                        </div>

                        {/* Chart */}
                        <ResponseChart />

                        {/* History */}
                        <HistoryTable />
                    </div>
                </main>
            </div>
        </div>
    );
}