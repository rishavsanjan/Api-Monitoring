package analytics

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) GetMonitorResults(monitorId string) ([]models.MonitorResult, error) {

	var results []models.MonitorResult

	err := database.DB.
	Where("monitor_id = ? ", monitorId).
	Order("checked_at desc").
	Limit(100).
	Find(&results).Error

	return  results, err
}

func (r *Repository) GetMonitorResultsCount(monitorId string) (int64,int64, error) {

	var total int64
	var up int64

	database.DB.Model(&models.MonitorResult{}).
	Where("monitor_id = ?", monitorId).
	Count(&total)

	database.DB.Model(&models.MonitorResult{}).
	Where("monitor_id = ? AND status = ?", monitorId, "UP").
	Count(&up)
	
	return  total, up, nil

}

func (r *Repository) GetAllResults() ([]models.MonitorResult, error) {

	var results []models.MonitorResult

	err := database.DB.
		Order("checked_at desc").
		Limit(1000).
		Find(&results).Error

	return results, err
}

