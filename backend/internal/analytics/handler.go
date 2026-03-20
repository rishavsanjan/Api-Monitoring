package analytics

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

func (h *Handler) GetResults(c *gin.Context) {

	id := c.Param("id")

	results, uptime, avgLatency, totalLogs, err := h.service.GetResults(id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch results"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"history": results,
		"stats": gin.H{
			"totalLogs":         totalLogs,
			"uptime":            uptime,
			"avgLatency": avgLatency,
		},
	})

}

func (h *Handler) GetUptime(c *gin.Context) {

	id := c.Param("id")

	uptime, err := h.service.UpTime(id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to calculate uptime"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uptime": uptime,
	})
}
