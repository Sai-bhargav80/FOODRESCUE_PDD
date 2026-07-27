'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const getIconUrl = (value: any) => (typeof value === 'string' ? value : value?.src ?? '');

const defaultIcon = L.icon({
  iconRetinaUrl: getIconUrl(markerIcon2x),
  iconUrl: getIconUrl(markerIcon),
  shadowUrl: getIconUrl(markerShadow),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapPreview() {
  useEffect(() => {
    if (typeof L !== 'undefined') {
      L.Marker.prototype.options.icon = defaultIcon;
    }
  }, []);

  return (
    <MapContainer
      className="h-full w-full"
      center={[37.7749, -122.4194]}
      zoom={13}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[37.7749, -122.4194]}>
        <Popup>
          Pickup location preview. Adjust your address when submitting the listing.
        </Popup>
      </Marker>
    </MapContainer>
  );
}
