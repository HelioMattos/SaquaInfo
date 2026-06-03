import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { db } from '../firebaseConfig';

export default function MapaExplore() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const buscarEventosDoFirebase = async () => {
      try {
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
        <Text style={{ marginTop: 10, color: '#666' }}>A carregar mapa de Saquarema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -22.9251,
          longitude: -42.4862,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {eventos.map((evento) => {
          if (evento.latitude && evento.longitude) {
            return (
              <Marker
                key={evento.id}
                coordinate={{ latitude: evento.latitude, longitude: evento.longitude }}
              >
                <Callout 
                  tooltip={false} 
                  onPress={() => router.push(`/evento/${evento.id}` as any)}
                >
                  <View style={styles.balao}>
                    <Text style={styles.tituloBalao}>{evento.titulo}</Text>
                    <Text style={styles.textoBalao}>Toque para ver detalhes</Text>
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
  container: { flex: 1, width: '100%', backgroundColor: '#fff' },
  map: { width: '100%', height: '100%' },
  balao: { padding: 5, maxWidth: 200, alignItems: 'center' },
  tituloBalao: { fontWeight: 'bold', fontSize: 14, marginBottom: 2, textAlign: 'center' },
  textoBalao: { fontSize: 12, color: '#007bff', textAlign: 'center' },
});