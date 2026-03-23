import { MonitorHistory, MonitorPageResponse } from "@/type/props";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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



interface Props {
    data: {
        time: string,
        value: number
    }[],
    monitorId: string
}


function getTimeFromISO(isoString: string): string {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid ISO timestamp');
    }
    return date.toTimeString().slice(0, 5);  // "HH:MM"
}



export default function ResponseTimeChart({ data, monitorId }: Props) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem("api");

        const socket = new WebSocket(
            `ws://localhost:8080/ws?token=${token}`
        );

        socket.onmessage = async (event) => {
            const data: MonitorHistory = JSON.parse(event.data);
            console.log("Live update:", data);
            const newPoint = {
                time: getTimeFromISO(data.CheckedAt),
                value: data.ResponseTimeMs
            };

            await queryClient.cancelQueries({ queryKey: ["monitor-result", monitorId] });



            queryClient.setQueryData<MonitorPageResponse>(
                ["monitor-result", monitorId],
                (old) => {
                    if (!old) return old;
                    if (old.monitor.ID != data.MonitorID) {
                        return old;
                    }

                    return {
                        ...old,
                        history:[data, ...old.history],
                        stats: {
                            ...old.stats,
                            totalLogs: old.stats.totalLogs += 1
                        },
                        chartData: [...old.chartData, newPoint]
                    };
                }
            );


        };

        return () => {
            socket.close(); 
        };
    }, []);


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