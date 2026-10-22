import { useMemo, useState } from "react";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Navbar from "../../Components/Navbar/Navbar";
import MapSection from "../../Components/Map/MapSection";
import { DEMO_STORAGE_KEY, readDemoStore } from "../../demoData";
import ZoneOverview from "../../Components/ZoneOverview/ZoneOverview";
import { alerts } from "../../Components/Alerts/alertsData";

const labels = { map: "Karnataka map", videos: "CCTV monitoring", devices: "Device inventory", blocks: "Monitoring blocks", zones: "Zone overview", analytics: "Analytics", alerts: "Alerts", reports: "Reports", settings: "Settings", admin: "Users and administration" };
const seeded = [{ id: "DEMO-UAV-01", name: "Demo patrol drone", kind: "Drone", lat: 12.9716, lng: 77.5946, status: "Sample" }, { id: "DEMO-CAM-01", name: "Demo traffic camera", kind: "CCTV", lat: 12.9352, lng: 77.6245, status: "Sample" }];
const readStore = () => { const store = readDemoStore(); return { devices: store.devices.length ? store.devices : seeded, blocks: store.blocks }; };

function VideoView({ devices }) {
  const cameras = devices.filter((device) => device.kind === "CCTV");
  return <><header className="page-heading"><div><p className="eyebrow">VIDEO MONITORING</p><h1>CCTV video feeds</h1><p className="muted">No streaming endpoint is configured for this frontend.</p></div></header>
    <div className="video-feed-grid">{cameras.map((camera) => <article className="video-feed" key={camera.id}><div className="video-unavailable"><span aria-hidden="true">▣</span><strong>Stream unavailable</strong><small>No live stream connected</small></div><div className="video-feed-meta"><div><strong>{camera.name}</strong><p>{camera.id} · {camera.status} sample</p><p>{camera.lat}, {camera.lng}</p></div><span className="status-chip offline">NOT CONNECTED</span></div></article>)}{!cameras.length && <div className="empty-state">No cameras are configured. Add a CCTV camera in Device inventory.</div>}</div>
    <section className="content-panel"><div className="panel-heading"><div><h2>Detection statistics</h2><p>Detection API is not connected. No live or sample counts are presented as current events.</p></div></div><div className="stats-unavailable">Vehicle detections <strong>Unavailable</strong><span>Connect the AI events API to show verified counts and timestamps.</span></div></section>
  </>;
}

function ResourceForm({ kind, initial, onClose, onSave, devices }) {
  const [form, setForm] = useState(initial || { id: "", name: "", lat: "", lng: "" });
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    const id = form.id.trim(); const lat = Number(form.lat); const lng = Number(form.lng);
    if (!id || !form.name.trim()) return setError("Enter a name and unique identifier.");
    if (devices.some((device) => device.id !== initial?.id && device.id.toLowerCase() === id.toLowerCase())) return setError("That identifier already exists.");
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) return setError("Enter valid latitude and longitude values.");
    onSave({ id, name: form.name.trim(), kind, lat, lng, status: "Configured · demo" });
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form className="resource-modal" onSubmit={submit} aria-labelledby="resource-title"><div className="panel-heading"><div><p className="eyebrow">DEMO CONFIGURATION</p><h2 id="resource-title">{initial ? "Edit" : "Add"} {kind.toLowerCase()}</h2></div><button className="quiet-button" type="button" onClick={onClose} aria-label="Close">×</button></div><p className="muted">Saved to this browser only. No backend or device will be changed.</p>
    <label>Device name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Unique ID<input required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} /></label><div className="form-columns"><label>Latitude<input required type="number" step="any" min="-90" max="90" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label><label>Longitude<input required type="number" step="any" min="-180" max="180" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button className="quiet-button" type="button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save sample device</button></div></form></div>;
}

