import { useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';
import { styles } from './styles/perfil.styles';

export default function Perfil() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Controle individual de visibilidade (olhinhos)
  const [verAtual, setVerAtual] = useState(true);
  const [verNova, setVerNova] = useState(true);
  const [verConfirmar, setVerConfirmar] = useState(true);
  
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const user = auth.currentUser;

  // Lógica para validar se as novas senhas são iguais e não vazias
  const senhasIguais = novaSenha === confirmarSenha && novaSenha !== '';

  const handleTrocarSenha = async () => {
    if (!novaSenha || !senhaAtual || !confirmarSenha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    if (!senhasIguais) {
      Alert.alert("Erro", "A confirmação da senha não coincide com a nova senha.");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Segurança", "A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      if (user && user.email) {
        // Reautenticação necessária pelo Firebase
        const cred = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(user, cred);
        
        // Atualização da senha
        await updatePassword(user, novaSenha);
        
        Alert.alert("Sucesso! ✅", "Sua senha foi alterada.");
        router.back();
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Erro", "Senha atual incorreta ou falha na autenticação.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Configurações de Perfil 🛡️</Text>
      <Text style={styles.info}>Logado como: {user?.email}</Text>

      {/* SENHA ATUAL */}
      <Text style={styles.label}>Senha Atual</Text>
      <View style={styles.areaSenha}>
        <TextInput 
          style={styles.inputSenha} 
          placeholder="Digite sua senha atual" 
          placeholderTextColor="#999"
          secureTextEntry={verAtual} 
          value={senhaAtual}
          onChangeText={setSenhaAtual}
        />
        <TouchableOpacity style={styles.botaoOlhinho} onPress={() => setVerAtual(!verAtual)}>
          <Text style={{fontSize: 18}}>{verAtual ? "👁️" : "🙈"}</Text>
        </TouchableOpacity>
      </View>

      {/* NOVA SENHA */}
      <Text style={styles.label}>Nova Senha</Text>
      <View style={styles.areaSenha}>
        <TextInput 
          style={styles.inputSenha} 
          placeholder="Digite a nova senha" 
          placeholderTextColor="#999"
          secureTextEntry={verNova} 
          value={novaSenha}
          onChangeText={setNovaSenha}
        />
        <TouchableOpacity style={styles.botaoOlhinho} onPress={() => setVerNova(!verNova)}>
          <Text style={{fontSize: 18}}>{verNova ? "👁️" : "🙈"}</Text>
        </TouchableOpacity>
      </View>

      {/* REPETIR NOVA SENHA */}
      <Text style={styles.label}>Repita a nova senha</Text>
      <View style={[styles.areaSenha, !senhasIguais && confirmarSenha !== '' ? {borderColor: '#E74C3C'} : null]}>
        <TextInput 
          style={styles.inputSenha} 
          placeholder="Repita a nova senha" 
          placeholderTextColor="#999"
          secureTextEntry={verConfirmar} 
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity style={styles.botaoOlhinho} onPress={() => setVerConfirmar(!verConfirmar)}>
          <Text style={{fontSize: 18}}>{verConfirmar ? "👁️" : "🙈"}</Text>
        </TouchableOpacity>
      </View>

      {/* MENSAGEM DE ERRO EM TEMPO REAL */}
      {!senhasIguais && confirmarSenha !== '' && (
        <Text style={{color: '#E74C3C', fontSize: 12, marginTop: -15, marginBottom: 15, fontWeight: 'bold'}}>
          ⚠️ As senhas não conferem.
        </Text>
      )}

      <TouchableOpacity 
        style={[styles.botao, (!senhasIguais || carregando) && {backgroundColor: '#BDC3C7'}]} 
        onPress={handleTrocarSenha} 
        disabled={carregando || !senhasIguais}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>CONFIRMAR ALTERAÇÃO</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
        <Text style={{color: '#666', textAlign: 'center'}}>Cancelar e Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}