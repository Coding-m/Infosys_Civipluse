import React from "react";
import PropTypes from "prop-types";
import {
  LayoutGrid, FileText, MessageSquare, User, LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/Logo.jpg";
import { handleLogout } from "../Citizen_panel/Dashboard/Sidebar"; // ✅ Shared logout

const menuItems = [
  { label: "Dashboard",      icon: LayoutGrid },
  { label: "All Complaints", icon: FileText },
  { label: "Feedback",       icon: MessageSquare },
  { label: "Profile",        icon: User },
  { label: "Logout",         icon: LogOut, isLogout: true },
];

const Sidebar = ({ selected, setSelected }) => {
  const navigate = useNavigate();

  const handleNavigation = (item) => {
    if (item.isLogout) {
      handleLogout(navigate); // ✅ Clears both storages + replace navigate
    } else {
      setSelected(item.label);
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <img src={logoImg} alt="CivicPulse Logo" className="dashboard-sidebar-logo" />
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
                  aria-label={item.label}
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

Sidebar.propTypes = {
  selected:    PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
};

export default Sidebar;