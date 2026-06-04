import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function MapaCustomizado({ coordenadas, setCoordenadas, isDark }: any) {
  
  useEffect(() => {
    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'map_click' && setCoordenadas) {
          setCoordenadas({ latitude: data.lat, longitude: data.lng });
        }
      } catch (e) {
        // Ignora mensagens automáticas do navegador
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setCoordenadas]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; height: 100%; width: 100%; overflow: hidden; }
        
        /* Dark Mode */
        ${isDark ? '.leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }' : ''}
        
        /* MÁGICA 1: Troca a mãozinha por uma mira de precisão se estiver cadastrando */
        ${setCoordenadas ? '.leaflet-container { cursor: crosshair !important; }' : ''}
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // MÁGICA 2: Removido o 'zoomControl: false' para os botões de + e - aparecerem na tela
        var map = L.map('map').setView([${coordenadas.latitude}, ${coordenadas.longitude}], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        var marker = L.marker([${coordenadas.latitude}, ${coordenadas.longitude}]).addTo(map);

        ${setCoordenadas ? `
          map.on('click', function(e) {
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            
            marker.setLatLng([lat, lng]);
            
            window.parent.postMessage(JSON.stringify({ type: 'map_click', lat: lat, lng: lng }), '*');
          });
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width: '100%', height: 200, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#333' : '#ddd' }}>
      <iframe
        srcDoc={mapHtml}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Mapa Interativo"
      />
    </View>
  );
}