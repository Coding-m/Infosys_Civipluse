import React from "react";
import { Trash2, Bell } from "lucide-react";
import useAdminWebSocket from "../../hooks/useAdminWebSocket";

const AdminNotifications = () => {
  // ✅ Use clearAllNotifications from updated hook
  const { notifications, deleteNotification, clearAllNotifications } =
    useAdminWebSocket();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
            Admin Notifications
          </h1>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {notifications.length} update{notifications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ✅ Clear all button */}
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={clearAllNotifications}
            style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", fontFamily: "inherit" }}
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: "24px", border: "1px solid var(--border-soft)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", background: "color-mix(in srgb, var(--primary) 10%, transparent)", marginBottom: "1.5rem" }}>
            <Bell size={32} color="var(--primary)" />
          </div>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: "600", color: "var(--text-primary)" }}>
            No Notifications
          </h2>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Real-time complaint updates will appear here
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notifications.map((note) => (
            <div
              key={note.id} // ✅ Use id — not index
              style={{
                padding: "1.25rem 1.5rem",
                background: "var(--surface)",
                border: "1px solid #3b82f6",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div>
                <p style={{ margin: "0 0 0.25rem", fontWeight: "600", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  {note.message}
                  {note.complaintId ? ` (Complaint #${note.complaintId})` : ""}
                </p>
                {/* ✅ Show timestamp from hook */}
                {note.timestamp && (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {note.timestamp}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label="Delete notification"
                onClick={() => deleteNotification(note.id)} // ✅ Delete by id
                style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "all 0.2s ease", flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;