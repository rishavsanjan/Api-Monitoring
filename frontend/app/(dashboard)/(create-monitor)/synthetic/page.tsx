"use client";

import { useState, useCallback } from "react";

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
  };
}

function formatInterval(mins: number): string {
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""}`;
  const h = mins / 60;
  return `${h} hour${h !== 1 ? "s" : ""}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
  >
    <path
      d="M5 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2v10M2 7h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 10l4 4 8-8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Monitor Card ─────────────────────────────────────────────────────────────

interface MonitorCardProps {
  monitor: MonitorForm;
  index: number;
  errors: FormErrors;
  canRemove: boolean;
  onChange: (i: number, key: keyof MonitorForm, value: string | boolean) => void;
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
  const kwErr = errors[`kw_${index}`];

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
          error={kwErr}
        >
          <TextInput
            type="text"
            placeholder="e.g. success, ok, true"
            value={monitor.keyword}
            hasError={!!kwErr}
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

            {/* Request Body (POST/PUT only) */}
            {(monitor.method === "POST" || monitor.method === "PUT") && (
              <Field label="Request Body (JSON)">
                <textarea
                  placeholder={'{\n  "key": "value"\n}'}
                  value={monitor.body}
                  rows={4}
                  onChange={(e) => onChange(index, "body", e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono outline-none transition-all resize-y
                    focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 hover:border-slate-600"
                />
              </Field>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateMonitorPage() {
  const [monitors, setMonitors] = useState<MonitorForm[]>([createMonitor()]);
  const [interval, setIntervalMins] = useState<number>(5);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const updateMonitor = useCallback(
    (i: number, key: keyof MonitorForm, value: string | boolean) => {
      setMonitors((prev) =>
        prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m))
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
      if (!m.keyword.trim()) errs[`kw_${i}`] = "At least one keyword is required";
    });
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await Promise.all(
        monitors.map((m) =>
          fetch("/api/monitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: m.name,
              URL: m.url,
              interval: interval * 60,
              method: m.method,
              type: "keyword",
              config: {
                headers: m.token ? { Authorization: `Bearer ${m.token}` } : {},
                requestBody: m.body,
                mustContain: m.keyword
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean),
              },
            }),
          }).then((r) => {
            if (!r.ok) throw new Error("Request failed");
          })
        )
      );
      setSuccess(true);
    } catch {
      // In a real app: toast.error("Failed to create monitor(s)");
      alert("Failed to create monitor(s). Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMonitors([createMonitor()]);
    setIntervalMins(5);
    setSuccess(false);
    setErrors({});
  };

  // ── Success state ─────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <div className="flex flex-col items-center gap-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckIcon />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">
              Monitor{monitors.length > 1 ? "s" : ""} created!
            </p>
            <p className="text-slate-400 text-sm mt-1.5 max-w-xs mx-auto">
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
    <div className="mx-auto max-w-2xl w-full py-8 px-4 space-y-5">
      <div className="mb-2">
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
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          {loading ? (
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