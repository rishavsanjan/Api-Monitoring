package worker

import (
	"api-monitoring-saas/internal/alert"
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"api-monitoring-saas/internal/ws"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

func RunMonitoringCycle() {
	alertRepo := alert.NewRepository()
	alertService := alert.NewService(alertRepo)
	var monitors []models.Monitor

	err := database.DB.
		Where("next_run <= ?", time.Now()).
		Find(&monitors).Error

	if err != nil {
		log.Println("Error fetching monitors:", err)
		return
	}

	for _, m := range monitors {
		monitor := m
		nextRun := time.Now().Add(time.Duration(monitor.Interval) * time.Second)
		database.DB.Model(&models.Monitor{}).
			Where("id = ?", monitor.ID).
			Update("next_run", nextRun)
		switch monitor.Type {
		case "http":
			go checkHttpMonitor(monitor, alertService)
		case "keyword":
			go func(m models.Monitor) {
				status, responseTime, statusCode, err := RunKeywordCheck(m, alertService)

				if err != nil {
					status = "DOWN"
				}

				result := models.MonitorResult{
					MonitorID:      m.ID,
					Status:         status,
					StatusCode:     statusCode,
					ResponseTimeMs: int(responseTime),
					CheckedAt:      time.Now(),
				}

				database.DB.Create(&result)

				msg, _ := json.Marshal(result)
				ws.SendToUser(m.UserId, msg)

			}(monitor)

		}

	}
}

func checkHttpMonitor(monitor models.Monitor, alertService *alert.Service) {

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

func RunKeywordCheck(
	monitor models.Monitor,
	alertService *alert.Service,
) (string, int64, int, error) {

	start := time.Now()

	var cfg struct {
		Headers        map[string]string `json:"headers"`
		MustContain    string            `json:"mustContain"`
		MustNotContain string            `json:"mustNotContain"`
	}

	if err := json.Unmarshal(monitor.Config, &cfg); err != nil {
		return "DOWN", 0, 0, err
	}

	req, err := http.NewRequest(monitor.Method, monitor.URL, nil)
	if err != nil {
		return "DOWN", 0, 0, err
	}

	for key, value := range cfg.Headers {
		req.Header.Set(key, value)
	}

	client := http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return "DOWN", 0, 0, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 1_000_000))
	if err != nil {
		return "DOWN", 0, 0, err
	}

	body := string(bodyBytes)

	status := "UP"


	statusCode := resp.StatusCode

	
	if statusCode != monitor.ExpectedStatus {
		status = "DOWN"
	}

	
	if cfg.MustContain != "" && !strings.Contains(body, cfg.MustContain) {
		status = "DOWN"
	}

	if cfg.MustNotContain != "" && strings.Contains(body, cfg.MustNotContain) {
		status = "DOWN"
	}

	responseTime := time.Since(start).Milliseconds()

	
	alertService.HandleStatusChange(monitor.ID, status)

	return status, responseTime, statusCode, nil
}
