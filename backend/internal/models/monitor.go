package models

import (
	"time"

	"gorm.io/datatypes"
)

type Monitor struct {
	ID             string    `gorm:"type:uuid;primaryKey"`
	UserId         string    `gorm:"type:uuid;index;not null"`
	Name           string    `gorm:"not null"`
	URL            string    `gorm:"not null"`
	Method         string    `gorm:"default:GET"`
	ExpectedStatus int       `gorm:"default:200"`
	Interval       int       `gorm:"default:60"`
	NextRun        time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP;index"`
	CreatedAt      time.Time
	Config         datatypes.JSON `gorm:"type:jsonb"`
	Type           string         `gorm:"default:http"`
}
