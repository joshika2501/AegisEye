function DashboardInsights({ onViewAlerts }) {
    return <>
        <section className="insight-panel">
            <header><div><h2>Crowd density</h2><span>Last 24 hours</span></div><span className="sample-label">NO AI FEED</span></header>
            <div className="insight-empty"><span className="empty-chart-icon">⌁</span><strong>History unavailable</strong><p>Connect the AI detections service to see verified crowd trends.</p></div>
        </section>
        <section className="insight-panel">
            <header><div><h2>Recent zone activity</h2><span>Event stream</span></div><button type="button" onClick={onViewAlerts}>View all</button></header>
            <div className="insight-empty"><strong>No verified events</strong><p>Recent activity will appear when the alerts service is connected.</p></div>
        </section>
    </>;
}

export default DashboardInsights;
