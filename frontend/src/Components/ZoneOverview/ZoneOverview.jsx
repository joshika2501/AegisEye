import ZoneCard from "./ZoneCard";
import { zoneOverview } from "./zoneOverviewData";

function ZoneOverview({ onViewAll }) {
    return (
        <div className="section-card">

            <div className="section-card-header">
                <span>Zone Overview · sample</span>
                <button className="section-card-link" type="button" onClick={onViewAll}>View All ›</button>
            </div>

            <div className="zone-overview-grid">
                {zoneOverview.map((zone) => (
                    <ZoneCard key={zone.id} zone={zone} />
                ))}
            </div>

        </div>
    );
}

export default ZoneOverview;
