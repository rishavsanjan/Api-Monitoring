"use client";

import { useState } from "react";
import { IconApi, IconCheck, IconDashboard, IconDatabase, IconGlobe, IconIncidents, IconMail, IconMenu, IconMonitors, IconMore, IconPlus, IconPulse, IconReports, IconSearch, IconSensors, IconSettings, IconShield, IconSpeed, IconWarning } from "../components/icons/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type MonitorStatus = "online" | "offline" | "degraded";

interface Monitor {
    id: number;
    name: string;
    url: string;
    status: MonitorStatus;
    responseTime: string;
    lastChecked: string;
    icon: React.ReactNode;
}

type NavItem = {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────



// ─── Data ─────────────────────────────────────────────────────────────────────

const MONITORS: Monitor[] = [
    { id: 1, name: "Main Website", url: "https://uptimepulse.com", status: "online", responseTime: "85ms", lastChecked: "1 min ago", icon: <IconGlobe /> },
    { id: 2, name: "API Gateway", url: "https://api.uptimepulse.com/v1", status: "online", responseTime: "120ms", lastChecked: "2 mins ago", icon: <IconApi /> },
    { id: 3, name: "Production DB", url: "db-prod-cluster.internal", status: "offline", responseTime: "Timeout", lastChecked: "Just now", icon: <IconDatabase /> },
    { id: 4, name: "Auth Service", url: "https://auth.uptimepulse.com", status: "online", responseTime: "150ms", lastChecked: "3 mins ago", icon: <IconShield /> },
    { id: 5, name: "Email Server", url: "smtp.uptimepulse.net", status: "online", responseTime: "310ms", lastChecked: "12 mins ago", icon: <IconMail /> },
];

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
    value: string;
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
    { label: "Dashboard", icon: <IconDashboard /> },
    { label: "Monitors", icon: <IconMonitors />, active: true },
    { label: "Incidents", icon: <IconIncidents /> },
    { label: "Reports", icon: <IconReports /> },
    { label: "Settings", icon: <IconSettings /> },
];

const Sidebar = ({ collapsed }: { collapsed: boolean }) => (
    <aside
        className={`
      flex-shrink-0 border-r border-slate-800 bg-[#101722] flex flex-col justify-between py-6
      transition-all duration-300
      ${collapsed ? "w-16" : "w-64"}
    `}
    >
        <div className={collapsed ? "px-3" : "px-6"}>
            {/* Brand */}
            <div className={`flex items-center gap-3 mb-10 ${collapsed ? "justify-center" : ""}`}>
                <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0 text-blue-400">
                    <IconPulse />
                </div>
                {!collapsed && (
                    <div className="flex flex-col leading-none">
                        <span className="text-white text-base font-bold">UptimePulse</span>
                        <span className="text-slate-500 text-xs font-medium mt-0.5">Monitoring Pro</span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href="#"
                        title={collapsed ? item.label : undefined}
                        className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${collapsed ? "justify-center" : ""}
              ${item.active
                                ? "bg-blue-500/10 text-blue-400"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }
            `}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </a>
                ))}
            </nav>
        </div>

        {/* Profile */}
        {!collapsed && (
            <div className="px-6 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                        AR
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Alex Rivera</p>
                        <p className="text-xs text-slate-500 truncate">Admin</p>
                    </div>
                </div>
            </div>
        )}
        {collapsed && (
            <div className="px-3 pt-6 border-t border-slate-800 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    AR
                </div>
            </div>
        )}
    </aside>
);

// ─── Add Monitor Modal ────────────────────────────────────────────────────────

const AddMonitorModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-white text-lg font-bold mb-6">Add New Monitor</h3>
            <div className="flex flex-col gap-4">
                {[
                    { label: "Monitor Name", placeholder: "e.g. Production API" },
                    { label: "URL or Hostname", placeholder: "https://api.example.com" },
                ].map((f) => (
                    <div key={f.label} className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">{f.label}</label>
                        <input
                            type="text"
                            placeholder={f.placeholder}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        />
                    </div>
                ))}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">Check Interval</label>
                    <select className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                        <option>Every 1 minute</option>
                        <option>Every 5 minutes</option>
                        <option>Every 10 minutes</option>
                        <option>Every 30 minutes</option>
                    </select>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                        Cancel
                    </button>
                    <button className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20">
                        Create Monitor
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── Monitors Table ───────────────────────────────────────────────────────────

const MonitorsTable = ({ monitors, search }: { monitors: Monitor[]; search: string }) => {
    const [openMenu, setOpenMenu] = useState<number | null>(null);

    const filtered = monitors.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-800">
                            {["Name", "URL", "Status", "Response Time", "Last Checked", "Actions"].map((h, i) => (
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
                        {filtered.map((m) => (
                            <tr
                                key={m.id}
                                className="hover:bg-slate-800/30 transition-colors group"
                            >
                                {/* Name */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                                            {m.icon}
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
                                    <StatusBadge status={m.status} />
                                </td>
                                {/* Response time */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`text-sm font-semibold ${m.status === "offline" ? "text-red-400" : "text-slate-300"}`}>
                                        {m.responseTime}
                                    </span>
                                </td>
                                {/* Last checked */}
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="text-sm text-slate-500">{m.lastChecked}</span>
                                </td>
                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-center relative">
                                    <button
                                        onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                                        className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
                                    >
                                        <IconMore />
                                    </button>
                                    {openMenu === m.id && (
                                        <div
                                            className="absolute right-6 top-12 z-20 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 w-40 text-left"
                                            onMouseLeave={() => setOpenMenu(null)}
                                        >
                                            {["View Details", "Edit Monitor", "Pause", "Delete"].map((action) => (
                                                <button
                                                    key={action}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${action === "Delete"
                                                            ? "text-red-400 hover:bg-red-500/10"
                                                            : "text-slate-300 hover:bg-slate-700"
                                                        }`}
                                                    onClick={() => setOpenMenu(null)}
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                                    No monitors match your search.
                                </td>
                            </tr>
                        )}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MonitorsPage() {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#101722] text-white">
            <Sidebar collapsed={sidebarCollapsed} />

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
                        <StatCard label="Active Monitors" value="24" icon={<IconSensors />} iconColor="text-blue-400" />
                        <StatCard label="Uptime (24h)" value="99.98%" icon={<IconCheck />} iconColor="text-emerald-400" />
                        <StatCard label="Average Latency" value="112ms" icon={<IconSpeed />} iconColor="text-amber-400" />
                        <StatCard label="Ongoing Incidents" value="1" icon={<IconWarning />} iconColor="text-red-400" valueColor="text-red-400" />
                    </div>

                    {/* Table */}
                    <MonitorsTable monitors={MONITORS} search={search} />
                </div>
            </main>

            {/* Modal */}
            {showModal && <AddMonitorModal onClose={() => setShowModal(false)} />}
        </div>
    );
}