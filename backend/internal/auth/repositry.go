package auth

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"errors"
	"fmt"

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

	err := database.DB.Select("name", "email").Where("id = ?", userId).First(&user).Error

	if err != nil {
		return &user, err
	}

	return &user, nil
}
