package monitor

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"

)

type SecretRepository struct {
}

func NewSecretRepository() *SecretRepository {

	return &SecretRepository{}
}

func (r *SecretRepository) CreateSecret(
	secret *models.Secret,
) error {

	return database.DB.Create(secret).Error
}

func (r *SecretRepository) GetMonitorSecrets(
	monitorID string,
) ([]models.Secret, error) {

	var secrets []models.Secret

	err := database.DB.
		Where("monitor_id = ?", monitorID).
		Find(&secrets).Error

	return secrets, err
}

func (r *SecretRepository) DeleteMonitorSecrets(
	monitorID string,
) error {

	return database.DB.
		Where("monitor_id = ?", monitorID).
		Delete(&models.Secret{}).Error
}
