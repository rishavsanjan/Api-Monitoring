package models

import "time"

type User struct {
	ID         string `gorm:"type:uuid;primaryKey"`
	Name       string `gorm:"not null"`
	Email      string `gorm:"uniqueIndex;not null"`
	Password   string `gorm:"not null"`
	CreatedAt  time.Time
	IsVerified bool `gorm:"default:false"`
}
