"use client";

import { Log } from "@/type/props";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageType = "error" | "success" | "info" | "warning";

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

const levelConfig: Record<MessageType, { tag: string; text: string; row: string; dot: string; badge: string }> = {
    error: { tag: "[ERR]", text: "text-red-300", row: "hover:bg-rose-500/5", dot: "bg-rose-400", badge: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
    warning: { tag: "[WRN]", text: "text-yellow-200", row: "hover:bg-yellow-500/5", dot: "bg-yellow-400", badge: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
    info: { tag: "[INF]", text: "text-blue-200", row: "hover:bg-blue-500/5", dot: "bg-blue-400", badge: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    success: { tag: "[OK] ", text: "text-slate-300", row: "hover:bg-slate-800/30", dot: "bg-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
};

const tagColor: Record<MessageType, string> = {
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    success: "text-emerald-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LogsSection({ logs }: LogsSectionProps) {
    const [filter, setFilter] = useState<"all" | MessageType>("all");
    const [search, setSearch] = useState("");

    console.log(logs)



    if (!logs) {
        return (
            <div className="mb-6">
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-900 px-4 py-2.5 flex items-center gap-2 border-b border-slate-800">
                        <span className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </span>
                        <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">system_events.log</span>
                    </div>
                    <div className="p-6 font-mono text-xs text-slate-500 flex items-center justify-center py-12">
                        No logs available
                    </div>
                </div>
            </div>
        );
    }

    const counts = (["error", "warning", "info", "success"] as MessageType[]).reduce(
        (acc, type) => ({ ...acc, [type]: logs.Messages.filter((m) => m.type === type).length }),
        {} as Record<MessageType, number>
    );

    const filteredMessages = logs.Messages.filter((msg) => {
        const matchesType = filter === "all" || msg.type === filter;
        const matchesSearch = search === "" || msg.message.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="mb-6">
            <div
                className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl"
                style={{ boxShadow: "inset 0 0 20px rgba(60, 131, 246, 0.05)" }}
            >
                {/* ── Terminal Title Bar ── */}
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

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {(["error", "warning", "info", "success"] as MessageType[]).map((type) =>
                            counts[type] > 0 ? (
                                <span
                                    key={type}
                                    className={`inline-flex items-center gap-1 border text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${levelConfig[type].badge}`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${levelConfig[type].dot}`} />
                                    {counts[type]} {levelConfig[type].tag.trim()}
                                </span>
                            ) : null
                        )}
                        <span className="text-slate-700 hidden sm:block">|</span>
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
                        {(["all", "error", "warning", "info", "success"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${filter === f
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
                <div className="p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto no-scrollbar">
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
                        filteredMessages.map((msg, i) => {
                            console.log(msg)
                            const type = (msg.type.trim() as MessageType) ?? "info";
                            const cfg = levelConfig[type];
                            return (
                                <div
                                    key={i}
                                    className={`flex gap-4 mb-1.5 group rounded px-1 py-0.5 transition-colors ${cfg.row}`}
                                >
                                    {/* Timestamp */}
                                    <span className="text-slate-600 shrink-0 tabular-nums">{msg.time}</span>

                                    {/* Level tag */}
                                    <span className={`shrink-0 uppercase font-bold tracking-widest ${tagColor[type]}`}>
                                        {cfg.tag}
                                    </span>

                                    {/* Message */}
                                    <span className={cfg.text}>{msg.message}</span>
                                </div>
                            );
                        })
                    )}

                    {/* Blinking cursor */}
                    <div className="flex items-center gap-2 text-blue-500/60 mt-3 px-1">
                        <span className="animate-pulse font-bold">▋</span>
                        <span className="text-slate-600">awaiting next check...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}