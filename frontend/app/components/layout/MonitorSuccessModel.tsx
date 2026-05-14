import React, { SetStateAction } from 'react'



interface Props {
    name: string,
    url: string,
    setSuccessModel: React.Dispatch<SetStateAction<boolean>>
    handleCloseModel: () => void
}

const MonitorSuccessModel: React.FC<Props> = ({ name, url, setSuccessModel, handleCloseModel }) => {
    return (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-10 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} className="w-8 h-8">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <div>
                <p className="text-white font-bold text-lg">Monitor Created!</p>
                <p className="text-slate-400 text-sm mt-1">
                    <span className="text-white font-medium">{name || "Your monitor"}</span> is now active and monitoring{" "}
                    <code className="text-blue-400 font-mono text-xs">{url || "your endpoint"}</code>.
                </p>
            </div>
            <button
                onClick={() => {
                    setSuccessModel(false);
                    handleCloseModel()
                }}
                className="mt-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-lg transition-colors"
            >
                Create Another
            </button>
        </div>
    )
}

export default MonitorSuccessModel