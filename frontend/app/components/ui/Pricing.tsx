const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 flex-shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface PricingPlan {
  name: string;
  price: string;
  desc: string;
  cta: string;
  highlight: boolean;
  features: string[];
}


const plans: PricingPlan[] = [
    {
        name: "Starter",
        price: "$0",
        desc: "For individuals & hobbyists.",
        cta: "Get Started",
        highlight: false,
        features: ["5 API Monitors", "5-minute checks", "Email Alerts"],
    },
    {
        name: "Pro",
        price: "$49",
        desc: "For growing startups.",
        cta: "Go Pro",
        highlight: true,
        features: ["50 API Monitors", "1-minute checks", "Slack & SMS Alerts", "30-day Data Retention"],
    },
    {
        name: "Enterprise",
        price: "$199",
        desc: "For large-scale infra.",
        cta: "Contact Sales",
        highlight: false,
        features: ["Unlimited Monitors", "10-second checks", "Custom Reporting & SLA", "Dedicated Support"],
    },
];


const Pricing = () => (
    <section id="pricing" className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-white text-3xl lg:text-5xl font-black mb-4 tracking-tight">
                    Simple, Transparent Pricing
                </h2>
                <p className="text-slate-400">Choose the plan that fits your scale.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative flex flex-col gap-6 p-8 rounded-2xl transition-all ${plan.highlight
                                ? "border-2 border-blue-500 bg-slate-900 shadow-2xl shadow-blue-500/10"
                                : "border border-slate-800 bg-slate-900/50"
                            }`}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                                Most Popular
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <h3 className="text-white text-lg font-bold">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-white text-4xl font-black">{plan.price}</span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            <p className="text-slate-500 text-sm">{plan.desc}</p>
                        </div>
                        <button
                            className={`w-full font-bold py-3 rounded-lg transition-all ${plan.highlight
                                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-slate-800 hover:bg-slate-700 text-white"
                                }`}
                        >
                            {plan.cta}
                        </button>
                        <ul className="flex flex-col gap-3">
                            {plan.features.map((feat) => (
                                <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="text-blue-400"><IconCheck /></span>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Pricing