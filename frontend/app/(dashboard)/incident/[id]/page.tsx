"use client"
import IncidentHeader from "@/app/components/layout/IncidentHeader";
import LogsSection from "@/app/components/layout/MonitorLog";
import PerformanceChart from "@/app/components/layout/PerformanceChart";
import api from "@/lib/axios";
import { IncidentPageResponse } from "@/type/props";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { ClipLoader } from "react-spinners";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const panel = "rounded-xl border border-white/[0.06] bg-[#141c2a]";

export default function IncidentDetail() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["monitor-result", id],
    queryFn: async () => {
      const response = await api.get(`/api/monitors/${id}/incident`);
      return response.data as IncidentPageResponse;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e141f]">
        <ClipLoader color="#94a3b8" size={40} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className={`${sans.variable} ${mono.variable} flex min-h-screen items-center justify-center bg-[#0e141f] p-6 text-slate-100`}
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        <div className={`${panel} max-w-sm p-8 text-center`}>
          <p className="text-lg font-semibold">Couldn’t load this incident</p>
          <p className="mt-2 text-sm text-slate-400">
            The request failed. Check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-6 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Average latency",
      value: data.stats.avgLatency,
      note: "2850% above normal",
      noteClass: "text-red-400",
      valueClass: "text-slate-100",
      up: true,
    },
    {
      label: "Total checks",
      value: data.stats.totalLogs,
      note: null,
      noteClass: "",
      valueClass: "text-slate-100",
      up: false,
    },
    {
      label: "Uptime, last 30 days",
      value: data.stats.uptime,
      note: "Minor impact",
      noteClass: "text-slate-400",
      valueClass: "text-emerald-400",
      up: false,
    },
  ];

  return (
    <div
      className={`${sans.variable} ${mono.variable} min-h-screen bg-[#0e141f] text-slate-100 antialiased`}
      style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
    >
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-10 motion-safe:animate-[incidentIn_0.5s_ease-out]">
        <IncidentHeader
          monitor={data.monitor}
          logCreationTime={data.log.CreatedAt}
          firstIncidentTime={data.firstDownTime}
        />

        {/* Hero: the failing status code, with the numbers that explain it */}
        <section
          className={`${panel} relative overflow-hidden border-red-500/20`}
          aria-label="Incident summary"
        >
          <span className="absolute inset-y-0 left-0 w-1 bg-red-500" aria-hidden />
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
            <div className="p-6 pl-8 sm:p-8 sm:pl-10">
              <p className="text-sm text-slate-400">Latest response</p>
              <p
                className="mt-2 text-7xl font-semibold leading-none tracking-tight text-red-400"
                style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
              >
                504
              </p>
              <p className="mt-3 text-lg font-medium text-slate-200">Gateway timeout</p>
            </div>

            <dl className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:border-l md:border-t-0">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col justify-center p-6">
                  <dt className="text-sm text-slate-400">{s.label}</dt>
                  <dd
                    className={`mt-1.5 text-3xl font-semibold tracking-tight ${s.valueClass}`}
                    style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                  >
                    {s.value}
                  </dd>
                  {s.note && (
                    <p className={`mt-1.5 flex items-center gap-1 text-xs ${s.noteClass}`}>
                      {s.up && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                          aria-hidden
                        >
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                      )}
                      {s.note}
                    </p>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>

        <PerformanceChart data={data.chartData} monitorId={data.monitor.ID} />

        <LogsSection logs={data.log} />

        {/* Request and response, one panel, two halves */}
        <section className={`${panel} grid overflow-hidden md:grid-cols-2`} aria-label="Request and response">
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-100">Request</h2>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm text-slate-400">URL</p>
                <p
                  className="mt-1 break-all text-sm text-slate-100"
                  style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                >
                  {data.monitor.URL}
                </p>
              </div>

              <div className="flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <p className="text-sm text-slate-400">Method</p>
                  <span
                    className="mt-1 inline-block rounded-md bg-emerald-400/10 px-2 py-0.5 text-sm font-semibold text-emerald-300"
                    style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                  >
                    POST
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Content type</p>
                  <p
                    className="mt-1 text-sm text-slate-100"
                    style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                  >
                    application/json
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] p-6 md:border-l md:border-t-0">
            <h2 className="text-base font-semibold text-slate-100">Response body</h2>

            <pre
              className="mt-5 overflow-x-auto rounded-lg bg-[#0a0f18] p-4 text-[13px] leading-relaxed text-slate-300"
              style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
            >
              <code>
                {"{\n"}
                {"  "}<span className="text-sky-300">"error"</span>: <span className="text-red-300">"gateway_timeout"</span>,{"\n"}
                {"  "}<span className="text-sky-300">"message"</span>: <span className="text-emerald-300">"upstream service 0x221 failed"</span>,{"\n"}
                {"  "}<span className="text-sky-300">"trace_id"</span>: <span className="text-emerald-300">"pulse_f42a1882bc"</span>,{"\n"}
                {"  "}<span className="text-sky-300">"timestamp"</span>: <span className="text-amber-300">1723459200</span>{"\n"}
                {"}"}
              </code>
            </pre>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes incidentIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}