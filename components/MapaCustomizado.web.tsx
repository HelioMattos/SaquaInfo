import React from 'react';
import { View } from 'react-native';

export default function MapaCustomizado({ coordenadas }: any) {
  // Cria o link do mapa dinamicamente usando as coordenadas recebidas
  const mapUrl = `https://maps.google.com/maps?q=${coordenadas.latitude},${coordenadas.longitude}&z=15&output=embed`;

  return (
    <View style={{ width: '100%', height: 200, borderRadius: 10, overflow: 'hidden' }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
      />
    </View>
  );
}