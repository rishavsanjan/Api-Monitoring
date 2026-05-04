const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);


const CTABanner = () => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto rounded-[2rem] bg-blue-500 p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-900/30 blur-3xl" />
      <h2 className="text-white text-3xl lg:text-5xl font-black mb-6 relative z-10 tracking-tight">
        Stop losing customers to downtime.
      </h2>
      <p className="text-white/80 text-lg lg:text-xl mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">
        Join 5,000+ engineering teams who trust UptimePulse for their mission-critical services.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
        <button className="bg-white text-blue-600 hover:bg-slate-100 text-lg font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 group">
          Get Started for Free
          <span className="group-hover:translate-x-1 transition-transform"><IconArrow /></span>
        </button>
        <button className="bg-blue-400/20 text-white border border-white/30 hover:bg-white/10 text-lg font-bold px-8 py-4 rounded-xl transition-all">
          Talk to an Expert
        </button>
      </div>
    </div>
  </section>
);

export default CTABanner