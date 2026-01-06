import React, { useEffect, useState, useRef } from "react";
import { Bell, Trash2, CheckCircle2, AlertCircle, Info, TrendingUp } from "lucide-react";

const NotificationsList = ({ notifications = [], setNotifications }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("info");
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const shownNotificationsRef = useRef(new Set());
  const queueRef = useRef([]);
  const initializedRef = useRef(false);

  const getNotificationIcon = (msg) => {
    if (msg.includes("RESOLVED")) return "resolved";
    if (msg.includes("IN_PROGRESS")) return "progress";
    if (msg.includes("REJECTED")) return "rejected";
    return "info";
  };

  const friendlyMessage = (msg) => {
    if (!msg) return "";

    const match = msg.match(/Complaint #(.*?) status updated to (.*)/);
    if (match) {
      const [, id, status] = match;
      switch (status) {
        case "IN_PROGRESS":
          return `Good news! Your complaint #${id} is now being processed.`;
        case "RESOLVED":
          return `Your complaint #${id} has been resolved. Thank you for your patience!`;
        case "REJECTED":
          return `Unfortunately, your complaint #${id} could not be resolved. Please contact support.`;
        default:
          return `Complaint #${id} status updated: ${status}`;
      }
    }

    return msg;
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    notifications.forEach((note) => {
      if (!shownNotificationsRef.current.has(note)) {
        queueRef.current.push(note);
        shownNotificationsRef.current.add(note);
      }
    });

    if (!openSnackbar && queueRef.current.length > 0) {
      const processQueue = () => {
        if (queueRef.current.length === 0) return;

        const next = queueRef.current.shift();

        setTimeout(() => {
          const index = notifications.findIndex((n) => n === next);
          const type = getNotificationIcon(next);

          setSnackbarMsg(friendlyMessage(next));
          setSnackbarType(type);
          setOpenSnackbar(true);
          setHighlightedIndex(index);

          setTimeout(() => setHighlightedIndex(null), 3000);

          setTimeout(processQueue, 4000);
        }, 0);
      };

      processQueue();
    }
  }, [notifications, openSnackbar]);

  const markAsRead = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const getNotificationColor = (msg) => {
    if (msg.includes("RESOLVED")) return { bg: "var(--accent)", light: "rgba(16, 185, 129, 0.1)" };
    if (msg.includes("IN_PROGRESS")) return { bg: "var(--primary)", light: "rgba(43, 80, 255, 0.1)" };
    if (msg.includes("REJECTED")) return { bg: "#ef4444", light: "rgba(239, 68, 68, 0.1)" };
    return { bg: "#3b82f6", light: "rgba(59, 130, 246, 0.1)" };
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{
        background: "var(--surface)",
        borderRadius: "24px",
        padding: "2.5rem",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--card-shadow)",
        marginBottom: "2rem",
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            margin: "0 0 0.5rem",
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "var(--text-primary)",
          }}>
            Notifications
          </h1>
          <p style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "0.95rem",
          }}>
            Stay updated with your complaint status and updates
          </p>
        </div>

        <div style={{
          height: "1px",
          background: "var(--border-soft)",
          marginBottom: "2rem",
        }}></div>

        {notifications.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "color-mix(in srgb, var(--primary) 2%, transparent)",
            borderRadius: "20px",
            border: "1px solid var(--border-soft)",
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              marginBottom: "1.5rem",
            }}>
              <Bell size={32} color="var(--primary)" />
            </div>
            <h2 style={{
              margin: "0 0 0.5rem",
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}>
              No Notifications
            </h2>
            <p style={{
              margin: 0,
              color: "var(--text-muted)",
              fontSize: "0.95rem",
            }}>
              You're all caught up! Check back later for updates on your complaints.
            </p>
          </div>
        ) : (
          <>
            {/* Notification Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}>
              <div style={{
                background: "color-mix(in srgb, var(--primary) 5%, transparent)",
                borderRadius: "16px",
                padding: "1rem",
                border: "1px solid var(--border-soft)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Total Notifications
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "var(--primary)",
                }}>
                  {notifications.length}
                </p>
              </div>

              <div style={{
                background: "color-mix(in srgb, var(--accent) 5%, transparent)",
                borderRadius: "16px",
                padding: "1rem",
                border: "1px solid var(--border-soft)",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}>
                  Resolved Issues
                </p>
                <p style={{
                  margin: 0,
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "var(--accent)",
                }}>
                  {notifications.filter(n => n.includes("RESOLVED")).length}
                </p>
              </div>
            </div>

            {/* Notifications List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {notifications.map((note, index) => {
                const colors = getNotificationColor(note);
                const notifType = getNotificationIcon(note);
                const iconMap = {
                  resolved: CheckCircle2,
                  progress: TrendingUp,
                  rejected: AlertCircle,
                  info: Info,
                };
                const Icon = iconMap[notifType];

                return (
                  <div
                    key={index}
                    style={{
                      padding: "1.5rem",
                      background: colors.light,
                      border: `1.5px solid ${colors.bg}`,
                      borderRadius: "16px",
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "1.25rem",
                      alignItems: "center",
                      boxShadow: highlightedIndex === index ? `0 20px 40px ${colors.bg}40` : "none",
                      backgroundColor: highlightedIndex === index ? `color-mix(in srgb, ${colors.bg} 8%, transparent)` : colors.light,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: colors.bg,
                      color: "white",
                    }}>
                      <Icon size={22} strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div>
                      <p style={{
                        margin: "0 0 0.5rem",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        fontWeight: "600",
                        lineHeight: "1.4",
                      }}>
                        {friendlyMessage(note)}
                      </p>
                      <p style={{
                        margin: 0,
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                      }}>
                        Just now • {notifType === "resolved" && "Issue Resolved"}
                        {notifType === "progress" && "In Progress"}
                        {notifType === "rejected" && "Rejected"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexShrink: 0,
                    }}>
                      <button
                        onClick={() => markAsRead(index)}
                        style={{
                          padding: "0.65rem 1rem",
                          background: colors.bg,
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "all 0.2s ease",
                          fontFamily: "inherit",
                        }}
                        title="Mark as read"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = `0 10px 20px ${colors.bg}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </button>

                      <button
                        onClick={() => deleteNotification(index)}
                        style={{
                          padding: "0.65rem 1rem",
                          background: "transparent",
                          color: colors.bg,
                          border: `1.5px solid ${colors.bg}`,
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "all 0.2s ease",
                          fontFamily: "inherit",
                        }}
                        title="Delete"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${colors.bg}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Toast Snackbar */}
      {openSnackbar && (
        <div style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          background: getNotificationColor(snackbarMsg).bg,
          color: "white",
          padding: "1.25rem 1.75rem",
          borderRadius: "14px",
          boxShadow: `0 25px 50px ${getNotificationColor(snackbarMsg).bg}40`,
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          maxWidth: "450px",
          animation: "slideInRight 0.3s ease",
          zIndex: 10000,
        }}>
          {(() => {
            const Icon = snackbarType === "resolved" ? CheckCircle2 : snackbarType === "progress" ? TrendingUp : AlertCircle;
            return <Icon size={22} strokeWidth={2.5} />;
          })()}
          <span style={{ flex: 1, fontSize: "0.95rem", fontWeight: "500" }}>{snackbarMsg}</span>
          <button
            onClick={() => setOpenSnackbar(false)}
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              border: "none",
              color: "white",
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "1.2rem",
              fontWeight: "bold",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            }}
          >
            ✕
          </button>
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
