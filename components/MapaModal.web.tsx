import React from 'react';
import { View } from 'react-native';

export default function MapaModal({ latitude, longitude, styles }: any) {
  // Cria o link do mapa dinamicamente usando as coordenadas recebidas
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    // Mantemos o styles.mapWrapper que vem do componente pai e adicionamos o overflow hidden
    <View style={[styles.mapWrapper, { overflow: 'hidden' }]}>
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