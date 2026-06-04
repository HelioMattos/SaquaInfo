import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function MapaCustomizado({ coordenadas, setCoordenadas, isDark }: any) {
  
  // 1. O React Native fica "escutando" as mensagens que vêm lá de dentro do iframe
  useEffect(() => {
    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        // Se recebemos um clique e estamos na tela de cadastro (setCoordenadas existe)
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

  // 2. Criamos o mapa (OpenStreetMap) do zero em HTML puro
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; height: 100%; width: 100%; overflow: hidden; }
        
        /* Mágica do Dark Mode: Inverte as cores do mapa se o app estiver escuro! */
        ${isDark ? '.leaflet-layer { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }' : ''}
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Inicia o mapa centralizado nas coordenadas atuais
        var map = L.map('map', { zoomControl: false }).setView([${coordenadas.latitude}, ${coordenadas.longitude}], 15);
        
        // Puxa as imagens livres do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Cria o alfinete
        var marker = L.marker([${coordenadas.latitude}, ${coordenadas.longitude}]).addTo(map);

        // SE existir a função de salvar (tela de cadastro), nós ativamos o clique!
        ${setCoordenadas ? `
          map.on('click', function(e) {
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            
            // Move o pino visualmente para onde o usuário clicou
            marker.setLatLng([lat, lng]);
            
            // Grita para o React Native: "Ei, o usuário clicou aqui!"
            window.parent.postMessage(JSON.stringify({ type: 'map_click', lat: lat, lng: lng }), '*');
          });
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ width: '100%', height: 200, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#333' : '#ddd' }}>
      {/* O srcDoc lê o HTML que acabamos de criar em vez de um link externo */}
      <iframe
        srcDoc={mapHtml}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Mapa Interativo"
      />
    </View>
  );
}