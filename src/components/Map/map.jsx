import React, { useEffect, useRef } from 'react';
import './Map.css';

const Map = ({ pins, onMapClick, mapRef }) => {
  const mapContainerRef = useRef(null);
  
  useEffect(() => {
    // Initialize map
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add click event
      map.on('click', (e) => {
        onMapClick(e.latlng);
      });
      
      mapRef.current = map;
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    // Add markers for pins
    if (mapRef.current) {
      // Clear existing markers
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
      
      // Add new markers
      pins.forEach(pin => {
        const marker = L.marker(pin.position).addTo(mapRef.current);
        
        let iconColor = 'blue';
        if (pin.type === 'visited') iconColor = 'green';
        if (pin.type === 'planning') iconColor = 'orange';
        
        marker.setIcon(
          L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        );
        
        marker.bindPopup(`
          <strong>${pin.locationName}</strong><br>
          <span class="pin-type-${pin.type}">${pin.type === 'visited' ? 'Visited' : 'Planning to Visit'}</span><br>
          ${pin.notes}<br>
          <em>Added on ${pin.date}</em>
        `);
      });
    }
  }, [pins]);
  
  return (
    <div className="map">
      <div ref={mapContainerRef} className="map-container"></div>
      <div className="map-instructions">
        <i className="fas fa-info-circle"></i> Click on the map to add a new destination
      </div>
    </div>
  );
};

export default Map;
