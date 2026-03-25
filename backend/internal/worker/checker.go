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

func SecondsSince(ts string) (int64, error) {
	const layout = "2006-01-02 15:04:05.999999-07"
	t, err := time.Parse(layout, ts)
	if err != nil {
		return 0, err
	}
	d := time.Since(t)
	return int64(d.Seconds()), nil
}

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

	msg, _ := json.Marshal(result)
	ws.SendToUser(monitor.UserId, msg)

}
