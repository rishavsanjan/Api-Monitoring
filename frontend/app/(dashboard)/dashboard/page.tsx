"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconMenu, IconPlus, IconSearch, IconSensors, IconSpeed, IconWarning } from "../../components/icons/icons";
import { useQueries } from "@tanstack/react-query";
import api from "@/lib/axios";
import { AddMonitorModal } from "@/app/components/layout/AddReportModal";
import { MonitorsTable } from "@/app/components/layout/MonitorsTable";
import { useSidebar } from "@/context/SidebarContext";



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




interface Stats {
    activeMonitors: number
    uptime: number
    averageLatency: number
    incidents: number
}



export default function MonitorsPage() {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeTab, setActiveTab] = useState('all');
    const { setCollapsed } = useSidebar();

    const queries = useQueries({
        queries: [
            {
                queryKey: ['monitors', currentPage, activeTab, debouncedQuery],

                queryFn: async () => {
                    const res = await api.get(`/api/monitors?tab=${activeTab}&page=${currentPage}&limit=${5}&search=${debouncedQuery}`);
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

    useEffect(() => {
        const searhTimeout = setTimeout(() => {
            setDebouncedQuery(search);
        }, 500);

        return() => {
            clearTimeout(searhTimeout);
        }
    }, [search])

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

    console.log(search)


    return (
        <div className="flex h-screen overflow-hidden bg-[#101722] text-white">

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-[#101722] flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCollapsed(prev => !prev)}
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
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                }}
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
                        <StatCard label="Active Monitors" value={statistics.activeMonitors} icon={<IconSensors />} iconColor="text-blue-400" />
                        <StatCard label="Uptime (24h)" value={statistics.uptime} icon={<IconCheck />} iconColor="text-emerald-400" />
                        <StatCard label="Average Latency" value={statistics.averageLatency} icon={<IconSpeed />} iconColor="text-amber-400" />
                        <StatCard label="Ongoing Incidents" value={statistics.incidents} icon={<IconWarning />} iconColor="text-red-400" valueColor="text-red-400" />
                    </div>

                    {/* Table */}
                    <MonitorsTable
                        monitors={monitors}
                        setCurrentPage={setCurrentPage}
                        currentPage={currentPage}
                        totalMonitors={statistics.activeMonitors}
                        isLoading={monitorsQuery.isLoading}
                    />
                </div>
            </main>

            {/* Modal */}
            {showModal && <AddMonitorModal onClose={() => setShowModal(false)} />}
        </div>
    );
}