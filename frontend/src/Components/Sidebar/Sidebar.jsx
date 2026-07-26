import SidebarItem from "./SidebarItem";
import SystemStatus from "./SystemStatus";

function Sidebar() {
    return (
        <aside className="sidebar">

            {/* Sidebar Header */}
            <div className="sidebar-brand">
                <img
                    src="/logo.jpeg"
                    alt="AegisEye Logo"
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
                    active
                />

                <SidebarItem
                    icon="🗺️"
                    label="Map"
                />

                <SidebarItem
                    icon="📹"
                    label="CCTV"
                />

                <SidebarItem
                    icon="🚁"
                    label="Drones"
                />

                <SidebarItem
                    icon="▣"
                    label="Zones"
                />

                <SidebarItem
                    icon="📊"
                    label="Analytics"
                />

                <SidebarItem
                    icon="⚠"
                    label="Alerts"
                />

                <SidebarItem
                    icon="📄"
                    label="Reports"
                />

                <SidebarItem
                    icon="⚙"
                    label="Settings"
                />

            </nav>

            {/* System Status */}
            <SystemStatus />

        </aside>
    );
}

export default Sidebar;