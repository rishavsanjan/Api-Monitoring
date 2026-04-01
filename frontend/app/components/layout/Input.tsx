interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    prefixIcon?: React.ReactNode;
    description?: string;
}

const Input = ({ label, error, prefixIcon, className = "", description, ...props }: InputProps) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-slate-300 text-xs">{description}</span>
        <div className="relative group">
            {prefixIcon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    {prefixIcon}
                </span>
            )}
            <input
                className={`
          w-full bg-slate-800/60 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600
          focus:outline-none focus:ring-2 transition-all
          ${error
                        ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                    }
          ${prefixIcon ? "pl-10" : ""}
          ${className}
        `}
                {...props}
            />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
);

export default Input
