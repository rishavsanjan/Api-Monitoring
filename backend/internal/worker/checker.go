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
	"os/exec"
	"regexp"
	"runtime"
	"strconv"
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
		case "ping":
			go func(m models.Monitor) {
				log.Println("checking ping : ")
				status, latency, packetLoss, err := RunPingCheck(m, alertService)
				log.Println("stats : ")
				log.Println(status, latency, packetLoss, err)
				if err != nil {
					status = "DOWN"
				}
				statusCode := 500
				if status == "UP" {
					statusCode = 200
				}
				result := models.MonitorResult{
					MonitorID:      m.ID,
					Status:         status,
					StatusCode:     statusCode,
					ResponseTimeMs: int(latency),
					CheckedAt:      time.Now(),
					PacketLoss:     packetLoss,
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

type KeywordConfig struct {
	Headers        map[string]string `json:"headers"`
	Body           string            `json:"requestBody"`
	MustContain    []string          `json:"mustContain"`
	MustNotContain []string          `json:"mustNotContain"`
	UseRegex       bool              `json:"useRegex"`
}

func RunKeywordCheck(
	monitor models.Monitor,
	alertService *alert.Service,
) (string, int64, int, error) {

	start := time.Now()

	// 🔹 Parse config
	var cfg KeywordConfig
	if err := json.Unmarshal(monitor.Config, &cfg); err != nil {
		log.Println("config error:", err)
		return "DOWN", 0, 0, err
	}

	// 🔹 Prepare request body
	var bodyReader io.Reader = nil
	if cfg.Body != "" {
		bodyReader = strings.NewReader(cfg.Body)
	}

	// 🔹 Create request
	req, err := http.NewRequest(monitor.Method, monitor.URL, bodyReader)
	if err != nil {
		return "DOWN", 0, 0, err
	}

	// 🔹 Add headers
	for k, v := range cfg.Headers {
		req.Header.Set(k, v)
	}

	// 🔹 Default content-type for body
	if cfg.Body != "" && req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", "application/json")
	}

	// 🔹 HTTP client
	client := http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Println("request error:", err)
		return "DOWN", 0, 0, err
	}
	defer resp.Body.Close()

	// 🔹 Read response (limit 1MB)
	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 1_000_000))
	if err != nil {
		log.Println("read error:", err)
		return "DOWN", 0, 0, err
	}

	body := string(bodyBytes)
	bodyLower := strings.ToLower(body)

	// 🔹 Debug (safe preview)
	previewLen := min(500, len(body))
	log.Println("BODY PREVIEW:", body[:previewLen])

	status := "UP"
	statusCode := resp.StatusCode

	// ✅ HTTP status check
	if statusCode != monitor.ExpectedStatus {
		log.Println("status mismatch:", statusCode)
		status = "DOWN"
	}

	// 🔍 MUST CONTAIN
	for _, keyword := range cfg.MustContain {
		keyword = strings.TrimSpace(keyword)

		if cfg.UseRegex {
			matched, err := regexp.MatchString(keyword, body)
			if err != nil || !matched {
				log.Println("regex mustContain failed:", keyword)
				status = "DOWN"
				break
			}
		} else {
			if !strings.Contains(bodyLower, strings.ToLower(keyword)) {
				log.Println("mustContain missing:", keyword)
				status = "DOWN"
				break
			}
		}
	}

	// 🔍 MUST NOT CONTAIN
	for _, keyword := range cfg.MustNotContain {
		keyword = strings.TrimSpace(keyword)

		if cfg.UseRegex {
			matched, err := regexp.MatchString(keyword, body)
			if err == nil && matched {
				log.Println("regex mustNotContain triggered:", keyword)
				status = "DOWN"
				break
			}
		} else {
			if strings.Contains(bodyLower, strings.ToLower(keyword)) {
				log.Println("mustNotContain found:", keyword)
				status = "DOWN"
				break
			}
		}
	}

	responseTime := time.Since(start).Milliseconds()

	// 🔔 Alert handling
	alertService.HandleStatusChange(monitor.ID, status)

	return status, responseTime, statusCode, nil
}

type PingConfig struct {
	Host     string `json:"host"`
	Attempts int    `json:"attempts"`
}

func RunPingCheck(
	monitor models.Monitor,
	alertService *alert.Service,
) (string, int64, int, error) {

	var cfg PingConfig
	if err := json.Unmarshal(monitor.Config, &cfg); err != nil {
		return "DOWN", 0, 0, err
	}

	// 🔹 Defaults
	if cfg.Attempts == 0 {
		cfg.Attempts = 5
	}

	host := cfg.Host
	if host == "" {
		host = monitor.URL
	}

	// 🔥 Clean host (remove https:// etc.)
	host = strings.TrimPrefix(host, "https://")
	host = strings.TrimPrefix(host, "http://")
	host = strings.Split(host, "/")[0]

	log.Println("System ping host:", host)

	// 🔹 OS-specific command
	var cmd *exec.Cmd

	if runtime.GOOS == "windows" {
		cmd = exec.Command("ping", "-n", strconv.Itoa(cfg.Attempts), host)
	} else {
		cmd = exec.Command("ping", "-c", strconv.Itoa(cfg.Attempts), host)
	}

	//start := time.Now()
	output, err := cmd.CombinedOutput()
	//duration := time.Since(start).Milliseconds()

	if err != nil {
		log.Println("ping command error:", err)
	}

	outStr := string(output)
	log.Println("PING OUTPUT:\n", outStr)

	// 🔍 Extract packet loss
	packetLoss := extractPacketLoss(outStr)

	// 🔍 Extract avg latency
	avgLatency := extractAvgLatency(outStr)

	status := "UP"

	if packetLoss == 100 {
		status = "DOWN"
	} else if packetLoss > 50 {
		status = "DOWN"
	}

	alertService.HandleStatusChange(monitor.ID, status)

	log.Printf("Ping Result → Host: %s | Loss: %d%% | Avg Latency: %dms\n",
		host, packetLoss, avgLatency)

	return status, avgLatency, packetLoss, nil
}

func extractPacketLoss(output string) int {
	// Windows: Lost = 0 (0% loss)
	re := regexp.MustCompile(`\((\d+)% loss\)`)
	match := re.FindStringSubmatch(output)

	if len(match) >= 2 {
		val, _ := strconv.Atoi(match[1])
		return val
	}

	// Linux: 0% packet loss
	re = regexp.MustCompile(`(\d+)% packet loss`)
	match = re.FindStringSubmatch(output)

	if len(match) >= 2 {
		val, _ := strconv.Atoi(match[1])
		return val
	}

	return 100
}

func extractAvgLatency(output string) int64 {
	// Windows: Average = 23ms
	re := regexp.MustCompile(`Average = (\d+)ms`)
	match := re.FindStringSubmatch(output)

	if len(match) >= 2 {
		val, _ := strconv.ParseInt(match[1], 10, 64)
		return val
	}

	// Linux: avg = 23.456 ms
	re = regexp.MustCompile(`= [\d\.]+/([\d\.]+)/`)
	match = re.FindStringSubmatch(output)

	if len(match) >= 2 {
		val, _ := strconv.ParseFloat(match[1], 64)
		return int64(val)
	}

	return 0
}
