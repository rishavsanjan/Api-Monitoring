package alert

import (
	"api-monitoring-saas/internal/models"
	"log"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) HandleFailure(monitorId string) {
	last, err := s.repo.GetLastResult(monitorId)

	if err != nil {
		return
	}

	if last.Status == "UP" {
		alert := models.Alert{
			MonitorID: monitorId,
			Type:      "API_DOWN",
			Message:   "Api is down",
			SentAt:    time.Now(),
		}

		s.repo.CreateAlert(&alert)

		log.Println("ALERT: API DOWN ->", monitorId)
	}
}
