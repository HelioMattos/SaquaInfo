import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';
import { useAdmin } from '../../hooks/useAdmin';
import { getIndexStyles } from '../../styles/index.styles';
import { Evento } from '../../types/evento';

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();
  const styles = getIndexStyles(isDark);
  const { isAdmin } = useAdmin();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'eventos'), orderBy('criadoEm', 'desc'));
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
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.tituloHeader, { color: '#007bff' }]}>SaquaInfo 🌊</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={24}
              color={isDark ? '#ffcc00' : '#333'}
            />
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity style={styles.botaoAdd} onPress={() => router.push('/cadastrar')}>
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {carregando ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: styles.colors.subtexto, marginTop: 40 }}>
              Nenhum evento cadastrado ainda.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/modal',
                  params: {
                    ...item,
                    lat: item.latitude.toString(),
                    lng: item.longitude.toString(),
                  },
                })
              }
            >
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={{ color: '#28a745', fontSize: 12, fontWeight: 'bold' }}>
                  {new Date(item.dataInicio).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={{ color: styles.colors.subtexto, fontSize: 13 }}>📍 {item.local}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#007bff" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
