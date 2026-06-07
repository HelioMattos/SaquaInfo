import { useRouter } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'; // Adicionado sendPasswordResetEmail
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  // Função de Login
  const handleLogin = async () => {
    if (!email || !senha) return Alert.alert('Erro', 'Preencha todos os campos.');
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  // Função de Recuperação de Senha (NOVA)
  const handleEsqueciSenha = async () => {
    if (!email) {
      return Alert.alert('Atenção', 'Por favor, digite seu e-mail acima para receber o link de recuperação.');
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'E-mail de redefinição enviado! Confira sua caixa de entrada ou spam.');
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail. Verifique se o endereço está correto.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.titulo, { color: isDark ? '#fff' : '#007bff' }]}>SaquaInfo</Text>
      
      <View style={styles.inputArea}>
        <Text style={[styles.label, { color: isDark ? '#aaa' : '#666' }]}>E-mail</Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9', 
              color: isDark ? '#fff' : '#333',
              borderColor: isDark ? '#333' : '#ddd'
            }
          ]}
          placeholder="exemplo@email.com"
          placeholderTextColor={isDark ? '#888' : '#bbb'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.label, { color: isDark ? '#aaa' : '#666' }]}>Senha</Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9', 
              color: isDark ? '#fff' : '#333',
              borderColor: isDark ? '#333' : '#ddd'
            }
          ]}
          placeholder="Sua senha"
          placeholderTextColor={isDark ? '#888' : '#bbb'}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {/* Botão de Login */}
      <TouchableOpacity style={styles.botao} onPress={handleLogin} disabled={carregando}>
        {carregando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>ENTRAR</Text>}
      </TouchableOpacity>
      
      {/* Botão de Registro (Corrigido para /registrar) */}
      <TouchableOpacity 
        onPress={() => router.push('/registrar')} 
        style={{ marginTop: 20 }}
      >
        <Text style={{ textAlign: 'center', color: isDark ? '#aaa' : '#666' }}>
          Não tem uma conta? <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Cadastre-se</Text>
        </Text>
      </TouchableOpacity>

      {/* Botão de Recuperação de Senha (AGORA FUNCIONANDO) */}
      <TouchableOpacity onPress={handleEsqueciSenha} style={{ marginTop: 20 }}>
        <Text style={{ color: '#007bff', textAlign: 'center', fontSize: 13, textDecorationLine: 'underline' }}>
          Esqueci minha senha
        </Text>
      </TouchableOpacity>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  inputArea: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, padding: 15, borderRadius: 12, fontSize: 16 },
  botao: { backgroundColor: '#007bff', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});