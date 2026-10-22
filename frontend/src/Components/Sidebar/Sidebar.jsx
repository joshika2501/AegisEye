import SidebarItem from "./SidebarItem";
import SystemStatus from "./SystemStatus";

function Sidebar({ page = "dashboard", onNavigate, demo, theme }) {
    return (
        <aside className="sidebar">

            {/* Sidebar Header */}
            <div className="sidebar-brand">
                <img
                    src={theme === "light" ? "/aegiseye-light.png" : "/aegiseye-dark.png"}
                    alt="AegisEye official logo"
                    className="brand-logo"
                />

                <div className="brand-text">
                    <h1 className="sidebar-header">AegisEye</h1>
                    <p className="sidebar-sub-header">
                        Integrated Surveillance System
                    </p>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="sidebar-navigation">

                <SidebarItem
                    icon="⌂"
                    label="Dashboard"
                    active={page === "dashboard"}
                    onClick={() => onNavigate("dashboard")}
                />

                <SidebarItem
                    icon="🗺️"
                    label="Map"
                    active={page === "map"}
                    onClick={() => onNavigate("map")}
                />

                <SidebarItem
                    icon="📹"
                    label="CCTV"
                    active={page === "videos"}
                    onClick={() => onNavigate("videos")}
                />

                <SidebarItem
                    icon="🚁"
                    label="Drones & Devices"
                    active={page === "devices"}
                    onClick={() => onNavigate("devices")}
                />

                <SidebarItem
                    icon="▣"
                    label="Blocks"
                    active={page === "blocks"}
                    onClick={() => onNavigate("blocks")}
                />

                <SidebarItem
                    icon="●"
                    label="Zones"
                    active={page === "zones"}
                    onClick={() => onNavigate("zones")}
                />

                <SidebarItem
                    icon="📊"
                    label="Analytics"
                    active={page === "analytics"}
                    onClick={() => onNavigate("analytics")}
                />

                <SidebarItem
                    icon="⚠"
                    label="Alerts"
                    active={page === "alerts"}
                    onClick={() => onNavigate("alerts")}
                />

                <SidebarItem
                    icon="📄"
                    label="Reports"
                    active={page === "reports"}
                    onClick={() => onNavigate("reports")}
                />

                <SidebarItem
                    icon="⚙"
                    label="Settings"
                    active={page === "settings"}
                    onClick={() => onNavigate("settings")}
                />

                <SidebarItem
                    icon="♙"
                    label="Users"
                    active={page === "admin"}
                    onClick={() => onNavigate("admin")}
                />

            </nav>

            {/* System Status */}
            <SystemStatus demo={demo} />

        </aside>
    );
}

export default Sidebar;
