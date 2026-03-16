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
	return database.DB.Create(monitor).Error
}

func (r *Repository) GetUserMonitor(userId string) ([]models.MonitorWithStatus, error) {

	var monitors []models.Monitor

	err := database.DB.Where("user_id = ?", userId).Find(&monitors).Error

	var result []models.MonitorWithStatus

	for _, monitor := range monitors {
		var log models.MonitorResult
		database.DB.
			Where("monitor_id = ?").
			Order("checked_at desc").
			First(&log)

		result = append(result, models.MonitorWithStatus{
			MonitorId:      monitor.ID,
			Name:           monitor.Name,
			URL:            monitor.URL,
			Method:         monitor.Method,
			ResponseTimeMs: log.ResponseTimeMs,
			LastChecked:    log.CheckedAt,
			ExpectedStatus: monitor.ExpectedStatus,
			CurrentStatus: log.StatusCode,
			
		})

	}

	return result, err
}

func (r *Repository) DeleteMonitor(id string) error {
	return database.DB.Delete(&models.Monitor{}, "id = ?", id).Error
}
