import { timeAgo } from "@/lib/date";
import { useRouter } from "next/navigation";
import { SetStateAction } from "react";
import { ClipLoader } from "react-spinners";
type MonitorStatus = "online" | "offline" | "degraded";

interface Monitor {
    monitorId: string,
    method: "GET" | "POST",
    status: string,
    name: string,
    url: string,
    responseTimeMs: number
    lastCheckedAt: string
    currentStatus: number,
    expectedStatus: number

}

const StatusBadge = ({ status }: { status: MonitorStatus }) => {
    const config = {
        online: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Online" },
        offline: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Offline" },
        degraded: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Degraded" },
    }[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export const MonitorsTable = (
    {
        monitors,
        setCurrentPage,
        currentPage,
        totalMonitors,
        isLoading
    }
        :
        {
            monitors: Monitor[],
            setCurrentPage: React.Dispatch<SetStateAction<number>>,
            currentPage: number,
            totalMonitors: number,
            isLoading: boolean
        }
) => {
    const router = useRouter();
    const totalPages = Math.ceil(totalMonitors / 5);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full ">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-800">
                            {["Name", "URL", "Status", "Response Time", "Last Checked"].map((h, i) => (
                                <th
                                    key={h}
                                    className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i >= 3 ? (i === 5 ? "text-center" : "text-right") : ""
                                        }`}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800 ">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-10">
                                    <div className="flex justify-center items-center w-full">
                                        <ClipLoader color="white" />
                                    </div>
                                </td>
                            </tr>
                        ) :
                            <>
                                {monitors.map((m) => (
                                    <tr
                                        onClick={() => {
                                            router.push(`/monitor/${m.monitorId}`)
                                        }}
                                        key={m.monitorId}
                                        className="cursor-pointer hover:bg-slate-800/30 transition-colors group"
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">

                                                </div>
                                                <span className="text-sm font-semibold text-white">{m.name}</span>
                                            </div>
                                        </td>
                                        {/* URL */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-500 font-mono">{m.url}</span>
                                        </td>
                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={m.status === "UP" ? "online" : "offline"} />
                                        </td>
                                        {/* Response time */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`text-sm font-semibold ${m.status === "offline" ? "text-red-400" : "text-slate-300"}`}>
                                                {m.responseTimeMs}
                                            </span>
                                        </td>
                                        {/* Last checked */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-slate-500">{timeAgo(m.lastCheckedAt)}</span>
                                        </td>

                                    </tr>
                                ))}
                            </>
                        }







                    </tbody>

                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-800 bg-slate-800/30">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-white">{currentPage === 1 ? 1 : currentPage - 1 * 5}</span> to{" "}
                    <span className="font-semibold text-white">{currentPage * 5}</span> of{" "}
                    <span className="font-semibold text-white">{totalMonitors}</span> results
                </p>
                <div className="flex gap-1.5">
                    <button
                        onClick={() => {
                            setCurrentPage(prev => prev -= 1)
                        }}
                        disabled={currentPage == 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-600 disabled:cursor-not-allowed cursor-pointer">
                        Previous
                    </button>
                    {

                    }
                    {pageNumbers.map((p) => (
                        <button
                            onClick={() => {
                                if (p === currentPage) {
                                    return;
                                }
                                setCurrentPage(p)
                            }}
                            disabled={p === currentPage}
                            key={p}
                            className={`disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === currentPage
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                : "border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => {
                            setCurrentPage(prev => prev += 1)
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors disabled:cursor-not-allowed disabled:hidden">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};