"use client";

import { IconBell, IconChevronRight, IconDashboard, IconHelp, IconIncidents, IconLink, IconMonitors, IconPlus, IconPulse, IconSettings, IconShield, IconStatusPages } from "@/app/components/icons/icons";
import HTTPMethodsList from "@/app/components/layout/MethodsList";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

interface MonitorForm {
    name: string;
    url: string;
    method: HttpMethod;
    statusCode: number;
    frequency: number;
    sslMonitoring: boolean;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────


// ─── Sidebar ──────────────────────────────────────────────────────────────────

type NavItem = { label: string; icon: React.ReactNode; active?: boolean; dividerBefore?: boolean };

const navItems: NavItem[] = [
    { label: "Dashboard", icon: <IconDashboard /> },
    { label: "Monitors", icon: <IconMonitors />, active: true },
    { label: "Incidents", icon: <IconIncidents /> },
    { label: "Status Pages", icon: <IconStatusPages /> },
    { label: "Settings", icon: <IconSettings />, dividerBefore: true },
];



// ─── Custom Toggle ────────────────────────────────────────────────────────────

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

// ─── Frequency Slider ─────────────────────────────────────────────────────────

const FREQ_LABELS = ["Every 1 min", "5 mins", "15 mins", "30 mins", "1 hour"];

const FrequencySlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) => {
    const pct = ((value - 1) / 59) * 100;
    const label =
        value === 1 ? "Every 1 minute" :
            value <= 5 ? `Every ${value} minutes` :
                value <= 15 ? "Every 15 minutes" :
                    value <= 30 ? "Every 30 minutes" :
                        "Every hour";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Monitoring Frequency</label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        {label}
                    </span>
                    <span className="text-[10px] text-slate-500 px-2 py-1 bg-slate-800 rounded-md font-medium">
                        Recommended: 1 min
                    </span>
                </div>
            </div>

            <div className="relative">
                {/* Track */}
                <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={60}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                    style={{ WebkitAppearance: "none" }}
                />
                {/* Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg shadow-blue-500/30 pointer-events-none transition-all"
                    style={{ left: `calc(${pct}% - 8px)` }}
                />
            </div>

            <div className="flex justify-between">
                {FREQ_LABELS.map((l) => (
                    <span key={l} className="text-[10px] text-slate-600 font-medium uppercase tracking-wide">
                        {l}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    prefixIcon?: React.ReactNode;
}

const Input = ({ label, error, prefixIcon, className = "", ...props }: InputProps) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="relative group">
            {prefixIcon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    {prefixIcon}
                </span>
            )}
            <input
                className={`
          w-full bg-slate-800/60 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600
          focus:outline-none focus:ring-2 transition-all
          ${error
                        ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }
          ${prefixIcon ? "pl-10" : ""}
          ${className}
        `}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
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
    const [form, setForm] = useState<MonitorForm>({
        name: "",
        url: "",
        method: "GET",
        statusCode: 200,
        frequency: 5,
        sslMonitoring: true,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof MonitorForm, string>>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = (): typeof errors => {
        const e: typeof errors = {};
        if (!form.name.trim()) e.name = "Monitor name is required";
        if (!form.url.trim()) e.url = "URL is required";
        else if (!/^https?:\/\/.+/.test(form.url)) e.url = "Enter a valid URL starting with http:// or https://";
        if (!form.statusCode || form.statusCode < 100 || form.statusCode > 599)
            e.statusCode = "Enter a valid HTTP status code (100–599)";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1400));
        setLoading(false);
        setSuccess(true);
    };

    return (
        <div className="mx-auto w-full">

            {success ? (
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
                    <button
                        onClick={() => { setSuccess(false); setForm({ name: "", url: "", method: "GET", statusCode: 200, frequency: 5, sslMonitoring: true }); }}
                        className="mt-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                        Create Another
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* Basic Info */}
                    <FormSection title="Basic Info">
                        
                        <Input
                            label="Monitor Name"
                            placeholder="e.g. Main API Gateway"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            error={errors.name}
                        />
                        <Input
                            label="URL to Monitor"
                            type="url"
                            placeholder="https://api.example.com/health"
                            value={form.url}
                            onChange={(e) => setForm({ ...form, url: e.target.value })}
                            error={errors.url}
                            prefixIcon={<IconLink />}
                        />

                        <div>
                            <p className="text-sm text-slate-300">HTTP Method</p>
                            <HTTPMethodsList />

                        </div>
                    </FormSection>

                    {/* Configuration */}
                    <FormSection title="Configuration">
                        <FrequencySlider
                            value={form.frequency}
                            onChange={(v) => setForm({ ...form, frequency: v })}
                        />
                        <div className="pt-4 border-t border-slate-800">
                            <Toggle
                                checked={form.sslMonitoring}
                                onChange={(v) => setForm({ ...form, sslMonitoring: v })}
                                label="Enable SSL monitoring"
                            />
                        </div>
                    </FormSection>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/60 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                        >
                            {loading ? (
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
                </form>
            )}
        </div>


    );
}