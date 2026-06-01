import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
// Confirme se o caminho para o seu firebaseConfig está correto aqui:
import { db } from '../firebaseConfig';

export default function MapaExplore() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const buscarEventosDoFirebase = async () => {
      try {
        // Puxa a coleção "eventos" inteira do seu banco de dados
        const querySnapshot = await getDocs(collection(db, "eventos"));
        const listaDeEventos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEventos(listaDeEventos);
      } catch (error) {
        console.error("Erro ao buscar eventos para o mapa:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarEventosDoFirebase();
  }, []);

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando mapa de Saquarema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -22.9251, // Centro de Saquarema
          longitude: -42.4862,
          latitudeDelta: 0.08, // Zoom ideal para ver a cidade toda
          longitudeDelta: 0.08,
        }}
      >
        {/* O código abaixo cria um pino no mapa para CADA evento que veio do Firebase */}
        {eventos.map((evento) => {
          // Só desenha o pino se o evento tiver latitude e longitude cadastradas
          if (evento.latitude && evento.longitude) {
            return (
              <Marker
                key={evento.id}
                coordinate={{ latitude: evento.latitude, longitude: evento.longitude }}
              >
                {/* O Callout é o balãozinho que aparece quando você toca no pino vermelho */}
                <Callout 
                  tooltip={false} 
                  // Quando o usuário tocar no balãozinho, ele é levado para a tela de detalhes
                  onPress={() => router.push(`/evento/${evento.id}` as any)}
                >
                  <View style={styles.balao}>
                    <Text style={styles.tituloBalao}>{evento.titulo}</Text>
                    <Text style={styles.textoBalao}>Toque para ver mais detalhes</Text>
                  </View>
                </Callout>
              </Marker>
            );
          }
          return null;
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  balao: {
    padding: 5,
    maxWidth: 200,
    alignItems: 'center',
  },
  tituloBalao: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  textoBalao: {
    fontSize: 12,
    color: '#007bff',
    textAlign: 'center',
  },
});