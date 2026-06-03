import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function MapaExploreWeb() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  // 1. Busca os eventos no Firebase
  useEffect(() => {
    const buscarEventosWeb = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "eventos"));
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEventos(lista);
      } catch (error) {
        console.error("Erro ao procurar eventos na web:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarEventosWeb();
  }, []);

  // 2. Escuta o clique do botão no mapa interativo
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_EVENT') {
        // Encontra todos os dados do evento que foi clicado
        const eventoClicado = eventos.find(e => e.id === event.data.id);
        
        if (eventoClicado) {
          // Vai para a tela /modal e envia todos os dados (id, titulo, lat, lng...) 
          // exatamente como o seu link funciona!
          router.push({
            pathname: '/modal',
            params: eventoClicado
          } as any);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [eventos]); // <-- Atualizado para sempre ter a lista de eventos mais recente

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10, color: '#666' }}>A carregar mapa interativo...</Text>
      </View>
    );
  }

  const marcadoresJs = eventos
    .filter(e => e.latitude && e.longitude)
    .map(e => `
      L.marker([${e.latitude}, ${e.longitude}])
        .addTo(map)
        .bindPopup(\`
          <div style="font-family: sans-serif; text-align: center; padding: 5px;">
            <h4 style="margin: 0 0 5px 0; color: #333;">${e.titulo}</h4>
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">${e.local}</p>
            <button 
              onclick="window.parent.postMessage({ type: 'NAVIGATE_EVENT', id: '${e.id}' }, '*')" 
              style="border: none; cursor: pointer; display: inline-block; background: #007bff; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; width: 100%;"
            >
              Ver Detalhes
            </button>
          </div>
        \`);
    `).join('\n');

  const conteudoHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
        .leaflet-popup-content-wrapper { border-radius: 8px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([-22.9251, -42.4862], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        ${marcadoresJs}
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <iframe
        srcDoc={conteudoHtml}
        style={{ border: 0, width: '100%', height: '100vh', flex: 1 }}
        title="Mapa de Eventos"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});