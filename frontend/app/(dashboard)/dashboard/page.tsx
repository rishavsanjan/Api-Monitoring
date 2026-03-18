"use client";

import { useState } from "react";
import { IconCheck, IconMenu, IconPlus, IconSearch, IconSensors, IconSpeed, IconWarning } from "../../components/icons/icons";
import { useQueries, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { timeAgo } from "@/lib/date";
import { AddMonitorModal } from "@/app/components/layout/AddReportModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type MonitorStatus = "online" | "offline" | "degraded";

interface Monitor {
    monitorId: string,
    method: "GET" | "POST",
    status: string,
    name: string,
    url: string,
    responseTimeMs: number
    lastCheckedAt: string
    currentStatus: number,
    expectedStatus: number

}



const PAGE_SIZE = 5;
const TOTAL = 24;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: MonitorStatus }) => {
    const config = {
        online: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Online" },
        offline: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Offline" },
        degraded: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Degraded" },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    iconColor: string;
    valueColor?: string;
}

const StatCard = ({ label, value, icon, iconColor, valueColor = "text-white" }: StatCardProps) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">{label}</span>
            <span className={iconColor}>{icon}</span>
        </div>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
);



// ─── Sidebar ───────────────────────────────────────────────────────────────
// ─── Add Monitor Modal ────────────────────────────────────────────────────────



// ─── Monitors Table ───────────────────────────────────────────────────────────

const MonitorsTable = ({ monitors, search }: { monitors: Monitor[]; search: string }) => {


    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-800">
                            {["Name", "URL", "Status", "Response Time", "Last Checked"].map((h, i) => (
                                <th
                                    key={h}
                                    className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i >= 3 ? (i === 5 ? "text-center" : "text-right") : ""
                                        }`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {monitors.map((m) => (
                            <tr
                                key={m.monitorId}
                                className="hover:bg-slate-800/30 transition-colors group"
                            >
                                {/* Name */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">

                                        </div>
                                        <span className="text-sm font-semibold text-white">{m.name}</span>
                                    </div>
                                </td>
                                {/* URL */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-slate-500 font-mono">{m.url}</span>
                                </td>
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={m.currentStatus === m.expectedStatus ? "online" : "offline"} />
                                </td>
                                {/* Response time */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`text-sm font-semibold ${m.status === "offline" ? "text-red-400" : "text-slate-300"}`}>
                                        {m.responseTimeMs}
                                    </span>
                                </td>
                                {/* Last checked */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="text-sm text-slate-500">{timeAgo(m.lastCheckedAt)}</span>
                                </td>

                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-800 bg-slate-800/30">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-white">1</span> to{" "}
                    <span className="font-semibold text-white">{PAGE_SIZE}</span> of{" "}
                    <span className="font-semibold text-white">{TOTAL}</span> results
                </p>
                <div className="flex gap-1.5">
                    <button disabled className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-600 cursor-not-allowed">
                        Previous
                    </button>
                    {[1, 2, 3].map((p) => (
                        <button
                            key={p}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === 1
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                : "border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};


interface Stats {
    activeMonitors: number
    uptime: number
    averageLatency: number
    incidents: number
}



export default function MonitorsPage() {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');

    const queries = useQueries({
        queries: [
            {
                queryKey: ['monitors', currentPage, activeTab],

                queryFn: async () => {
                    const res = await api.get(`/api/monitors?tab=${activeTab}&page=${currentPage}&limit=${5}`);
                    console.log(res.data)
                    return res.data.monitors as Monitor[];
                },
                staleTime: 60000,
                gcTime: 10 * 60 * 1000,
                refetchInterval: 60000
            },
            {
                queryKey: ['stats'],

                queryFn: async () => {
                    const res = await api.get(`/api/monitors/stats`);
                    console.log(res.data)
                    return res.data.stats as Stats;
                },
                staleTime: 60000,
                gcTime: 10 * 60 * 1000,
                refetchInterval: 60000
            }
        ]
    })

    const [monitorsQuery, statsQuery] = queries;

    const monitors: Monitor[] = monitorsQuery.data ?? [];
    const statistics: Stats = statsQuery.data ?? {
        activeMonitors: 0,
        uptime: 0,
        averageLatency: 0,
        incidents: 0
    };

    if (!monitors || !statistics) {
        return;
    }


    return (
        <div className="flex h-screen overflow-hidden bg-[#101722] text-white">

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#101722] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <IconMenu />
                        </button>
                        <h2 className="text-lg font-bold text-white">Monitors</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                <IconSearch />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search monitors…"
                                className="w-56 bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Add monitor */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <IconPlus />
                            Add Monitor
                        </button>
                    </div>
                </header>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard label="Active Monitors" value={ statistics.activeMonitors} icon={<IconSensors />} iconColor="text-blue-400" />
                        <StatCard label="Uptime (24h)" value={statistics.uptime} icon={<IconCheck />} iconColor="text-emerald-400" />
                        <StatCard label="Average Latency" value={statistics.averageLatency} icon={<IconSpeed />} iconColor="text-amber-400" />
                        <StatCard label="Ongoing Incidents" value={statistics.incidents} icon={<IconWarning />} iconColor="text-red-400" valueColor="text-red-400" />
                    </div>

                    {/* Table */}
                    <MonitorsTable monitors={monitors} search={search} />
                </div>
            </main>

            {/* Modal */}
            {showModal && <AddMonitorModal onClose={() => setShowModal(false)} />}
        </div>
    );
}