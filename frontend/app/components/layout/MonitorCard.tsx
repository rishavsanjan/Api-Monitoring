import { Editor } from "@monaco-editor/react";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

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

type FormErrors = Partial<Record<string, string>>;

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


interface MonitorCardProps {
    monitor: MonitorForm;
    index: number;
    errors: FormErrors;
    canRemove: boolean;
    onChange: (i: number, key: keyof MonitorForm | "variableName" | "path", value: string | boolean) => void;
    onRemove: (i: number) => void;
}
const METHODS = ["GET", "POST", "PUT"] as const;
const MonitorCard = ({
    monitor,
    index,
    errors,
    canRemove,
    onChange,
    onRemove,
}: MonitorCardProps) => {
    const nameErr = errors[`name_${index}`];
    const urlErr = errors[`url_${index}`];
   // const kwErr = errors[`kw_${index}`];
    const [error, setError] = useState("");
    return (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
                        {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-300">
                        {monitor.name.trim() || `Monitor ${index + 1}`}
                    </span>
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                        aria-label="Remove monitor"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M4 4l8 8M12 4l-8 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Card body */}
            <div className="p-6 space-y-5">
                <Field label="Monitor Name" error={nameErr}>
                    <TextInput
                        type="text"
                        placeholder="e.g. Main API Gateway"
                        value={monitor.name}
                        hasError={!!nameErr}
                        onChange={(e) => onChange(index, "name", e.target.value)}
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
                            onChange={(e) => onChange(index, "url", e.target.value)}
                        />
                    </div>
                </Field>

                <Field
                    label="Keywords"
                    description="Comma-separated. All must be present in the API response."
                   // error={kwErr}
                >
                    <TextInput
                        type="text"
                        placeholder="e.g. success, ok, true"
                        value={monitor.keyword}
                        //hasError={!!kwErr}
                        onChange={(e) => onChange(index, "keyword", e.target.value)}
                    />
                </Field>

                {/* Advanced toggle */}
                <button
                    type="button"
                    onClick={() => onChange(index, "showAdv", !monitor.showAdv)}
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
                                        onClick={() => onChange(index, "method", m)}
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
                                    onChange={(e) => onChange(index, "token", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => onChange(index, "showToken", !monitor.showToken)}
                                    className="px-3 py-2 text-xs font-medium text-slate-400 bg-slate-800/60 border border-slate-700/80 rounded-lg hover:text-slate-200 hover:border-slate-600 transition-all whitespace-nowrap"
                                >
                                    {monitor.showToken ? "Hide" : "Show"}
                                </button>
                            </div>
                        </Field>
                        <Field label="Extract variables from response">
                            <div className="flex flex-col gap-3">
                                <div
                                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end"
                                >
                                    {/* Variable name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                            Variable name
                                        </label>
                                        <input
                                            type="text"
                                            value={monitor.extract.variableName}
                                            onChange={(e) => onChange(index, "variableName", e.target.value)}
                                            placeholder="e.g. token"
                                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5
                                           text-sm text-white placeholder-slate-600 focus:outline-none
                                           focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>

                                    {/* Variable path */}
                                    <div>
                                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                                                JSON path
                                            </label>
                                        <input
                                            type="text"
                                            value={monitor.extract.path}
                                            onChange={(e) => onChange(index, "path", e.target.value)}
                                            placeholder="e.g. data.token"
                                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5
                                           text-sm text-white placeholder-slate-600 focus:outline-none
                                           focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        // onClick={}
                                        //disabled={extracts.length === 1}
                                        className="p-2.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10
                                       disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        aria-label="Remove variable"
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        </Field>

                        {/* Request Body (POST/PUT only) */}
                        {(monitor.method === "POST" || monitor.method === "PUT") && (
                            <Field label="Request Body (JSON)">


                                <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
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
                                        value={monitor.body.length === 0 ? `{
  "success": true
}` : monitor.body}
                                        onChange={(value?: string) => {
                                            if (!value) {
                                                return;
                                            }
                                            const next = value || "";
                                            onChange(index, "body", next)
                                            try {
                                                JSON.parse(next);
                                                setError("");
                                            } catch {
                                                setError("Invalid JSON requestBody");
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
                                        {error ? (
                                            <p className="text-sm text-red-400">{error}</p>
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
    );
};

export default MonitorCard