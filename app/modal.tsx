import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'; // <-- Platform adicionado aqui
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebaseConfig';
import { getModalStyles } from '../styles/modal.styles';

import MapaModal from '../components/MapaModal';

const { width } = Dimensions.get('window');

export default function ModalScreen() {
  const { isDark } = useTheme();
  const styles = getModalStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);

  const listaFotos = params.imagens 
    ? (params.imagens as string).split(',').map(url => url.trim()).filter(url => url !== '') 
    : [];

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

  // --- FUNÇÃO DE COMPARTILHAR NO WHATSAPP COM LINK DINÂMICO ---
  const handleShareWhatsApp = () => {
    // Se estiver na Web, pega o link exato da página. Se for celular, usa o link padrão.
    const linkSite = Platform.OS === 'web' ? window.location.href : 'https://saquainfo.vercel.app'; 
    
    // Monta a mensagem completa com o link no final
    const mensagem = `Confira este evento no *SaquaInfo*! 🌊\n\n🎉 *${params.titulo}*\n📍 *Local:* ${params.local}\n📅 *Quando:* ${formatarDataHora(params.dataInicio as string)}\n\n🔗 *Veja todas as fotos e detalhes aqui:*\n${linkSite}`;
    
    // Converte para o formato da internet
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    
    // Tenta abrir o link
    Linking.openURL(url).catch(() => {
      if (Platform.OS === 'web') window.alert('Erro: Não foi possível abrir o WhatsApp.');
      else Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    });
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
        
        {/* ================= CARROSSEL DE IMAGENS ================= */}
        {listaFotos.length > 0 && (
          <View style={{ height: 350, marginBottom: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
            >
              {listaFotos.map((foto, index) => (
                <Image 
                  key={index}
                  source={{ uri: foto }} 
                  style={{ width: width - 40, height: 350 }} 
                  resizeMode="contain" 
                />
              ))}
            </ScrollView>
            
            {listaFotos.length > 1 && (
              <View style={{
                position: 'absolute', bottom: 10, right: 10,
                backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                  Arraste para ver mais ({listaFotos.length})
                </Text>
              </View>
            )}
          </View>
        )}

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

        {/* ================= BOTÃO DO WHATSAPP ================= */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row', 
            backgroundColor: '#25D366', 
            padding: 16, 
            borderRadius: 12, 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3
          }} 
          onPress={handleShareWhatsApp}
        >
          <Ionicons name="logo-whatsapp" size={24} color="#fff" style={{ marginRight: 10 }} />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Compartilhar com Amigos</Text>
        </TouchableOpacity>

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