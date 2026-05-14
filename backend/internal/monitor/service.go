package monitor

import (
	"api-monitoring-saas/internal/models"
	"api-monitoring-saas/internal/security"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo              *Repository
	secretRepo        *SecretRepository
	encryptionService *security.EncryptionService
}

func NewService(
	repo *Repository,
	secretRepo *SecretRepository,
	encryptionKey string,
) *Service {

	return &Service{
		repo:       repo,
		secretRepo: secretRepo,
		encryptionService: security.NewEncryptionService(
			encryptionKey,
		),
	}
}


func (s *Service) RunMonitorNow(id string) error {
	return s.repo.RunMonitorNow(id)
}

func (s *Service) UpdateMonitor(id string, input UpdateMonitorInput) error {
	return s.repo.UpdateMonitor(id, input)
}

// func (s *Service) CreateMonitor(userId string, name string, url string, monitorType string, config map[string]interface{}, method string) error {
// 	jsonConfig, err := json.Marshal(config)
// 	if err != nil {
// 		return err
// 	}
// 	monitor := models.Monitor{
// 		ID:             uuid.New().String(),
// 		UserId:         userId,
// 		Name:           name,
// 		URL:            url,
// 		Method:         method,
// 		ExpectedStatus: 200,
// 		Interval:       60,
// 		CreatedAt:      time.Now(),
// 		Type:           monitorType,
// 		Config:         jsonConfig,
// 	}

// 	return s.repo.CreateMonitor(&monitor)
// }

func (s *Service) CreateMonitor(
	userId string,
	name string,
	url string,
	monitorType string,
	config map[string]interface{},
	method string,
) error {

	monitorID := uuid.New().String()

	// Extract + encrypt sensitive values
	sanitizedConfig, secrets, err := ExtractSecrets(monitorType ,config)
	if err != nil {
		return err
	}

	// Store encrypted secrets
	for key, value := range secrets {

		encryptedValue, err := s.encryptionService.Encrypt(value)
		if err != nil {
			return err
		}

		secret := models.Secret{
			ID: uuid.New().String(),
			UserID:         userId,
			MonitorID:      monitorID,
			Key:            key,
			EncryptedValue: encryptedValue,
		}

		if err := s.secretRepo.CreateSecret(&secret); err != nil {
			return err
		}
	}

	jsonConfig, err := json.Marshal(sanitizedConfig)
	if err != nil {
		return err
	}

	monitor := models.Monitor{
		ID:             monitorID,
		UserId:         userId,
		Name:           name,
		URL:            url,
		Method:         method,
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


func ExtractSecrets(
	monitorType string,
	config map[string]interface{},
) (map[string]interface{}, map[string]string, error) {

	switch monitorType {

	case "synthetic":
		return extractSyntheticSecrets(config)

	case "keyword":
		return extractKeywordSecrets(config)

	default:
		return config,
			make(map[string]string),
			nil
	}
}



func extractSyntheticSecrets(
	config map[string]interface{},
) (map[string]interface{}, map[string]string, error) {

	secrets := make(map[string]string)

	stepsRaw, ok := config["steps"]
	if !ok {
		return config, secrets, nil
	}

	steps, ok := stepsRaw.([]interface{})
	if !ok {
		return nil, nil,
			errors.New("invalid steps format")
	}

	for stepIndex, stepRaw := range steps {

		step, ok := stepRaw.(map[string]interface{})
		if !ok {
			continue
		}

		requestRaw, ok := step["request"]
		if !ok {
			continue
		}

		request, ok := requestRaw.(map[string]interface{})
		if !ok {
			continue
		}

		extractRequestSecrets(
			request,
			stepIndex,
			secrets,
		)
	}

	return config, secrets, nil
}

func extractKeywordSecrets(
	config map[string]interface{},
) (map[string]interface{}, map[string]string, error) {

	secrets := make(map[string]string)

	requestRaw, ok := config["request"]
	if !ok {
		return config, secrets, nil
	}

	request, ok := requestRaw.(map[string]interface{})
	if !ok {
		return nil, nil,
			errors.New("invalid request format")
	}

	err := extractRequestSecrets(
		request,
		0,
		secrets,
	)

	if err != nil {
		return nil, nil, err
	}

	return config, secrets, nil
}


func extractRequestSecrets(
	request map[string]interface{},
	prefix int,
	secrets map[string]string,
) error {

	// Encrypt body
	if body, exists := request["body"]; exists &&
		body != nil {

		bodyBytes, err := json.Marshal(body)
		if err != nil {
			return err
		}

		secretKey := fmt.Sprintf(
			"step_%d_body",
			prefix,
		)

		secrets[secretKey] = string(bodyBytes)

		request["body"] =
			"{{" + secretKey + "}}"
	}

	// Encrypt Authorization header
	if headersRaw, exists := request["headers"];
		exists {

		headers, ok :=
			headersRaw.(map[string]interface{})

		if ok {

			if auth, exists :=
				headers["Authorization"]; exists {

				authString, ok := auth.(string)

				if ok && authString != "" {

					secretKey := fmt.Sprintf(
						"step_%d_authorization",
						prefix,
					)

					secrets[secretKey] =
						authString

					headers["Authorization"] =
						"{{" + secretKey + "}}"
				}
			}
		}
	}

	return nil
}


