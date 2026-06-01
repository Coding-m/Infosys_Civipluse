import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL;

let stompClient = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const connectWebSocket = ({ onCitizenNotify, onAdminNotify }) => {
  if (isConnected) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  // ✅ Fallback if VITE_WS_URL not set
  const wsUrl = WS_URL || `${window.location.origin}/ws`;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    connectHeaders: { Authorization: `Bearer ${token}` },

    // ✅ Disable debug logs in production
    debug: import.meta.env.DEV ? (msg) => console.log("STOMP:", msg) : () => {},

    // ✅ Auto reconnect with limit
    reconnectDelay: 5000,

    onConnect: () => {
      isConnected = true;
      reconnectAttempts = 0; // ✅ Reset on successful connect
      console.info("WebSocket connected");

      if (onCitizenNotify) {
        stompClient.subscribe("/user/queue/notify", (msg) => {
          try {
            onCitizenNotify(JSON.parse(msg.body));
          } catch (e) {
            console.warn("Failed to parse citizen notification:", e);
          }
        });
      }

      if (onAdminNotify) {
        stompClient.subscribe("/topic/admin/complaints", (msg) => {
          try {
            onAdminNotify(JSON.parse(msg.body));
          } catch (e) {
            console.warn("Failed to parse admin notification:", e);
          }
        });
      }
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers?.message || frame);
      isConnected = false;
    },

    onWebSocketError: (error) => {
      console.error("WebSocket error:", error);
      isConnected = false;

      // ✅ Stop reconnecting after max attempts
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn("Max WebSocket reconnect attempts reached — stopping");
        stompClient?.deactivate();
        stompClient = null;
      }
    },

    onDisconnect: () => {
      console.info("WebSocket disconnected");
      isConnected = false;
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    isConnected = false;
    reconnectAttempts = 0;
  }
};

// ✅ Check connection status from anywhere
export const isWebSocketConnected = () => isConnected;