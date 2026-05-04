package monitor

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

type CreateMonitorRequest struct {
	Name     string                 `json:"name"`
	URL      string                 `json:"URL"`
	Interval int                    `json:"interval"`
	Type     string                 `json:"type"`
	Method   string                 `json:"method"`
	Config   map[string]interface{} `json:"config"`
}

type UpdateMonitorInput struct {
	Name     *string `json:"name"`
	URL      *string `json:"url"`
	Interval *int    `json:"interval"`
}

func (h *Handler) RunMonitorNow(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	err := h.service.RunMonitorNow(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "monitor scheduled successfully",
	})

}

func (h *Handler) UpdateMonitor(c *gin.Context) {
	var req UpdateMonitorInput
	id := c.Param("id")
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	h.service.UpdateMonitor(id, req)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "monitor updated successfully",
	})
}

func (h *Handler) CreateMonitor(c *gin.Context) {
	var req CreateMonitorRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})
		return
	}

	userId := c.GetString("user_id")

	h.service.CreateMonitor(userId, req.Name, req.URL, req.Type, req.Config, req.Method)

	c.JSON(http.StatusOK, gin.H{
		"message": "monitor created",
	})
}

func (h *Handler) GetMonitors(c *gin.Context) {

	userID := c.GetString("user_id")
	pageStr := c.DefaultQuery("page", "1")
	search := c.DefaultQuery("search", "")
	fmt.Print(search)
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid page number: " + err.Error()})
		return
	}
	if page < 1 {
		page = 1
	}
	monitors, total, err := h.service.GetMonitors(userID, page, search)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch monitors"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"monitors": monitors,
		"total":    total,
		"page":     page,
	})
}

func (h *Handler) DeleteMonitor(c *gin.Context) {

	id := c.Param("id")
	err := h.service.DeleteMonitor(id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch monitors"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "monitor deleted",
	})

}

func (h *Handler) GetDashboardStats(c *gin.Context) {
	userID := c.GetString("user_id")
	stats, err := h.service.GetDashboardStats(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to find stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats":   stats,
	})

}

func (h *Handler) GetMonitorHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	monitorId := c.Param("id")
	pageStr := c.DefaultQuery("page", "1")
	page, err := strconv.Atoi(pageStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid page number: " + err.Error()})
		return
	}
	if page < 1 {
		page = 1
	}

	history, err := h.service.GetMonitorHistory(userID, page, monitorId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to find history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"history": history,
	})
}
