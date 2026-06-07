import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapaExplore from '../../components/MapaExplore';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';
import { Evento } from '../../types/evento';

export default function ExploreScreen() {
  const { isDark } = useTheme();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'eventos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista: Evento[] = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() } as Evento);
      });
      setEventos(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      {carregando ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />
      ) : (
        <MapaExplore eventos={eventos} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
