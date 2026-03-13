const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

const Home = () => (
  <div className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-blue-500/5 relative">
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent pointer-events-none z-10" />
    {/* Browser chrome */}
    <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center gap-3">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
      </div>
      <div className="bg-slate-800 px-4 py-1 rounded text-[10px] text-slate-500 font-mono flex-1 max-w-[360px]">
        uptimepulse.io/dashboard
      </div>
    </div>
    {/* Fake dashboard UI */}
    <div className="bg-[#0d1420] p-6 grid grid-cols-4 gap-4">
      {/* Stat cards */}
      {[
        { label: "Uptime", value: "99.98%", color: "text-emerald-400" },
        { label: "Avg Latency", value: "142ms", color: "text-blue-400" },
        { label: "Monitors", value: "48", color: "text-slate-200" },
        { label: "Incidents", value: "2", color: "text-amber-400" },
      ].map((s) => (
        <div key={s.label} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mb-1">{s.label}</p>
          <p className={`${s.color} text-xl font-bold font-mono`}>{s.value}</p>
        </div>
      ))}
      {/* Fake chart */}
      <div className="col-span-3 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs font-semibold mb-3">Response Time (24h)</p>
        <svg viewBox="0 0 400 80" className="w-full">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,60 C30,55 60,40 90,45 C120,50 150,30 180,35 C210,40 240,20 270,25 C300,30 330,45 360,40 C380,37 400,42 400,42 L400,80 L0,80 Z" fill="url(#chartGrad)" />
          <path d="M0,60 C30,55 60,40 90,45 C120,50 150,30 180,35 C210,40 240,20 270,25 C300,30 330,45 360,40 C380,37 400,42 400,42" fill="none" stroke="#3b82f6" strokeWidth="2" />
        </svg>
      </div>
      {/* Status list */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
        <p className="text-slate-400 text-xs font-semibold mb-1">Status</p>
        {[
          { name: "Auth API", ok: true },
          { name: "Payments", ok: true },
          { name: "CDN", ok: false },
          { name: "DB", ok: true },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px]">{s.name}</span>
            <span className={`w-2 h-2 rounded-full ${s.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

 const Hero = () => (
  <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 px-6">
    <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
        </span>
        Now with Global Edge Monitoring
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-white text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
        Modern API Monitoring for{" "}
        <span className="text-blue-400">Scalable Teams</span>
      </h1>

      {/* Sub */}
      <p className="max-w-2xl text-slate-400 text-lg lg:text-xl leading-relaxed">
        Keep your APIs running smoothly with real-time insights, automated testing, and global monitoring. Built for modern engineering teams who demand 100% uptime.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button className="bg-blue-500 hover:bg-blue-400 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group">
          Get Started for Free
          <span className="group-hover:translate-x-1 transition-transform"><IconArrow /></span>
        </button>
        <button className="bg-slate-800 hover:bg-slate-700 text-white text-lg font-bold px-8 py-4 rounded-xl border border-slate-700 transition-all">
          Schedule Demo
        </button>
      </div>

      {/* Dashboard mockup */}
      <div className="mt-12 w-full flex justify-center">
        <Home />
      </div>
    </div>
  </section>
);

export default Hero

