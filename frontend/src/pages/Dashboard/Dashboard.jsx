import { useCallback, useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./dashboard-api.css";

const OPEN_STATUSES = new Set(["NEW", "VERIFIED", "RESPONDING"]);
const NEXT_STATUSES = {
  NEW: ["VERIFIED", "FALSE_ALERT"],
  VERIFIED: ["RESPONDING", "FALSE_ALERT"],
  RESPONDING: ["RESOLVED"],
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function Dashboard() {
  const [data, setData] = useState({ incidents: [], alerts: [], cameras: [], health: null });
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [incidents, alerts, cameras, health] = await Promise.all([
        api.get("/api/incidents", { params: { page: 0, size: 100, ...(statusFilter && { status: statusFilter }), ...(severityFilter && { severity: severityFilter }) } }),
        api.get("/api/alerts", { params: { page: 0, size: 100 } }),
        api.get("/api/cameras"),
        api.get("/api/health"),
      ]);
      setData({ incidents: incidents.data.items ?? [], alerts: alerts.data.items ?? [], cameras: cameras.data ?? [], health: health.data });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? requestError.message ?? "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, severityFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  const openIncident = async (incident) => {
    setSelected(incident);
    setNote("");
    try {
      const response = await api.get(`/api/incidents/${incident.id}`);
      setSelected(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not load incident details.");
    }
  };

  const changeStatus = async (status) => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/api/incidents/${selected.id}/status`, { status, note: note.trim() || null });
      setSelected(null);
      setNote("");
      await refresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? "Could not update incident status.");
    } finally {
      setSaving(false);
    }
  };

  const activeIncidents = data.incidents.filter((item) => OPEN_STATUSES.has(item.status)).length;
  const criticalAlerts = data.alerts.filter((item) => item.severity === "CRITICAL").length;
  const cameraCount = data.cameras.length;

  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main-content">
        <Navbar onRefresh={refresh} />
        <div className="dashboard-content api-dashboard" id="overview">
          {error && <div className="api-message api-error" role="alert">{error}</div>}
          <div className="api-toolbar"><div><h1>Operations dashboard</h1><p>Live records from the AegisSight backend API</p></div><button onClick={refresh}>Refresh</button></div>
          <section className="api-stats" aria-label="Dashboard summary">
            <article><span>Registered cameras</span><strong>{cameraCount}</strong></article>
            <article><span>Incidents</span><strong>{data.incidents.length}</strong></article>
            <article><span>Open incidents</span><strong>{activeIncidents}</strong></article>
            <article><span>Critical alerts</span><strong>{criticalAlerts}</strong></article>
          </section>
          {loading ? <p className="api-muted">Loading backend data…</p> : (
            <div className="api-columns">
              <section className="api-panel" id="incidents">
                <header className="api-incident-header"><h2>Incidents</h2><div><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{["NEW", "VERIFIED", "RESPONDING", "RESOLVED", "FALSE_ALERT"].map((status) => <option key={status}>{status}</option>)}</select><select aria-label="Filter by severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}><option value="">All severities</option>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((severity) => <option key={severity}>{severity}</option>)}</select><span>{data.incidents.length} shown</span></div></header>
                {data.incidents.length === 0 ? <p className="api-muted">No incidents returned by the backend.</p> : <div className="api-table-wrap"><table><thead><tr><th>Incident</th><th>Severity</th><th>Status</th><th>Source</th><th>Created</th><th /></tr></thead><tbody>{data.incidents.map((incident) => <tr key={incident.id}><td><strong>{incident.title}</strong><small>{incident.incidentCode} · {incident.eventType}</small></td><td>{incident.severity}</td><td>{incident.status}</td><td>{incident.sourceId ?? "—"}</td><td>{formatDate(incident.createdAt)}</td><td><button className="api-small-button" onClick={() => openIncident(incident)}>Details</button></td></tr>)}</tbody></table></div>}
              </section>
              <section className="api-panel" id="alerts">
                <header><h2>Alerts</h2><span>{data.alerts.length} recent</span></header>
                {data.alerts.length === 0 ? <p className="api-muted">No alerts returned by the backend.</p> : <div className="api-alert-list">{data.alerts.map((alert) => <article key={alert.id}><div><strong>{alert.title}</strong><p>{alert.message || alert.locationLabel || alert.sourceId}</p></div><span className={`api-badge severity-${String(alert.severity).toLowerCase()}`}>{alert.severity}</span><small>{formatDate(alert.createdAt)}</small></article>)}</div>}
              </section>
              <section className="api-panel" id="cameras">
                <header><h2>Registered cameras</h2><span>Metadata only</span></header>
                {data.cameras.length === 0 ? <p className="api-muted">No cameras registered. Register a source before sending AI detections.</p> : <div className="api-camera-list">{data.cameras.map((camera) => <article key={camera.id}><span className="api-camera-icon">{camera.platform === "UAV_CAMERA" ? "✈" : "◉"}</span><div><strong>{camera.name}</strong><small>{camera.id} · {camera.platform} · {camera.locationLabel || "Location not set"}</small></div><span className={camera.active ? "api-active" : "api-inactive"}>{camera.active ? "Active" : "Inactive"}</span></article>)}</div>}
              </section>
              <section className="api-panel api-health-panel"><header><h2>Backend health</h2></header><p><span className={data.health?.status === "UP" ? "api-active" : "api-inactive"}>● {data.health?.status ?? "Unknown"}</span></p><small>Health endpoint reports service and database readiness. Camera metadata does not include streaming or telemetry.</small></section>
            </div>
          )}
        </div>
      </main>
      {selected && <div className="api-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="api-modal" role="dialog" aria-modal="true" aria-labelledby="incident-detail-title"><header><div><h2 id="incident-detail-title">{selected.title}</h2><p>{selected.incidentCode} · {selected.eventType}</p></div><button onClick={() => setSelected(null)} aria-label="Close">×</button></header><dl><dt>Status</dt><dd>{selected.status}</dd><dt>Severity / risk</dt><dd>{selected.severity} / {selected.riskScore ?? "—"}</dd><dt>Source / location</dt><dd>{selected.sourceId ?? "—"} · {selected.locationLabel ?? "Location not set"}</dd><dt>Summary</dt><dd>{selected.summary || "No summary provided."}</dd><dt>Latest status note</dt><dd>{selected.statusNote || "No note."}</dd><dt>Created</dt><dd>{formatDate(selected.createdAt)}</dd></dl><label className="api-note-label">Status update note<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} /></label><div className="api-modal-actions"><button onClick={() => setSelected(null)}>Close</button>{(NEXT_STATUSES[selected.status] ?? []).map((status) => <button key={status} disabled={saving} onClick={() => changeStatus(status)}>{saving ? "Saving…" : `Mark ${status.replace("_", " ")}`}</button>)}</div></section></div>}
    </div>
  );
}

export default Dashboard;
