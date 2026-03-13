interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  body: string;
}


const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const features: FeatureCard[] = [
  {
    icon: <IconBell />,
    title: "Real-time Alerts",
    body: "Get notified via Slack, PagerDuty, or Email the second your API goes down. Instant escalation for critical issues.",
  },
  {
    icon: <IconChart />,
    title: "Performance Analytics",
    body: "Deep dive into latency, throughput, and error rates with interactive charts. Identify bottlenecks before they hit users.",
  },
  {
    icon: <IconGlobe />,
    title: "Global Monitoring",
    body: "Check health from 20+ global locations. Ensure a consistent experience for your users regardless of where they are.",
  },
];

const Features = () => (
  <section id="features" className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-16 text-center lg:text-left">
        <h2 className="text-white text-3xl lg:text-5xl font-black tracking-tight leading-tight">
          Engineered for Reliability
        </h2>
        <p className="text-slate-400 text-lg max-w-xl">
          Everything you need to monitor, analyze, and optimize your API performance in one place.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="group p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/40 hover:bg-slate-900 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              {f.icon}
            </div>
            <h3 className="text-white text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-slate-400 text-base leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features