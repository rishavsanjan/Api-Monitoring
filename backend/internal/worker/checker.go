package worker

import (
	"api-monitoring-saas/internal/alert"
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/models"
	"api-monitoring-saas/internal/monitor"
	"api-monitoring-saas/internal/security"
	"api-monitoring-saas/internal/ws"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/PaesslerAG/jsonpath"
)

func RunMonitoringCycle() {
	alertRepo := alert.NewRepository()
	alertService := alert.NewService(alertRepo)

	secretService := monitor.NewSecretRepository()
	encryptionService := security.NewEncryptionService(os.Getenv("ENCRYPTION_KEY"))

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
				status, responseTime, statusCode, logMessage, err := RunKeywordCheck(m, alertService, secretService, encryptionService)
				errorMessage := ""
				if err != nil {
					status = "DOWN"
					errorMessage = err.Error()
					AddLogHelper(fmt.Sprintf("Error : %s", err), "error", &logMessage)
				}

				result := models.MonitorResult{
					MonitorID:      m.ID,
					Status:         status,
					StatusCode:     statusCode,
					ResponseTimeMs: int(responseTime),
					CheckedAt:      time.Now(),
					ErrorMessage:   errorMessage,
				}

				database.DB.Create(&result)

				logs := models.MonitorLog{
					MonitorID: m.ID,
					ResultID:  result.ID,
					Messages:  logMessage,
					CreatedAt: time.Now(),
				}

				database.DB.Create(&logs)
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
		case "synthetic":
			go func(m models.Monitor) {

				var config MonitorConfig

				err := json.Unmarshal(m.Config, &config)
				if err != nil {
					log.Println("Failed to parse config:", err)
					return
				}

				// Load secrets
				var secrets []models.Secret

				err = database.DB.
					Where("monitor_id = ?", m.ID).
					Find(&secrets).Error

				if err != nil {
					log.Println("Failed to load secrets:", err)
					return
				}

				// Build decrypted secret map
				secretMap := make(map[string]string)

				encryptionService := security.NewEncryptionService(
					os.Getenv("ENCRYPTION_KEY"),
				)

				for _, secret := range secrets {

					decrypted, err := encryptionService.Decrypt(
						secret.EncryptedValue,
					)

					if err != nil {
						log.Println("Failed to decrypt secret:", err)
						return
					}

					secretMap[secret.Key] = decrypted
				}

				// Replace variables
				ReplaceVariablesInConfig(
					&config,
					secretMap,
				)

				status := "DOWN"
				var responseTime int64

				status, responseTime, err =
					RunSyntheticMonitor(config)

				if err != nil {
					log.Println("Synthetic monitor failed:", err)
				}

				result := models.MonitorResult{
					MonitorID:      m.ID,
					Status:         status,
					StatusCode:     200,
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

func ReplaceVariablesInConfig(
	config *MonitorConfig,
	secrets map[string]string,
) {

	for i := range config.Steps {

		request := &config.Steps[i].Request

		// Replace body
		request.Body = replaceVariables(
			request.Body,
			secrets,
		)

		// Replace headers
		for key, value := range request.Headers {

			request.Headers[key] = replaceVariables(
				value,
				secrets,
			)
		}
	}
}

func replaceVariables(
	input string,
	secrets map[string]string,
) string {

	re := regexp.MustCompile(`\{\{(.*?)\}\}`)

	return re.ReplaceAllStringFunc(
		input,
		func(match string) string {

			key := strings.TrimSuffix(
				strings.TrimPrefix(match, "{{"),
				"}}",
			)

			if value, ok := secrets[key]; ok {
				return value
			}

			return match
		},
	)
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
	Name    string            `json:"name"`
	Extract map[string]string `json:"extract"`
	Request struct {
		URL     string            `json:"url"`
		Body    string            `json:"body"`
		Method  string            `json:"method"`
		Headers map[string]string `json:"headers"`
	} `json:"request"`
	Assertions struct {
		Status         int      `json:"status"`
		MustContain    []string `json:"mustContain"`
		MustNotContain []string `json:"mustNotContain"`
		UseRegex       bool     `json:"useRegex"`
	} `json:"assertions"`
}

func AddLogHelper(message string, msgtype string, logs *[]models.LogMessage) {
	now := time.Now().Format("15:04:05")
	entry := models.LogMessage{
		Time:    now,
		Message: message,
		Type:    msgtype,
	}

	*logs = append(*logs, entry)

	log.Println(message)
}

func RunKeywordCheck(
	monitor models.Monitor,
	alertService *alert.Service,
	secretRepo *monitor.SecretRepository,
	encryptionService *security.EncryptionService,
) (string, int64, int, []models.LogMessage, error) {

	var logs []models.LogMessage
	start := time.Now()

	log.Println("===================================")
	log.Println("RUNNING KEYWORD MONITOR")
	AddLogHelper("RUNNING KEYWORD MONITOR", "success", &logs)
	log.Println("Monitor ID:", monitor.ID)
	AddLogHelper(fmt.Sprintf("Monitor ID: %s", monitor.ID), "success", &logs)
	log.Println("Monitor URL:", monitor.URL)
	AddLogHelper(fmt.Sprintf("Monitor URL: %s", monitor.URL), "success", &logs)
	log.Println("===================================")

	// 🔹 Parse config
	var cfg KeywordConfig

	if err := json.Unmarshal(monitor.Config, &cfg); err != nil {
		log.Println("❌ CONFIG PARSE ERROR:", err)
		AddLogHelper(fmt.Sprintf("❌ CONFIG PARSE ERROR: %s", err), "error", &logs)
		return "DOWN", 0, 0, logs, err
	}

	log.Printf("%+v\n", cfg)
	AddLogHelper(fmt.Sprintf("%+v", cfg), "success", &logs)
	log.Println("✅ Config parsed successfully")
	AddLogHelper("✅ Config parsed successfully", "success", &logs)

	// 🔐 Load monitor secrets
	secrets, err := secretRepo.GetMonitorSecrets(monitor.ID)
	if err != nil {
		log.Println("❌ SECRET LOAD ERROR:", err)
		AddLogHelper(fmt.Sprintf("❌ SECRET LOAD ERROR: %s", err), "error", &logs)
		return "DOWN", 0, 0, logs, err
	}

	log.Println("✅ Secrets loaded:", len(secrets))
	AddLogHelper(fmt.Sprintf("✅ Secrets loaded: %d", len(secrets)), "success", &logs)

	// 🔐 Build variables map
	variables := make(map[string]string)

	for _, secret := range secrets {
		log.Println("Decrypting secret:", secret.Key)
		AddLogHelper(fmt.Sprintf("Decrypting secret: %s", secret.Key), "success", &logs)
		decrypted, err := encryptionService.Decrypt(secret.EncryptedValue)
		if err != nil {
			log.Println("❌ SECRET DECRYPT ERROR:", err)
			AddLogHelper(fmt.Sprintf("❌ SECRET DECRYPT ERROR: %s", err), "error", &logs)
			return "DOWN", 0, 0, logs, err
		}

		variables[secret.Key] = decrypted
	}

	log.Println("✅ Variables prepared")
	AddLogHelper("✅ Variables prepared", "success", &logs)

	// 🔄 Replace variables in body
	cfg.Request.Body = replaceVariables(cfg.Request.Body, variables)

	// 🔧 Unwrap double-encoded JSON body if needed
	var unwrapped string
	if err := json.Unmarshal([]byte(cfg.Request.Body), &unwrapped); err == nil {
		log.Println("⚠️ Body was double-encoded, unwrapping...")
		AddLogHelper("⚠️ Body was double-encoded, unwrapping...", "warning", &logs)
		cfg.Request.Body = strings.TrimSpace(unwrapped)
	}

	log.Println("✅ Body variables replaced")
	AddLogHelper("✅ Body variables replaced", "success", &logs)
	log.Println(cfg.Request.Body)
	AddLogHelper(cfg.Request.Body, "success", &logs)

	// 🔄 Replace variables in headers, skip empty Bearer tokens
	resolvedHeaders := make(map[string]string)

	for key, value := range cfg.Request.Headers {
		resolved := replaceVariables(value, variables)

		if strings.EqualFold(key, "Authorization") {
			trimmed := strings.TrimSpace(resolved)
			parts := strings.SplitN(trimmed, " ", 2)
			if len(parts) < 2 || strings.TrimSpace(parts[1]) == "" {
				log.Println("⚠️ Skipping Authorization header — token is empty")
				AddLogHelper("⚠️ Skipping Authorization header — token is empty", "warning", &logs)
				continue
			}
		}

		resolvedHeaders[key] = resolved
	}

	log.Println("✅ Header variables replaced")
	AddLogHelper("✅ Header variables replaced", "success", &logs)

	// 🔹 Prepare request body reader
	var bodyReader io.Reader = nil

	log.Println("FINAL REQUEST BODY:")
	AddLogHelper("FINAL REQUEST BODY:", "success", &logs)
	log.Println(cfg.Request.Body)
	AddLogHelper(cfg.Request.Body, "success", &logs)

	if cfg.Request.Body != "" {
		log.Println("Request body exists")
		AddLogHelper("Request body exists", "success", &logs)
		bodyReader = strings.NewReader(cfg.Request.Body)
	}

	// 🔹 Resolve method and URL
	method := cfg.Request.Method
	if method == "" {
		method = monitor.Method
	}

	url := cfg.Request.URL
	if url == "" {
		url = monitor.URL
	}

	// 🔹 Create request
	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		log.Println("❌ REQUEST BUILD ERROR:", err)
		AddLogHelper(fmt.Sprintf("❌ REQUEST BUILD ERROR: %s", err), "error", &logs)
		return "DOWN", 0, 0, logs, err
	}

	log.Println("✅ Request created")
	AddLogHelper("✅ Request created", "success", &logs)

	// 🔹 Add resolved headers
	for k, v := range resolvedHeaders {
		req.Header.Set(k, v)
		log.Println("Header added:", k)
		AddLogHelper(fmt.Sprintf("Header added: %s", k), "success", &logs)
	}

	// 🔹 Default content-type
	if cfg.Request.Body != "" && req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", "application/json")
	}

	// 🔹 HTTP client
	client := http.Client{
		Timeout: 10 * time.Second,
	}

	log.Println("🚀 Sending request...")
	AddLogHelper("🚀 Sending request...", "success", &logs)

	resp, err := client.Do(req)
	if err != nil {
		log.Println("❌ REQUEST ERROR:", err)
		AddLogHelper(fmt.Sprintf("❌ REQUEST ERROR: %s", err), "error", &logs)
		return "DOWN", 0, 0, logs, err
	}

	log.Println("✅ Response received:", resp.StatusCode)
	AddLogHelper(fmt.Sprintf("✅ Response received: %d", resp.StatusCode), "success", &logs)

	// 🔹 Read response safely
	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 1_000_000))
	resp.Body.Close()

	if err != nil {
		log.Println("❌ RESPONSE READ ERROR:", err)
		AddLogHelper(fmt.Sprintf("❌ RESPONSE READ ERROR: %s", err), "error", &logs)
		return "DOWN", 0, 0, logs, err
	}

	body := string(bodyBytes)
	log.Println("✅ Response body length:", len(body))
	AddLogHelper(fmt.Sprintf("✅ Response body length: %d", len(body)), "success", &logs)

	previewLen := min(500, len(body))
	log.Println("📦 BODY PREVIEW:", body[:previewLen])
	AddLogHelper(fmt.Sprintf("📦 BODY PREVIEW: %s", body[:previewLen]), "success", &logs)

	bodyLower := strings.ToLower(body)
	status := "UP"
	statusCode := resp.StatusCode

	// ✅ HTTP status check
	expectedStatus := cfg.Assertions.Status
	if expectedStatus == 0 {
		expectedStatus = monitor.ExpectedStatus
	}

	if statusCode != expectedStatus {
		log.Println("❌ STATUS MISMATCH: expected:", expectedStatus, "got:", statusCode)
		AddLogHelper(fmt.Sprintf("❌ STATUS MISMATCH: expected: %d got: %d", expectedStatus, statusCode), "error", &logs)
		status = "DOWN"
	}

	// 🔍 MUST CONTAIN
	for _, keyword := range cfg.Assertions.MustContain {
		keyword = strings.TrimSpace(keyword)
		log.Println("Checking mustContain:", keyword)
		AddLogHelper(fmt.Sprintf("Checking mustContain: %s", keyword), "success", &logs)

		if cfg.Assertions.UseRegex {
			matched, err := regexp.MatchString(keyword, body)
			if err != nil {
				log.Println("❌ REGEX ERROR:", err)
				AddLogHelper(fmt.Sprintf("❌ REGEX ERROR: %s", err), "error", &logs)
				status = "DOWN"
				break
			}
			if !matched {
				log.Println("❌ REGEX NOT MATCHED:", keyword)
				AddLogHelper(fmt.Sprintf("❌ REGEX NOT MATCHED: %s", keyword), "error", &logs)
				status = "DOWN"
				break
			}
		} else {
			if !strings.Contains(bodyLower, strings.ToLower(keyword)) {
				log.Println("❌ MUST CONTAIN FAILED:", keyword)
				AddLogHelper(fmt.Sprintf("❌ MUST CONTAIN FAILED: %s", keyword), "error", &logs)
				status = "DOWN"
				break
			}
		}
	}

	// 🔍 MUST NOT CONTAIN
	for _, keyword := range cfg.Assertions.MustNotContain {
		keyword = strings.TrimSpace(keyword)
		log.Println("Checking mustNotContain:", keyword)
		AddLogHelper(fmt.Sprintf("Checking mustNotContain: %s", keyword), "success", &logs)

		if cfg.Assertions.UseRegex {
			matched, err := regexp.MatchString(keyword, body)
			if err != nil {
				log.Println("❌ REGEX ERROR:", err)
				AddLogHelper(fmt.Sprintf("❌ REGEX ERROR: %s", err), "error", &logs)
				status = "DOWN"
				break
			}
			if matched {
				log.Println("❌ MUST NOT CONTAIN MATCHED:", keyword)
				AddLogHelper(fmt.Sprintf("❌ MUST NOT CONTAIN MATCHED: %s", keyword), "error", &logs)
				status = "DOWN"
				break
			}
		} else {
			if strings.Contains(bodyLower, strings.ToLower(keyword)) {
				log.Println("❌ MUST NOT CONTAIN FOUND:", keyword)
				AddLogHelper(fmt.Sprintf("❌ MUST NOT CONTAIN FOUND: %s", keyword), "error", &logs)
				status = "DOWN"
				break
			}
		}
	}

	responseTime := time.Since(start).Milliseconds()

	log.Println("✅ FINAL STATUS:", status)
	AddLogHelper(fmt.Sprintf("✅ FINAL STATUS: %s", status), "success", &logs)
	log.Println("⏱ RESPONSE TIME:", responseTime, "ms")
	AddLogHelper(fmt.Sprintf("⏱ RESPONSE TIME: %d ms", responseTime), "success", &logs)

	// 🔔 Alert handling
	alertService.HandleStatusChange(monitor.ID, status)

	return status, responseTime, statusCode, logs, nil
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

