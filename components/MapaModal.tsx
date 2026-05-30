import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapaModal({ latitude, longitude, titulo, isDark, styles }: any) {
  return (
    <View style={styles.mapWrapper}>
      <MapView 
        style={styles.map} 
        userInterfaceStyle={isDark ? 'dark' : 'light'} 
        initialRegion={{ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
        scrollEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} title={titulo} />
      </MapView>
    </View>
  );
}