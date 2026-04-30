package auth

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"api-monitoring-saas/internal/notification"
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) CreateUser(user *models.User) error {
	var foundUser models.User

	err := database.DB.Where("email = ?", user.Email).First(&foundUser).Error
	if err == nil {
		return fmt.Errorf("User already exits")
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return database.DB.Create(user).Error
}

func (r *Repository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User

	err := database.DB.Where("email = ?", email).First(&user).Error

	return &user, err
}

func (r *Repository) VerifyUserToken(userId string) (*models.User, error) {
	var user models.User

	err := database.DB.Select("name", "email", "is_verified").Where("id = ?", userId).First(&user).Error

	if err != nil {
		return &user, err
	}

	return &user, nil
}

func (r *Repository) VerifyEmail(userId string) error {
	var user *models.User

	err := database.DB.Where("id = ?", userId).First(&user).Error

	if err != nil {
		return err
	}

	var otp string

	otp, err = GenerateOTP()

	if err != nil {
		return fmt.Errorf("Unable to generate otp")
	}

	body := fmt.Sprintf("Your OTP for email verification is %s", otp)
	notification.SendEmail(user.Email, "Email Verification", body)

	var hashedOTP string

	hashedOTP, err = HashOTP(otp)

	if err != nil {
		return fmt.Errorf("Unable to hash the OTP")
	}

	record := models.OTP{
		Identifier: user.Email,
		OTPHash:    hashedOTP,
		ExpiresAt:  time.Now().Add(5 * time.Minute),
		Attempts:   0,
		Used:       false,
	}

	err = database.DB.Create(&record).Error

	if err != nil {
		return fmt.Errorf("Unable to add OTP in database")
	}

	return nil

}
func (r *Repository) VerifyOtp(userId string, code string) error {
	var user models.User

	err := database.DB.Where("id = ?", userId).First(&user).Error
	if err != nil {
		return err
	}

	var otp models.OTP

	err = database.DB.
		Where("identifier = ? AND used = ? AND expires_at > ?", user.Email, false, time.Now()).
		Order("created_at DESC").
		First(&otp).Error
	log.Print("printing error")	
	log.Print(err)
	if err != nil {
		return fmt.Errorf("OTP not found or expired")
	}

	if otp.Attempts >= 5 {
		return fmt.Errorf("Too many attempts")
	}

	err = bcrypt.CompareHashAndPassword([]byte(otp.OTPHash), []byte(code))

	if err != nil {
		database.DB.Model(&otp).Update("attempts", otp.Attempts+1)
		return fmt.Errorf("Wrong OTP!")
	}

	database.DB.Model(&otp).Updates(map[string]interface{}{
		"verified": true,
	})

	err = database.DB.
		Model(&models.User{}).
		Where("email = ?", user.Email).
		Update("is_verified", true).Error

	if err != nil {
		return err
	}
	return nil
}

func GenerateOTP() (string, error) {
	b := make([]byte, 3)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	otp := int(b[0])<<16 | int(b[1])<<8 | int(b[2])
	return fmt.Sprintf("%06d", otp%1000000), nil
}

func HashOTP(otp string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(otp), bcrypt.DefaultCost)
	return string(bytes), err
}
