function StatCard({ icon, value, label, subtext, color, onClick }) {
    return (
        <button type="button" className={`stat-card${onClick ? " stat-card-action" : ""}`} onClick={onClick} disabled={!onClick}>

            <div className={`stat-icon stat-icon-${color}`}>
                <span>{icon}</span>
            </div>

            <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
                <span className="stat-subtext">{subtext}</span>
            </div>

        </button>
    );
}

export default StatCard;
