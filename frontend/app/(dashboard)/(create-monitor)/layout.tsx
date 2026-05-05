import { IconBell, IconChevronRight, IconHelp } from '@/app/components/icons/icons'
// import MonitorDropdown from '@/app/components/layout/AccordianDropdown';
import React from 'react'

interface Props {
    children: React.ReactNode;
}

const CreateMonitorLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#101722] text-white w-full">

            {/* Main */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#101722]/80 backdrop-blur-sm sticky top-0 z-10">
                    <nav className="flex items-center gap-1.5 text-sm">
                        <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors font-medium">
                            Monitors
                        </a>
                        <span className="text-slate-700"><IconChevronRight /></span>
                        <span className="text-slate-300 font-medium">Create New Monitor</span>
                    </nav>
                    <div className="flex items-center gap-2">
                        {[<IconBell key="b" />, <IconHelp key="h" />].map((icon, i) => (
                            <button key={i} className="w-9 h-9 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors">
                                {icon}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Form Area */}
                <div className="flex-1 p-8 overflow-y-auto w-full">
                    <div className="mx-auto w-full">

                        {/* Page heading */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Create New Monitor</h2>
                            <p className="text-slate-400">
                                Configure your endpoint monitoring parameters. We will alert you immediately if it goes down.
                            </p>
                        </div>
                        <div className='mb-2'>
                            <p>Monitor Type</p>
                            {/* <MonitorDropdown/> */}
                        </div>
                        {children}

                    </div>

                </div>

            </main>
        </div>
    )
}

export default CreateMonitorLayout