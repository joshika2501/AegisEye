function MapFilters({ region, onRegionChange, deviceType, onDeviceTypeChange, blockId, onBlockChange, blocks, range, onRangeChange }) {
    return <div className="map-filters" aria-label="Map filters">
        <div className="map-filter"><label htmlFor="map-region">Select Region</label><select id="map-region" value={region} onChange={(event) => onRegionChange(event.target.value)}><option value="karnataka">Karnataka, India</option><option value="bengaluru">Bengaluru</option></select></div>
        <div className="map-filter"><label htmlFor="map-device-type">Device Type</label><select id="map-device-type" value={deviceType} onChange={(event) => onDeviceTypeChange(event.target.value)}><option value="all">All resources</option><option value="Drone">Drones</option><option value="CCTV">CCTV cameras</option></select></div>
        <div className="map-filter"><label htmlFor="map-block">Monitoring Block</label><select id="map-block" value={blockId} onChange={(event) => onBlockChange(event.target.value)}><option value="all">All blocks</option>{blocks.map((block) => <option key={block.id} value={block.id}>{block.name}</option>)}</select></div>
        <div className="map-filter"><label htmlFor="map-range">Map range</label><select id="map-range" value={range} onChange={(event) => onRangeChange(event.target.value)}><option value="overview">State overview</option><option value="regional">Regional view</option><option value="close">Close view</option></select></div>
    </div>;
}

export default MapFilters;
