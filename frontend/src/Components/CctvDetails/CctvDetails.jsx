import { useState } from "react";
import cctvDetailImage from "../../assets/dashboard/cctv-detail.png";

function CctvDetails({ onViewAll }) {
    const [camera] = useState({ id: "DEMO-CAM-01", zone: "Karnataka", block: "Unassigned", status: "Sample configured", resolution: "1080p · sample", nightVision: true, coverage: 120, storageLeft: 68 });

    return (
        <div className="panel-dark">
            <div className="panel-title"><span>SAMPLE CCTV DETAILS</span><button className="panel-title-link" type="button" onClick={onViewAll}>View All ›</button></div>
            <div className="panel-top-row">
                <div className="panel-top-item"><span className="panel-top-label">Camera ID</span><span className="panel-top-value">{camera.id}</span></div>
                <div className="panel-top-item panel-top-right"><span className="panel-top-label">Zone</span><span className="panel-top-value">{camera.zone} › {camera.block}</span></div>
            </div>
            <div className="panel-visual"><img src={cctvDetailImage} alt="CCTV camera" /></div>
            <div className="panel-status-row"><span>Status: {camera.status} · sample only</span><button type="button" className="live-feed-btn" onClick={onViewAll}>Live Feed</button></div>
            <div className="panel-stats-grid panel-stats-grid-4">
                <div className="panel-stat"><span className="panel-stat-label">Resolution</span><span className="panel-stat-value">{camera.resolution}</span></div>
                <div className="panel-stat"><span className="panel-stat-label">Night Vision</span><span className="panel-stat-value panel-stat-green">{camera.nightVision ? "ON" : "OFF"}</span></div>
                <div className="panel-stat"><span className="panel-stat-label">Coverage</span><span className="panel-stat-value">{camera.coverage}°</span></div>
                <div className="panel-stat"><span className="panel-stat-label">Storage Left</span><span className="panel-stat-value">{camera.storageLeft}%</span></div>
            </div>
        </div>
    );
}

export default CctvDetails;
