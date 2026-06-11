import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "../../../hooks/useThemePreference.js";
import api from "../../../api/axios.js";

import Sidebar from "./Sidebar";
import ComplaintsTable from "./ComplaintsTable";
import NotificationsList from "./NotificationsList";
import SubmitGrievance from "./SubmitGrievance";
import TrackComplaints from "./TrackComplaints";
import FeedbackContainer from "../Feedback/FeedbackContainer";
import Profile from "./Profile";

const WS_URL = import.meta.env.VITE_WS_URL;
const MAX_NOTIFICATIONS = 50;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();

  const [selected, setSelected] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState(null);
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);

  const stompClientRef = useRef(null);

  // ✅ FIX: token in state (prevents refresh bug)
  const [token, setToken] = useState(null);

  // ── Load token safely after refresh ──
  useEffect(() => {
    const t =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    setToken(t);
  }, []);

  // ── Auth Guard ──
  useEffect(() => {
    if (token === null) return; // wait for token check

    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate, token]);

  // ── Fetch Complaints ──
const fetchComplaints = useCallback(async () => {
  try {
    setComplaintLoading(true);
    setComplaintError(null);

    console.log("TOKEN:", localStorage.getItem("token"));

    const response = await api.get("/api/citizen/complaints");

    console.log("STATUS:", response.status);
    console.log("DATA:", response.data);

    setComplaints(
      Array.isArray(response.data) ? response.data : []
    );

  } catch (error) {

    console.log("ERROR STATUS:", error?.response?.status);
    console.log("ERROR DATA:", error?.response?.data);
    console.log("FULL ERROR:", error);

    if (error?.response?.status !== 401) {
      setComplaintError("Failed to load complaints. Please try again.");
    }

    setComplaints([]);

  } finally {
    setComplaintLoading(false);
  }
}, []);
  // ── Initial fetch AFTER token is ready ──
  useEffect(() => {
    if (token) {
      fetchComplaints();
    }
  }, [token, fetchComplaints]);

  // ── WebSocket Notifications ──
  const subscribeToNotifications = useCallback((stompClient) => {
    stompClient.subscribe("/user/queue/notify", (message) => {
      try {
        const payload = JSON.parse(message.body);

        setComplaints((prev) =>
          prev.map((c) =>
            c.id === payload.complaintId
              ? { ...c, status: payload.status || payload.message }
              : c
          )
        );

        setNotifications((prev) => {
          const newNotification = {
            id: Date.now(),
            message: `Complaint #${payload.complaintId} updated: ${
              payload.status || payload.message
            }`,
            timestamp: new Date().toLocaleTimeString(),
          };

          return [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        });
      } catch (e) {
        console.warn("Notification parse error:", e);
      }
    });
  }, []);

  // ── WebSocket Init ──
  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const initWebSocket = async () => {
      try {
        const { Client } = await import("@stomp/stompjs");
        const { default: SockJS } = await import("sockjs-client");

        const wsUrl = WS_URL || `${window.location.origin}/ws`;

        const stompClient = new Client({
          webSocketFactory: () => new SockJS(wsUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          reconnectDelay: 5000,

          onConnect: () => {
            if (isMounted) {
              subscribeToNotifications(stompClient);
            }
          },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;
      } catch (error) {
        console.error("WebSocket init failed:", error);
      }
    };

    initWebSocket();

    return () => {
      isMounted = false;
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [token, subscribeToNotifications]);

  // ── Render ──
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
          <h1>Citizen Dashboard</h1>

          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </header>

        {/* Body */}
        <div className="dashboard-body">
          {selected === "Dashboard" && (
            <ComplaintsTable
              complaints={complaints}
              loading={complaintLoading}
              error={complaintError}
              fetchComplaints={fetchComplaints}
              onFeedback={(c) => {
                setFeedbackComplaint(c);
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

          {selected === "My Profile" && <Profile navigate={navigate} />}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
