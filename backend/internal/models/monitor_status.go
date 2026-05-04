package models

type MonitorWithStatus struct {
	MonitorId      string `json:"monitorId"`
	Name           string `json:"name"`
	URL            string `json:"url"`
	Method         string `json:"method"`
	Status         string `json:"status"`
	ResponseTimeMs int    `json:"responseTimeMs"`
	LastChecked    string `json:"lastCheckedAt"`
	CurrentStatus  int    `json:"currentStatus"`
	ExpectedStatus int    `json:"expectedStatus"`
	LogId          string `json:"logId"`
}
