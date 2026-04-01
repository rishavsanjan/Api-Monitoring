"use client"
import { useEffect, useRef, useState } from "react";
import { IconDashboard, IconIncidents, IconMonitors, IconPlus, IconPulse, IconReports, IconSettings } from "../icons/icons";
import { useSidebar } from "@/context/SidebarContext";
import { useRouter } from "next/navigation";

type NavItem = {
    label: string;
    icon: React.ReactNode;
    link: string
};

const navItems: NavItem[] = [
    { label: "Dashboard", icon: <IconDashboard />, link: '/dashboard' },
    { label: "Monitors", icon: <IconMonitors />, link: '/dashboard' },
    { label: "Incidents", icon: <IconIncidents />, link: '/dashboard/create-monitor' },
    { label: "Create", icon: <IconPlus />, link: '/http' },
    { label: "Settings", icon: <IconSettings />, link: '/create-monitor' },
];

export default function Sidebar() {
    const { collapsed, activeBar,setActiveBar } = useSidebar();
    const [sidebarWidth, setSidebarWidth] = useState(260)
    const isResizing = useRef(false);
    const router = useRouter();
    const startResizing = () => {
        isResizing.current = true
        document.body.style.userSelect = "none"
    }

    const stopResizing = () => {
        isResizing.current = false
        document.body.style.userSelect = "auto"
    }

    const resize = (e: MouseEvent) => {
        if (!isResizing.current || collapsed) return;

        const newWidth = e.clientX;

        if (newWidth < 180 || newWidth > 500) return;

        setSidebarWidth(newWidth);
    }

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);

        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, []);

    return (
        <aside
            style={{ width: collapsed ? 64 : sidebarWidth }}
            className={`
      shrink-0  bg-[#101722] flex flex-col justify-between py-6
      transition-all duration-300 relative
     
    `}
        >
            <div
                onMouseDown={startResizing}
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-slate-800 border-r border-slate-800"
            />
            <div className={collapsed ? "px-3" : "px-6"}>
                {/* Brand */}
                <div className={`flex items-center gap-3 mb-10 ${collapsed ? "justify-center" : ""}`}>
                    <div className="bg-blue-500/20 p-2 rounded-lg shrink-0 text-blue-400">
                        <IconPulse />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col leading-none">
                            <span className="text-white text-base font-bold">UptimePulse</span>
                            <span className="text-slate-500 text-xs font-medium mt-0.5">Monitoring Pro</span>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <button
                            
                            onClick={() => {
                                setActiveBar(item.label)
                                router.push(item.link)
                            }}
                            key={item.label}
                            title={collapsed ? item.label : undefined}
                            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${collapsed ? "justify-center" : ""}
              ${activeBar === item.label
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }
            `}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {
                                !collapsed && <span className="text-sm font-medium">{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Profile */}
            {!collapsed && (
                <div className="px-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                            AR
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">Alex Rivera</p>
                            <p className="text-xs text-slate-500 truncate">Admin</p>
                        </div>
                    </div>
                </div>
            )}
            {collapsed && (
                <div className="px-3 pt-6 border-t border-slate-800 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                        AR
                    </div>
                </div>
            )}
        </aside>
    )
}
