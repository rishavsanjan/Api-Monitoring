const FrequencySlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (v: number) => void;
}) => {
    const FREQ_LABELS = ["Every 1 min", "5 mins", "15 mins", "30 mins", "1 hour"];
    const pct = ((value - 1) / 3600) * 100;
    const label = `Every ${value / 60} minutes`


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Monitoring Frequency</label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        {label}
                    </span>
                    <span className="text-[10px] text-slate-500 px-2 py-1 bg-slate-800 rounded-md font-medium">
                        Recommended: 1 min
                    </span>
                </div>
            </div>

            <div className="relative">
                {/* Track */}
                <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={1}
                    max={60}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                    style={{ WebkitAppearance: "none" }}
                />
                {/* Thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg shadow-blue-500/30 pointer-events-none transition-all"
                    style={{ left: `calc(${pct}% - 8px)` }}
                />
            </div>

            <div className="flex justify-between">
                {FREQ_LABELS.map((l) => (
                    <span key={l} className="text-[10px] text-slate-600 font-medium uppercase tracking-wide">
                        {l}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default FrequencySlider