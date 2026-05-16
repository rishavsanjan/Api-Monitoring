package analytics

import (
	"api-monitoring-saas/internal/models"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) GetResults(monitorID string) ([]models.MonitorResult, models.Monitor,models.MonitorLog, float64, float64, int64, error) {
	return s.repo.GetMonitorResults(monitorID)
}


func (s *Service) GetChart(monitorId string) []ChartPoint {
	return  s.repo.GetChart(monitorId)
}

func (s *Service) UpTime(monitorID string) (float64, error) {
	total, up, err := s.repo.GetMonitorResultsCount(monitorID)

	if err != nil || total == 0 {
		return 0, err
	}

	uptime := (float64(up) / float64(total)) * 100

	return uptime, nil
}