type MonitorConfig struct {
	Steps []Step `json:"steps"`
}

type Step struct {
	Name       string            `json:"name"`
	Request    RequestConfig     `json:"request"`
	Assertions AssertionConfig   `json:"assertions"`
	Extract    map[string]string `json:"extract"` // variableName -> JSONPath
}

type RequestConfig struct {
	URL     string            `json:"url"`
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

type AssertionConfig struct {
	Status      int      `json:"status"`
	MustContain []string `json:"mustContain"`
}

func RunSyntheticMonitor(config MonitorConfig) (string, int64, error) {
	variables := make(map[string]string)
	client := &http.Client{Timeout: 10 * time.Second}
	start := time.Now()
	for _, step := range config.Steps {
		log.Println("Running step:", step.Name)
		// Replace variables in request
		reqConfig := replaceVariablesInReq(step.Request, variables)

		// Build request
		req, err := buildRequest(reqConfig)
		if err != nil {
			fmt.Errorf("step %s: request build failed: %v", step.Name, err)
			return "DOWN", 0, err
		}

		// Execute
		s := time.Now()
		resp, err := client.Do(req)
		d := time.Since(s)

		if err != nil {
			fmt.Errorf("step %s: request failed: %v", step.Name, err)
			return "DOWN", 0, err
		}
		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)
		bodyStr := string(bodyBytes)

		//  Assertions
		if err := validateAssertions(step.Assertions, resp.StatusCode, bodyStr); err != nil {
			fmt.Errorf("step %s failed: %v", step.Name, err)
			return "DOWN", 0, err
		}

		// Extract variables
		if len(step.Extract) > 0 {
			if err := extractVariables(step.Extract, bodyBytes, variables); err != nil {
				fmt.Errorf("step %s extract failed: %v", step.Name, err)
				return "DOWN", 0, err
			}
		}

		log.Printf("Step %s time %v", step.Name, d)
	}
	responseTime := time.Since(start).Milliseconds()
	fmt.Println("total time : ", responseTime)
	return "UP", responseTime, nil
}

