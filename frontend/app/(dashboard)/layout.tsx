"use client"
import React from 'react'
import Sidebar from '../components/layout/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen">
                <Sidebar  />

                <div className="flex-1 flex flex-col">
                    <main className="flex-1  bg-gray-50 overflow-y-auto">

                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>

    )
}

