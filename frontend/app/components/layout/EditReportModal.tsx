import api from "@/lib/axios";
import { MonitorPageResponse, MonitorWithStatus, Stats } from "@/type/props";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export const EditMonitorModal = (
    {
        onClose,
        name,
        url,
        interval,
        monitorId
    }
        :
        {
            onClose: () => void,
            name: string,
            url: string,
            interval: number,
            monitorId: string
        }
) => {
    const [form, setForm] = useState<{
        name: string
        url: string
        interval: number
    }>({
        name: name,
        url: url,
        interval: interval
    })

    const queryClient = useQueryClient();

    const updateMonitorMutation = useMutation({
        mutationKey: ['monitor-edit'],
        mutationFn: async () => {
           const res = await api.patch(`/api/monitors/${monitorId}/update`, {
                name: form.name,
                url: form.url,
                interval: form.interval,
            })

            console.log(res.data)
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["monitor-result", monitorId] });
            const previousMonitors = queryClient.getQueryData(["monitor-result", monitorId]);



            queryClient.setQueryData<MonitorPageResponse>(
                ["monitor-result", monitorId],
                (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        monitor: {
                            ...old.monitor,
                            Name: name,
                            URL: url,
                            Interval: interval
                        }
                    };
                }
            );


            return { previousMonitors }
        },
        onError: (_err, _vars, context) => {
            if (context?.previousMonitors) {
                queryClient.setQueryData(['monitor-result', monitorId], context.previousMonitors);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['monitor-result', monitorId] });
        },
        onSuccess: async () => {
            toast.success("API updated successfully!")
            onClose();
        }
    })



    console.log(form)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-white text-lg font-bold mb-6">Edit Monitor</h3>
                <div className="flex flex-col gap-4">
                    {[
                        { label: "Monitor Name", placeholder: "e.g. Production API" },
                        { label: "URL or Hostname", placeholder: "https://api.example.com" },
                    ].map((f) => (
                        <div key={f.label} className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-300">{f.label}</label>
                            <input
                                value={f.label === "Monitor Name" ? form.name : form.url}
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
                                updateMonitorMutation.mutate()
                            }}
                            disabled={updateMonitorMutation.isPending || form.name.length < 3 || form.url.length < 5}
                            className="disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-1 bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20">
                            {
                                updateMonitorMutation.isPending ?
                                    <ClipLoader color="white" size={15}/>
                                    :
                                    'Update Monitor'

                            }

                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
