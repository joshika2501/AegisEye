import { alerts } from "./alertsData";

function AiAlerts({ onViewAll }) {
    return (
        <div className="panel-dark">

            <div className="panel-title">
                <span>SAMPLE ALERTS</span>
                <button className="panel-title-link" type="button" onClick={onViewAll}>View All ›</button>
            </div>

            <div className="alerts-list">
                {alerts.map((alert) => (
                    <button className="alert-item" type="button" key={alert.id} onClick={onViewAll} aria-label={`View sample alert: ${alert.title}`}>

                        <div className={`alert-icon alert-icon-${alert.severity}`}>
                            {alert.icon}
                        </div>

                        <div className="alert-text">
                            <span className="alert-title">{alert.title}</span>
                            <span className="alert-meta">{alert.meta}</span>
                        </div>

                        <div className="alert-right">
                            <span className="alert-time">{alert.time}</span>
                            <span className={`alert-severity alert-severity-${alert.severity}`}>
                                {alert.severity === "high" ? "High" : "Medium"} ›
                            </span>
                        </div>

                    </button>
                ))}
            </div>

        </div>
    );
}

export default AiAlerts;
