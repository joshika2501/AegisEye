import { useEffect, useState } from "react";

function SystemStatus({ demo }) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return <section className="system-status" aria-label="System status">
        <header className="system-status-header"><strong className="system-status-title">System Status</strong></header>
        <div className="overall-status overall-offline"><span className="red-dot" /><span className="overall-status-text">{demo ? "Demo · services not connected" : "Status unavailable"}</span></div>
        <div className="status-divider" />
        {["Network", "Drones", "CCTV’s", "Server"].map((label) => <div className="status-row" key={label}><span className="status-label">{label}</span><span className="status-info offline"><span className="status-dot">●</span><span className="status-text">Unavailable</span></span></div>)}
        <div className="status-divider" />
        <div className="status-info"><span aria-hidden="true">▦</span><span>{now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
        <div className="status-info"><span aria-hidden="true">◷</span><span>{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span></div>
    </section>;
}

export default SystemStatus;
