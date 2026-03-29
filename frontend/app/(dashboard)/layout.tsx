"use client"
import React, { useState } from 'react'
import Sidebar from '../components/layout/Sidebar';
import { ClipLoader } from 'react-spinners';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="flex h-screen">
            <Sidebar  collapsed={collapsed}/>

            <div className="flex-1 flex flex-col">
                <main className="flex-1  bg-gray-50 overflow-y-auto">
                   
                    {children}
                </main>
            </div>
        </div>
    )
}

