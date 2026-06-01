import React, { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Trash2, CheckCircle2, AlertCircle, Info, TrendingUp } from "lucide-react";

const NotificationsList = ({ notifications = [], setNotifications }) => {
  const [snackbar, setSnackbar]           = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);

  const initializedRef        = useRef(false);
  const shownNotificationsRef = useRef(new Set());
  const queueRef              = useRef([]);
  const snackbarTimerRef      = useRef(null);
  const processQueueRef       = useRef(null); // ✅ holds stable ref to processQueue

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getMessage = (note) =>
    typeof note === "object" ? note.message : note;

  const getNotificationType = (msg) => {
    if (!msg) return "info";
    if (msg.includes("RESOLVED"))    return "resolved";
    if (msg.includes("IN_PROGRESS")) return "progress";
    if (msg.includes("REJECTED"))    return "rejected";
    return "info";
  };

  const friendlyMessage = (msg) => {
    if (!msg) return "";
    const match = msg.match(/Complaint #(.*?) (?:status updated to|updated:) (.*)/);
    if (match) {
      const [, id, status] = match;
      switch (status.trim()) {
        case "IN_PROGRESS": return `Good news! Your complaint #${id} is now being processed.`;
        case "RESOLVED":    return `Your complaint #${id} has been resolved. Thank you!`;
        case "REJECTED":    return `Your complaint #${id} could not be resolved. Please contact support.`;
        default:            return `Complaint #${id} status updated: ${status}`;
      }
    }
    return msg;
  };

  const getNotificationColor = (msg) => {
    if (!msg) return { bg: "#3b82f6", light: "rgba(59,130,246,0.1)" };
    if (msg.includes("RESOLVED"))    return { bg: "#10b981", light: "rgba(16,185,129,0.1)" };
    if (msg.includes("IN_PROGRESS")) return { bg: "var(--primary)", light: "rgba(43,80,255,0.1)" };
    if (msg.includes("REJECTED"))    return { bg: "#ef4444",  light: "rgba(239,68,68,0.1)" };
    return                                   { bg: "#3b82f6",  light: "rgba(59,130,246,0.1)" };
  };

  const iconMap = {
    resolved: CheckCircle2,
    progress: TrendingUp,
    rejected: AlertCircle,
    info:     Info,
  };

  // ✅ processQueue uses ref so recursive call always gets the latest version
  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) return;

    const next   = queueRef.current.shift();
    const msg    = getMessage(next);
    const noteId = typeof next === "object" ? next.id : next;
    const type   = getNotificationType(msg);

    setSnackbar({ message: friendlyMessage(msg), type });
    setHighlightedId(noteId);

    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);

    snackbarTimerRef.current = setTimeout(() => {
      setHighlightedId(null);
      setSnackbar(null);
      processQueueRef.current?.(); // ✅ call via ref — always up-to-date, no stale closure
    }, 4000);
  }, []);

  // Keep the ref in sync with the latest function instance
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // ── Queue Processing Effect ───────────────────────────────────────────────
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    notifications.forEach((note) => {
      const key = typeof note === "object" ? note.id : note;
      if (!shownNotificationsRef.current.has(key)) {
        if (!queueRef.current.find((n) => (typeof n === "object" ? n.id : n) === key)) {
          queueRef.current.push(note);
        }
        shownNotificationsRef.current.add(key);
      }
    });

    if (!snackbar && queueRef.current.length > 0) {
      processQueue();
    }
  }, [notifications, snackbar, processQueue]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const deleteNotification = (note) => {
    if (typeof note === "object") {
      setNotifications((prev) => prev.filter((n) => n.id !== note.id));
    } else {
      setNotifications((prev) => prev.filter((n) => n !== note));
    }
  };

  const clearAll = () => setNotifications([]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ background: "var(--surface)", borderRadius: "24px", padding: "2.5rem", border: "1px solid var(--border-soft)", boxShadow: "var(--card-shadow)", marginBottom: "2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
              Notifications
            </h1>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {notifications.length} update{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", fontFamily: "inherit" }}
            >
              Clear All
            </button>
          )}
        </div>

        <div style={{ height: "1px", background: "var(--border-soft)", marginBottom: "2rem" }} />

        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "color-mix(in srgb, var(--primary) 2%, transparent)", borderRadius: "20px", border: "1px solid var(--border-soft)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", background: "color-mix(in srgb, var(--primary) 10%, transparent)", marginBottom: "1.5rem" }}>
              <Bell size={32} color="var(--primary)" />
            </div>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>
              No Notifications
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
              You're all caught up! Updates on your complaints will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {notifications.map((note) => {
              const msg           = getMessage(note);
              const noteId        = typeof note === "object" ? note.id : msg;
              const colors        = getNotificationColor(msg);
              const type          = getNotificationType(msg);
              const Icon          = iconMap[type];
              const isHighlighted = noteId === highlightedId;
              const timestamp     = typeof note === "object" ? note.timestamp : null;

              return (
                <div
                  key={noteId}
                  style={{
                    padding: "1.5rem",
                    background: isHighlighted
                      ? `color-mix(in srgb, ${colors.bg} 8%, transparent)`
                      : colors.light,
                    border: `1.5px solid ${colors.bg}`,
                    borderRadius: "16px",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: "1.25rem",
                    alignItems: "center",
                    boxShadow: isHighlighted ? `0 20px 40px ${colors.bg}40` : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", background: colors.bg, color: "white" }}>
                    <Icon size={22} strokeWidth={2.5} />
                  </div>

                  <div>
                    <p style={{ margin: "0 0 0.35rem", color: "var(--text-primary)", fontSize: "1rem", fontWeight: "600", lineHeight: 1.4 }}>
                      {friendlyMessage(msg)}
                    </p>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {timestamp || "Just now"} •{" "}
                      {type === "resolved" && "Issue Resolved"}
                      {type === "progress" && "In Progress"}
                      {type === "rejected" && "Rejected"}
                      {type === "info"     && "Update"}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Delete notification"
                    onClick={() => deleteNotification(note)}
                    style={{ padding: "0.65rem", background: "transparent", color: colors.bg, border: `1.5px solid ${colors.bg}`, borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", fontFamily: "inherit" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.bg; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = colors.bg; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Snackbar */}
      {snackbar && (
        <div style={{
          position: "fixed", top: "2rem", right: "2rem",
          background: getNotificationColor(snackbar.message).bg,
          color: "white", padding: "1.25rem 1.75rem", borderRadius: "14px",
          boxShadow: `0 25px 50px ${getNotificationColor(snackbar.message).bg}40`,
          display: "flex", alignItems: "center", gap: "1.25rem",
          maxWidth: "450px", zIndex: 10000, animation: "slideInRight 0.3s ease",
        }}>
          {React.createElement(iconMap[snackbar.type] || Info, { size: 22, strokeWidth: 2.5 })}
          <span style={{ flex: 1, fontSize: "0.95rem", fontWeight: "500" }}>{snackbar.message}</span>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSnackbar(null)}
            style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "white", width: "28px", height: "28px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
          >✕</button>
        </div>
      )}

      <style>{`@keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
};

export default NotificationsList;