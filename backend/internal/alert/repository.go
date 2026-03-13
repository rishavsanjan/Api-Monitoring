package alert

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) CreateAlert(alert *models.Alert) error {
	return database.DB.Create(alert).Error
}

func (r *Repository) GetLastResult(monitorId string) (*models.MonitorResult, error) {
	var result models.MonitorResult

	err := database.DB.
		Find("monitor_id = ?", monitorId).
		Order("checked_at desc"). 
		First(&result).Error

	return  &result, err
}
