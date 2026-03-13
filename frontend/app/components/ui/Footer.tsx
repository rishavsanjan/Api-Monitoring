interface FooterColumn {
    heading: string;
    links: string[];
}


const IconPulse = ({ className = "w-7 h-7" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const footerColumns: FooterColumn[] = [
    { heading: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
    { heading: "Resources", links: ["Documentation", "API Reference", "Support", "Community"] },
    { heading: "Company", links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"] },
];

const Footer = () => (
    <footer className="bg-slate-900/50 border-t border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-5">
                <div className="flex items-center gap-2 text-blue-400">
                    <IconPulse className="w-6 h-6" />
                    <span className="text-white text-xl font-bold tracking-tight">UptimePulse</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Reliable monitoring for the modern web. Built by engineers, for engineers.
                </p>
                <div className="flex gap-3">
                    {["X", "@", "↗"].map((icon) => (
                        <a key={icon} href="#" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all">
                            {icon}
                        </a>
                    ))}
                </div>
            </div>

            {/* Columns */}
            {footerColumns.map((col) => (
                <div key={col.heading} className="flex flex-col gap-4">
                    <h4 className="text-white font-bold text-sm">{col.heading}</h4>
                    {col.links.map((link) => (
                        <a key={link} href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                            {link}
                        </a>
                    ))}
                </div>
            ))}

            {/* Status */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm">Status</h4>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    All Systems Operational
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800">
            <p className="text-slate-600 text-xs text-center md:text-left">
                © 2024 UptimePulse Monitoring Solutions. All rights reserved.
            </p>
        </div>
    </footer>
);

export default Footer