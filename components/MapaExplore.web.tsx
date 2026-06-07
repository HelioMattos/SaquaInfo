import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 15 }}>
      <Text style={styles.webTitle}>Eventos na Região (Versão Web)</Text>
      <Text style={styles.webSubtitle}>O mapa interativo está disponível no app nativo. Veja a lista de eventos abaixo:</Text>

      {eventos.map((evento) => (
        <TouchableOpacity 
          key={evento.id} 
          style={styles.card}
          onPress={() => router.push({
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
          })}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon(evento.categoria) as any} size={24} color="#fff" />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.titulo}>{evento.titulo}</Text>
            <Text style={styles.categoria}>{evento.categoria}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  webTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  webSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  iconContainer: { backgroundColor: '#007bff', padding: 10, borderRadius: 25, marginRight: 15 },
  infoContainer: { flex: 1 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  categoria: { fontSize: 14, color: '#666', marginTop: 2 }
});