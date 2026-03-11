package router

import (
	"api-monitoring-saas/internal/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	repo := auth.NewRepositry()
	service := auth.NewService(repo)
	handler := auth.NewHandler(service)

	api := r.Group("/api")
	{
		api.POST("/register", handler.Register)
		api.POST("/login", handler.Login)
	}

	return r;
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
