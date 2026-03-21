import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Area,
    AreaChart
} from "recharts";

const data = [
    { time: "12:00", value: 150 },
    { time: "12:01", value: 140 },
    { time: "12:02", value: 160 },
    { time: "12:03", value: 130 },
];

export default function ResponseTimeChart() {
    return (
        <div className="bg-[#0B1220] text-white p-5 rounded-2xl shadow-lg w-full">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Response Time</h2>

                <div className="flex gap-2 text-sm">
                    <button className="px-3 py-1 rounded-lg bg-gray-700">1h</button>
                    <button className="px-3 py-1 rounded-lg bg-blue-600">24h</button>
                    <button className="px-3 py-1 rounded-lg bg-gray-700">7d</button>
                </div>
            </div>

            {/* Chart */}
            <div className="w-full h-64">
                <ResponsiveContainer>
                    <AreaChart data={data}>

                        {/* Gradient */}
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Grid */}
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

                        {/* Axes */}
                       <XAxis
  dataKey="time"
  tickFormatter={(value, index) => {
    return index % 5 === 0 ? value : ""; // show every 5 mins
  }}
/>
                        <YAxis
                            stroke="#6b7280"
                            tick={{ fontSize: 12 }}
                            unit="ms"
                        />

                        {/* Tooltip */}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "none",
                                borderRadius: "10px",
                            }}
                        />

                        {/* Area + Line */}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            fill="url(#colorUv)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}