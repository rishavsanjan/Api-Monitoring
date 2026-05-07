"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

interface ChartDataPoint {
  time: string;
  value: string;
}

interface PerformanceChartProps {
  data: {
    time: string;
  value: number;
  }[];
  monitorId: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-blue-400/25 bg-[rgba(15,30,55,0.95)] backdrop-blur-sm px-3 py-2 shadow-xl">
      <div className="text-blue-400 font-semibold text-sm">{payload[0].value}ms</div>
      <div className="text-white/50 text-[11px] mt-0.5">{label}</div>
    </div>
  );
}

export default function PerformanceChart({ data, monitorId }: PerformanceChartProps) {
  // Coerce string values to numbers for Recharts
  const parsed = data.map((d) => ({ time: d.time, value: parseFloat(d.value) }));

  const numericVals = parsed.map((d) => d.value).filter(Number.isFinite);
  const minV = numericVals.length ? Math.min(...numericVals) : 0;
  const maxV = numericVals.length ? Math.max(...numericVals) : 100;
  const pad = (maxV - minV) * 0.3 || 30;
  const yMin = Math.floor((minV - pad) / 10) * 10;
  const yMax = Math.ceil((maxV + pad) / 10) * 10;

  // ~5 evenly spaced x-axis ticks
  const tickSet = (() => {
    if (parsed.length <= 5) return new Set(parsed.map((d) => d.time));
    const step = Math.floor((parsed.length - 1) / 4);
    return new Set([0, step, step * 2, step * 3, parsed.length - 1].map((i) => parsed[i].time));
  })();

  const gradientId = `fill-${monitorId}`;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#0d1b2e] to-[#091524] px-6 py-5 w-full">
      <div className="flex items-center justify-between mb-5">
        <span className="text-white text-[15px] font-bold tracking-wide">Response Time</span>
        <span className="text-white/30 text-xs font-mono">{monitorId}</span>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={parsed} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.38} />
              <stop offset="55%" stopColor="#2563eb" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            horizontal
            vertical={false}
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="3 6"
          />

          <XAxis
            dataKey="time"
            tick={{ fill: "rgba(255,255,255,0.32)", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            ticks={[...tickSet]}
            label={{
              value: "Time",
              position: "insideBottomRight",
              offset: -4,
              fill: "rgba(255,255,255,0.2)",
              fontSize: 10,
            }}
          />

          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}ms`}
            width={46}
            label={{
              value: "Response Time",
              angle: -90,
              position: "insideLeft",
              offset: -2,
              fill: "rgba(255,255,255,0.2)",
              fontSize: 10,
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(96,165,250,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#60a5fa"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: "#60a5fa", stroke: "#1d4ed8", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}