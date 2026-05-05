"use client"
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
type IncidentSeverity = "critical" | "major" | "minor";

interface Incident {
  id: string;
  title: string;
  service: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  duration: string;
  startedAt: string;
}

type NavItem = { id: string; label: string; icon: JSX.Element };
type FilterStatus = "all" | IncidentStatus;
type FilterSeverity = "all" | IncidentSeverity;

// ── Data ───────────────────────────────────────────────────────────────────────

const INCIDENTS: Incident[] = [
  {
    id: "INC-0041",
    title: "API Gateway Latency Spike",
    service: "prod-us-east-1 / gateway-service",
    status: "investigating",
    severity: "critical",
    duration: "42m 12s",
    startedAt: "Today, 14:22 UTC",
  },
  {
    id: "INC-0040",
    title: "Auth Service Database Connection Timeout",
    service: "auth-service / postgres-primary",
    status: "identified",
    severity: "major",
    duration: "1h 05m",
    startedAt: "Today, 13:59 UTC",
  },
  {
    id: "INC-0039",
    title: "Storage Node Rebalancing Failure",
    service: "storage-cluster-04 / s3-compat",
    status: "resolved",
    severity: "minor",
    duration: "24m 10s",
    startedAt: "Oct 24, 09:12 UTC",
  },
  {
    id: "INC-0038",
    title: "Inbound Webhook Delay",
    service: "event-bus / ingress-v2",
    status: "resolved",
    severity: "minor",
    duration: "8m 44s",
    startedAt: "Oct 23, 22:45 UTC",
  },
  {
    id: "INC-0037",
    title: "CDN Cache Purge Failure",
    service: "cdn-edge / cache-service",
    status: "resolved",
    severity: "minor",
    duration: "15m 30s",
    startedAt: "Oct 22, 18:00 UTC",
  },
];

// ── Icons ──────────────────────────────────────────────────────────────────────

const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  services: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  trendUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  trendDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
  { id: "incidents", label: "Incidents", icon: Icons.warning },
  { id: "services", label: "Services", icon: Icons.services },
  { id: "logs", label: "Logs", icon: Icons.logs },
  { id: "settings", label: "Settings", icon: Icons.settings },
];

// ── Status / Severity helpers ─────────────────────────────────────────────────

const STATUS_STYLES: Record<IncidentStatus, { badge: string; dot: string; label: string; pulse: boolean }> = {
  investigating: {
    badge: "bg-yellow-900/40 text-yellow-400 border border-yellow-400/20",
    dot: "bg-yellow-400",
    label: "Investigating",
    pulse: true,
  },
  identified: {
    badge: "bg-orange-900/40 text-orange-400 border border-orange-400/20",
    dot: "bg-orange-400",
    label: "Identified",
    pulse: false,
  },
  monitoring: {
    badge: "bg-blue-900/40 text-blue-400 border border-blue-400/20",
    dot: "bg-blue-400",
    label: "Monitoring",
    pulse: true,
  },
  resolved: {
    badge: "bg-emerald-900/40 text-emerald-400 border border-emerald-400/20",
    dot: "bg-emerald-400",
    label: "Resolved",
    pulse: false,
  },
};

