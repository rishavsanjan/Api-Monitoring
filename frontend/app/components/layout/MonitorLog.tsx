"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Logs {
    CreatedAt: Date;
    ID: number;
    Messages: {
        message: string;
        time: string;
        type: "error" | "success";
    }[];
    MonitorID: string;
    ResultID: number;
}

interface LogsSectionProps {
    logs: Logs | null | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LogsSection({ logs }: LogsSectionProps) {
    const [filter, setFilter] = useState<"all" | "error" | "success">("all");
    const [search, setSearch] = useState("");

    if (!logs) {
        return (
            <div className="mb-6">
                <h2 className="text-lg font-bold text-white tracking-tight mb-4">Logs</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center py-12 text-slate-500">
                    <p className="text-sm">No logs available</p>
                </div>
            </div>
        );
    }

    const errorCount   = logs.Messages.filter((m) => m.type === "error").length;
    const successCount = logs.Messages.filter((m) => m.type === "success").length;

    const filteredMessages = logs.Messages.filter((msg) => {
        const matchesType   = filter === "all" || msg.type === filter;
        const matchesSearch = search === "" || msg.message.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="mb-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white tracking-tight">Logs</h2>
                    <div className="flex items-center gap-1.5">
                        {errorCount > 0 && (
                            <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                {errorCount} error{errorCount !== 1 ? "s" : ""}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {successCount} success
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search messages…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors w-44"
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-0.5 bg-slate-800/60 border border-slate-700 rounded-lg p-0.5">
                        {(["all", "error", "success"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                                    filter === f ? "bg-blue-500 text-white shadow" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Card ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

                {/* Card meta row */}
                <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-800 bg-slate-900/80">
                    <code className="text-slate-500 text-xs font-mono">result #{logs.ResultID}</code>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-500 text-xs">{formatDate(logs.CreatedAt)}</span>
                    <span className="ml-auto text-slate-600 text-xs">
                        {filteredMessages.length} / {logs.Messages.length} messages
                    </span>
                </div>

                {/* Messages */}
                {filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <p className="text-sm">No messages match your filters</p>
                        <button
                            onClick={() => { setSearch(""); setFilter("all"); }}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div>
                        {filteredMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex items-start gap-4 px-5 py-3 border-b border-slate-800/50 last:border-0 transition-colors ${
                                    msg.type === "error" ? "hover:bg-rose-500/5" : "hover:bg-slate-800/20"
                                }`}
                            >
                                {/* Badge */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold tracking-widest border flex-shrink-0 mt-0.5 ${
                                    msg.type === "error"
                                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${msg.type === "error" ? "bg-rose-400" : "bg-emerald-400"}`} />
                                    {msg.type === "error" ? "ERR" : "OK"}
                                </span>

                                {/* Message */}
                                <p className={`flex-1 text-sm font-mono leading-relaxed ${
                                    msg.type === "error" ? "text-rose-200" : "text-slate-300"
                                }`}>
                                    {msg.message}
                                </p>

                                {/* Time */}
                                <span className="text-slate-500 text-xs font-mono tabular-nums flex-shrink-0 pt-0.5">
                                    {msg.time}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}