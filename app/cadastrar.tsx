import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebaseConfig';
import { getCadastrarStyles } from '../styles/cadastrar.styles';

// Importação do mapa que se adapta sozinho para Web ou App
import MapaCustomizado from '../components/MapaCustomizado';

// Funções auxiliares para padronizar a data/hora inicial do navegador
const pad = (n: number) => n.toString().padStart(2, '0');
const hoje = new Date();
const dataLocalDefault = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
const horaLocalDefault = `${pad(hoje.getHours())}:${pad(hoje.getMinutes())}`;

// COMPONENTE MÁGICO: Força o navegador a mostrar o calendário HTML5 real!
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

  // Voltamos para os links manuais das imagens
  const [img1, setImg1] = useState('');
  const [img2, setImg2] = useState('');
  const [img3, setImg3] = useState('');

  // 📱 Estados nativos para o Telemóvel
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataTermino, setDataTermino] = useState(new Date());
  const [showPicker, setShowPicker] = useState<{show: boolean, mode: 'date' | 'time', target: 'inicio' | 'termino'}>({
    show: false, mode: 'date', target: 'inicio'
  });

  // 💻 Estados para ativar os Calendários/Relógios Nativos da Web
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
      // CORREÇÃO 1: Pega o título corretamente
      setTitulo(params.titulo as string || '');
      setLocal(params.local as string || '');
      setDescricao(params.descricao as string || '');
      setCategoria((params.categoria as string) || 'Outros');
      
      // CORREÇÃO 2: Prevenção contra "NaN"
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

  const handleSalvar = async () => {
    if (!titulo || !local || !descricao || !img1) {
      if (Platform.OS === 'web') window.alert("Atenção: Preencha Título, Local, Descrição e ao menos a primeira Foto.");
      else Alert.alert("Atenção", "Preencha Título, Local, Descrição e ao menos a primeira Foto.");
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
      const listaFotos = [img1, img2, img3].filter(url => url !== '').join(',');

      const dados = { 
        titulo, 
        local, 
        descricao, 
        categoria, 
        imagens: listaFotos,
        dataInicio: isoInicio, 
        dataTermino: isoTermino, 
        latitude: coordenadas.latitude, 
        longitude: coordenadas.longitude, 
        atualizadoEm: serverTimestamp() 
      };

      if (params.id) {
        await updateDoc(doc(db, "eventos", params.id as string), dados);
      } else {
        await addDoc(collection(db, "eventos"), { ...dados, criadoEm: serverTimestamp() });
      }
      
      if (Platform.OS === 'web') window.alert("Evento salvo com sucesso!");
      else Alert.alert("Sucesso", "Evento salvo com sucesso!");
      
      router.back();

    } catch (error) { 
      if (Platform.OS === 'web') window.alert("Erro: Falha ao salvar o evento.");
      else Alert.alert("Erro", "Falha ao salvar."); 
    } finally { 
      setCarregando(false); 
    }
  };

  if (verificandoAcesso) return <ActivityIndicator style={{flex:1}} size="large" />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.headerTitle}>{params.id ? "Editar Evento" : "Novo Evento"}</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholderTextColor={styles.colors.placeholder} placeholder="Nome do evento" />

        <Text style={styles.label}>Local</Text>
        <TextInput style={styles.input} value={local} onChangeText={setLocal} placeholderTextColor={styles.colors.placeholder} placeholder="Ex: Praia de Itaúna" />

        <Text style={styles.label}>Links das Fotos (Para o Carrossel)</Text>
        <TextInput style={[styles.input, {marginBottom: 5}]} value={img1} onChangeText={setImg1} placeholderTextColor={styles.colors.placeholder} placeholder="URL da Foto 1 (Obrigatória)" />
        <TextInput style={[styles.input, {marginBottom: 5}]} value={img2} onChangeText={setImg2} placeholderTextColor={styles.colors.placeholder} placeholder="URL da Foto 2" />
        <TextInput style={styles.input} value={img3} onChangeText={setImg3} placeholderTextColor={styles.colors.placeholder} placeholder="URL da Foto 3" />

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
            <Text style={styles.buttonText}>{carregando ? "SALVANDO..." : "SALVAR EVENTO"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()} disabled={carregando}>
            <Text style={styles.buttonTextCancel}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}