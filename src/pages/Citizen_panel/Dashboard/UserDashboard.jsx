import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "../../../hooks/useThemePreference.js";
import api from "../../../api/axios.js"; // ✅ Use configured axios instance

import Sidebar from "./Sidebar";
import ComplaintsTable from "./ComplaintsTable";
import NotificationsList from "./NotificationsList";
import SubmitGrievance from "./SubmitGrievance";
import TrackComplaints from "./TrackComplaints";
import FeedbackContainer from "../Feedback/FeedbackContainer";
import Profile from "./Profile";

const WS_URL = import.meta.env.VITE_WS_URL;
const MAX_NOTIFICATIONS = 50; // ✅ Prevent memory bloat

const UserDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();

  const [selected, setSelected]               = useState("Dashboard");
  const [complaints, setComplaints]           = useState([]);
  const [notifications, setNotifications]     = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError]   = useState(null);
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);

  // ✅ useRef for WebSocket — prevents stale closures
  const stompClientRef = useRef(null);

  // ✅ Read from both storages — matches ProtectedRoute
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // ── Auth Guard ────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate, token]);

  // ── Fetch Complaints ──────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    try {
      setComplaintLoading(true);
      setComplaintError(null);

      // ✅ Use api instance — auto attaches token, handles 401
      const response = await api.get("/api/citizen/complaints");
      setComplaints(Array.isArray(response.data) ? response.data : []);

    } catch (error) {
      // ✅ Don't show error if 401 — axios interceptor handles redirect
      if (error?.response?.status !== 401) {
        setComplaintError("Failed to load complaints. Please try again.");
      }
      setComplaints([]);
    } finally {
      setComplaintLoading(false);
    }
  }, []);

  // ── Initial Fetch ─────────────────────────────────────────
  useEffect(() => {
    if (token) fetchComplaints();
  }, [fetchComplaints, token]);

  // ── WebSocket Notifications ───────────────────────────────
  const subscribeToNotifications = useCallback((stompClient) => {
    stompClient.subscribe("/user/queue/notify", (message) => {
      try {
        const payload = JSON.parse(message.body);

        // ✅ Update complaint status in list
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint.id === payload.complaintId
              ? { ...complaint, status: payload.status || payload.message }
              : complaint
          )
        );

        // ✅ Add notification with id + timestamp
        setNotifications((prev) => {
          const newNotification = {
            id: Date.now(),
            message: `Complaint #${payload.complaintId} updated: ${payload.status || payload.message}`,
            timestamp: new Date().toLocaleTimeString(),
          };
          return [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        });

      } catch (e) {
        console.warn("Failed to parse notification:", e);
      }
    });
  }, []);

  // ── Initialize WebSocket ──────────────────────────────────
  useEffect(() => {
    if (!token) return;

    let isMounted = true; // ✅ Prevent state update on unmounted component

    const initWebSocket = async () => {
      try {
        const { Client } = await import("@stomp/stompjs");
        const { default: SockJS } = await import("sockjs-client");

        const wsUrl = WS_URL || `${window.location.origin}/ws`;

        const stompClient = new Client({
          webSocketFactory: () => new SockJS(wsUrl),
          connectHeaders: { Authorization: `Bearer ${token}` },
          debug: import.meta.env.DEV ? (msg) => console.log("WS:", msg) : () => {},
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,

          onConnect: () => {
            if (isMounted) {
              subscribeToNotifications(stompClient);
            }
          },

          onStompError: (frame) => {
            console.error("WebSocket broker error:", frame.headers?.message);
          },

          onWebSocketError: (error) => {
            console.error("WebSocket connection error:", error);
          },

          onDisconnect: () => {
            console.info("WebSocket disconnected");
          },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

      } catch (error) {
        console.error("WebSocket initialization failed:", error);
      }
    };

    initWebSocket();

    // ✅ Cleanup on unmount
    return () => {
      isMounted = false;
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [token, subscribeToNotifications]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="dashboard-shell">
      <Sidebar
        selected={selected}
        setSelected={setSelected}
        notifications={notifications}
        navigate={navigate}
      />

      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-header-title">Citizen Dashboard</h1>
          <div className="dashboard-header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="dashboard-body">
          {selected === "Dashboard" && (
            <ComplaintsTable
              complaints={complaints}
              loading={complaintLoading}
              error={complaintError}
              fetchComplaints={fetchComplaints}
              onFeedback={(complaint) => {
                setFeedbackComplaint(complaint);
                setSelected("Feedback");
              }}
            />
          )}

          {selected === "Submit Grievance" && (
            <SubmitGrievance
              complaints={complaints}
              setComplaints={setComplaints}
            />
          )}

          {selected === "Track Complaints" && (
            <TrackComplaints
              initialComplaints={complaints}
              loading={complaintLoading}
              token={token}
            />
          )}

          {selected === "Notifications" && (
            <NotificationsList
              notifications={notifications}
              setNotifications={setNotifications}
            />
          )}

          {selected === "Feedback" && (
            <FeedbackContainer
              complaints={complaints}
              selectedComplaint={feedbackComplaint}
              clearSelection={() => setFeedbackComplaint(null)}
            />
          )}

          {selected === "My Profile" && (
            <Profile navigate={navigate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;