import React, { JSX, useState } from 'react'

interface NotificationSettings {
    emailAlerts: boolean;
    slackIntegration: boolean;
    weeklyReports: boolean;
}
const notificationItems: {
    key: keyof NotificationSettings;
    label: string;
    desc: string;
    color: string;
    icon: JSX.Element;
}[] = [
        {
            key: "emailAlerts",
            label: "Email Alerts",
            desc: "Receive critical uptime alerts directly in your inbox.",
            color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
            ),
        },
        {
            key: "slackIntegration",
            label: "Slack Integration",
            desc: "Post notifications to a dedicated #uptime-alerts channel.",
            color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
        },
        {
            key: "weeklyReports",
            label: "Weekly Reports",
            desc: "Get a summary of your monitor performance every Monday.",
            color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            ),
        },
    ];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${checked ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white border border-slate-200 shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"
                    }`}
            />
        </button>
    );
}

const NotificationsTab = () => {

    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailAlerts: true,
        slackIntegration: false,
        weeklyReports: true,
    });
    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-bold">Notifications</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage how and when you receive alerts from UptimePulse.
                </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
                {notificationItems.map(({ key, label, desc, color, icon }) => (
                    <div key={key} className="p-6 flex items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                                {icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">{label}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                            </div>
                        </div>
                        <Toggle
                            checked={notifications[key]}
                            onChange={(v) => setNotifications({ ...notifications, [key]: v })}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default NotificationsTab