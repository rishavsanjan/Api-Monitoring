package monitor

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repositry struct{}

func NewRepositry() *Repositry {
	return &Repositry{}
}

func (r *Repositry) CreateMonitor(monitor *models.Monitor) error {
	return  database.DB.Create(monitor).Error
}

func (r *Repositry) GetUserMonitor(userId string) ([]models.Monitor, error){

	var monitors []models.Monitor

	err := database.DB.Where("user_id = ?", userId).Find(&monitors).Error
	return  monitors, err
}

func (r *Repositry) DeleteMonitor(id string) error {
	return database.DB.Delete(&models.Monitor{}, "id = ?", id).Error
}