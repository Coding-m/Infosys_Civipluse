import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, FileText, UserPlus, BarChart3,
  MessageSquare, User, LogOut,
} from "lucide-react";
import logoImg from "../../assets/Logo.jpg";

const menuItems = [
  { label: "Dashboard",      icon: LayoutGrid },
  { label: "All Complaints", icon: FileText },
  { label: "Create Officer", icon: UserPlus },
  { label: "OfficerRequest", icon: UserPlus },
  { label: "Analytics",      icon: BarChart3 },
  { label: "Feedback",       icon: MessageSquare },
  { label: "Profile",        icon: User },
  { label: "Logout",         icon: LogOut, isLogout: true },
];

const AdminSidebar = ({ selected, setSelected }) => {
  const navigate = useNavigate();

  const handleNavigation = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("adminToken");
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
          {menuItems.map((item) => {
            const Icon     = item.icon;
            const isActive = selected === item.label;

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
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

AdminSidebar.propTypes = {
  selected:    PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default AdminSidebar;