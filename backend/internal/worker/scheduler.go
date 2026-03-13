package worker

import (
	"log"
	"time"
)

func StartScheduler() {
	ticker := time.NewTicker(60 * time.Second)

	for range ticker.C{
		log.Println("Running monitoring cycle")
		RunMonitoringCycle()
	}
}