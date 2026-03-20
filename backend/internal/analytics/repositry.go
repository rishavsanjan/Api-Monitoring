package analytics

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) GetMonitorResults(monitorId string) ([]models.MonitorResult, float64, float64, int64, error) {

	var results []models.MonitorResult

	err := database.DB.
		Where("monitor_id = ?", monitorId).
		Order("checked_at desc").
		Limit(5).
		Find(&results).Error

	if err != nil {
		return nil, 0, 0, 0, err
	}

	var totalLogs int64
	database.DB.
		Model(&models.MonitorResult{}).
		Where("monitor_id = ?", monitorId).
		Count(&totalLogs)

	var upTimeLogs int64
	database.DB.
		Model(&models.MonitorResult{}).
		Where("monitor_id = ?", monitorId).
		Where("status = ?", "UP").
		Count(&upTimeLogs)

	var totalResponseTime int64
	database.DB.
		Model(&models.MonitorResult{}).
		Where("monitor_id = ?", monitorId).
		Where("status = ?", "UP").
		Select("SUM(response_time_ms)").
		Scan(&totalResponseTime)

	var uptime float64
	if totalLogs > 0 {
		uptime = (float64(upTimeLogs) / float64(totalLogs)) * 100
	}

	var avgLatency float64
	if upTimeLogs > 0 {
		avgLatency = float64(totalResponseTime) / float64(upTimeLogs)
	}

	return results, uptime, avgLatency, totalLogs, nil
}

func (r *Repository) GetMonitorResultsCount(monitorId string) (int64, int64, error) {

	var total int64
	var up int64

	database.DB.Model(&models.MonitorResult{}).
		Where("monitor_id = ?", monitorId).
		Count(&total)

	database.DB.Model(&models.MonitorResult{}).
		Where("monitor_id = ? AND status = ?", monitorId, "UP").
		Count(&up)

	return total, up, nil

}

func (r *Repository) GetAllResults() ([]models.MonitorResult, error) {

	var results []models.MonitorResult

	err := database.DB.
		Order("checked_at desc").
		Limit(1000).
		Find(&results).Error

	return results, err
}
