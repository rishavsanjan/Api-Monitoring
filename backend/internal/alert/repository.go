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

	err := database.DB.Where("monitor_id = ?", monitorId).Order("checked_at desc").First(&result).Error

	return &result, err
}

func (r *Repository) GetUserEmailByMonitorId(monitorId string) (string, error) {
	var user models.User

	var monitor models.Monitor

	err := database.DB.
		Where("id = ?", monitorId).
		Select("user_id").
		First(&monitor).
		Error
	
	if err != nil {
		return "no monitor found", err
	}

	userId := monitor.UserId

	err = database.DB.Where("id = ?", userId).First(&user).Error

	if err != nil {
		return "no user found", err
	}

	email := user.Email

	return email, err

}
