'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet 기본 마커 아이콘 설정 (Next.js 환경에서 이미지가 깨지는 현상 방지)
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type Place = {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  visit_date: string;
  day_number: number;
  activities: string;
};

type Course = {
  id: number;
  name: string;
  color: string;
  places: Place[];
};

export default function MapView({ course }: { course: Course }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }} />;

  const centerLat = course.places.length > 0 ? course.places[0].lat : 48.8566;
  const centerLng = course.places.length > 0 ? course.places[0].lng : 2.3522;
  const positions: [number, number][] = course.places.map(p => [p.lat, p.lng]);

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={course.id === 1 ? 13 : 8} // 파리는 13, 렌터카 이동은 8
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {course.places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ padding: '5px' }}>
                <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', color: '#333' }}>{place.name}</h3>
                <p style={{ margin: '0 0 5px', fontSize: '0.9rem', color: '#666' }}>
                  <strong>날짜:</strong> {new Date(place.visit_date).toLocaleDateString()} (Day {place.day_number})
                </p>
                <p style={{ margin: '0 0 5px', fontSize: '0.95rem', color: '#444' }}>{place.description}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}><strong>추천 활동:</strong> {place.activities}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {positions.length > 1 && (
          <Polyline positions={positions} color={course.color} weight={4} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
}
