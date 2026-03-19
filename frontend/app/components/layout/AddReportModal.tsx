import api from "@/lib/axios";
import { Monitor, Stats } from "@/type/props";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

export const AddMonitorModal = ({ onClose }: { onClose: () => void }) => {
    const [form, setForm] = useState<{
        name: string
        url: string
        interval: number
    }>({
        name: "",
        url: "",
        interval: 60
    })

    const queryClient = useQueryClient();

    const addMonitorMutation = useMutation({
        mutationKey: ['monitor-add'],
        mutationFn: async () => {
            const res = await api.post("/api/monitors", {
                name: form.name,
                URL: form.url,
                interval: form.interval,
            })
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["monitors"] });
            await queryClient.cancelQueries({ queryKey: ["stats"] });
            const previousMonitors = queryClient.getQueryData(['monitors']);
            const previousStats = queryClient.getQueryData(['stats']);

            const optimisticMonitor: Monitor = {
                monitorId: 'temp-' + Date.now(),
                name: form.name,
                url: form.url,
                method: 'GET',
                responseTimeMs: 0,
                lastCheckedAt: String(Date.now()),
                currentStatus: 200,
                expectedStatus: 200,
                status: ''
            }

            queryClient.setQueryData<Monitor[]>(['results'], (old) =>
                old ? [...old, optimisticMonitor] : [optimisticMonitor]
            );

            queryClient.setQueryData<Stats>(['stats'], (oldStats) => {
                if (!oldStats) return { activeMonitors: 1, uptime: 0, averageLatency: 0, incidents: 0 };

                return {
                    ...oldStats,
                    activeMonitors: oldStats.activeMonitors + 1,
                };
            });


            return { previousMonitors, previousStats }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousMonitors) {
                queryClient.setQueryData(['monitors'], context.previousMonitors);
            }
            if (context?.previousStats) {
                queryClient.setQueryData(['stats'], context.previousStats);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['monitors'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    })



    console.log(form)
    return (
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
                                onChange={(e) => {
                                    if (f.label === "Monitor Name") {
                                        setForm(prev => ({ ...prev, name: e.target.value }))
                                    } else {
                                        setForm(prev => ({ ...prev, url: e.target.value }))
                                    }
                                }}
                                type="text"
                                placeholder={f.placeholder}
                                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                        </div>
                    ))}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">Check Interval</label>
                        <select
                            onChange={(e) => {
                                setForm(prev => ({ ...prev, interval: parseInt(e.target.value) }))
                            }}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                            <option value={60}>Every 1 minute</option>
                            <option value={300}>Every 5 minutes</option>
                            <option value={600}>Every 10 minutes</option>
                            <option value={1800}>Every 30 minutes</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                addMonitorMutation.mutate()
                            }}
                            disabled={addMonitorMutation.isPending || form.name.length < 3 || form.url.length < 5}
                            className="disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-1 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20">
                            {
                                addMonitorMutation.isPending ?
                                    <ClipLoader />
                                    :
                                    'Create Monitor'

                            }

                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
