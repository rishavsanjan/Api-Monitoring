package models

import "time"

type MonitorResult struct {
	ID             uint   `gorm:"primaryKey"`
	MonitorID      string `gorm:"type:uuid;index"`
	Status         string
	StatusCode     int
	ResponseTimeMs int
	PacketLoss     int `gorm:"default:null"`
	ErrorMessage   string
	CheckedAt      time.Time
}
