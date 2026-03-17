package models

import "time"

type Monitor struct {
	ID             string `gorm:"type:uuid;primaryKey"`
	UserId         string `gorm:"type:uuid;index;not null"`
	Name           string `gorm:"not null"`
	URL            string `gorm:"not null"`
	Method         string `gorm:"default:GET"`
	ExpectedStatus int    `gorm:"default:200"`
	Interval       int    `gorm:"default:60"`
	CreatedAt      time.Time
}
