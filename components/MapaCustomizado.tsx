import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function MapaCustomizado({ coordenadas, setCoordenadas, isDark }: any) {
  return (
    <MapView 
      style={{ width: '100%', height: 200, borderRadius: 10 }}
      userInterfaceStyle={isDark ? 'dark' : 'light'} 
      initialRegion={{ ...coordenadas, latitudeDelta: 0.01, longitudeDelta: 0.01 }} 
      
      // 1. Funciona se der um toque rápido
      onPress={(e) => {
        if (setCoordenadas) {
          setCoordenadas(e.nativeEvent.coordinate);
        }
      }}

      // 2. Funciona se tocar e segurar no mapa vazio
      onLongPress={(e) => {
        if (setCoordenadas) {
          setCoordenadas(e.nativeEvent.coordinate);
        }
      }}
    >
      <Marker 
        coordinate={coordenadas} 
        // 3. Permite arrastar o pino pelo mapa se a função setCoordenadas existir
        draggable={!!setCoordenadas}
        onDragEnd={(e) => {
          if (setCoordenadas) {
            setCoordenadas(e.nativeEvent.coordinate);
          }
        }}
      />
    </MapView>
  );
}