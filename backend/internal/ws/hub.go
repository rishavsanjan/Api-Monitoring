
package ws

import "github.com/gorilla/websocket"

type Hub struct {
	Clients map[string]map[*websocket.Conn]bool 
}

var H = Hub{
	Clients: make(map[string]map[*websocket.Conn]bool),
}


func SendToUser(userID string, message []byte) {

	clients, ok := H.Clients[userID]
	if !ok {
		return
	}

	for conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			conn.Close()
			delete(clients, conn)
		}
	}
}
