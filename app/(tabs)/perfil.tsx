import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // <-- Adicionado o ScrollView aqui
import { auth } from '../../firebaseConfig';

export default function PerfilScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    // 1. SE FOR WEB (VERCEL / PWA)
    if (Platform.OS === 'web') {
      const confirmar = window.confirm("Deseja realmente sair da sua conta?");
      if (confirmar) {
        try {
          await signOut(auth);
          router.replace('/'); // Força a volta para o Login
        } catch (error) {
          console.error(error);
          window.alert("Não foi possível deslogar.");
        }
      }
    } 
    // 2. SE FOR CELULAR (ANDROID / IOS)
    else {
      Alert.alert(
        "Sair",
        "Deseja realmente sair da sua conta?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Sair", 
            style: "destructive", 
            onPress: async () => {
              try {
                await signOut(auth);
                router.replace('/'); // Força a volta para o Login
              } catch (error) {
                Alert.alert("Erro", "Não foi possível deslogar.");
              }
            } 
          }
        ]
      );
    }
  };

  return (
    // Trocamos a View fixa por um ScrollView que permite rolagem
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer} // Estilo interno da rolagem
    >
        
        {/* Cabeçalho do Perfil */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.userName}>Bem-vindo!</Text>
          <Text style={styles.userEmail}>{user?.email || "Usuário não identificado"}</Text>
        </View>

        {/* Seção de Informações/Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#555" />
            <Text style={styles.infoText}>Status: Verificado</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={24} color="#555" />
            <Text style={styles.infoText}>Localização: Saquarema, RJ</Text>
          </View>
        </View>

        {/* Botão de Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={{marginRight: 10}} />
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
    // Esse paddingBottom 100 é mágico! Garante que o fundo não bata na barra de baixo.
    paddingBottom: 100, 
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40, // Deixei um espaço um pouco maior antes do botão
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007bff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#444',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});