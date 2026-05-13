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
  value: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  monitorId: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const isHighLatency = value > 200;
  
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0f1a]/95 backdrop-blur-md px-4 py-3 shadow-2xl">
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${isHighLatency ? 'text-rose-400' : 'text-emerald-400'}`}>
          {Math.max(0, value)}ms
        </span>
        {isHighLatency && (
          <span className="text-[10px] font-medium text-rose-400/80 bg-rose-400/10 px-1.5 py-0.5 rounded">
            High
          </span>
        )}
      </div>
      <div className="text-white/40 text-[10px] mt-1 font-mono">{label}</div>
    </div>
  );
}

export default function PerformanceChart({ data, monitorId }: PerformanceChartProps) {
  const positiveData = data.map(point => ({
    ...point,
    value: Math.max(0, point.value)
  }));
  
  const vals = positiveData.map((d) => d.value).filter(Number.isFinite);
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 100;
  
  const yMin = 0;
  const pad = (maxV - yMin) * 0.15 || 20;
  const yMax = Math.ceil((maxV + pad) / 10) * 10;

  const getTicks = () => {
    if (positiveData.length <= 6) return positiveData.map(d => d.time);
    const step = Math.floor(positiveData.length / 5);
    return positiveData.filter((_, i) => i % step === 0).map(d => d.time);
  };

  const gradientId = `fill-${monitorId}`;
  const ticks = getTicks();

  const avgResponse = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  const latestResponse = vals[vals.length - 1] || 0;
  const isHealthy = latestResponse < 100;

  return (
    <div className="group rounded-2xl mb-4 border border-white/[0.06] bg-gradient-to-br from-[#0a0f1a] to-[#0d1521]  hover:border-white/[0.12] transition-all duration-300">
      {/* Header with enhanced stats */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-[11px] font-mono uppercase tracking-wider">Live</span>
          </div>
          <span className="text-white text-[15px] font-semibold tracking-wide">Response Time</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Avg</div>
            <div className="text-white font-mono text-sm font-semibold">{avgResponse}ms</div>
          </div>
          <div className="w-px h-8 bg-white/[0.06]" />
          <div className="text-right">
            <div className="text-white/40 text-[10px] uppercase tracking-wider">Latest</div>
            <div className={`font-mono text-sm font-semibold ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {latestResponse}ms
            </div>
          </div>
          <div className="text-white/20 text-xs font-mono bg-white/[0.03] px-2 py-1 rounded-md">
            {monitorId}
          </div>
        </div>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={positiveData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#50A2FF" stopOpacity={0.4} />
                <stop offset="40%" stopColor="#50A2FF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#50A2FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              horizontal
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4 6"
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "ui-monospace, monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
              ticks={ticks}
              dy={8}
            />

            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "ui-monospace, monospace" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
              tickFormatter={(v) => `${v}ms`}
              width={55}
              dx={-8}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ 
                stroke: "rgba(16,185,129,0.3)", 
                strokeWidth: 1.5, 
                strokeDasharray: "3 3",
                className: "cursor-line"
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#50A2FF"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ 
                r: 5, 
                fill: "#50A2FF", 
                stroke: "#064e3b", 
                strokeWidth: 3,
                className: "transition-all duration-200 hover:r-6"
              }}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with additional metrics */}
      <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex gap-4 text-[10px] text-white/30 font-mono">
          <span>✓ Positive values only</span>
          <span>•</span>
          <span>Auto-scaling Y-axis</span>
        </div>
        <div className="text-[10px] text-white/20">
          Last {positiveData.length} samples
        </div>
      </div>
    </div>
  );
}