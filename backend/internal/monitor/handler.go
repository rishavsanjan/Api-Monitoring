package monitor

import (
	"net/http"

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
	Name     string `json:"name"`
	URL      string `json:"URL"`
	Interval int    `json:"interval"`
}

type UpdateMonitorInput struct {
	Name     *string `json:"name"`
	URL      *string `json:"url"`
	Interval *int    `json:"interval"`
}

func (h *Handler) UpdateMonitor(c *gin.Context) {
	var req UpdateMonitorInput
	id := c.Param("id");
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

	h.service.CreateMonitor(userId, req.Name, req.URL)

	c.JSON(http.StatusOK, gin.H{
		"message": "monitor created",
	})
}

func (h *Handler) GetMonitors(c *gin.Context) {

	userID := c.GetString("user_id")
	monitors, err := h.service.GetMonitors(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch monitors"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"monitors": monitors,
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
