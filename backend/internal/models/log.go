package models

import (
	"time"
)

type MonitorLog struct {
	ID        uint      `gorm:"primaryKey"`

	ResultID  uint      `gorm:"index"`
	MonitorID string    `gorm:"type:uuid;index"`

	Messages  []LogMessage `gorm:"serializer:json"`

	CreatedAt time.Time
}

type LogMessage struct {
	Time    string `json:"time"`
	Message string `json:"message"`
	Type    string `json:"type"`
}