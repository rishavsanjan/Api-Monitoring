"use client";

import CTABanner from "./components/ui/CTABanner";
import Features from "./components/ui/Features";
import Footer from "./components/ui/Footer";
import Hero from "./components/ui/Hero";
import Navbar from "./components/ui/Navbar";
import Pricing from "./components/ui/Pricing";

const Background = () => (
  <div className="fixed inset-0 -z-10 bg-[#101722]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-500 opacity-[0.06] blur-[150px]" />
    <div className="absolute right-0 top-1/2 h-[300px] w-[300px] rounded-full bg-violet-500 opacity-[0.04] blur-[100px]" />
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white relative">
      <Background />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}