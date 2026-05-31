import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL;

let client = null;

export default function useAdminWebSocket() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: () => {},
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      onConnect: () => {
        client.subscribe("/topic/admin/complaints", (msg) => {
          const dto = JSON.parse(msg.body);
          setNotifications((prev) => [
            { complaintId: dto.complaintId, message: dto.status },
            ...prev,
          ]);
        });
      },
      onStompError:  () => {},
      onDisconnect:  () => {},
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  const deleteNotification = (idx) => {
    setNotifications((prev) => prev.filter((_, i) => i !== idx));
  };

  return { notifications, deleteNotification };
}