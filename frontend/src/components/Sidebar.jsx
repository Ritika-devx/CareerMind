
import { NavLink } from "react-router-dom";
import {
  BrainCircuit, LayoutDashboard, BriefcaseBusiness,
  Wallet, Network, ChartNoAxesCombined
} from "lucide-react";

const links = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/role", label: "Role Prediction", icon: BriefcaseBusiness },
  { path: "/salary", label: "Salary Prediction", icon: Wallet },
  { path: "/clustering", label: "Job Clustering", icon: Network },
  { path: "/insights", label: "Insights", icon: ChartNoAxesCombined },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <BrainCircuit size={30} />
        <span>CareerMind</span>
      </div>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="nav-links">
        {links.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">AI Job Market Intelligence</div>
    </aside>
  );
}
