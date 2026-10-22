import StatCard from "./StatCard";
import ViewModeToggle from "./ViewModeToggle";
import droneStatImage from "../../assets/dashboard/drone-stat.png";
import cameraStatImage from "../../assets/dashboard/camera-stat.png";

function StatsBar({ demo = true, onNavigate, onModeChange }) {
    const unavailable = demo ? "Sample dataset · not live" : "No connected data source";
    return <div className="stats-bar">
        <div className="stats-cards">
            <StatCard icon={<img src={droneStatImage} alt="" />} value="1" label="Sample drone" subtext={unavailable} color="blue" onClick={() => onNavigate("devices")} />
            <StatCard icon={<img src={cameraStatImage} alt="" />} value="1" label="Sample camera" subtext={unavailable} color="green" onClick={() => onNavigate("videos")} />
            <StatCard icon="!" value="—" label="Active alerts" subtext="No alert service connected" color="amber" onClick={() => onNavigate("alerts")} />
            <StatCard icon="▣" value="0" label="Monitoring blocks" subtext="Create a block to begin" color="purple" onClick={() => onNavigate("blocks")} />
        </div>
            <ViewModeToggle onChange={onModeChange} />
    </div>;
}

export default StatsBar;
