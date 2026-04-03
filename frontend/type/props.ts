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

export interface MonitorWithStatus {
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

export interface MonitorHistory {
    CheckedAt: string,
    ID: number,
    MonitorID: string,
    ResponseTimeMs: number,
    Status: "UP" | "DOWN",
    StatusCode: number

}

export interface Monitor {
    ID: string
    UserId: string
    Name: string
    URL: string
    Method: "GET"
    ExpectedStatus: 200
    Interval: number
    CreatedAt: string
}

export interface MonitorPageResponse {
    history: MonitorHistory[],
    monitor: Monitor,
    chartData: {
        time: string,
        value: number
    }[],
    stats: {
        totalLogs: number
        uptime: number
        avgLatency: number
    }
}

export interface KeywordMonitorForm {
    name: string;
    url: string;
    method: string;
    statusCode: number;
    interval: number;
    keyword: string;
    authorizationToken: string,
    requestBody: string
    type : string
}

export interface PingMonitorForm {
    name: string;
    url: string;
    interval: number;
    type : string
}

