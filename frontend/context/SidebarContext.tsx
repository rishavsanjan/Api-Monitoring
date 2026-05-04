// context/SidebarContext.tsx
"use client";

import { createContext, SetStateAction, useContext, useState } from "react";

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<SetStateAction<boolean>>;
  activeBar: string
  setActiveBar : React.Dispatch<SetStateAction<string>>;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeBar, setActiveBar] = useState('Monitors');
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed , activeBar, setActiveBar}}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider");
  return context;
};