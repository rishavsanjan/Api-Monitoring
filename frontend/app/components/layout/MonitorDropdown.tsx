'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { IconChevronRight } from '@/app/components/icons/icons'

type MonitorType = {
    id: string
    label: string
    description: string
    icon: string
    path: string
}

const MONITOR_TYPES: MonitorType[] = [
    {
        id: 'http',
        label: 'HTTP',
        description: 'Monitor HTTP/HTTPS endpoints for uptime and response',
        icon: '🌐',
        path: '/http',
    },
    {
        id: 'keyword',
        label: 'Keyword',
        description: 'Check that a keyword exists or is absent on a page',
        icon: '🔍',
        path: '/keyword',
    },
    {
        id: 'ping',
        label: 'Ping',
        description: 'ICMP ping a host to verify network reachability',
        icon: '📡',
        path: '/ping',
    },
    {
        id: 'synthetic',
        label: 'Synthetic',
        description: 'Run scripted browser flows to test user journeys',
        icon: '🤖',
        path: '/synthetic',
    },
]

export default function MonitorDropdown() {
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Derive selected from current route
    const selected =
        MONITOR_TYPES.find((m) => pathname?.startsWith(m.path)) ?? null

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (monitor: MonitorType) => {
        setOpen(false)
        router.push(monitor.path)
    }

    return (
        <div ref={ref} className="relative w-full max-w-sm">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`
                    w-full flex items-center justify-between gap-3
                    px-4 py-3 rounded-xl border text-sm font-medium
                    transition-all duration-200
                    ${open
                        ? 'border-blue-500 bg-slate-800/80 text-white shadow-lg shadow-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                    }
                `}
            >
                <span className="flex items-center gap-2.5">
                    {selected ? (
                        <>
                            <span className="text-base leading-none">{selected.icon}</span>
                            <span className="text-white">{selected.label}</span>
                        </>
                    ) : (
                        <span className="text-slate-500">Select monitor type…</span>
                    )}
                </span>

                {/* Chevron rotates when open */}
                <span
                    className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                >
                    <IconChevronRight />
                </span>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="
                        absolute left-0 top-[calc(100%+6px)] z-50
                        w-full min-w-[320px]
                        rounded-xl border border-slate-700
                        bg-slate-900/95 backdrop-blur-md
                        shadow-2xl shadow-black/40
                        overflow-hidden
                        animate-in fade-in slide-in-from-top-1 duration-150
                    "
                >
                    {MONITOR_TYPES.map((monitor) => {
                        const isActive = selected?.id === monitor.id
                        return (
                            <button
                                key={monitor.id}
                                type="button"
                                onClick={() => handleSelect(monitor)}
                                className={`
                                    w-full flex items-start gap-3.5 px-4 py-3.5 text-left
                                    transition-colors duration-150 group
                                    ${isActive
                                        ? 'bg-blue-600/20 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }
                                `}
                            >
                                <span className="mt-0.5 text-xl leading-none shrink-0">
                                    {monitor.icon}
                                </span>
                                <span className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-semibold ${isActive ? 'text-blue-400' : ''}`}>
                                        {monitor.label}
                                    </span>
                                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                        {monitor.description}
                                    </span>
                                </span>
                                {isActive && (
                                    <span className="ml-auto mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}