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

func (r *Repository) GetUserMonitor(
	userId string,
	page int,
	search string,
) ([]models.MonitorWithStatus, int64, error) {
	limit := 5
	offset := (page - 1) * limit

	var total int64

	countQuery := database.DB.Model(&models.Monitor{}).
		Where("user_id = ?", userId)

	if search != "" {
		countQuery = countQuery.Where("name ILIKE ?", "%"+search+"%")
	}

	countQuery.Count(&total)

	var results []models.MonitorWithStatus

	query := `
		SELECT DISTINCT ON (m.id)
			m.id AS monitor_id,
			m.name,
			m.url,
			m.method,
			m.expected_status,
			r.status_code AS current_status,
			r.response_time_ms,
			r.checked_at AS last_checked
		FROM monitors m
		LEFT JOIN monitor_results r 
			ON m.id = r.monitor_id
		WHERE m.user_id = ?
	`

	args := []interface{}{userId}

	// 🔍 Search support
	if search != "" {
		query += " AND m.name ILIKE ?"
		args = append(args, "%"+search+"%")
	}

	query += `
		ORDER BY m.id, r.checked_at DESC
		LIMIT ? OFFSET ?
	`

	args = append(args, limit, offset)

	err := database.DB.Raw(query, args...).Scan(&results).Error

	return results, total, err
}

func (r *Repository) DeleteMonitor(id string) error {
	return database.DB.Delete(&models.Monitor{}, "id = ?", id).Error
}

func (r *Repository) UpdateMonitor(id string, input UpdateMonitorInput) error {
	updates := make(map[string]interface{})

	if input.Name != nil {
		updates["name"] = *input.Name
	}
	if input.URL != nil {
		updates["url"] = *input.URL
	}
	if input.Interval != nil {
		updates["interval"] = *input.Interval
	}

	if len(updates) == 0 {
		return nil
	}

	return database.DB.
		Model(&models.Monitor{}).
		Where("id = ?", id).
		Updates(updates).Error

}

func (r *Repository) GetDashboardStats(userId string) (models.DashboardStats, error) {
	var stats models.DashboardStats

	// 1. Total monitors
	var total int64
	err := database.DB.
		Model(&models.Monitor{}).
		Where("user_id = ?", userId).
		Count(&total).Error
	if err != nil {
		return stats, err
	}

	stats.ActiveMonitors = total

	// 2. Get latest result per monitor (JOIN + DISTINCT ON)
	rows, err := database.DB.Raw(`
	SELECT DISTINCT ON (m.id)
		m.id,
		m.expected_status,
		r.status_code,
		r.response_time_ms
	FROM monitors m
	LEFT JOIN monitor_results r ON m.id = r.monitor_id
	WHERE m.user_id = ?::uuid
	ORDER BY m.id, r.checked_at DESC
`, userId).Rows()

	if err != nil {
		return stats, err
	}
	defer rows.Close()

	var up, down int64
	var totalResponse int64
	var countResponse int64

	for rows.Next() {
		var monitorId string
		var expected int
		var statusCode *int
		var responseTime *int64

		err := rows.Scan(&monitorId, &expected, &statusCode, &responseTime)
		if err != nil {
			continue
		}

		// If no result exists → treat as DOWN
		if statusCode == nil {
			down++
			continue
		}

		if *statusCode == expected {
			up++
		} else {
			down++
		}

		if responseTime != nil {
			totalResponse += *responseTime
			countResponse++
		}
	}

	stats.UpTime = up
	stats.DownApi = down

	if countResponse > 0 {
		stats.AverageLatency = totalResponse / countResponse
	}

	return stats, nil
}

