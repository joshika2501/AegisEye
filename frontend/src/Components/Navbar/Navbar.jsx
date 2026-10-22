import { useState } from "react";
import { readDemoStore } from "../../demoData";
import { zoneOverview } from "../ZoneOverview/zoneOverviewData";

const demoDevices = [
    { id: "DEMO-UAV-01", name: "Demo patrol drone", kind: "Drone" },
    { id: "DEMO-CAM-01", name: "Demo traffic camera", kind: "CCTV" },
];
function BellIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>; }
function MailIcon() { return <svg className="communication-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="1.8" /><path d="m4.5 7 7.5 5.7L19.5 7" /></svg>; }
function GearIcon() { return <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.5-1.9-3.3-2.4 1a7.8 7.8 0 0 0-1.7-1L15 3.6h-4l-.4 2.6a7.8 7.8 0 0 0-1.7 1l-2.4-1-1.9 3.3 2 1.5a7.7 7.7 0 0 0 0 2l-2 1.5 1.9 3.3 2.4-1a7.8 7.8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.8 7.8 0 0 0 1.7-1l2.4 1 1.9-3.3-2-1.5Z" /><circle cx="12" cy="12" r="3" /></svg>; }
function AlertIcon() { return <svg className="emergency-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 16h14l-1.1-5a6 6 0 0 0-11.8 0L5 16Z" /><path d="M4 19h16M12 2v2M5 5l1.4 1.4M19 5l-1.4 1.4M2 11h2M20 11h2" /></svg>; }

function Navbar({ theme, setTheme, demo, onExitDemo, onNavigate }) {
    const [query, setQuery] = useState("");
    const [popover, setPopover] = useState("");
    const store = readDemoStore();
    const devices = store.devices.length ? store.devices : demoDevices;
    const searchable = [
        ...devices.map((device) => ({ ...device, route: device.kind === "CCTV" ? "videos" : "devices", typeLabel: device.kind })),
        ...store.blocks.map((block) => ({ ...block, route: "blocks", typeLabel: "Monitoring block" })),
        ...zoneOverview.map((zone) => ({ id: zone.id, name: zone.name, route: "zones", typeLabel: "Sample zone" })),
        { id: "karnataka", name: "Karnataka operations map", route: "map", typeLabel: "Map" },
    ];
    const matches = query.trim() ? searchable.filter((item) => `${item.name} ${item.id} ${item.typeLabel}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6) : [];

    const searchKeyDown = (event) => {
        if (event.key === "Escape") { setQuery(""); event.currentTarget.blur(); }
        if (event.key === "Enter" && matches[0]) { onNavigate(matches[0].route); setQuery(""); }
    };
    const selectResult = (item) => { onNavigate(item.route); setQuery(""); };

    return <header className="navbar" aria-label="Application toolbar">
        <div className="navbar-search-wrap">
            <div className="navbar-search"><span aria-hidden="true">⌕</span><input type="search" className="navbar-search-input" placeholder="Search for zones, blocks, cameras, drones..." aria-label="Search configured resources" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={searchKeyDown} aria-expanded={Boolean(query.trim())} aria-controls="navbar-search-results" /></div>
            {query.trim() && <div className="search-results" id="navbar-search-results" role="listbox" aria-label="Search results">
                {matches.length ? matches.map((item) => <button type="button" role="option" aria-selected="false" key={`${item.route}-${item.id}`} onClick={() => selectResult(item)}><span className="search-result-icon">{item.typeLabel === "Drone" ? "✣" : item.typeLabel === "CCTV" ? "▣" : "⌕"}</span><span><strong>{item.name}</strong><small>{item.id} · {item.typeLabel}</small></span></button>) : <p>No configured resources match “{query}”.</p>}
            </div>}
        </div>
        <div className="navbar-actions">
            {demo && <span className="demo-session-pill">DEMO · SAMPLE DATA</span>}
            <button className="emergency-alert-btn" type="button" onClick={() => setPopover(popover === "emergency" ? "" : "emergency")}><AlertIcon /><span>Emergency Alert</span></button>
            <button className="navbar-icon-btn notification-button" type="button" aria-label="Open alerts" title="Alerts" onClick={() => onNavigate("alerts")}><BellIcon />{demo && <span className="icon-badge" aria-hidden="true">!</span>}</button>
            <button className="navbar-icon-btn communication-icon-button" type="button" aria-label="Open communications status" title="Communications" aria-expanded={popover === "communications"} onClick={() => setPopover(popover === "communications" ? "" : "communications")}><MailIcon /></button>
            <button className="navbar-icon-btn settings-icon-button" type="button" aria-label="Open settings" title="Settings" onClick={() => onNavigate("settings")}><GearIcon /></button>
            <button className="navbar-icon-btn theme-icon-button" type="button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☼" : "◐"}</button>
            <div className="navbar-divider" />
            <button className="navbar-profile" type="button" aria-expanded={popover === "profile"} onClick={() => setPopover(popover === "profile" ? "" : "profile")}>
                <span className="navbar-avatar" aria-hidden="true">◉</span><span className="navbar-profile-text"><span className="navbar-profile-name">{demo ? "Demo Operator" : "Operator 01"}</span><span className="navbar-profile-role">{demo ? "Sample workspace" : "Control Center"}</span></span><span aria-hidden="true">⌄</span>
            </button>
            {popover && <div className="toolbar-popover" role="dialog" aria-label={popover === "profile" ? "User menu" : "Status"}>
                <button className="toolbar-popover-close" type="button" aria-label="Close panel" onClick={() => setPopover("")}>×</button>
                {popover === "profile" && <><strong>{demo ? "Demo Operator" : "Operator 01"}</strong><p>{demo ? "Demo mode · changes isolated to this browser" : "Authentication provider is not connected"}</p><button className="quiet-button" type="button" onClick={() => { setPopover(""); onNavigate("settings"); }}>Preferences</button>{demo && <button className="quiet-button" type="button" onClick={onExitDemo}>Exit demo</button>}</>}
                {popover === "communications" && <><strong>Communications unavailable</strong><p>No messaging or mail integration is connected.</p></>}
                {popover === "emergency" && <><strong>Emergency alert unavailable</strong><p>No alert dispatch endpoint is connected. No message has been sent.</p><button className="quiet-button" type="button" onClick={() => { setPopover(""); onNavigate("alerts"); }}>View alert status</button></>}
            </div>}
        </div>
        {demo && <button className="quiet-button mobile-exit-demo" type="button" onClick={onExitDemo}>Exit demo</button>}
    </header>;
}

export default Navbar;
