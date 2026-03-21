"use client";

import { IconAnalytics, IconBell, IconChevronRight, IconDashboard, IconEdit, IconIncidents, IconMonitors, IconPlay, IconSearch, IconSettings, IconTrendDown, IconTrendUp, IconUser } from "@/app/components/icons/icons";
import HistoryTable from "@/app/components/layout/HistoryTable";
import PerformanceChart from "@/charts/PerformanceChart";
import api from "@/lib/axios";
import { Monitor, MonitorHistory } from "@/type/props";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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

interface Stats {
    CheckedAt: string,
    ID: number,
    MonitorID: string,
    ResponseTimeMs: number,
    Status: "UP" | "DOWN",
    StatusCode: number
}

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
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data } = useQuery({
        queryKey: ['monitor-result', id],
        queryFn: async () => {
            const response = await api.get(`/api/monitors/${id}/results`)
            console.log(response.data)
            return response.data as {
                history: MonitorHistory[],
                monitor: Monitor,
                stats: {
                    totalLogs: number
                    uptime: number
                    avgLatency: number
                }
            }
        }
    })

    if (!data) {
        return;
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#101722] text-white">
            <Topbar />
            <div className="flex flex-1">
                <main className="flex-1 overflow-y-auto bg-[#0d131e]">
                    <div className="p-6 lg:px-10 ">

                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">

                            <button onClick={() => { router.push('/dashboard') }} className="hover:text-blue-400 transition-colors">Monitors</button>
                            <IconChevronRight />
                            <span className="text-white font-medium">{data?.monitor.Name}</span>
                        </nav>

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-3">
                                    {data?.monitor.Name}
                                </h1>
                                <div className="flex items-center gap-2.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                                    </span>
                                    <span className="text-slate-400 text-sm font-medium">
                                        Endpoint:{" "}
                                        <code className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-blue-400 font-mono text-xs">
                                            {data?.monitor.URL}
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
                            <StatCard label="Uptime (24h)" value={`${String(data!.stats.uptime.toFixed(1))}%`} delta="+0.05%" deltaPositive={true} />
                            <StatCard label="Avg. Latency" value={`${String(data.stats.avgLatency.toFixed(0))} ms`} delta="+12ms" deltaPositive={false} />
                            <StatCard label="Total Checks" value={`${String(data.stats.totalLogs)}`} delta="Scheduled" deltaPositive={null} />
                        </div>

                        <PerformanceChart />

                        {/* Chart */}
                        <ResponseChart />

                        {/* History */}
                        <HistoryTable history={data?.history ?? []} />
                    </div>
                </main>
            </div>
        </div>
    );
}