function OperationsPage({ page, theme, setTheme, demo, onExitDemo, onNavigate }) {
  const [data, setData] = useState(readStore);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState("Drone");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [blockForm, setBlockForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockFields, setBlockFields] = useState({ id: "", name: "", south: "", west: "", north: "", east: "" });
  const [blockError, setBlockError] = useState("");
  const addDevice = (device) => {
    const next = { ...data, devices: editing ? data.devices.map((item) => item.id === editing.id ? { ...device, blockId: editing.blockId } : item) : [...data.devices, device] };
    setData(next); localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)); setAdding(false);
    setEditing(null);
  };
  const assignBlock = (device, blockId) => {
    const next = { ...data, devices: data.devices.map((item) => item.id === device.id ? { ...item, blockId: blockId || undefined } : item) };
    setData(next); localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
  };
  const saveBlock = (event) => {
    event.preventDefault();
    const id = blockFields.id.trim();
    const n = { south: Number(blockFields.south), west: Number(blockFields.west), north: Number(blockFields.north), east: Number(blockFields.east) };
    if (!id || !blockFields.name.trim()) return setBlockError("Enter a block name and unique identifier.");
    if (data.blocks.some((block) => block.id !== editingBlock?.id && block.id.toLowerCase() === id.toLowerCase())) return setBlockError("That block identifier already exists.");
    if (Object.values(n).some((v) => !Number.isFinite(v)) || n.south < -90 || n.north > 90 || n.west < -180 || n.east > 180 || n.south >= n.north || n.west >= n.east) return setBlockError("Enter valid bounds: south < north and west < east.");
    const block = { id, name: blockFields.name.trim(), color: "#2563eb", geometry: { type: "Feature", properties: { id, name: blockFields.name.trim() }, geometry: { type: "Polygon", coordinates: [[[n.west,n.south],[n.east,n.south],[n.east,n.north],[n.west,n.north],[n.west,n.south]]] } } };
    const next = { ...data, blocks: editingBlock ? data.blocks.map((item) => item.id === editingBlock.id ? block : item) : [...data.blocks, block], devices: editingBlock && editingBlock.id !== id ? data.devices.map((device) => device.blockId === editingBlock.id ? { ...device, blockId: id } : device) : data.devices };
    setData(next); localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)); setBlockForm(false); setEditingBlock(null); setBlockFields({ id: "", name: "", south: "", west: "", north: "", east: "" }); setBlockError("");
  };
  const editBlock = (block) => {
    const ring = block.geometry.geometry.coordinates[0];
    setBlockFields({ id: block.id, name: block.name, south: String(Math.min(...ring.map((p) => p[1]))), west: String(Math.min(...ring.map((p) => p[0]))), north: String(Math.max(...ring.map((p) => p[1]))), east: String(Math.max(...ring.map((p) => p[0]))) });
    setEditingBlock(block); setBlockError(""); setBlockForm(true);
  };
  const removeBlock = (block) => {
    if (!window.confirm(`Delete sample block “${block.name}”?`)) return;
    const next = { ...data, blocks: data.blocks.filter((item) => item.id !== block.id), devices: data.devices.map((device) => device.blockId === block.id ? { ...device, blockId: undefined } : device) };
    setData(next); localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
  };
  const currentTitle = labels[page] || "Operations";
  const vehicles = useMemo(() => data.devices.filter((d) => d.kind === "CCTV"), [data.devices]);
  return <div className="dashboard"><Sidebar page={page} onNavigate={onNavigate} demo={demo} theme={theme} /><main className="main-content"><Navbar theme={theme} setTheme={setTheme} demo={demo} onExitDemo={onExitDemo} onNavigate={onNavigate} />{demo && <div className="demo-banner"><strong>Demo workspace</strong><span>Sample records only. Changes are isolated to browser storage.</span></div>}<div className="operations-content">
    {page === "map" && <MapSection onSelectDevice={setSelected} onAddDevice={() => { setKind("Drone"); setAdding(true); }} />}
    {page === "videos" && <VideoView devices={vehicles} />}
    {page === "devices" && <><header className="page-heading"><div><p className="eyebrow">RESOURCE MANAGEMENT</p><h1>Device inventory</h1><p className="muted">Configured coordinates are sample settings, not verified live positions.</p></div><div className="button-row"><button className="primary-button" onClick={() => { setKind("Drone"); setAdding(true); }}>＋ Add drone</button><button className="primary-button secondary" onClick={() => { setKind("CCTV"); setAdding(true); }}>＋ Add CCTV</button></div></header><div className="content-panel"><div className="device-table-wrap"><table className="device-table"><thead><tr><th>Device</th><th>Type</th><th>Identifier</th><th>Configured location</th><th>Block assignment</th><th>Status</th><th></th></tr></thead><tbody>{data.devices.map((device) => <tr key={device.id} onClick={() => setSelected(device)} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button,select")) { event.preventDefault(); setSelected(device); } }} tabIndex="0" aria-label={`Open details for ${device.name}`}><td><strong>{device.name}</strong></td><td>{device.kind}</td><td>{device.id}</td><td>{device.lat.toFixed(4)}, {device.lng.toFixed(4)}</td><td><select aria-label={`Assign ${device.name} to block`} value={device.blockId || ""} onClick={(e) => e.stopPropagation()} onChange={(e) => assignBlock(device,e.target.value)}><option value="">Unassigned</option>{data.blocks.map((block) => <option key={block.id} value={block.id}>{block.name}</option>)}</select></td><td><span className="status-chip offline">{device.status}</span></td><td><button className="quiet-button" onClick={(e) => { e.stopPropagation(); setEditing(device); setKind(device.kind); setAdding(true); }}>Edit</button></td></tr>)}</tbody></table></div><p className="muted">Control actions are unavailable because no device command service is connected.</p></div></>}
    {page === "blocks" && <><header className="page-heading"><div><p className="eyebrow">GEOGRAPHIC MANAGEMENT</p><h1>Monitoring blocks</h1><p className="muted">Demo rectangles are saved in this browser only; server persistence is not connected.</p></div><div className="button-row"><button className="quiet-button" onClick={() => onNavigate("map")}>Open map</button><button className="primary-button" onClick={() => { setEditingBlock(null); setBlockFields({ id: "", name: "", south: "", west: "", north: "", east: "" }); setBlockForm((show) => !show); }}>＋ Add block</button></div></header>{blockForm && <form className="content-panel block-form" onSubmit={saveBlock}><div className="form-columns"><label>Name<input required value={blockFields.name} onChange={(e) => setBlockFields({ ...blockFields, name: e.target.value })}/></label><label>Unique ID<input required value={blockFields.id} onChange={(e) => setBlockFields({ ...blockFields, id: e.target.value })}/></label><label>South latitude<input required type="number" step="any" value={blockFields.south} onChange={(e) => setBlockFields({ ...blockFields, south: e.target.value })}/></label><label>West longitude<input required type="number" step="any" value={blockFields.west} onChange={(e) => setBlockFields({ ...blockFields, west: e.target.value })}/></label><label>North latitude<input required type="number" step="any" value={blockFields.north} onChange={(e) => setBlockFields({ ...blockFields, north: e.target.value })}/></label><label>East longitude<input required type="number" step="any" value={blockFields.east} onChange={(e) => setBlockFields({ ...blockFields, east: e.target.value })}/></label></div>{blockError && <p className="form-error" role="alert">{blockError}</p>}<div className="modal-actions"><button className="quiet-button" type="button" onClick={() => { setBlockForm(false); setEditingBlock(null); }}>Cancel</button><button className="primary-button">{editingBlock ? "Update sample block" : "Save sample block"}</button></div></form>}<div className="content-panel">{data.blocks.length ? <div className="block-list">{data.blocks.map((block) => <article className="block-row" key={block.id}><div><strong>{block.name}</strong><p>{block.id} · rectangle · {data.devices.filter((device) => device.blockId === block.id).length} assigned devices</p></div><div className="button-row"><button className="quiet-button" onClick={() => onNavigate("map")}>View on map</button><button className="quiet-button" onClick={() => editBlock(block)}>Edit</button><button className="quiet-button" onClick={() => removeBlock(block)}>Delete</button></div></article>)}</div> : <div className="empty-state">No monitoring blocks configured. Add a sample rectangle to explore the block workflow.</div>}</div></>}
    {page === "zones" && <><header className="page-heading"><div><p className="eyebrow">ZONE SUMMARY · SAMPLE DATA</p><h1>Zone overview</h1><p className="muted">Zone statistics below are design samples; no zone analytics API is connected.</p></div><button className="quiet-button" onClick={() => onNavigate("map")}>Open map</button></header><ZoneOverview onViewAll={() => onNavigate("blocks")} /></>}
    {page === "alerts" && <><header className="page-heading"><div><p className="eyebrow">ALERTS · SAMPLE DATA</p><h1>Alert activity</h1><p className="muted">These sample alerts are not connected to an AI event service.</p></div></header><div className="content-panel"><div className="block-list">{alerts.map((alert) => <article className="block-row" key={alert.id}><div><strong>{alert.title}</strong><p>{alert.meta} · {alert.time}</p></div><span className={`status-chip ${alert.severity === "high" ? "alert-high" : "offline"}`}>{alert.severity.toUpperCase()}</span></article>)}</div></div></>}
    {page === "settings" && <><header className="page-heading"><div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1></div></header><div className="content-panel settings-panel"><div><strong>Appearance</strong><p>Choose the dashboard color theme. Your selection is saved in this browser.</p></div><div className="button-row"><button className="quiet-button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light mode</button><button className="quiet-button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark mode</button></div><div className="settings-divider"/><div><strong>Account</strong><p>{demo ? "Demo session · no production identity is connected." : "Authentication provider is not connected."}</p></div>{demo && <button className="quiet-button" onClick={onExitDemo}>Exit demo</button>}</div></>}
    {["analytics", "reports", "admin"].includes(page) && <><header className="page-heading"><div><p className="eyebrow">OPERATIONS</p><h1>{currentTitle}</h1></div></header><div className="content-panel empty-state"><strong>{page === "admin" ? "Administration is unavailable" : `${currentTitle} data is unavailable`}</strong><p>{page === "admin" ? "No authentication provider, roles, users API, or audit service is connected. This demo cannot grant admin privileges." : "Connect the corresponding backend service to display verified operational records."}</p></div></>}
  </div></main>{selected && <aside className="device-detail-drawer"><button className="quiet-button drawer-close" onClick={() => setSelected(null)} aria-label="Close details">×</button><p className="eyebrow">DEVICE DETAILS · SAMPLE</p><h2>{selected.name}</h2><dl><dt>Identifier</dt><dd>{selected.id}</dd><dt>Type</dt><dd>{selected.kind}</dd><dt>Configured coordinates</dt><dd>{selected.lat}, {selected.lng}</dd><dt>Status</dt><dd>{selected.status}</dd><dt>Device commands</dt><dd>Unavailable — no device integration</dd></dl>{selected.kind === "CCTV" ? <button className="quiet-button" onClick={() => onNavigate("videos")}>Open associated video feed</button> : <button className="quiet-button" onClick={() => onNavigate("devices")}>Manage drone configuration</button>}</aside>}{adding && <ResourceForm kind={kind} initial={editing || undefined} devices={data.devices} onClose={() => { setAdding(false); setEditing(null); }} onSave={addDevice} />}</div>;
}

export default OperationsPage;
