package monitor

import (
	"api-monitoring-saas/internal/models"
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

func (s *Service) CreateMonitor(userId string, name string, url string) error {

	monitor := models.Monitor{
		ID: uuid.New().String(),
		UserId: userId,
		Name: name,
		URL: url,
		Method: "GET",
		ExpectedStatus: 200,
		Interval: 60,
		CreatedAt: time.Now(),
	}

	return  s.repo.CreateMonitor(&monitor)
}

func (s *Service) GetMonitors(userId string) ([]models.Monitor, error){
	return  s.repo.GetUserMonitor(userId)
}

func (s *Service) DeleteMonitor(id string)  error{
	return  s.repo.DeleteMonitor(id)
}
