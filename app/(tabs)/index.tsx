import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebaseConfig';
import { getIndexStyles } from '../../styles/index.styles';

interface Evento {
  id: string;
  titulo: string;
  local: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  dataInicio: string;
  dataTermino: string;
  imagens?: string;
}

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();
  const styles = getIndexStyles(isDark);
  
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verificarPermissao = async () => {
      const user = auth.currentUser;
      if (user && user.email) {
        const emailLogado = user.email.toLowerCase().trim();
        const userDoc = await getDoc(doc(db, "usuarios", emailLogado));
        if (userDoc.exists() && userDoc.data().tipo === 'admin') setIsAdmin(true);
      }
    };
    verificarPermissao();

    const q = query(collection(db, "eventos"), orderBy("criadoEm", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista: Evento[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lista.push({ id: doc.id, ...data } as Evento);
      });
      setEventos(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <Text style={[styles.tituloHeader, { color: '#007bff' }]}>SaquaInfo 🌊</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 15 }}>
            <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={isDark ? "#ffcc00" : "#333"} />
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity style={styles.botaoAdd} onPress={() => router.push('/cadastrar')}>
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => {
          
          const fotoCapa = item.imagens 
            ? item.imagens.split(',')[0].trim() 
            : 'https://via.placeholder.com/150x150.png?text=Sem+Foto';

          return (
            <TouchableOpacity 
              // Estilo alterado para "row" (lado a lado)
              style={[styles.card, { padding: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }]} 
              onPress={() => router.push({ 
                pathname: '/modal', 
                params: { ...item, lat: item.latitude.toString(), lng: item.longitude.toString() }
              })}
            >
              {/* MINIATURA DA IMAGEM PEQUENA DO LADO ESQUERDO */}
              <Image 
                source={{ uri: fotoCapa }}
                style={{ width: 90, height: 90, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                resizeMode="cover"
              />

              {/* TEXTO DO LADO DIREITO */}
              <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={{ color: '#28a745', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                  {new Date(item.dataInicio).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={{ color: styles.colors.subtexto, fontSize: 13, marginTop: 4 }}>📍 {item.local}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#007bff" />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}