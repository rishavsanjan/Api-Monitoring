package models

import "time"

type Secret struct {
	ID             string    `gorm:"primaryKey"`
	UserID         string    `gorm:"index;not null"`
	MonitorID      string    `gorm:"not null;uniqueIndex:idx_monitor_key"`
	Key            string `gorm:"size:100;not null;uniqueIndex:idx_monitor_key"`
	EncryptedValue string `gorm:"type:text;not null"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
