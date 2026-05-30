import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebaseConfig';
import { getModalStyles } from '../styles/modal.styles';

// Importação do mapa blindado para o Modal
import MapaModal from '../components/MapaModal';

export default function ModalScreen() {
  const { isDark } = useTheme();
  const styles = getModalStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);

  const formatarDataHora = (dataString: any) => {
    if (!dataString) return 'Não informada';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return 'Data inválida';
      return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Não informada';
    }
  };

  useEffect(() => {
    const verificarPermissao = async () => {
      const user = auth.currentUser;
      if (user && user.email) {
        try {
          const emailLogado = user.email.toLowerCase().trim();
          const userDoc = await getDoc(doc(db, "usuarios", emailLogado));
          if (userDoc.exists() && userDoc.data().tipo === 'admin') setIsAdmin(true);
        } catch (error) { console.error(error); }
      }
    };
    verificarPermissao();
  }, []);

  const latitude = parseFloat(params.lat as string) || -22.9251;
  const longitude = parseFloat(params.lng as string) || -42.4862;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={styles.colors.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Evento</Text>
        <View style={styles.actionButtons}>
          {isAdmin && (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push({ pathname: '/cadastrar', params: { ...params } })}>
                <Ionicons name="create-outline" size={24} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => {
                Alert.alert("Excluir", "Deseja remover este evento?", [
                  { text: "Cancelar" },
                  { text: "Excluir", style: "destructive", onPress: async () => {
                    await deleteDoc(doc(db, "eventos", params.id as string));
                    router.back();
                  }}
                ]);
              }}>
                <Ionicons name="trash-outline" size={24} color="#dc3545" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.rowInfo}>
          <Text style={styles.tituloText}>{params.titulo}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagTexto}>{params.categoria || 'Geral'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={24} color="#007bff" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValue}>{params.local}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={24} color="#28a745" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Início</Text>
            <Text style={styles.infoValue}>{formatarDataHora(params.dataInicio as string)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={24} color="#dc3545" />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Término</Text>
            <Text style={styles.infoValue}>{formatarDataHora(params.dataTermino as string)}</Text>
          </View>
        </View>

        <View style={styles.descricaoContainer}>
          <Text style={styles.labelVerde}>Sobre o evento</Text>
          <Text style={styles.descricaoText}>{params.descricao || "Nenhuma descrição detalhada fornecida."}</Text>
        </View>

        {/* COMPONENTE DO MAPA SUBSTITUÍDO AQUI */}
        <MapaModal 
          latitude={latitude} 
          longitude={longitude} 
          titulo={params.titulo as string} 
          isDark={isDark} 
          styles={styles} 
        />

      </ScrollView>
    </View>
  );
}