package models

import "time"

type MonitorResult struct {
	ID             uint   `gorm:"primaryKey"`
	MonitorID      string `gorm:"index"`
	Status         string
	StatusCode     int
	ResponseTimeMs int
	CheckedAt      time.Time
}
