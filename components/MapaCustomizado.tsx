import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function MapaCustomizado({ coordenadas, setCoordenadas, isDark }: any) {
  return (
    <MapView 
      style={{ width: '100%', height: 200, borderRadius: 10 }} // Altura padrão definida
      userInterfaceStyle={isDark ? 'dark' : 'light'} 
      initialRegion={{ ...coordenadas, latitudeDelta: 0.01, longitudeDelta: 0.01 }} 
      onPress={(e) => setCoordenadas(e.nativeEvent.coordinate)}
    >
      <Marker coordinate={coordenadas} />
    </MapView>
  );
}