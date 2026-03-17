package models

type DashboardStats struct {
	ActiveMonitors int64     `json:"activeMonitors"`
	UpTime         int64 `json:"uptime"`
	AverageLatency int64     `json:"averageLatency"`
	DownApi        int64     `json:"incidents"`
}
