export interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export interface SignupForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    agree: boolean;
}

export interface Monitor {
    monitorId: string,
    method: "GET" | "POST",
    status: string,
    name: string,
    url: string,
    responseTimeMs: number
    lastCheckedAt: string
    currentStatus: number,
    expectedStatus: number

}

export interface Stats {
    activeMonitors: number
    uptime: number
    averageLatency: number
    incidents: number
}

