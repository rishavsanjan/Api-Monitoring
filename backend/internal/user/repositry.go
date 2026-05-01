package user

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
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

	return  nil
}
