import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import StatsBar from "../../Components/Stats/StatsBar";
import MapSection from "../../Components/Map/MapSection";
import DroneDetails from "../../Components/DroneDetails/DroneDetails";
import CctvDetails from "../../Components/CctvDetails/CctvDetails";
import AiAlerts from "../../Components/Alerts/AiAlerts";
import ZoneOverview from "../../Components/ZoneOverview/ZoneOverview";
import CameraThumbnails from "../../Components/CameraThumbnails/CameraThumbnails";
import DashboardInsights from "../../Components/DashboardInsights/DashboardInsights";
import { useState } from "react";

function Dashboard({ theme, setTheme, demo, onExitDemo, onNavigate }) {
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [viewMode, setViewMode] = useState("surveillance");
    return (
        <div className="dashboard">
            <Sidebar page="dashboard" onNavigate={onNavigate} demo={demo} theme={theme} />

            <main className="main-content">
                <Navbar theme={theme} setTheme={setTheme} demo={demo} onExitDemo={onExitDemo} onNavigate={onNavigate} />

                <div className="dashboard-content">
                    {demo && <div className="demo-banner"><strong>Demo workspace</strong><span>All displayed values and device records are samples. No live cameras, telemetry, or alerts are connected.</span></div>}
                    <StatsBar demo={demo} onNavigate={onNavigate} onModeChange={setViewMode} />

                    <div className={`dashboard-grid ${viewMode === "monitoring" ? "monitoring-mode" : ""}`}>

                        <div className="dashboard-main">
                            <MapSection compact onSelectDevice={setSelectedDevice} onAddDevice={() => onNavigate("devices")} />
                            <ZoneOverview onViewAll={() => onNavigate("zones")} />
                            <div className="dashboard-insights-grid">
                                <DashboardInsights onViewAlerts={() => onNavigate("alerts")} />
                                <CameraThumbnails onNavigate={onNavigate} />
                            </div>
                        </div>

                        <div className="dashboard-side">
                            <DroneDetails onViewAll={() => onNavigate("devices")} />
                            <CctvDetails onViewAll={() => onNavigate("videos")} />
                            <AiAlerts onViewAll={() => onNavigate("alerts")} />
                        </div>

                    </div>
                    {selectedDevice && <aside className="selection-note" aria-label="Selected map device"><button className="selection-close" onClick={() => setSelectedDevice(null)} aria-label="Dismiss device details">×</button><p className="eyebrow">DEVICE DETAILS · SAMPLE</p><strong>{selectedDevice.name}</strong><span>{selectedDevice.id} · {selectedDevice.kind}</span><span>Configured location: {selectedDevice.lat.toFixed(4)}, {selectedDevice.lng.toFixed(4)}</span><span>Status: {selectedDevice.status} · telemetry unavailable</span><div><button className="quiet-button" onClick={() => onNavigate("devices")}>Manage device</button>{selectedDevice.kind === "CCTV" && <button className="quiet-button" onClick={() => onNavigate("videos")}>Open video</button>}</div></aside>}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
