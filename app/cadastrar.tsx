import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker'; // <-- Biblioteca de Câmera/Galeria
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'; // <-- Funções de Upload
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapaCustomizado from '../components/MapaCustomizado';
import { useTheme } from '../context/ThemeContext';
import { auth, db, storage } from '../firebaseConfig'; // <-- Importamos o storage
import { getCadastrarStyles } from '../styles/cadastrar.styles';

const pad = (n: number) => n.toString().padStart(2, '0');
const hoje = new Date();
const dataLocalDefault = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
const horaLocalDefault = `${pad(hoje.getHours())}:${pad(hoje.getMinutes())}`;

const InputNativoWeb = ({ tipo, valor, setValor, isDark }: any) => {
  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: tipo,
      value: valor,
      onChange: (e: any) => setValor(e.target.value),
      style: {
        padding: '12px',
        backgroundColor: isDark ? '#333' : '#f5f5f5',
        color: isDark ? '#fff' : '#333',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        fontFamily: 'inherit'
      }
    });
  }
  return null;
};

export default function CadastrarEvento() {
  const { isDark } = useTheme();
  const styles = getCadastrarStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [coordenadas, setCoordenadas] = useState({ latitude: -22.9251, longitude: -42.4862 });
  const [carregando, setCarregando] = useState(false);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);

  // Estados das imagens (agora guardam o caminho local do celular ou o link da web)
  const [img1, setImg1] = useState('');
  const [img2, setImg2] = useState('');
  const [img3, setImg3] = useState('');

  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataTermino, setDataTermino] = useState(new Date());
  const [showPicker, setShowPicker] = useState<{show: boolean, mode: 'date' | 'time', target: 'inicio' | 'termino'}>({
    show: false, mode: 'date', target: 'inicio'
  });

  const [dataInicioWeb, setDataInicioWeb] = useState(dataLocalDefault);
  const [horaInicioWeb, setHoraInicioWeb] = useState(horaLocalDefault);
  const [dataTerminoWeb, setDataTerminoWeb] = useState(dataLocalDefault);
  const [horaTerminoWeb, setHoraTerminoWeb] = useState(horaLocalDefault);

  const categorias = [
    { id: 'Esportes', icon: 'fitness' },
    { id: 'Show', icon: 'musical-notes' },
    { id: 'Comida', icon: 'restaurant' },
    { id: 'Religioso', icon: 'bonfire' },
    { id: 'Cultural', icon: 'library' },
    { id: 'Outros', icon: 'help-circle' }
  ];

  useEffect(() => {
    const verificarAcessoAdmin = async () => {
      const user = auth.currentUser;
      if (!user) { router.replace('/(tabs)'); return; }
      const userDoc = await getDoc(doc(db, "usuarios", user.email?.toLowerCase().trim() || ""));
      if (userDoc.exists() && userDoc.data().tipo === 'admin') setVerificandoAcesso(false);
      else router.replace('/(tabs)');
    };
    verificarAcessoAdmin();

    if (params.id) {
      setTitulo(params.titulo as string || '');
      setLocal(params.local as string || '');
      setDescricao(params.descricao as string || '');
      setCategoria((params.categoria as string) || 'Outros');
      
      const latSafe = parseFloat((params.latitude || params.lat) as string);
      const lngSafe = parseFloat((params.longitude || params.lng) as string);
      
      setCoordenadas({ 
        latitude: isNaN(latSafe) ? -22.9251 : latSafe, 
        longitude: isNaN(lngSafe) ? -42.4862 : lngSafe 
      });
      
      if (params.dataInicio) {
        const d = new Date(params.dataInicio as string);
        setDataInicio(d);
        setDataInicioWeb(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        setHoraInicioWeb(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      if (params.dataTermino) {
        const d = new Date(params.dataTermino as string);
        setDataTermino(d);
        setDataTerminoWeb(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        setHoraTerminoWeb(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }

      if (params.imagens) {
        const imgs = (params.imagens as string).split(',');
        setImg1(imgs[0] || '');
        setImg2(imgs[1] || '');
        setImg3(imgs[2] || '');
      }
    }
  }, [params.id]);

  const onChangePicker = (event: any, selectedDate?: Date) => {
    setShowPicker({ ...showPicker, show: false });
    if (selectedDate) {
      if (showPicker.target === 'inicio') setDataInicio(selectedDate);
      else setDataTermino(selectedDate);
    }
  };

  // ==========================================
  // FUNÇÕES DE CÂMERA E GALERIA
  // ==========================================
  const escolherImagem = async (setImagem: React.Dispatch<React.SetStateAction<string>>) => {
    if (Platform.OS !== 'web') {
      // Pergunta se o usuário quer Câmera ou Galeria no celular
      Alert.alert(
        "Adicionar Foto",
        "Escolha de onde quer pegar a imagem:",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Câmera", onPress: () => abrirCamera(setImagem) },
          { text: "Galeria", onPress: () => abrirGaleria(setImagem) }
        ]
      );
    } else {
      // Na web, abre direto os arquivos do computador
      abrirGaleria(setImagem);
    }
  };

  const abrirGaleria = async (setImagem: React.Dispatch<React.SetStateAction<string>>) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6, // Comprime a foto para o app não ficar pesado
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const abrirCamera = async (setImagem: React.Dispatch<React.SetStateAction<string>>) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Ops", "Precisamos da permissão da câmera para tirar a foto!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  // ==========================================
  // FUNÇÃO DE UPLOAD PARA O FIREBASE
  // ==========================================
  const fazerUploadImagem = async (uri: string) => {
    // Se o link já começar com HTTP (caso de edição de um evento antigo), não precisa fazer upload
    if (!uri || uri.startsWith('http')) return uri;

    try {
      // Pega o arquivo do celular/pc e converte num formato que o Firebase aceita (Blob)
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Cria um nome único para a foto
      const nomeUnico = `evento_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, `eventos/${nomeUnico}`);
      
      // Envia para o Firebase Storage
      await uploadBytes(storageRef, blob);
      
      // Pega o link definitivo da foto na internet
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Erro no upload da imagem:", error);
      throw error;
    }
  };

  const handleSalvar = async () => {
    if (!titulo || !local || !descricao || !img1) {
      if (Platform.OS === 'web') window.alert("Atenção: Preencha Título, Local, Descrição e ao menos a PRIMEIRA foto.");
      else Alert.alert("Atenção", "Preencha Título, Local, Descrição e ao menos a PRIMEIRA foto.");
      return;
    }
    
    setCarregando(true);

    let isoInicio = dataInicio.toISOString();
    let isoTermino = dataTermino.toISOString();

    if (Platform.OS === 'web') {
      try {
        const [anoI, mesI, diaI] = dataInicioWeb.split('-');
        const [horaI, minI] = horaInicioWeb.split(':');
        isoInicio = new Date(Number(anoI), Number(mesI) - 1, Number(diaI), Number(horaI), Number(minI)).toISOString();

        const [anoT, mesT, diaT] = dataTerminoWeb.split('-');
        const [horaT, minT] = horaTerminoWeb.split(':');
        isoTermino = new Date(Number(anoT), Number(mesT) - 1, Number(diaT), Number(horaT), Number(minT)).toISOString();
      } catch (e) {
        window.alert("Por favor, selecione uma data e hora válidas.");
        setCarregando(false);
        return;
      }
    }

    try {
      // 1. FAZ O UPLOAD DAS FOTOS PRIMEIRO
      const url1 = await fazerUploadImagem(img1);
      const url2 = await fazerUploadImagem(img2);
      const url3 = await fazerUploadImagem(img3);
      
      // Junta os links definitivos separados por vírgula
      const listaFotos = [url1, url2, url3].filter(url => url !== '').join(',');

      const dados = { 
        titulo, 
        local, 
        descricao, 
        categoria, 
        imagens: listaFotos, // Salva os links definitivos
        dataInicio: isoInicio, 
        dataTermino: isoTermino, 
        latitude: coordenadas.latitude, 
        longitude: coordenadas.longitude, 
        atualizadoEm: serverTimestamp() 
      };

      // 2. SALVA OS DADOS DO EVENTO
      if (params.id) {
        await updateDoc(doc(db, "eventos", params.id as string), dados);
      } else {
        await addDoc(collection(db, "eventos"), { ...dados, criadoEm: serverTimestamp() });
      }
      
      if (Platform.OS === 'web') window.alert("Evento salvo com sucesso!");
      else Alert.alert("Sucesso", "Evento salvo com sucesso!");
      
      router.back();

    } catch (error) { 
      if (Platform.OS === 'web') window.alert("Erro: Falha ao salvar o evento ou fotos.");
      else Alert.alert("Erro", "Falha ao salvar."); 
    } finally { 
      setCarregando(false); 
    }
  };

  // Componente visual para as caixas de fotos
  const CaixaFoto = ({ uri, setUri, numero }: any) => (
    <TouchableOpacity 
      style={{
        flex: 1, height: 100, backgroundColor: isDark ? '#333' : '#f0f0f0', 
        borderRadius: 10, marginHorizontal: 4, justifyContent: 'center', 
        alignItems: 'center', overflow: 'hidden', borderWidth: 1, 
        borderColor: isDark ? '#444' : '#ddd', borderStyle: 'dashed'
      }}
      onPress={() => escolherImagem(setUri)}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="camera" size={24} color={isDark ? '#aaa' : '#888'} />
          <Text style={{ fontSize: 10, color: isDark ? '#aaa' : '#888', marginTop: 4 }}>Foto {numero}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (verificandoAcesso) return <ActivityIndicator style={{flex:1}} size="large" />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.headerTitle}>{params.id ? "Editar Evento" : "Novo Evento"}</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholderTextColor={styles.colors.placeholder} placeholder="Nome do evento" />

        <Text style={styles.label}>Local</Text>
        <TextInput style={styles.input} value={local} onChangeText={setLocal} placeholderTextColor={styles.colors.placeholder} placeholder="Ex: Praia de Itaúna" />

        {/* NOVA ÁREA DE UPLOAD DE FOTOS */}
        <Text style={styles.label}>Fotos do Evento (Toque para adicionar)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <CaixaFoto uri={img1} setUri={setImg1} numero="1" />
          <CaixaFoto uri={img2} setUri={setImg2} numero="2" />
          <CaixaFoto uri={img3} setUri={setImg3} numero="3" />
        </View>

        <Text style={styles.label}>Data e Hora de Início</Text>
        {Platform.OS === 'web' ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ flex: 2, marginRight: 5 }}>
              <InputNativoWeb tipo="date" valor={dataInicioWeb} setValor={setDataInicioWeb} isDark={isDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <InputNativoWeb tipo="time" valor={horaInicioWeb} setValor={setHoraInicioWeb} isDark={isDark} />
            </View>
          </View>
        ) : (
          <View style={styles.dateTimeRow}>
            <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowPicker({show:true, mode:'date', target:'inicio'})}>
              <Ionicons name="calendar" size={18} color="#007bff" />
              <Text style={styles.dateTimeText}>{dataInicio.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowPicker({show:true, mode:'time', target:'inicio'})}>
              <Ionicons name="time" size={18} color="#007bff" />
              <Text style={styles.dateTimeText}>{dataInicio.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Data e Hora de Término</Text>
        {Platform.OS === 'web' ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ flex: 2, marginRight: 5 }}>
              <InputNativoWeb tipo="date" valor={dataTerminoWeb} setValor={setDataTerminoWeb} isDark={isDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <InputNativoWeb tipo="time" valor={horaTerminoWeb} setValor={setHoraTerminoWeb} isDark={isDark} />
            </View>
          </View>
        ) : (
          <View style={styles.dateTimeRow}>
            <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowPicker({show:true, mode:'date', target:'termino'})}>
              <Ionicons name="calendar" size={18} color="#007bff" />
              <Text style={styles.dateTimeText}>{dataTermino.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowPicker({show:true, mode:'time', target:'termino'})}>
              <Ionicons name="time" size={18} color="#007bff" />
              <Text style={styles.dateTimeText}>{dataTermino.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showPicker.show && Platform.OS !== 'web' && (
          <DateTimePicker value={showPicker.target === 'inicio' ? dataInicio : dataTermino} mode={showPicker.mode} is24Hour={true} onChange={onChangePicker} />
        )}

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriaContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity key={cat.id} style={[styles.catBadge, categoria === cat.id && styles.catBadgeSelected]} onPress={() => setCategoria(cat.id)}>
              <View style={styles.catBadgeInner}>
                <Ionicons name={cat.icon as any} size={16} color={categoria === cat.id ? '#fff' : styles.colors.texto} />
                <Text style={[styles.catText, categoria === cat.id && styles.catTextSelected]}>{cat.id}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descrição</Text>
        <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline placeholderTextColor={styles.colors.placeholder} placeholder="Detalhes..." />

        <Text style={styles.label}>Coordenadas (Lat / Lng)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 5, marginBottom: 0 }]} value={String(coordenadas.latitude)} onChangeText={(text) => setCoordenadas({...coordenadas, latitude: parseFloat(text) || 0})} keyboardType="numeric" placeholder="Latitude" placeholderTextColor={styles.colors.placeholder} />
          <TextInput style={[styles.input, { flex: 1, marginLeft: 5, marginBottom: 0 }]} value={String(coordenadas.longitude)} onChangeText={(text) => setCoordenadas({...coordenadas, longitude: parseFloat(text) || 0})} keyboardType="numeric" placeholder="Longitude" placeholderTextColor={styles.colors.placeholder} />
        </View>

        <View style={styles.mapContainer}>
          <MapaCustomizado coordenadas={coordenadas} setCoordenadas={setCoordenadas} isDark={isDark} />
        </View>

        <View style={styles.buttonArea}>
          <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={carregando}>
            <Text style={styles.buttonText}>{carregando ? "ENVIANDO FOTOS E SALVANDO..." : "SALVAR EVENTO"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()} disabled={carregando}>
            <Text style={styles.buttonTextCancel}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}