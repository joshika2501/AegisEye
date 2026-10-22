import { useState } from "react";

function ViewModeToggle({ onChange }) {
    const [mode, setMode] = useState("surveillance");

    return (
        <div className="view-mode-card">

            <span className="view-mode-label">View Mode</span>

            <div className="view-mode-toggle">
                <button
                    className={`view-mode-btn ${mode === "surveillance" ? "active" : ""}`}
                    aria-pressed={mode === "surveillance"}
                    onClick={() => { setMode("surveillance"); onChange?.("surveillance"); }}
                >
                    SURVEILLANCE
                </button>

                <button
                    className={`view-mode-btn ${mode === "monitoring" ? "active" : ""}`}
                    aria-pressed={mode === "monitoring"}
                    onClick={() => { setMode("monitoring"); onChange?.("monitoring"); }}
                >
                    MONITORING
                </button>
            </div>

        </div>
    );
}

export default ViewModeToggle;
