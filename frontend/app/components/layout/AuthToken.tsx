import React from 'react'

const AuthToken = () => {
    return (
        <div className="w-full max-w-6xl bg-[#111827] text-white  rounded-xl">
            <div className="mt-6 border-t border-slate-700 mb-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-end">
                <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Auth. type
                    </label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none rounded-xl border border-slate-600 bg-[#0f172a] px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-slate-400"
                        >
                            <option>Bearer</option>
                        </select>
                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                        Token
                    </label>
                    <input
                        type="text"
                        placeholder="Paste your token here"
                        className={`
          w-full bg-slate-800/60 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600
          focus:outline-none focus:ring-2 transition-all
                    border-slate-700 focus:border-blue-500 focus:ring-blue-500/20
        `}
                    />
                </div>
            </div>

            <div className="mt-6 border-t border-slate-700"></div>
        </div>
    )
}

export default AuthToken