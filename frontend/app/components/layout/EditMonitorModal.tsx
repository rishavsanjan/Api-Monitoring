"use client";

import { useEffect, useRef, useState } from "react";
import { X, Globe, Clock, Tag } from "lucide-react";

interface EditMonitorModalProps {
  name: string;
  url: string;
  interval: number;
  monitorId: string;
  onClose: () => void;
  onSave?: (data: { name: string; url: string; interval: number }) => Promise<void> | void;
}

export default function EditMonitorModal({
  name,
  url,
  interval,
  monitorId,
  onClose,
  onSave,
}: EditMonitorModalProps) {
  const [formName, setFormName] = useState(name);
  const [formUrl, setFormUrl] = useState(url);
  const [formInterval, setFormInterval] = useState(interval);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) handleClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave?.({ name: formName, url: formUrl, interval: formInterval });
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        transition: "opacity 0.2s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d1521] shadow-2xl"
        style={{
          transition: "opacity 0.2s ease, transform 0.2s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <h2 className="text-white font-semibold text-base tracking-wide">Edit Monitor</h2>
            <p className="text-white/30 text-xs font-mono mt-0.5 truncate max-w-xs">{monitorId}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-all duration-150 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-white/50 text-xs font-medium uppercase tracking-wider">
              <Tag size={11} />
              Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              placeholder="My Monitor"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-150 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-white/50 text-xs font-medium uppercase tracking-wider">
              <Globe size={11} />
              Endpoint URL
            </label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              required
              placeholder="https://example.com"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-150 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
          </div>

          {/* Interval */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-white/50 text-xs font-medium uppercase tracking-wider">
              <Clock size={11} />
              Check Interval (seconds)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formInterval}
                onChange={(e) => setFormInterval(Number(e.target.value))}
                required
                min={10}
                step={10}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-150 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20 pr-16"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 text-xs font-mono pointer-events-none">
                sec
              </span>
            </div>
            <p className="text-white/20 text-xs">Minimum interval is 10 seconds.</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-150 cursor-pointer shadow shadow-blue-900/40"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}