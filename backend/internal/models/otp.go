package models

import "time"

type OTP struct {
	ID         int    `gorm:"primaryKey"`
	Identifier string `gorm:"index"`
	OTPHash    string
	ExpiresAt  time.Time
	Attempts   int
	Used       bool
	CreatedAt  time.Time
}
