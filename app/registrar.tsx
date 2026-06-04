import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importando o tema
import { auth } from '../firebaseConfig';

export default function Registrar() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false); // Adicionamos estado de carregamento
  const router = useRouter();
  const { isDark } = useTheme(); // Pegando o estado do tema

  const handleRegistro = async () => {
    // 1. Validações antes de enviar para o banco
    if (!email || !senha) {
      if (Platform.OS === 'web') window.alert('Atenção: Preencha e-mail e senha!');
      else Alert.alert('Atenção', 'Preencha e-mail e senha!');
      return;
    }

    if (senha.length < 6) {
      if (Platform.OS === 'web') window.alert('Atenção: A senha deve ter pelo menos 6 caracteres.');
      else Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      // Tenta criar a conta removendo espaços em branco do e-mail
      await createUserWithEmailAndPassword(auth, email.trim(), senha);
      
      if (Platform.OS === 'web') window.alert('Sucesso: Conta criada com sucesso!');
      else Alert.alert('Sucesso', 'Conta criada!');
      
      // Volta para a tela de login
      router.replace('/'); 
    } catch (error: any) {
      console.error("Erro no Firebase:", error);
      
      // Traduz o erro do Firebase para algo fácil de entender
      let mensagemErro = "Falha ao registrar.";
      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = "Este e-mail já está cadastrado.";
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = "O formato do e-mail é inválido.";
      }

      if (Platform.OS === 'web') window.alert('Erro: ' + mensagemErro);
      else Alert.alert('Erro', mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#333' }]}>Criar Conta</Text>
      
      <TextInput 
        style={[
          styles.input, 
          { 
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9', 
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#333' : '#ddd' 
          }
        ]} 
        placeholder="E-mail" 
        placeholderTextColor={isDark ? '#888' : '#bbb'} 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
        keyboardType="email-address" 
      />

      <TextInput 
        style={[
          styles.input, 
          { 
            backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9', 
            color: isDark ? '#fff' : '#333',
            borderColor: isDark ? '#333' : '#ddd' 
          }
        ]} 
        placeholder="Senha (mínimo 6 caracteres)" 
        placeholderTextColor={isDark ? '#888' : '#bbb'} 
        value={senha} 
        onChangeText={setSenha} 
        secureTextEntry 
      />

      <TouchableOpacity 
        style={[styles.button, carregando && { backgroundColor: '#6c757d' }]} 
        onPress={handleRegistro}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>CADASTRAR</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }} disabled={carregando}>
        <Text style={[styles.link, { color: '#007bff' }]}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#28a745', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { textAlign: 'center', fontWeight: '500' }
});