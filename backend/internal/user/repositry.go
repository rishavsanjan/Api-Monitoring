package user

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"

	"golang.org/x/crypto/bcrypt"
)

type Repository struct {
}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) UpdateProfile(userId string, name string) error {
	err := database.DB.Model(&models.User{}).Where("id = ? ", userId).Update("name", name).Error
	if err != nil {
		return err
	}

	return nil
}

func (r *Repository) PasswordChecker(userId string, password string) error {

	var user models.User
	err := database.DB.Where("id = ? ", userId).First(&user).Error

	if err != nil {
		return err
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))

	if err != nil {
		return  err
	}

	return nil
}
