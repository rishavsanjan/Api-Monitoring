"use client";

import { useEffect, useRef, useState } from "react";
import { X, Globe, Clock, Tag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Monitor, MonitorPageResponse } from "@/type/props";

interface EditMonitorModalProps {
  name: string;
  url: string;
  interval: number;
  monitorId: string;
  onClose: () => void;
}

interface Errors {
  name: string,
  url: string,
  interval: string
}

export default function EditMonitorModal({
  name,
  url,
  interval,
  monitorId,
  onClose,
}: EditMonitorModalProps) {
  const [formName, setFormName] = useState(name);
  const [formUrl, setFormUrl] = useState(url);
  const [formInterval, setFormInterval] = useState(interval);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Errors>({
    name: "",
    url: "",
    interval: ""
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
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

  function isValidLink(input: string): boolean {
    try {
      const url = new URL(input)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }

  async function handleSubmit() {
    if (formUrl.trim().length === 0) {
      setErrors(prev => ({ ...prev, url: "Enter a link" }));
      return;
    }
    if (formName.trim().length === 0) {
      setErrors(prev => ({ ...prev, name: "Name should not have zero characters!" }));
      return;
    }
    if (!isValidLink(formUrl)) {
      setErrors(prev => ({ ...prev, url: "Please enter a valid link" }));
      return;
    }

    

    handleUpdateMutation.mutate();
  }

  const handleUpdateMutation = useMutation({
    mutationKey: ['update-monitor', monitorId],
    mutationFn: async () => {
      const res = await api.patch(`/api/monitors/${monitorId}/update`, {
        name: formName,
        url: formUrl,
        interval: formInterval
      })

      return res.data
    },
    onSuccess: async () => {

      if (interval !== formInterval || url !== formUrl) {
        await queryClient.cancelQueries({ queryKey: ["monitor-result", monitorId] });
      }

      queryClient.setQueryData<MonitorPageResponse>(["monitor-result", monitorId],
        (old) => {
          if (!old) return old;
          if (old.monitor.ID !== monitorId) return old;
          return {
            ...old,
            monitor: {
              ...old.monitor,
              Name: formName,
              Interval: formInterval,
              URL: formUrl
            }
          }
        }
      )
      handleClose()
      toast.success("Monitor updated successfully!")
    },
    onError: () => {
      toast.error("Some error occured!")
    }
  })

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
        <div className="px-6 py-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-white/50 text-xs font-medium uppercase tracking-wider">
              <Tag size={11} />
              Name
            </label>
            <div>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="My Monitor"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-white text-sm placeholder-white/20 outline-none transition-all duration-150 focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/20"
              />
              {
                errors.name.length > 0 &&
                <span className="text-red-800 text-xs px-3.5">{errors.name}</span>
              }
            </div>

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
            {
                errors.url.length > 0 &&
                <span className="text-red-800 text-xs px-3.5">{errors.url}</span>
              }
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
              onClick={() => {
                handleSubmit()
              }}
              disabled={handleUpdateMutation.isPending || (formName === name && formInterval === interval && formUrl === url)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-150 cursor-pointer shadow shadow-blue-900/40"
            >
              {handleUpdateMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}