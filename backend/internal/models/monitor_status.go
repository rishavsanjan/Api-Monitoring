package models

import "time"

type MonitorWithStatus struct {
	MonitorId      string    `json:"monitorId"`
	Name           string    `json:"name"`
	URL            string    `json:"url"`
	Method         string    `json:"method"`
	Status         string    `json:"status"`
	ResponseTimeMs int       `json:"responseTimeMs"`
	LastChecked    time.Time `json:"lastCheckedAt"`
	CurrentStatus  int       `json:"currentStatus"`
	ExpectedStatus int       `json:"expectedStatus"`
}
