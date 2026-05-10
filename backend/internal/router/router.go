package router

import (
	"api-monitoring-saas/internal/analytics"
	"api-monitoring-saas/internal/auth"
	"api-monitoring-saas/internal/middleware"
	"api-monitoring-saas/internal/monitor"
	"api-monitoring-saas/internal/user"
	"api-monitoring-saas/internal/ws"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // allow all
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authRepo := auth.NewRepository()
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)

	monitorRepo := monitor.NewRepository()
	monitorService := monitor.NewService(monitorRepo)
	monitorHandler := monitor.NewHandler(monitorService)

	analyticsRepo := analytics.NewRepository()
	analyticsService := analytics.NewService(analyticsRepo)
	analyticsHandler := analytics.NewHandler(analyticsService)

	userRepo := user.NewRepository();
	userService := user.NewService(userRepo)
	userHandler := user.NewHandler(userService)

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
		protected.GET("/monitors/stats", monitorHandler.GetDashboardStats)
		protected.PATCH("/monitors/:id/update", monitorHandler.UpdateMonitor)
		protected.GET("/monitors/:id/history", monitorHandler.GetMonitorHistory)
		protected.GET("/monitors/:id", monitorHandler.RunMonitorNow)
		protected.GET("/me", authHandler.VerifyUserToken)
		protected.GET("/send-otp", authHandler.VerifyEmail)
		protected.POST("/verify-otp", authHandler.VerifyOtp)
		protected.POST("/update-profile", userHandler.UpdateProfile)
		protected.POST("/password-checker", userHandler.PasswordChecker)
	}

	protected.GET("/monitors/:id/results", analyticsHandler.GetResults)
	protected.GET("/monitors/:id/uptime", analyticsHandler.GetUptime)

	r.GET("/ws", ws.HandleWS)
	return r
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
