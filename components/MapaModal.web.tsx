import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

export default function MapaModal({ latitude, longitude, styles }: any) {
  const abrirGoogleMaps = () => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  };

  return (
    <View style={[styles.mapWrapper, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9ecef', padding: 20 }]}>
      <Ionicons name="map" size={40} color="#6c757d" />
      <Text style={{ marginTop: 10, color: '#495057', textAlign: 'center', marginBottom: 15 }}>
        A visualização interna do mapa está disponível no app.
      </Text>
      
      <TouchableOpacity 
        onPress={abrirGoogleMaps} 
        style={{ backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
      >
        <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Abrir no Google Maps</Text>
      </TouchableOpacity>
    </View>
  );
}