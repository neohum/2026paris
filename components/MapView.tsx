'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 기본 마커
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 커스텀 DIV 아이콘 (이모지 기반)
const getIcon = (type?: string) => {
  if (type === 'accommodation') {
    return L.divIcon({
      className: '',
      html: '<div style="font-size: 24px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">🏨</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  } else if (type === 'recommended') {
    return L.divIcon({
      className: '',
      html: '<div style="font-size: 24px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">🌟</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }
  return customIcon;
};

// 핀 추가용 아이콘
const newLocationIcon = L.divIcon({
  className: '',
  html: '<div style="font-size: 24px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid red; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; animation: bounce 1s infinite alternate;">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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
  place_type?: string;
};

type Course = {
  id: number;
  name: string;
  color: string;
  places: Place[];
};

// 지도 클릭 이벤트 핸들러
function MapClickRecorder({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapView({ 
  course, 
  onMapClick, 
  newLocation 
}: { 
  course: Course; 
  onMapClick?: (lat: number, lng: number) => void;
  newLocation?: { lat: number, lng: number } | null;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height: '600px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }} />;

  const centerLat = course.places.length > 0 ? course.places[0].lat : 48.8566;
  const centerLng = course.places.length > 0 ? course.places[0].lng : 2.3522;
  // attraction 타입만 선으로 연결
  const positions: [number, number][] = course.places
    .filter(p => !p.place_type || p.place_type === 'attraction')
    .map(p => [p.lat, p.lng]);

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      
      {/* 맵 클릭 안내 오버레이 레이블 */}
      {onMapClick && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', pointerEvents: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          👆 지도 위를 클릭하여 원하는 위치를 선택하세요
        </div>
      )}

      <MapContainer 
        key={course.id}
        center={[centerLat, centerLng]} 
        zoom={course.id === 1 ? 13 : 8} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapClickRecorder onMapClick={onMapClick} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {course.places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            icon={getIcon(place.place_type)}
          >
            <Popup>
              <div style={{ padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', flexWrap: 'wrap' }}>
                  {place.place_type === 'accommodation' && <span style={{ background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>숙소</span>}
                  {place.place_type === 'recommended' && <span style={{ background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>유저 추천</span>}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ margin: 0, fontSize: '1.2rem', color: '#0ea5e9', textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer' }}
                    title="구글 지도 검색"
                  >
                    {place.name} 🔗
                  </a>
                </div>
                <p style={{ margin: '0 0 5px', fontSize: '0.9rem', color: '#666' }}>
                  <strong>날짜:</strong> {place.visit_date ? new Date(place.visit_date).toLocaleDateString() : '지정안됨'} (Day {place.day_number})
                </p>
                <p style={{ margin: '0 0 5px', fontSize: '0.95rem', color: '#444' }}>{place.description}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}><strong>추천 활동:</strong> {place.activities}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 새 마커 추가 시 임시 핀 */}
        {newLocation && (
          <Marker position={[newLocation.lat, newLocation.lng]} icon={newLocationIcon}>
            <Popup>여기에 장소를 추가합니다 추가하기 폼을 작성해주세요!</Popup>
          </Marker>
        )}

        {positions.length > 1 && (
          <Polyline positions={positions} color={course.color} weight={4} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
}
