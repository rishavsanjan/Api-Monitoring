"use client"
import api from '@/lib/axios';
import { formatTimestamp } from '@/lib/date';
import { MonitorHistory as MonHistory } from '@/type/props';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ClipLoader } from 'react-spinners';

interface ApiResponse {
    history: MonHistory[];
    lastPage: number;
    total: number;
}

const StatusBadge = ({ status }: { status: "UP" | "DOWN" }) => {
    const cfg = {
        UP: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Healthy" },
        DOWN: { dot: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", label: "Failed" },
        degraded: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Degraded" },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const MonitorHistory = () => {
    const params = useParams();
    const id = params.id as string;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["monitor-history", id],

        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get(
                `/api/monitors/${id}/history?page=${pageParam}`
            );
            return response.data as ApiResponse;
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1;
            if (nextPage > lastPage.lastPage) return undefined;

            return nextPage;
        },
    });

    const loaderRef = useRef<HTMLTableRowElement | null>(null);

    useEffect(() => {
        if (!loaderRef.current || !hasNextPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchNextPage();
            }
        });

        observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage]);

    const history = data?.pages.flatMap((page) => page.history) ?? [];

    return (
        <div className="bg-slate-900 border border-slate-800  overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="font-bold text-white">Recent Check History</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 border-b border-slate-800">
                        <tr>
                            {["Status", "Timestamp", "Response Time", "Status Code"].map((h) => (
                                <th key={h} className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                        {history.map((row) => (
                            <tr key={row.CheckedAt} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4"><StatusBadge status={row.Status} /></td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-300 whitespace-nowrap">
                                    {formatTimestamp(row.CheckedAt)}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                                    {row.ResponseTimeMs}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono text-sm ${row.Status === "DOWN" ? "text-rose-400" : "text-emerald-400"}`}>
                                        {row.StatusCode}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {hasNextPage && (
                            <tr ref={loaderRef}>
                                <td colSpan={4} className="py-6">
                                    <div className="flex justify-center items-center">
                                        {isFetchingNextPage ? (
                                            <ClipLoader color='white'/>
                                        ) : (
                                            <span className="text-slate-500 text-sm">Scroll to load more</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            
        </div>
    );
};

export default MonitorHistory;