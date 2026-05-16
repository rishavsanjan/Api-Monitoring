package analytics

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"time"
)

type Repository struct{}

func NewRepository() *Repository {
	return &Repository{}
}

func (r *Repository) GetMonitorResults(monitorId string) ([]models.MonitorResult, models.Monitor, models.MonitorLog, float64, float64, int64, error) {

	var results []models.MonitorResult
	var monitor models.Monitor
	var monitorLogs models.MonitorLog

	err := database.DB.
		Where("monitor_id = ?", monitorId).
		Limit(5).
		Order("checked_at desc").
		Find(&results).Error

	database.DB.
		Where("id = ?", monitorId).
		Find(&monitor)

	

	if err != nil {
		return nil, monitor,monitorLogs, 0, 0, 0, err
	}

	database.DB.
		Where("monitor_id = ?", monitorId).
		First(&monitorLogs).
		Order("created_at desc")

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

	return results, monitor,monitorLogs, uptime, avgLatency, totalLogs, nil
}

type Result struct {
	Minute      time.Time
	AvgResponse float64
}

type ChartPoint struct {
	Time  string  `json:"time"`
	Value float64 `json:"value"`
}

func (r *Repository) GetChart(monitorId string) []ChartPoint {
	var results []Result

	database.DB.Raw(`
	  SELECT *
	  FROM (
	    SELECT 
	      DATE_TRUNC('minute', checked_at) AS minute,
	      AVG(response_time_ms) AS avg_response
	    FROM monitor_results
	    WHERE monitor_id = ?
	    GROUP BY minute
	    ORDER BY minute DESC
	    LIMIT 60
	  ) sub
	  ORDER BY minute ASC
	`, monitorId).Scan(&results)

	var formatted []ChartPoint

	for _, r := range results {
		formatted = append(formatted, ChartPoint{
			Time:  r.Minute.Format("15:04"),
			Value: r.AvgResponse,
		})
	}

	return formatted
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


