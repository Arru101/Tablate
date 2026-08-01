import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Pharmacy } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { calculateLiveTrafficEta } from '../../utils/trafficUtils';

interface Props {
  pharmacies: Pharmacy[];
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
}

export const InteractiveMap: React.FC<Props> = ({ pharmacies, onSelectPharmacy }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const { userLocation, filters } = useAppStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([userLocation.lat, userLocation.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng]);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (!markersGroup) return;
    markersGroup.clearLayers();

    // Add User Pin
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-5 w-5 bg-cyan-600 border-2 border-white shadow-md"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup(`<div class="p-1 font-bold text-xs">Your Current Emergency Location<br/><span class="font-normal text-slate-500">${userLocation.addressName}</span></div>`)
      .addTo(markersGroup);

    // Render Radius Circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }
    circleRef.current = L.circle([userLocation.lat, userLocation.lng], {
      color: '#0d9488',
      fillColor: '#14b8a6',
      fillOpacity: 0.1,
      radius: filters.radiusKm * 1000,
    }).addTo(map);

    // Add Pharmacy Markers with Live Traffic ETA & Exact Distance
    pharmacies.forEach((pharm) => {
      const traffic = calculateLiveTrafficEta(userLocation.lat, userLocation.lng, pharm.lat, pharm.lng);

      const pinColor = pharm.isOpenNow ? '#10b981' : '#94a3b8';
      const statusText = pharm.isOpenNow ? 'ONLINE' : 'OFFLINE';
      const destinationQuery = encodeURIComponent(`${pharm.name}, ${pharm.address}, ${pharm.city}, ${pharm.state} ${pharm.pincode}`);
      
      const pharmIcon = L.divIcon({
        className: 'custom-pharm-marker',
        html: `
          <div class="flex items-center justify-center px-2 py-1 rounded-xl bg-slate-900 text-white shadow-xl border-2 text-[11px] font-bold cursor-pointer" style="border-color: ${pinColor}">
            <span class="w-2 h-2 rounded-full mr-1" style="background-color: ${pinColor}"></span>
            ${pharm.name.split(' ')[0]} (${traffic.distanceKm}km)
          </div>
        `,
        iconSize: [120, 30],
        iconAnchor: [60, 15]
      });

      const marker = L.marker([pharm.lat, pharm.lng], { icon: pharmIcon });
      marker.bindPopup(`
        <div class="p-2 space-y-1 text-xs">
          <div class="font-bold text-sm text-slate-900">${pharm.name}</div>
          <div class="text-slate-600 font-semibold">${pharm.address}, ${pharm.city}</div>
          <div class="font-bold text-teal-600">📍 ${traffic.distanceKm} km away • ⏱️ ETA ~${traffic.etaMinutes} mins</div>
          <div class="text-[10px] text-slate-500 font-bold">🚦 ${traffic.trafficLabel}</div>
          <div class="pt-1">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}" target="_blank" class="inline-block px-3 py-1 bg-teal-600 text-white rounded font-bold no-underline">Live Traffic Route (${traffic.etaMinutes}m)</a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectPharmacy) onSelectPharmacy(pharm);
      });

      marker.addTo(markersGroup);
    });

  }, [userLocation, pharmacies, filters.radiusKm]);

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
