package router

import (
	"api-monitoring-saas/internal/analytics"
	"api-monitoring-saas/internal/auth"
	"api-monitoring-saas/internal/middleware"
	"api-monitoring-saas/internal/monitor"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	authRepo := auth.NewRepository()
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	monitorRepo := monitor.NewRepository()
	monitorService := monitor.NewService(monitorRepo)
	monitorHandler := monitor.NewHandler(monitorService)

	analyticsRepo := analytics.NewRepository()
	analyticsService := analytics.NewService(analyticsRepo)
	analyticsHandler := analytics.NewHandler(analyticsService)

	api := r.Group("/api")
	{
		api.POST("/register", authHandler.Register)
		api.POST("/login", authHandler.Login)
	}

	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/monitors", monitorHandler.CreateMonitor)
		protected.GET("/monitors", monitorHandler.GetMonitors)
		protected.DELETE("/monitors/:id", monitorHandler.DeleteMonitor)
	}

	protected.GET("/monitors/:id/results", analyticsHandler.GetResults)
	protected.GET("/monitors/:id/uptime", analyticsHandler.GetUptime)

	return r
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
