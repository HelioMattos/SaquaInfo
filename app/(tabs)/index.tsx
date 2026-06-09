import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import HeaderActions from '../../components/HeaderActions';
import LogoSaquaInfo from '../../components/LogoSaquaInfo';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';
import { getIndexStyles } from '../../styles/index.styles';
import { Evento, eventoEstaAtivo, parseImagens } from '../../types/evento';

export default function HomeScreen() {
  const { isDark } = useTheme();
  const styles = getIndexStyles(isDark);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'eventos'), orderBy('criadoEm', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const lista: Evento[] = [];
        querySnapshot.forEach((docSnap) => {
          const evento = { id: docSnap.id, ...docSnap.data() } as Evento;
          if (eventoEstaAtivo(evento)) lista.push(evento);
        });
        setEventos(lista);
        setCarregando(false);
      },
      () => setCarregando(false)
    );
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <LogoSaquaInfo />
        <HeaderActions showThemeToggle />
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
              Nenhum evento ativo no momento.
            </Text>
          }
          renderItem={({ item }) => {
            const imagens = parseImagens(item.imagens);
            const fotoCapa =
              imagens[0] || 'https://via.placeholder.com/150x150.png?text=Sem+Foto';

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/modal',
                    params: { id: item.id },
                  })
                }
              >
                <Image
                  source={{ uri: fotoCapa }}
                  style={styles.cardImagem}
                  contentFit={Platform.OS === 'web' ? 'contain' : 'cover'}
                />

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitulo}>{item.titulo}</Text>
                  <Text style={styles.cardData}>
                    {new Date(item.dataInicio).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.cardLocal}>📍 {item.local}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#007bff" />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
