import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "../../../hooks/useThemePreference.js";

import Sidebar from "./Sidebar";
import ComplaintsTable from "./ComplaintsTable";
import NotificationsList from "./NotificationsList";
import SubmitGrievance from "./SubmitGrievance";
import TrackComplaints from "./TrackComplaints";
import FeedbackContainer from "../Feedback/FeedbackContainer";
import Profile from "./Profile";

const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

const UserDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();

  const [selected, setSelected] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState(null);
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);

  const token = localStorage.getItem("token");

  // ── Auth Guard ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  // ── Fetch Complaints ───────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    try {
      setComplaintLoading(true);
      setComplaintError(null);

      const response = await fetch(
        `${API_URL}/api/citizen/complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching complaints:", error);

      setComplaintError(
        "Failed to load complaints. Please try again."
      );

      setComplaints([]);
    } finally {
      setComplaintLoading(false);
    }
  }, [token]);

  // ── Initial Fetch ──────────────────────────────────────────
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ── WebSocket Notifications ────────────────────────────────
  const subscribeToNotifications = useCallback((stompClient) => {
    stompClient.subscribe("/user/queue/notify", (message) => {
      const payload = JSON.parse(message.body);

      // Update complaint status
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === payload.complaintId
            ? {
                ...complaint,
                status: payload.status || payload.message,
              }
            : complaint
        )
      );

      // Add notification
      setNotifications((prevNotifications) => [
        `Complaint #${payload.complaintId} status updated to ${payload.status}`,
        ...prevNotifications,
      ]);
    });
  }, []);

  // ── Initialize WebSocket ───────────────────────────────────
  const initializeWebSocket = useCallback(async () => {
    try {
      const { Client } = await import("@stomp/stompjs");
      const { default: SockJS } = await import("sockjs-client");

      const stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),

        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },

        debug: () => {},

        reconnectDelay: 5000,

        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          subscribeToNotifications(stompClient);
        },

        onStompError: (frame) => {
          console.error("Broker error:", frame);
        },

        onWebSocketError: (error) => {
          console.error("WebSocket error:", error);
        },
      });

      stompClient.activate();

      return stompClient;
    } catch (error) {
      console.error("WebSocket initialization failed:", error);
      return null;
    }
  }, [token, subscribeToNotifications]);

  // ── Start WebSocket ────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    let stompClient;

    initializeWebSocket().then((client) => {
      stompClient = client;
    });

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [token, initializeWebSocket]);

  // ── Render ─────────────────────────────────────────────────
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
          <h1 className="dashboard-header-title">
            Citizen Dashboard
          </h1>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun /> : <Moon />}

              <span>
                {theme === "dark" ? "Light" : "Dark"}
              </span>
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
              clearSelection={() =>
                setFeedbackComplaint(null)
              }
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