import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Destination {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  notes?: string;
  category?: string;
}

interface InteractiveMapProps {
  destinations: Destination[];
  onMapClick?: (lat: number, lng: number) => void;
  onDestinationClick?: (destination: Destination) => void;
  isAddingMode?: boolean;
  pendingLatLng?: { lat: number; lng: number };
}

function MapClickHandler({ onMapClick, isAddingMode }: { onMapClick?: (lat: number, lng: number) => void; isAddingMode?: boolean }) {
  useMapEvents({
    click: (e) => {
      if (isAddingMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function InteractiveMap({
  destinations,
  onMapClick,
  onDestinationClick,
  isAddingMode = false,
  pendingLatLng,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Default center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Calculate map bounds based on destinations
  const getMapBounds = () => {
    if (destinations.length === 0) return null;
    
    const bounds = L.latLngBounds(
      destinations.map(dest => [dest.latitude, dest.longitude])
    );
    return bounds;
  };

  useEffect(() => {
    const bounds = getMapBounds();
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [destinations]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} isAddingMode={isAddingMode} />
        
        {isAddingMode && pendingLatLng && (
          <Marker position={[pendingLatLng.lat, pendingLatLng.lng]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">New destination</h4>
                <p className="text-sm text-gray-600 mt-1">Finish details in the form to save.</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {destinations.map((destination) => (
          <Marker
            key={destination._id}
            position={[destination.latitude, destination.longitude]}
            eventHandlers={{
              click: () => onDestinationClick?.(destination),
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{destination.name}</h4>
                {destination.category && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {destination.category}
                  </span>
                )}
                {destination.notes && (
                  <p className="text-sm text-gray-600 mt-2">{destination.notes}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {isAddingMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-10">
          Click on the map to add a destination
        </div>
      )}
    </div>
  );
}