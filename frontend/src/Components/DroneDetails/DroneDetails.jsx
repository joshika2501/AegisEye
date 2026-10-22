import { useState } from "react";
import droneDetailImage from "../../assets/dashboard/drone-detail.png";

function DroneDetails({ onViewAll }) {
    const [drone] = useState({ id: "DEMO-UAV-01", type: "Patrol drone", battery: 92, status: "Sample active", signal: "Sample", altitude: 150, speed: 40, flightTime: 35, cameraOn: true, gpsConnected: true });

    return (
        <div className="panel-dark">
            <div className="panel-title"><span>SAMPLE DRONE DETAILS</span><button className="panel-title-link" type="button" onClick={onViewAll}>View All ›</button></div>
            <div className="panel-top-row">
                <div className="panel-top-item"><span className="panel-top-label">Drone ID</span><span className="panel-top-value">{drone.id} ({drone.type})</span></div>
                <div className="panel-top-item panel-top-right"><span className="panel-top-label">Battery</span><span className="panel-top-value">{drone.battery}%</span></div>
            </div>
            <div className="panel-visual"><img src={droneDetailImage} alt="Surveillance drone" /></div>
            <div className="panel-status-row"><span>Status: {drone.status} · sample only</span><span>Telemetry unavailable</span></div>
            <div className="panel-stats-grid">
                <div className="panel-stat"><span className="panel-stat-label">Altitude</span><span className="panel-stat-value">{drone.altitude} m</span></div>
                <div className="panel-stat"><span className="panel-stat-label">Speed</span><span className="panel-stat-value">{drone.speed} km/h</span></div>
                <div className="panel-stat"><span className="panel-stat-label">Flight Time</span><span className="panel-stat-value">{drone.flightTime} min</span></div>
                <div className="panel-stat"><span className="panel-stat-label">Camera</span><span className="panel-stat-value panel-stat-green">{drone.cameraOn ? "ON" : "OFF"}</span></div>
                <div className="panel-stat"><span className="panel-stat-label">GPS</span><span className="panel-stat-value panel-stat-green">{drone.gpsConnected ? "Connected" : "Lost"}</span></div>
            </div>
        </div>
    );
}

export default DroneDetails;