func buildRequest(cfg RequestConfig) (*http.Request, error) {
	var body io.Reader

	if cfg.Body != "" {
		body = strings.NewReader(cfg.Body)
	}

	req, err := http.NewRequest(cfg.Method, cfg.URL, body)
	if err != nil {
		return nil, err
	}

	for k, v := range cfg.Headers {
		req.Header.Set(k, v)
	}

	if cfg.Body != "" {
		req.Header.Set("Content-Type", "application/json")
	}

	return req, nil
}

func replaceVariablesInReq(req RequestConfig, vars map[string]string) RequestConfig {

	replace := func(input string) string {
		for k, v := range vars {
			input = strings.ReplaceAll(input, "{{"+k+"}}", v)
		}
		return input
	}

	req.URL = replace(req.URL)

	for k, v := range req.Headers {
		req.Headers[k] = replace(v)
	}

	// ✅ FIXED
	if req.Body != "" {
		req.Body = replace(req.Body)
	}

	return req
}

func validateAssertions(assert AssertionConfig, status int, body string) error {

	if assert.Status != 0 && status != assert.Status {
		return fmt.Errorf("expected status %d, got %d", assert.Status, status)
	}

	for _, keyword := range assert.MustContain {
		if !strings.Contains(body, keyword) {
			return fmt.Errorf("missing keyword: %s", keyword)
		}
	}

	return nil
}

func extractVariables(extract map[string]string, body []byte, vars map[string]string) error {

	var jsonData interface{}
	if err := json.Unmarshal(body, &jsonData); err != nil {
		return err
	}

	for key, path := range extract {
		value, err := jsonpath.Get(path, jsonData)
		if err != nil {
			return fmt.Errorf("failed to extract %s: %v", key, err)
		}

		vars[key] = fmt.Sprintf("%v", value)
	}

	return nil
}
