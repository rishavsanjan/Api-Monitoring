package worker

import (
	"api-monitoring-saas/internal/alert"
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"log"
	"net/http"
	"time"
)

func RunMonitoringCycle() {

	var monitors []models.Monitor

	err := database.DB.Find(&monitors).Error

	if err != nil {
		log.Println("Error fetching monitors:", err)
		return
	}

	for _, monitor := range monitors {
		go checkMonitor(monitor)
	}

}

func checkMonitor(monitor models.Monitor) {
	alertRepo := alert.NewRepository()
	alertService := alert.NewService(alertRepo)

	start := time.Now()

	response, err := http.Get(monitor.URL)

	responseTime := time.Since(start).Milliseconds()

	status := "DOWN"
	statusCode := 0
	if err == nil {

		statusCode = response.StatusCode

		if response.StatusCode == monitor.ExpectedStatus {
			status = "UP"
		}

		response.Body.Close()
	}
	alertService.HandleStatusChange(monitor.ID, status)

	result := models.MonitorResult{
		MonitorID:      monitor.ID,
		Status:         status,
		StatusCode:     statusCode,
		ResponseTimeMs: int(responseTime),
		CheckedAt:      time.Now(),
	}

	database.DB.Create(&result)
}
