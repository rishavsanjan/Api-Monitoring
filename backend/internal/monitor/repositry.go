package monitor

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) CreateMonitor(monitor *models.Monitor) error {
	return  database.DB.Create(monitor).Error
}

func (r *Repository) GetUserMonitor(userId string) ([]models.Monitor, error){

	var monitors []models.Monitor

	err := database.DB.Where("user_id = ?", userId).Find(&monitors).Error
	return  monitors, err
}

func (r *Repository) DeleteMonitor(id string) error {
	return database.DB.Delete(&models.Monitor{}, "id = ?", id).Error
}