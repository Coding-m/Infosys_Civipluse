import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL;
const MAX_NOTIFICATIONS = 50; // ✅ Prevent memory bloat
const MAX_RECONNECT_ATTEMPTS = 5;

export default function useAdminWebSocket() {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null); // ✅ useRef instead of module-level variable
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // ✅ Only connect if user is admin
    if (!token || role !== "ADMIN") return;

    // ✅ Fallback URL if env missing
    const wsUrl = WS_URL || `${window.location.origin}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,

      // ✅ Debug only in development
      debug: import.meta.env.DEV
        ? (msg) => console.log("Admin WS:", msg)
        : () => {},

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        setIsConnected(true);
        reconnectAttempts.current = 0; // ✅ Reset on success
        console.info("Admin WebSocket connected");

        client.subscribe("/topic/admin/complaints", (msg) => {
          try {
            const dto = JSON.parse(msg.body);
            setNotifications((prev) => {
              const newNotification = {
                id: Date.now(), // ✅ Unique id for deletion
                complaintId: dto.complaintId,
                message: dto.status || dto.message,
                timestamp: new Date().toLocaleTimeString(),
              };
              // ✅ Keep only latest 50 notifications
              return [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
            });
          } catch (e) {
            console.warn("Failed to parse admin notification:", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error("Admin STOMP error:", frame.headers?.message);
        setIsConnected(false);
      },

      onWebSocketError: (error) => {
        console.error("Admin WebSocket error:", error);
        setIsConnected(false);

        // ✅ Stop after max attempts
        reconnectAttempts.current++;
        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          console.warn("Max reconnect attempts reached");
          client.deactivate();
        }
      },

      onDisconnect: () => {
        console.info("Admin WebSocket disconnected");
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    // ✅ Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []); // ✅ Run once on mount

  // ✅ Delete by id instead of index — safer
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ✅ Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    isConnected,
    deleteNotification,
    clearAllNotifications,
  };
}