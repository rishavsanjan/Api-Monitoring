"use client";

import { Log } from "@/type/props";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogsSectionProps {
    logs: Log | null | undefined;
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
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    {/* Terminal title bar */}
                    <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            </span>
                            <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                                system_events.log
                            </span>
                        </div>
                    </div>
                    <div className="p-6 font-mono text-xs text-slate-500 flex items-center justify-center py-12">
                        No logs available
                    </div>
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
        <div className="mb-6 ">
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl "
                 style={{ boxShadow: "inset 0 0 20px rgba(60, 131, 246, 0.05)" }}>

                {/* ── Terminal Title Bar ── */}
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 ">
                    <div className="flex items-center gap-2">
                        <span className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </span>
                        <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                            system_events.log
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Error / success counts */}
                        <div className="flex items-center gap-2">
                            {errorCount > 0 && (
                                <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    {errorCount} ERR
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {successCount} OK
                            </span>
                        </div>

                        <span className="text-slate-700">|</span>

                        {/* Meta */}
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
                            result #{logs.ResultID} · {formatDate(logs.CreatedAt)}
                        </span>
                    </div>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/60 bg-slate-900/40">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Filter logs…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-700/60 text-slate-300 placeholder-slate-600 text-xs font-mono rounded-md pl-7 pr-3 py-1 focus:outline-none focus:border-blue-500/60 transition-colors"
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-0.5 bg-slate-900/80 border border-slate-700/60 rounded-md p-0.5 ml-auto">
                        {(["all", "error", "success"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                                    filter === f
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "text-slate-500 hover:text-slate-300"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Count */}
                    <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
                        {filteredMessages.length}/{logs.Messages.length}
                    </span>
                </div>

                {/* ── Log Lines ── */}
                <div className="p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto">
                    {filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                            <p>No messages match your filters</p>
                            <button
                                onClick={() => { setSearch(""); setFilter("all"); }}
                                className="mt-2 text-blue-500/70 hover:text-blue-400 transition-colors text-[10px]"
                            >
                                clear filters
                            </button>
                        </div>
                    ) : (
                        filteredMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-4 mb-1.5 group rounded px-1 py-0.5 transition-colors ${
                                    msg.type === "error" ? "hover:bg-rose-500/5" : "hover:bg-slate-800/30"
                                }`}
                            >
                                {/* Timestamp */}
                                <span className="text-slate-600 shrink-0 tabular-nums">
                                    {msg.time}
                                </span>

                                {/* Level tag */}
                                <span className={`shrink-0 uppercase font-bold tracking-widest ${
                                    msg.type === "error" ? "text-red-400" : "text-emerald-400"
                                }`}>
                                    {msg.type === "error" ? "[ERR]" : "[OK] "}
                                </span>

                                {/* Message */}
                                <span className={
                                    msg.type === "error"
                                        ? "text-red-300"
                                        : "text-slate-300"
                                }>
                                    {msg.message}
                                </span>
                            </div>
                        ))
                    )}

                    {/* Blinking cursor row */}
                    <div className="flex items-center gap-2 text-blue-500/60 mt-3 px-1">
                        <span className="animate-pulse font-bold">▋</span>
                        <span className="text-slate-600">awaiting next check...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}