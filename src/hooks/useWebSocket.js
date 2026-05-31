import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL;

let stompClient = null;
let isConnected = false;

export const connectWebSocket = ({ onCitizenNotify, onAdminNotify }) => {
  if (isConnected) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: () => {},

    onConnect: () => {
      isConnected = true;

      if (onCitizenNotify) {
        stompClient.subscribe("/user/queue/notify", (msg) => {
          try { onCitizenNotify(JSON.parse(msg.body)); } catch { /* ignore parse errors */ }
        });
      }

      if (onAdminNotify) {
        stompClient.subscribe("/topic/admin/complaints", (msg) => {
          try { onAdminNotify(JSON.parse(msg.body)); } catch { /* ignore parse errors */ }
        });
      }
    },

    onStompError:      () => {},
    onWebSocketError:  () => { isConnected = false; },
    onDisconnect:      () => { isConnected = false; stompClient = null; },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient && isConnected) {
    stompClient.deactivate();
  }
};