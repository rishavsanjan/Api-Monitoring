"use client"
import MonitorSuccessModel from "@/app/components/layout/MonitorSuccessModel";
import api from "@/lib/axios";
import { Editor } from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

interface Extract {
    variableName: string;
    path: string;
}

interface MonitorForm {
    name: string;
    url: string;
    method: "GET" | "POST" | "PUT";
    keyword: string;
    token: string;
    body: string;
    showAdv: boolean;
    showToken: boolean;
    extract: Extract;
}

interface FieldProps {
    label: string;
    description?: string;
    error?: string;
    children: React.ReactNode;
}

const Field = ({ label, description, error, children }: FieldProps) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {label}
        </label>
        {children}
        {description && !error && (
            <p className="text-xs text-slate-500">{description}</p>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
);

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

const TextInput = ({ hasError, className = "", ...props }: TextInputProps) => (
    <input
        {...props}
        className={`w-full bg-slate-800/60 border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all
      focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60
      ${hasError ? "border-red-500/60 ring-2 ring-red-500/20" : "border-slate-700/80 hover:border-slate-600"}
      ${className}`}
    />
);

const METHODS = ["GET", "POST", "PUT"] as const;

const defaultForm: MonitorForm = {
    name: "",
    url: "",
    method: "GET",
    keyword: "",
    token: "",
    body: "",
    showAdv: false,
    showToken: false,
    extract: { variableName: "", path: "" },
};

const MonitorCard = () => {
    const [monitor, setMonitor] = useState<MonitorForm>(defaultForm);
    const [nameErr, setNameErr] = useState("");
    const [urlErr, setUrlErr] = useState("");
    const [bodyError, setBodyError] = useState("");
    const [successModel, setSuccessModel] = useState(false)

    const update = (
        key: keyof MonitorForm | "variableName" | "path",
        value: string | boolean
    ) => {
        setMonitor((prev) => {
            if (key === "variableName" || key === "path") {
                return {
                    ...prev,
                    extract: { ...prev.extract, [key]: value as string },
                };
            }
            return { ...prev, [key]: value };
        });

        if (key === "name") setNameErr("");
        if (key === "url") setUrlErr("");
    };

    const validate = (): boolean => {
        let valid = true;
        if (!monitor.name.trim()) {
            setNameErr("Monitor name is required.");
            valid = false;
        }
        if (!monitor.url.trim()) {
            setUrlErr("URL is required.");
            valid = false;
        } else {
            try {
                new URL(monitor.url);
            } catch {
                setUrlErr("Please enter a valid URL.");
                valid = false;
            }
        }
        return valid;
    };

    const handleSave = () => {
        if (validate()) {
            createKeyWordMonitorMutation.mutate()
        }
    };


    const createKeyWordMonitorMutation = useMutation({
        mutationKey: ['create-keyword'],
        mutationFn: async () => {

            const config = () => {
                const mustContainKeywords = monitor.keyword.split(",").map(item => item.trim()).filter(item => item.length > 0);
                const path = `.$${monitor.extract.path}`
                return {
                    name: monitor.name,
                    request: {
                        url: monitor.url,
                        method: monitor.method,
                        body: monitor.body,
                        headers: {
                            "Authorization": `Bearer ${monitor.token}`
                        }
                    },
                    assertions: {
                        status: 200,
                        mustContain: mustContainKeywords
                    },
                    extract: monitor.extract ? {
                        [monitor.extract.variableName]: path
                    } : null
                }
            }

          
            const res = await api.post(`/api/monitors`, {
                name: monitor.name,
                url: monitor.url,
                type: "keyword",
                interval: 60,
                method: monitor.method,
                config: config()
            })
            console.log(res.data)
            return res.data
        },
        onError: () => {
            toast.error("Unable to upload!")
        },
        onSuccess: () => {
            toast.success("Monitor uploaded successfully!")
        }
    })

    const handleSuccessModelClose = () => {
        setSuccessModel(false);
        setMonitor({
            name: "",
            url: "",
            method: "GET",
            keyword: "",
            token: "",
            body: "",
            showAdv: false,
            showToken: false,
            extract: { variableName: "", path: "" },
        })
    }

    return (
        <div className="min-h-screen  flex items-start justify-center p-6 bg-[#101722] w-full mx-auto">
            <div className="w-full  space-y-6">
                {
                    (createKeyWordMonitorMutation.isSuccess && successModel) &&
                    <MonitorSuccessModel name={monitor.name} url={monitor.url} setSuccessModel={setSuccessModel} handleCloseModel={handleSuccessModelClose} />
                }
                {/* Page header */}
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-slate-100">New Monitor</h1>
                    <p className="text-sm text-slate-500">
                        Configure an endpoint to monitor its availability and response.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Card header */}
                    <div className="flex items-center px-6 py-4 border-b border-slate-800/80">
                        <span className="text-sm font-medium text-slate-300">
                            {monitor.name.trim() || "Untitled Monitor"}
                        </span>
                    </div>

                    {/* Card body */}
                    <div className="p-6 space-y-5">
                        <Field label="Monitor Name" error={nameErr}>
                            <TextInput
                                type="text"
                                placeholder="e.g. Main API Gateway"
                                value={monitor.name}
                                hasError={!!nameErr}
                                onChange={(e) => update("name", e.target.value)}
                            />
                        </Field>

                        <Field label="URL to Monitor" error={urlErr}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path
                                            d="M1 7h12M7 1l5 6-5 6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                <TextInput
                                    type="url"
                                    placeholder="https://api.example.com/health"
                                    value={monitor.url}
                                    hasError={!!urlErr}
                                    className="pl-9"
                                    onChange={(e) => update("url", e.target.value)}
                                />
                            </div>
                        </Field>

                        <Field
                            label="Keywords"
                            description="Comma-separated. All must be present in the API response."
                        >
                            <TextInput
                                type="text"
                                placeholder="e.g. success, ok, true"
                                value={monitor.keyword}
                                onChange={(e) => update("keyword", e.target.value)}
                            />
                        </Field>

                        {/* Advanced toggle */}
                        <button
                            type="button"
                            onClick={() => update("showAdv", !monitor.showAdv)}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group"
                        >
                            <ChevronRightIcon
                                className={`transition-transform duration-200 ${monitor.showAdv ? "rotate-90" : ""}`}
                            />
                            Advanced settings
                        </button>

                        {/* Advanced section */}
                        {monitor.showAdv && (
                            <div className="space-y-5 pt-2 pl-4 border-l border-slate-700/60">
                                {/* HTTP Method */}
                                <Field label="HTTP Method">
                                    <div className="flex rounded-lg border border-slate-700/80 overflow-hidden">
                                        {METHODS.map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => update("method", m)}
                                                className={`flex-1 py-2 text-sm font-medium transition-all
                          ${monitor.method === m
                                                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                                        : "bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                {/* Auth Token */}
                                <Field label="Authorization Token">
                                    <div className="flex gap-2">
                                        <TextInput
                                            type={monitor.showToken ? "text" : "password"}
                                            placeholder="Bearer eyJhbGci..."
                                            value={monitor.token}
                                            className="flex-1"
                                            onChange={(e) => update("token", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => update("showToken", !monitor.showToken)}
                                            className="px-3 py-2 text-xs font-medium text-slate-400 bg-slate-800/60 border border-slate-700/80 rounded-lg hover:text-slate-200 hover:border-slate-600 transition-all whitespace-nowrap"
                                        >
                                            {monitor.showToken ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </Field>

                                {/* Extract variables */}
                                <Field label="Extract variables from response">
                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                                    Variable name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={monitor.extract.variableName}
                                                    onChange={(e) => update("variableName", e.target.value)}
                                                    placeholder="e.g. token"
                                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5
                                                   text-sm text-white placeholder-slate-600 focus:outline-none
                                                   focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                                    JSON path
                                                </label>
                                                <input
                                                    type="text"
                                                    value={monitor.extract.path}
                                                    onChange={(e) => update("path", e.target.value)}
                                                    placeholder="e.g. data.token"
                                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5
                                                   text-sm text-white placeholder-slate-600 focus:outline-none
                                                   focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMonitor((prev) => ({
                                                        ...prev,
                                                        extract: { variableName: "", path: "" },
                                                    }))
                                                }
                                                className="p-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                aria-label="Clear variable"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </Field>

                                {/* Request Body (POST/PUT only) */}
                                {(monitor.method === "POST" || monitor.method === "PUT") && (
                                    <Field label="Request Body (JSON)">
                                        <div className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                                            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-slate-200">Body</span>
                                                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300">
                                                        raw
                                                    </span>
                                                    <span className="rounded-md bg-emerald-900/40 px-2 py-1 text-xs text-emerald-300">
                                                        JSON
                                                    </span>
                                                </div>
                                            </div>
                                            <Editor
                                                height="280px"
                                                defaultLanguage="json"
                                                value={
                                                    monitor.body.length === 0
                                                        ? `{\n  "success": true\n}`
                                                        : monitor.body
                                                }
                                                onChange={(value?: string) => {
                                                    if (!value) return;
                                                    update("body", value);
                                                    try {
                                                        JSON.parse(value);
                                                        setBodyError("");
                                                    } catch {
                                                        setBodyError("Invalid JSON request body");
                                                    }
                                                }}
                                                theme="vs-dark"
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    scrollBeyondLastLine: false,
                                                    wordWrap: "on",
                                                    automaticLayout: true,
                                                    formatOnPaste: true,
                                                    formatOnType: true,
                                                }}
                                            />
                                            <div className="border-t border-slate-800 px-4 py-2">
                                                {bodyError ? (
                                                    <p className="text-sm text-red-400">{bodyError}</p>
                                                ) : (
                                                    <p className="text-sm text-emerald-400">Valid JSON</p>
                                                )}
                                            </div>
                                        </div>
                                    </Field>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={createKeyWordMonitorMutation.isPending}
                        className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                    >
                        {
                            createKeyWordMonitorMutation.isPending ?
                                <ClipLoader color="white " size={15} />

                                :
                                "Save Monitor"

                        }

                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonitorCard;