import React from "react";
import PropTypes from "prop-types";
import {
  LayoutGrid,
  BookOpen,
  TrendingUp,
  Bell,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";
import logoImg from "../../../assets/Logo.jpg";

const sidebarItems = [
  { label: "Dashboard",        icon: LayoutGrid },
  { label: "Submit Grievance", icon: BookOpen },
  { label: "Track Complaints", icon: TrendingUp },
  { label: "Notifications",    icon: Bell },
  { label: "Feedback",         icon: MessageSquare },
  { label: "My Profile",       icon: User },
  { label: "Logout",           icon: LogOut, isLogout: true },
];

const Sidebar = ({ selected, setSelected, notifications, navigate }) => {
  const handleNavigation = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      setSelected(item.label);
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <img src={logoImg} alt="CivicPulse" />
        <div className="dashboard-sidebar-title">CivicPulse</div>
      </div>

      <nav className="dashboard-nav">
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.label;
            const badge = item.label === "Notifications" ? (notifications?.length || 0) : 0;

            return (
              <li key={item.label} className="dashboard-nav-item">
                <button
                  type="button"
                  className={`dashboard-nav-button ${isActive ? "active" : ""}`}
                  onClick={() => handleNavigation(item)}
                  style={item.isLogout ? { color: "var(--accent)" } : {}}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {badge > 0 && (
                    <span className="dashboard-nav-badge">{badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  selected:      PropTypes.string.isRequired,
  setSelected:   PropTypes.func.isRequired,
  notifications: PropTypes.array,
  navigate:      PropTypes.func.isRequired,
};

export default Sidebar;