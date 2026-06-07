import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Evento } from '../types/evento';

interface MapaExploreProps {
  eventos: Evento[];
}

export default function MapaExplore({ eventos }: MapaExploreProps) {
  const router = useRouter();

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Esportes': return 'fitness';
      case 'Show': return 'mic';
      case 'Comida': return 'fast-food';
      case 'Religioso': return 'bonfire';
      case 'Cultural': return 'library';
      default: return 'location';
    }
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={{ latitude: -22.9251, longitude: -42.4862, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
    >
      {eventos.map((evento) => (
        <Marker key={evento.id} coordinate={{ latitude: evento.latitude, longitude: evento.longitude }}>
          <View style={styles.markerContainer}>
            <Ionicons name={getIcon(evento.categoria) as any} size={18} color="#fff" />
          </View>
          <Callout onPress={() => router.push({
            pathname: '/modal',
            params: {
              id: evento.id,
              titulo: evento.titulo,
              local: evento.local,
              descricao: evento.descricao,
              categoria: evento.categoria,
              dataInicio: evento.dataInicio,
              dataTermino: evento.dataTermino,
              imagens: evento.imagens || '',
              lat: evento.latitude.toString(),
              lng: evento.longitude.toString(),
            }
          })}>
            <View style={{ width: 140, padding: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>{evento.titulo}</Text>
              <Text style={{ fontSize: 11, color: '#666' }}>{evento.categoria}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  markerContainer: { backgroundColor: '#007bff', padding: 6, borderRadius: 20, borderWidth: 2, borderColor: '#fff' }
});