package alert

import (
	"api-monitoring-saas/internal/models"
	"api-monitoring-saas/internal/notification"
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

func (s *Service) HandleStatusChange(monitorId string, currentStatus string) {

	last, err := s.repo.GetLastResult(monitorId)
	log.Println(last, err)
	if err != nil {

		if currentStatus == "DOWN" {

			alert := models.Alert{
				MonitorID: monitorId,
				Type:      "API_DOWN",
				Message:   "API is down",
				SentAt:    time.Now(),
			}

			s.repo.CreateAlert(&alert)

			email, err := s.repo.GetUserEmailByMonitorId(monitorId)

			if err != nil {
				return
			}

			notification.SendEmail(
				email,
				"API Monitoring Alert",
				"Your API is currently DOWN.",
			)

			log.Println("ALERT: API DOWN (first check)", monitorId)
		}

		return
	}

	previousStatus := last.Status

	if currentStatus == "DOWN" && previousStatus == "UP" {
		alert := models.Alert{
			MonitorID: monitorId,
			Type:      "API_DOWN",
			Message:   "API is down",
			SentAt:    time.Now(),
		}
		s.repo.CreateAlert(&alert)

		log.Println("ALERT: API DOWN ", monitorId)

		return
	}

	if currentStatus == "UP" && previousStatus == "DOWN" {
		alert := models.Alert{
			MonitorID: monitorId,
			Type:      "API_RECOVERY",
			Message:   "API recovery",
			SentAt:    time.Now(),
		}
		email, err := s.repo.GetUserEmailByMonitorId(monitorId)

		log.Println(email, err)

		if err != nil {
			return
		}

		notification.SendEmail(
			email,
			"API Monitoring Alert",
			"Your API which was down is now fully recovered",
		)
		s.repo.CreateAlert(&alert)
		log.Println("API IS RECOVERED ", monitorId)

		return
	}

}
