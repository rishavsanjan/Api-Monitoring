"use client";

import { IconAnalytics, IconBell, IconChevronRight, IconDashboard, IconEdit, IconIncidents, IconMonitors, IconPlay, IconSearch, IconSettings, IconTrendDown, IconTrendUp, IconUser } from "@/app/components/icons/icons";
import { AddMonitorModal } from "@/app/components/layout/AddReportModal";
import { EditMonitorModal } from "@/app/components/layout/EditReportModal";
import HistoryTable from "@/app/components/layout/HistoryTable";
import PerformanceChart from "@/charts/PerformanceChart";
import api from "@/lib/axios";
import { Monitor, MonitorHistory, MonitorPageResponse } from "@/type/props";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    delta: string;
    deltaPositive: boolean | null;
}


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



function getTimeFromISO(isoString: string): string {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid ISO timestamp');
    }
    return date.toTimeString().slice(0, 5);
}

export default function MonitorDetailPage() {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { data, isLoading } = useQuery({
        queryKey: ['monitor-result', id],
        queryFn: async () => {
            const response = await api.get(`/api/monitors/${id}/results`)
            console.log(response.data)
            return response.data as MonitorPageResponse
        }
    })



    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem("api");

        const socket = new WebSocket(
            `ws://localhost:8080/ws?token=${token}`
        );

        socket.onmessage = async (event) => {
            const data: MonitorHistory = JSON.parse(event.data);
            console.log("Live update:", data);
            const newPoint = {
                time: getTimeFromISO(data.CheckedAt),
                value: data.ResponseTimeMs
            };

            await queryClient.cancelQueries({ queryKey: ["monitor-result", id] });



            queryClient.setQueryData<MonitorPageResponse>(
                ["monitor-result", id],
                (old) => {
                    if (!old) return old;
                    if (old.monitor.ID != data.MonitorID) {
                        return old;
                    }
                    toast.success(`Response recieved : ${data.ResponseTimeMs}ms`)

                    return {
                        ...old,
                        history: [data, ...old.history],
                        stats: {
                            ...old.stats,
                            totalLogs: old.stats.totalLogs += 1
                        },
                        chartData: [...old.chartData, newPoint]
                    };
                }
            );




        };

        return () => {
            socket.close();
        };
    }, []);



    if (!data) {
        return (
            <div className="bg-[#101722] h-full items-center flex justify-center text-white">
                <ClipLoader color="white" size={50}/>
            </div>
        )

    }

    return (
        <div className="flex flex-col min-h-screen bg-[#101722] text-white">
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
                                <button
                                    onClick={() => {
                                        setShowModal(true)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors">
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

                        <PerformanceChart data={data.chartData} monitorId={data.monitor.ID} />


                        {/* History */}
                        <HistoryTable history={data?.history ?? []} />
                        {showModal &&
                            <EditMonitorModal
                                name={data.monitor.Name}
                                url={data.monitor.URL}
                                interval={data.monitor.Interval}
                                onClose={() => setShowModal(false)}
                                monitorId={data.monitor.ID}
                            />}
                    </div>
                </main>
            </div>
        </div>
    );
}