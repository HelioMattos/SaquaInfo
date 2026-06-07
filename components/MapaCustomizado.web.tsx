import React from 'react';
import { Text, View } from 'react-native';

export default function MapaCustomizado({ coordenadas }: any) {
  return (
    <View style={{ width: '100%', height: 200, borderRadius: 10, backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ color: '#333', textAlign: 'center', marginBottom: 10, fontSize: 14 }}>
        O ajuste fino no mapa está disponível apenas no aplicativo nativo (Android/iOS).
      </Text>
      <Text style={{ color: '#666', fontWeight: 'bold' }}>
        Lat: {coordenadas.latitude.toFixed(4)} | Lng: {coordenadas.longitude.toFixed(4)}
      </Text>
    </View>
  );
}