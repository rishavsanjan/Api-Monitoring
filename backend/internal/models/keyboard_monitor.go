package models

type KeyboardMonitors struct {
	Name string `json:"name"`
	URL string `json:"url"`
	Status string `json:"status"`
	LastChecked string `json:"lastCheckedAt"`
	CurrentStatus int `json:"currentStatus"`
	ExpectedStatus int `json:"expectedStatus"`
}
