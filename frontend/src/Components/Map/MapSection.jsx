import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEMO_STORAGE_KEY } from "../../demoData";
import MapFilters from "./MapFilters";

const initialDevices = [
  { id: "DEMO-UAV-01", name: "Demo patrol drone", kind: "Drone", lat: 12.9716, lng: 77.5946, status: "Sample" },
  { id: "DEMO-CAM-01", name: "Demo traffic camera", kind: "CCTV", lat: 12.9352, lng: 77.6245, status: "Sample" },
];
const initialBlocks = [];
const droneGlyph = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="4.5" cy="4.5" r="2.5"/><circle cx="19.5" cy="4.5" r="2.5"/><circle cx="4.5" cy="19.5" r="2.5"/><circle cx="19.5" cy="19.5" r="2.5"/><path d="m10 10-3.8-3.8M14 10l3.8-3.8M10 14l-3.8 3.8M14 14l3.8 3.8M9 10h6l1.5 5h-9L9 10ZM12 15v2"/></svg>';
const cctvGlyph = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7.5h11.5l3 2.4v4.2l-3 2.4H3z"/><path d="M17.5 9.2h2.2l1.8 2.8-1.8 2.8h-2.2M8 16.5v2.7M5.5 19.2h5M10.5 16.5v2.7"/><circle cx="18.5" cy="12" r=".7"/></svg>';
const markerGlyph = (kind) => kind === "Drone" ? droneGlyph : cctvGlyph;
const icon = (kind) => L.divIcon({ className: "device-marker-wrap", html: `<span class="device-marker ${kind.toLowerCase()}">${markerGlyph(kind)}</span>`, iconSize: [30, 30], iconAnchor: [15, 15] });

function LocationPicker({ enabled, onPick }) {
  useMapEvents({ click: (event) => enabled && onPick({ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) }) });
  return null;
}
function FitBoundary({ feature }) {
  const map = useMap();
  useEffect(() => { if (feature) map.fitBounds(L.geoJSON(feature).getBounds(), { padding: [26, 26] }); }, [feature, map]);
  return null;
}
function MapZoomBridge({ onReady, boundary }) {
  const map = useMap();
  useEffect(() => {
    onReady({
      step: (step) => map.setZoom(Math.max(6, Math.min(18, map.getZoom() + step))),
      region: (region) => {
        if (region === "karnataka" && boundary) map.fitBounds(L.geoJSON(boundary).getBounds(), { padding: [26, 26] });
        else map.setView([12.9716, 77.5946], 12);
      },
      range: (range) => map.setZoom({ overview: 7, regional: 11, close: 14 }[range] || 11),
      fullscreen: () => {
        const element = map.getContainer();
        if (!document.fullscreenElement) element.requestFullscreen?.();
        else document.exitFullscreen?.();
      },
    });
  }, [map, onReady, boundary]);
  return null;
}