const SEVERITY_STYLES: Record<IncidentSeverity, { dot: string; label: string; text: string }> = {
  critical: { dot: "bg-red-500", label: "Critical", text: "text-slate-300" },
  major: { dot: "bg-orange-500", label: "Major", text: "text-slate-300" },
  minor: { dot: "bg-slate-500", label: "Minor", text: "text-slate-400" },
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IncidentsDashboard() {
  const [activeNav, setActiveNav] = useState("incidents");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const TOTAL_PAGES = 3;

  const filtered = INCIDENTS.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inc.status === statusFilter;
    const matchSeverity = severityFilter === "all" || inc.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  const activeCount = INCIDENTS.filter((i) => i.status !== "resolved").length;
  const resolvedCount = INCIDENTS.filter((i) => i.status === "resolved").length;

  return (
    <div className="bg-[#101722] text-slate-100 min-h-screen font-sans flex relative">
      {/* Ambient glow */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ── Sidebar ── */}
      

      {/* ── Main ── */}
      <main className="ml-64 flex-1 min-h-screen relative z-10">
        {/* Top nav */}
        <header className="fixed top-0 left-64 right-0 z-40 bg-slate-900/50 backdrop-blur-md h-16 px-8 flex justify-between items-center border-b border-white/5">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{Icons.search}</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="bg-slate-800 border-none rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 w-64 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/50 transition-colors">
              {Icons.bell}
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/50 transition-colors">
              {Icons.user}
            </button>
          </div>
        </header>

        <div className="pt-24 px-8 pb-12">
          {/* Page header */}
          <div className="mb-12">
            <h2 className="text-[30px] font-bold tracking-tight text-white mb-2">Incidents</h2>
            <p className="text-slate-400 max-w-2xl text-sm">
              Real-time monitoring of active system anomalies and historical resolution logs. Maintain 99.99% reliability through systematic tracking.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Open incidents */}
            <div className="bg-[#131c29] rounded-xl p-6 border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-8xl leading-none select-none">⚠</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Open Incidents</p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-white leading-none">
                  {String(activeCount).padStart(2, "0")}
                </span>
                <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                  {Icons.trendUp} +2 this hour
                </span>
              </div>
            </div>

            {/* MTTR */}
            <div className="bg-[#131c29] rounded-xl p-6 border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity text-8xl leading-none select-none">⏱</div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">MTTR</p>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white leading-none">18</span>
                  <span className="text-sm font-bold text-slate-500">min</span>
                </div>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  {Icons.trendDown} -4m avg
                </span>
              </div>
            </div>

            {/* Health score */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">System Health Score</h3>
                <p className="text-sm text-slate-400">All services are within operational thresholds.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-2xl font-black text-blue-400">99.98%</span>
                  <span className="text-[10px] uppercase tracking-tighter text-slate-500">Last 24 Hours</span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="bg-[#1e293b] border border-white/5 px-4 py-2 pl-8 rounded-lg text-sm font-medium text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="all">Status: All</option>
                  <option value="investigating">Investigating</option>
                  <option value="identified">Identified</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="resolved">Resolved</option>
                </select>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">{Icons.filter}</span>
              </div>

              {/* Severity filter */}
              <div className="relative">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as FilterSeverity)}
                  className="bg-[#1e293b] border border-white/5 px-4 py-2 pl-8 rounded-lg text-sm font-medium text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="all">Severity: All</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
              </div>

              <div className="h-6 w-px bg-white/10 mx-1" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active: {activeCount}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resolved: {resolvedCount}</span>
            </div>

            <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/20">
              {Icons.add} Create Incident
            </button>
          </div>

          {/* Table */}
          <div className="bg-[#131c29] rounded-xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/30">
                    {["Incident & Service", "Status", "Severity", "Duration / Started", ""].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest ${h === "" ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                        No incidents match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((inc) => {
                      const s = STATUS_STYLES[inc.status];
                      const sev = SEVERITY_STYLES[inc.severity];
                      const isResolved = inc.status === "resolved";
                      return (
                        <tr key={inc.id} className={`hover:bg-white/[0.02] transition-colors group ${isResolved ? "opacity-70 hover:opacity-100" : ""}`}>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{inc.title}</span>
                              <span className="text-xs font-mono text-slate-500 mt-1">{inc.service}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
                              {s.label}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                              <span className={`text-sm font-medium ${sev.text}`}>{sev.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{inc.duration}</span>
                              <span className="text-[10px] text-slate-500 uppercase mt-0.5">{inc.startedAt}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-white transition-colors gap-1">
                              View Details {Icons.chevronRight}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between bg-slate-900/20 border-t border-white/5">
              <span className="text-xs text-slate-500">Showing 1–{filtered.length} of 145 incidents</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors"
                >
                  {Icons.chevronLeft}
                </button>
                {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === TOTAL_PAGES}
                  onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 text-slate-400 disabled:opacity-40 hover:bg-slate-700 transition-colors"
                >
                  {Icons.chevronRight}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}