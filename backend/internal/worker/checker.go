package worker

import (
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

func checkMonitor(monitor models.Monitor){
	start := time.Now()

	response, err := http.Get(monitor.URL)

	responseTime := time.Since(start).Milliseconds()

	result := models.MonitorResult{
		MonitorID: monitor.ID,
		ResponseTimeMs: int(responseTime),
		CheckedAt: time.Now(),
	}

	if err != nil {
		result.Status = "DOWN"
		result.StatusCode = 0
	}else{
		result.StatusCode = response.StatusCode

		if response.StatusCode == monitor.ExpectedStatus {
			result.Status = "UP"
		}else{
			result.Status = "DOWN"
		}

		response.Body.Close()
	}

	database.DB.Create(&result)
}