function MapSection({ onAddDevice, onSelectDevice, onSelectLocation, picking = false, compact = false }) {
  const [boundary, setBoundary] = useState(null);
  const [boundaryError, setBoundaryError] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [deviceType, setDeviceType] = useState("all");
  const [blockId, setBlockId] = useState("all");
  const [region, setRegion] = useState("karnataka");
  const [range, setRange] = useState("overview");
  const [layers, setLayers] = useState({ tiles: true, boundary: true, devices: true, blocks: true });
  const [devices] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY))?.devices || initialDevices; } catch { return initialDevices; }
  });
  const [blocks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY))?.blocks || initialBlocks; } catch { return initialBlocks; }
  });
  const mapOps = useRef({ step: () => {}, range: () => {}, fullscreen: () => {} });
  const center = [14.5, 76.2];
  const lineStyle = useMemo(() => ({ color: "#b45309", weight: 3, fillColor: "#fbbf24", fillOpacity: 0.08 }), []);
  const handleMapClick = (location) => { setClickedLocation(location); onSelectLocation?.(location); };
  const visibleDevices = devices.filter((device) => (deviceType === "all" || device.kind === deviceType) && (blockId === "all" || device.blockId === blockId));
  const setRangeOnMap = (value) => { setRange(value); mapOps.current.range(value); };
  const setRegionOnMap = (value) => { setRegion(value); mapOps.current.region(value); };

  useEffect(() => {
    const controller = new AbortController();
    fetch("/karnataka-boundary.json", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Boundary file unavailable"); return response.json(); })
      .then((data) => {
        const feature = data.features?.find((item) => item.properties?.shapeISO === "IN-KA");
        if (feature) setBoundary(feature); else setBoundaryError(true);
      })
      .catch((error) => { if (error.name !== "AbortError") setBoundaryError(true); });
    return () => controller.abort();
  }, []);

  return <section className="map-section operations-map" aria-label="Karnataka operations map">
    {!compact && <header className="map-heading"><div><p className="eyebrow">GEOGRAPHIC VIEW</p><h2>Karnataka operations map</h2><p className="muted">Street tiles © OpenStreetMap contributors · Boundary © geoBoundaries / DataMeet</p></div>
      <div className="map-heading-actions"><span className="sample-tag">SAMPLE DEVICES</span>{onAddDevice && <button className="primary-button" onClick={onAddDevice}>＋ Add resource</button>}</div>
    </header>}
    <MapFilters region={region} onRegionChange={setRegionOnMap} deviceType={deviceType} onDeviceTypeChange={setDeviceType} blockId={blockId} onBlockChange={setBlockId} blocks={blocks} range={range} onRangeChange={setRangeOnMap} />
    <div className="leaflet-map-wrap">
      {boundaryError && <div className="map-notice" role="status">State boundary could not load. The base map is still available.</div>}
      {picking && <div className="map-notice picking" role="status">Click the map to select coordinates.</div>}
      <MapContainer center={center} zoom={7} minZoom={6} maxZoom={18} scrollWheelZoom className="leaflet-map">
        {layers.tiles && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
        {layers.boundary && boundary && <><GeoJSON data={boundary} style={lineStyle} /><FitBoundary feature={boundary} /></>}
        <LocationPicker enabled onPick={handleMapClick} />
        <MapZoomBridge onReady={(operations) => { mapOps.current = operations; }} boundary={boundary} />
        {layers.devices && visibleDevices.map((device) => <Marker key={device.id} position={[device.lat, device.lng]} icon={icon(device.kind)} eventHandlers={{ click: () => onSelectDevice?.(device) }}><Popup><strong>{device.name}</strong><br />{device.id} · {device.kind}<br />{device.status}<br />{device.lat}, {device.lng}</Popup></Marker>)}
        {clickedLocation && <CircleMarker center={[clickedLocation.lat, clickedLocation.lng]} radius={7} pathOptions={{ color: "#fff", fillColor: "#2563eb", fillOpacity: 1, weight: 2 }}><Popup>Selected map location<br />{clickedLocation.lat}, {clickedLocation.lng}</Popup></CircleMarker>}
        {layers.blocks && blocks.filter((block) => blockId === "all" || block.id === blockId).map((block) => block.geometry && <GeoJSON key={block.id} data={block.geometry} style={{ color: block.color || "#2563eb", weight: 2, fillOpacity: 0.12 }} />)}
      </MapContainer>
      {!compact && onAddDevice && <button className="map-add-resource primary-button" onClick={onAddDevice}>＋ Add resource</button>}
      <div className="map-layer-panel"><strong>Layers</strong>
        {[{ key: "boundary", label: "Karnataka boundary" }, { key: "devices", label: "Configured devices" }, { key: "blocks", label: "Monitoring blocks" }, { key: "tiles", label: "Street map" }].map((layer) => <label key={layer.key}><input type="checkbox" checked={layers[layer.key]} onChange={(event) => setLayers({ ...layers, [layer.key]: event.target.checked })} />{layer.label}</label>)}
        <div className="layer-divider" />
        <strong className="map-key-title">Legend</strong><span className="map-key-row"><i className="legend-icon drone" dangerouslySetInnerHTML={{ __html: droneGlyph }} /> Drone · sample</span><span className="map-key-row"><i className="legend-icon camera" dangerouslySetInnerHTML={{ __html: cctvGlyph }} /> CCTV · sample</span><span className="map-key-row"><i className="legend-block" /> Monitoring block</span>
        <div className="layer-divider" /><span className="layer-unavailable">Vehicle heatmap · unavailable</span><span className="layer-unavailable">Camera coverage · unavailable</span>
      </div>
      <div className="map-controls"><button onClick={() => mapOps.current.step(1)} aria-label="Zoom in">+</button><button onClick={() => mapOps.current.step(-1)} aria-label="Zoom out">−</button><button onClick={() => mapOps.current.fullscreen()} aria-label="Toggle map fullscreen">⛶</button></div>
      {clickedLocation && <div className="map-location-readout" aria-live="polite">Selected location · {clickedLocation.lat}, {clickedLocation.lng}</div>}
    </div>
  </section>;
}

export default MapSection;
