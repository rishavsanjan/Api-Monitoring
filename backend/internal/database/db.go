package database

import (
	"api-monitoring-saas/internal/models"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := os.Getenv("DATABASE_URL")
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database")
	}

	DB = db
	//migrate()
	log.Println("Database connected")
}

func migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Monitor{},
		&models.MonitorResult{},
		&models.Alert{},
	)

	if err != nil {
		log.Fatal("Migration failed")
	}

	log.Println("Database migrated")
}
