package auth

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}


func (r *Repository) GetUserByEmail(email string) (*models.User, error){
	var user models.User

	err := database.DB.Where("email = ?", email).First(&user).Error

	return  &user, err
}
