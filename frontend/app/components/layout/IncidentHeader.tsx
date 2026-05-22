import { timeAgo } from '@/lib/helper'
import { Monitor } from '@/type/props';
import { Check, ClipboardClock, RefreshCcw, Timer } from 'lucide-react';
import React, { useEffect, useState } from 'react'

interface Props {
    monitor: Monitor,
    logCreationTime: Date
}

const IncidentHeader: React.FC<Props> = ({ monitor, logCreationTime }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(14 * 60 + 32);
    const [resolved, setResolved] = useState(false);

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
    const [toast, setToast] = useState({ visible: false, message: "" });

    const showToast = (message: string) => {
        setToast({ visible: true, message });
        setTimeout(() => setToast({ visible: false, message: "" }), 3000);
    };
    const handleRetry = () => showToast("Dispatching manual health check...");

    const handleResolve = () => {
        setResolved(true);
        showToast("Incident status updated to RESOLVED.");
    };
    return (
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                    <span>{monitor.Name}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-500">{monitor.ID}</span>
                </div>
                <h1 className="text-[30px] font-bold tracking-tight text-slate-100 leading-tight">
                    {monitor.Name}
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
                        <ClipboardClock /> Started {timeAgo(logCreationTime)}
                    </span>
                    <span className="text-slate-400 text-sm flex items-center gap-1.5">
                        <Timer /> Duration: {formatDuration(elapsedSeconds)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleRetry}
                    className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-slate-100 font-semibold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2"
                >
                    <RefreshCcw />Retry Check
                </button>
                
            </div>
        </header>
    )
}

export default IncidentHeader