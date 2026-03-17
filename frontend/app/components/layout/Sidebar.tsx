"use client"
import { usePathname } from "next/navigation";
import { IconDashboard, IconIncidents, IconMonitors, IconPulse, IconReports, IconSettings } from "../icons/icons";

type NavItem = {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
};

const navItems: NavItem[] = [
    { label: "Dashboard", icon: <IconDashboard /> },
    { label: "Monitors", icon: <IconMonitors />, active: true },
    { label: "Incidents", icon: <IconIncidents /> },
    { label: "Reports", icon: <IconReports /> },
    { label: "Settings", icon: <IconSettings /> },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
    const pathname = usePathname();
    
    return (
        <aside
            className={`
      flex-shrink-0 border-r border-slate-800 bg-[#101722] flex flex-col justify-between py-6
      transition-all duration-300
      ${collapsed ? "w-16" : "w-64"}
    `}
        >
            <div className={collapsed ? "px-3" : "px-6"}>
                {/* Brand */}
                <div className={`flex items-center gap-3 mb-10 ${collapsed ? "justify-center" : ""}`}>
                    <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0 text-blue-400">
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
                        <a
                            key={item.label}
                            href="#"
                            title={collapsed ? item.label : undefined}
                            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
              ${collapsed ? "justify-center" : ""}
              ${item.active
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }
            `}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                        </a>
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

// export const Sidebar = ({ collapsed }: { collapsed: boolean }) => (

//     <aside
//         className={`
//       flex-shrink-0 border-r border-slate-800 bg-[#101722] flex flex-col justify-between py-6
//       transition-all duration-300
//       ${collapsed ? "w-16" : "w-64"}
//     `}
//     >
//         <div className={collapsed ? "px-3" : "px-6"}>
//             {/* Brand */}
//             <div className={`flex items-center gap-3 mb-10 ${collapsed ? "justify-center" : ""}`}>
//                 <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0 text-blue-400">
//                     <IconPulse />
//                 </div>
//                 {!collapsed && (
//                     <div className="flex flex-col leading-none">
//                         <span className="text-white text-base font-bold">UptimePulse</span>
//                         <span className="text-slate-500 text-xs font-medium mt-0.5">Monitoring Pro</span>
//                     </div>
//                 )}
//             </div>

//             {/* Nav */}
//             <nav className="flex flex-col gap-1">
//                 {navItems.map((item) => (
//                     <a
//                         key={item.label}
//                         href="#"
//                         title={collapsed ? item.label : undefined}
//                         className={`
//               flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
//               ${collapsed ? "justify-center" : ""}
//               ${item.active
//                                 ? "bg-blue-500/10 text-blue-400"
//                                 : "text-slate-400 hover:bg-slate-800 hover:text-white"
//                             }
//             `}
//                     >
//                         <span className="flex-shrink-0">{item.icon}</span>
//                         {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
//                     </a>
//                 ))}
//             </nav>
//         </div>

//         {/* Profile */}
//         {!collapsed && (
//             <div className="px-6 pt-6 border-t border-slate-800">
//                 <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
//                         AR
//                     </div>
//                     <div className="flex-1 min-w-0">
//                         <p className="text-sm font-semibold text-white truncate">Alex Rivera</p>
//                         <p className="text-xs text-slate-500 truncate">Admin</p>
//                     </div>
//                 </div>
//             </div>
//         )}
//         {collapsed && (
//             <div className="px-3 pt-6 border-t border-slate-800 flex justify-center">
//                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
//                     AR
//                 </div>
//             </div>
//         )}
//     </aside>
// );