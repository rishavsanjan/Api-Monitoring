package models

import "time"

type Alert struct {
	ID        uint      `gorm:"primaryKey"`
	MonitorID string    `gorm:"index"`
	Type      string
	Message   string
	SentAt    time.Time
}