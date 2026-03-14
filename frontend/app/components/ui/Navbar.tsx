import Link from "next/link";
import { useState } from "react";

const IconPulse = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const links = ["Features", "Pricing", "Docs", "Blog"];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#101722]/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 text-blue-400">
          <IconPulse />
          <span className="text-white text-xl font-bold tracking-tight">UptimePulse</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 justify-center gap-10">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-slate-400 text-sm font-medium hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href={`/auth?tab=login`} className="text-slate-400 text-sm font-semibold hover:text-white transition-colors px-3 py-2">
            Log In
          </Link>

          <Link  className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-500/20" href={'/auth?tab=signup'}>
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-800 mt-4 pt-4 pb-2 flex flex-col gap-4 px-1">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="text-slate-300 text-sm font-medium hover:text-white transition-colors py-1">
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button className="text-slate-300 font-semibold text-sm py-2 text-left">Log In</button>
            <button className="bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-lg w-full">Get Started</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar
