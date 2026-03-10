package main

import (
	"api-monitoring-saas/internal/database"
	"api-monitoring-saas/internal/router"
	"github.com/joho/godotenv"
	"log"
)

func main() {
	err := godotenv.Load();
	if err != nil {
		log.Println("No .env file found")
	}

	database.ConnectDatabase()
	r := router.SetupRouter()
	log.Println("Server running on port 8080")

	r.Run(":8080")
}
