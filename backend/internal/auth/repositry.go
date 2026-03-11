package auth

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repositry struct{}

func NewRepositry() *Repositry {
	return &Repositry{}
}

func (r *Repositry) CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}


func (r *Repositry) GetUserByEmail(email string) (*models.User, error){
	var user models.User

	err := database.DB.Where("email = ?", email).First(&user).Error

	return  &user, err
}
