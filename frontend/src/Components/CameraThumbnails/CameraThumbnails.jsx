import { cameraThumbnails } from "./thumbnailsData";

function CameraThumbnails({ onNavigate }) {
    return (
        <div className="section-card">

            <div className="section-card-header">
                <span>Sample camera tiles</span>
                <span className="section-card-link">No streams connected</span>
            </div>

            <div className="thumbnail-grid">
                {cameraThumbnails.map((cam) => (
                    <button className="thumbnail-item" type="button" key={cam.id} onClick={() => onNavigate("videos")} aria-label={`Open sample video monitoring for ${cam.id}`}>
                        <div className="thumbnail-card">
                            <span>🎥</span>
                            <span className="thumbnail-live-tag">DEMO</span>
                        </div>
                        <span className="thumbnail-label">{cam.id}</span>
                    </button>
                ))}
            </div>

        </div>
    );
}

export default CameraThumbnails;
