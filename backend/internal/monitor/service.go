package monitor

import (
	"api-monitoring-saas/internal/models"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) UpdateMonitor(id string, input UpdateMonitorInput) error {
	return s.repo.UpdateMonitor(id, input)
}

func (s *Service) CreateMonitor(userId string, name string, url string, monitorType string, config map[string]interface{}) error {
	jsonConfig, err := json.Marshal(config)
	if err != nil {
		return err
	}
	monitor := models.Monitor{
		ID:             uuid.New().String(),
		UserId:         userId,
		Name:           name,
		URL:            url,
		Method:         "GET",
		ExpectedStatus: 200,
		Interval:       60,
		CreatedAt:      time.Now(),
		Type:           monitorType,
		Config:         jsonConfig,
	}

	return s.repo.CreateMonitor(&monitor)
}

func (s *Service) GetMonitors(userId string, page int, search string) ([]models.MonitorWithStatus, int64, error) {
	return s.repo.GetUserMonitor(userId, page, search)
}

func (s *Service) DeleteMonitor(id string) error {
	return s.repo.DeleteMonitor(id)
}

func (s *Service) GetDashboardStats(userId string) (models.DashboardStats, error) {
	return s.repo.GetDashboardStats(userId)
}

func (s *Service) GetMonitorHistory(userId string, page int, monitorId string) ([]models.MonitorResult, error) {
	return s.repo.GetMonitorHistory(userId, page, monitorId)
}
