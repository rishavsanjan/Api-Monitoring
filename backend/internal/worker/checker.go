package worker

import (
	"api-monitoring-saas/internal/alert"
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"api-monitoring-saas/internal/ws"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

func RunMonitoringCycle() {

	var monitors []models.Monitor

	err := database.DB.
		Where("next_run <= ?", time.Now()).
		Find(&monitors).Error

	if err != nil {
		log.Println("Error fetching monitors:", err)
		return
	}

	for _, monitor := range monitors {
		nextRun := time.Now().Add(time.Duration(monitor.Interval) * time.Second)
		database.DB.Model(&models.Monitor{}).
			Where("id = ?", monitor.ID).
			Update("next_run", nextRun)

		go checkMonitor(monitor)
	}
}

func checkMonitor(monitor models.Monitor) {
	alertRepo := alert.NewRepository()
	alertService := alert.NewService(alertRepo)

	start := time.Now()

	client := http.Client{
		Timeout: 10 * time.Second,
	}

	response, err := client.Get(monitor.URL)

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

	msg, _ := json.Marshal(result)
	ws.SendToUser(monitor.UserId, msg)

}
