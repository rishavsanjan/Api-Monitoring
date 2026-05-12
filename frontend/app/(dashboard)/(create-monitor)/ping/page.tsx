"use client";

import { IconLink, IconPlus, IconShield } from "@/app/components/icons/icons";
import AuthToken from "@/app/components/layout/AuthToken";
import FrequencySlider from "@/app/components/layout/FrequenctSlider";
// import Input from "@/app/components/layout/Input";
import JsonBodyEditor from "@/app/components/layout/JsonBodyEditor";
import api from "@/lib/axios";
import { KeywordMonitorForm, MonitorWithStatus, PingMonitorForm, Stats } from "@/type/props";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";


const Toggle = ({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${checked ? "bg-blue-500" : "bg-slate-700"
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"
                    }`}
            />
        </button>
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
            <IconShield />
            {label}
        </span>
    </label>
);







// ─── Form Section Card ────────────────────────────────────────────────────────

const FormSection = ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5 backdrop-blur-sm">
        {title && (
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{title}</h3>
        )}
        {children}
    </div>
);



export default function CreateMonitorPage() {
    const [form, setForm] = useState<PingMonitorForm>({
        name: "",
        url: "",
        interval: 60,
        type: "ping"

    });
    const [errors, setErrors] = useState<Partial<Record<keyof KeywordMonitorForm, string>>>({});
    const [successModel, setSuccessModel] = useState(false);
    const validate = (): typeof errors => {

        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Monitor name is required";
        if (!form.url.trim()) e.url = "URL is required";
        else if (!/^https?:\/\/.+/.test(form.url)) e.url = "Enter a valid URL starting with http:// or https://";

        return e;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        addMonitorMutation.mutate();
    };


    const queryClient = useQueryClient();

    const addMonitorMutation = useMutation({
        mutationKey: ['monitor-add'],
        mutationFn: async () => {

            const config = {
                "host": form.url,
                "attempts": 5,
            }
            console.log(config)
            await api.post("/api/monitors", {
                name: form.name,
                URL: form.url,
                interval: form.interval,
                type: form.type,
                config: config,
            })
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["monitors"] });
            await queryClient.cancelQueries({ queryKey: ["stats"] });
            const previousMonitors = queryClient.getQueryData(['monitors']);
            const previousStats = queryClient.getQueryData(['stats']);

            const optimisticMonitor: MonitorWithStatus = {
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

            queryClient.setQueryData<MonitorWithStatus[]>(['results'], (old) =>
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
        onSuccess: async () => {
            setSuccessModel(true);
            toast.success("Monitor created successfully!");
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
        <div className="mx-auto w-full">

            {successModel && addMonitorMutation.isSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-10 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} className="w-8 h-8">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">Monitor Created!</p>
                        <p className="text-slate-400 text-sm mt-1">
                            <span className="text-white font-medium">{form.name || "Your monitor"}</span> is now active and monitoring{" "}
                            <code className="text-blue-400 font-mono text-xs">{form.url || "your endpoint"}</code>.
                        </p>
                    </div>
                    {/* <button
                        onClick={() => { setSuccessModel(false); setForm({ name: "", url: "", method: "GET", statusCode: 200, interval: 5 }); }}
                        className="mt-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        Create Another
                    </button> */}
                </div>
            ) : (
                <div className="space-y-5">

                    {/* Basic Info */}
                    <FormSection title="Basic Info">

                        {/* <Input
                            label="Name"
                            placeholder="e.g. Host 1"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            error={errors.name}
                        />
                        <Input
                            label="IP or host to monitor"
                            type="url"
                            placeholder="e.g. 80.123.70.58 or example.com"
                            value={form.url}
                            onChange={(e) => setForm({ ...form, url: e.target.value })}
                            error={errors.url}
                            prefixIcon={<IconLink />}
                        /> */}

                        <FrequencySlider
                            value={form.interval}
                            onChange={(v) => setForm({ ...form, interval: v * 60 })}
                        />

                    </FormSection>


                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        {/* <button
                            
                            className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button> */}
                        <button
                            onClick={() => {
                                handleSubmit()
                            }}
                            disabled={addMonitorMutation.isPending}
                            className="flex items-center gap-2 px-8 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/60 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                        >
                            {addMonitorMutation.isPending ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <IconPlus />
                                    Create Monitor
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>


    );
}