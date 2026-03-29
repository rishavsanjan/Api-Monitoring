// context/SidebarContext.tsx
"use client";

import { createContext, SetStateAction, useContext, useState } from "react";

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside SidebarProvider");
  return context;
};