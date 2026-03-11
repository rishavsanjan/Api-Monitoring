package worker

import "time"

func StartScheduler() {
	ticker := time.NewTicker(60 * time.Second)

	for range ticker.C{
		
	}
}