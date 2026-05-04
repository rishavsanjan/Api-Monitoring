"use client";

import MonitorCard from "@/app/components/layout/MonitorCard";
import api from "@/lib/axios";
import { Editor } from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CheckIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonitorForm {
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT";
    keyword: string;
    token: string;
    body: string;
    showAdv: boolean;
    showToken: boolean;
    extract: Extract
}

interface Extract {
    variableName: string
    path: string
}

function createExtract(): Extract {
    return {
        variableName: "",
        path: ""
    }
}

type FormErrors = Partial<Record<string, string>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMonitor(): MonitorForm {
    return {
        name: "",
        url: "",
        method: "GET",
        keyword: "",
        token: "",
        body: "",
        showAdv: false,
        showToken: false,
        extract: createExtract()
    };
}

function formatInterval(mins: number): string {
    if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""}`;
    const h = mins / 60;
    return `${h} hour${h !== 1 ? "s" : ""}`;
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateMonitorPage() {
    const [monitors, setMonitors] = useState<MonitorForm[]>([createMonitor()]);
    const [interval, setIntervalMins] = useState<number>(5);
    const [errors, setErrors] = useState<FormErrors>({});
    const [monitorName, setMonitorName] = useState("");

    // ── Handlers ────────────────────────────────────────────────────────────────

    const updateMonitor = useCallback(
        (i: number, key: keyof MonitorForm | "variableName" | "path", value: string | boolean) => {

            if (key === "variableName" || key === "path") {
                setMonitors((prev) =>
                    prev.map((m, idx) => (idx === i) ? {
                        ...m, extract: {
                            ...m.extract, [key]: value
                        }
                    } : m)
                )

                return;
            }
            setMonitors((prev) =>
                prev.map((m, idx) => (idx === i ? {
                    ...m, [key]: value

                } : m))
            );
            // Clear related error on change
            const errKeys = [`name_${i}`, `url_${i}`, `kw_${i}`];
            setErrors((prev) => {
                const next = { ...prev };
                errKeys.forEach((k) => delete next[k]);
                return next;
            });
        },
        []
    );

    const addMonitor = () => setMonitors((prev) => [...prev, createMonitor()]);

    const removeMonitor = (i: number) =>
        setMonitors((prev) => prev.filter((_, idx) => idx !== i));

    // ── Validation ───────────────────────────────────────────────────────────────

    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        monitors.forEach((m, i) => {
            if (!m.name.trim()) errs[`name_${i}`] = "Monitor name is required";
            if (!m.url.trim()) {
                errs[`url_${i}`] = "URL is required";
            } else if (!/^https?:\/\/.+/.test(m.url)) {
                errs[`url_${i}`] = "Enter a valid URL starting with http:// or https://";
            }
            //if (!m.keyword.trim()) errs[`kw_${i}`] = "At least one keyword is required";
        });
        return errs;
    };

    // ── Submit ───────────────────────────────────────────────────────────────────

    const handleSubmissionMutation = useMutation({
        mutationKey: ['create-monitor'],
        mutationFn: async () => {
            const config = monitors.map((m) => {
                const mustContainKeywords = m.keyword.split(",").map(item => item.trim()).filter(item => item.length > 0);
                const path = `.$${m.extract.path}`
                return {
                    name: m.name,
                    request: {
                        url: m.url,
                        method: m.method,
                        body: m.body,
                        headers: {
                            "Authorization": `Bearer ${m.token}`
                        }
                    },
                    assertions: {
                        status: 200,
                        mustContain: mustContainKeywords
                    },
                    extract: m.extract ? {
                        [m.extract.variableName]: path
                    } : null
                }
            })

            console.log(config)
            return;
            await api.post(`/api/monitors`, {
                name: monitorName,
                URL: monitors[0].url,
                interval: interval * 60,
                type: "synthetic",
                config: {
                    "steps": config
                },
                method: "GET"
            })
        },
        onSuccess: async () => {
            toast.success("Montoir created successfully!")
        },
        onError: async () => {
            toast.error("Internal server error!")
        }
    })

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setErrors({});
        handleSubmissionMutation.mutate();
        return;

    };

    const handleReset = () => {
        setMonitors([createMonitor()]);
        setIntervalMins(5);
        setErrors({});
    };

    // ── Success state ─────────────────────────────────────────────────────────────

    if (handleSubmissionMutation.isSuccess) {
        return (
            <div className="w-full py-12 px-4">
                <div className="flex flex-col items-center gap-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckIcon />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-lg">
                            Monitor{monitors.length > 1 ? "s" : ""} created!
                        </p>
                        <p className="text-slate-400 text-sm mt-1.5 w-full mx-auto">
                            <span className="text-white font-medium">
                                {monitors[0].name || "Your monitor"}
                            </span>{" "}
                            is now active and watching{" "}
                            <code className="text-blue-400 font-mono text-xs break-all">
                                {monitors[0].url || "your endpoint"}
                            </code>
                            .
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="mt-1 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-all"
                    >
                        Create another
                    </button>
                </div>
            </div>
        );
    }


    // ── Main render ──────────────────────────────────────────────────────────────

    return (
        <div className="mx-auto  w-full py-8 px-4 space-y-5">
            <div className="mb-2">
                <div className=" my-4 text-sm text-slate-400 mt-1">
                    <h1 className="text-xl font-semibold text-white tracking-tight">
                        Monitor Name
                    </h1>
                    <input
                        onChange={(e) => {
                            setMonitorName(e.target.value)
                        }}
                        placeholder="e.g. Website synthetic monitior"
                        className={`w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all
                        focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60
                        `}
                    />
                </div>

                <h1 className="text-xl font-semibold text-white tracking-tight">
                    Create monitors
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Monitor endpoints for uptime, latency, and keyword presence.
                </p>
            </div>



            {/* Monitor cards */}
            {monitors.map((monitor, i) => (
                <MonitorCard
                    key={i}
                    monitor={monitor}
                    index={i}
                    errors={errors}
                    canRemove={monitors.length > 1}
                    onChange={updateMonitor}
                    onRemove={removeMonitor}
                />
            ))}

            {/* Add monitor button */}
            <button
                type="button"
                onClick={addMonitor}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-700 rounded-2xl text-sm text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-800/30 transition-all"
            >
                <PlusIcon />
                Add another monitor
            </button>

            {/* Check frequency */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Check Frequency
                </p>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min={1}
                        max={60}
                        step={1}
                        value={interval}
                        onChange={(e) => setIntervalMins(Number(e.target.value))}
                        className="flex-1 accent-blue-500"
                    />
                    <span className="text-sm font-semibold text-white min-w-[72px] text-right tabular-nums">
                        {formatInterval(interval)}
                    </span>
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-slate-500">Every 1 min</span>
                    <span className="text-xs text-slate-500">Every 1 hour</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
                <button
                    type="button"
                    onClick={() => { handleSubmit() }}
                    disabled={handleSubmissionMutation.isPending}
                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                >
                    {handleSubmissionMutation.isPending ? (
                        <>
                            <svg
                                className="animate-spin w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                            Creating…
                        </>
                    ) : (
                        <>
                            <PlusIcon />
                            Create monitor{monitors.length > 1 ? "s" : ""}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}