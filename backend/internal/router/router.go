package router

import (
	"api-monitoring-saas/internal/auth"
	"api-monitoring-saas/internal/middleware"
	"api-monitoring-saas/internal/monitor"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	authRepo := auth.NewRepositry()
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	monitorRepo := monitor.NewRepositry();
	monitorService := monitor.NewService(monitorRepo)
	monitorHandler := monitor.NewHandler(monitorService)



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

	return r;
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
