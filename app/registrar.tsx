import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../firebaseConfig';

export default function Registrar() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  const handleRegistro = async () => {
    if (!email || !senha) {
      return Alert.alert('Erro', 'Preencha e-mail e senha.');
    }
    if (senha.length < 6) {
      return Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
    }

    setCarregando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const emailNormalizado = cred.user.email?.toLowerCase().trim() || '';

      await setDoc(doc(db, 'usuarios', emailNormalizado), {
        email: emailNormalizado,
        tipo: 'usuario',
        criadoEm: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.');
      router.replace('/login');
    } catch {
      Alert.alert('Erro', 'Falha ao registrar. Verifique o e-mail ou tente outra senha.');
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
            borderColor: isDark ? '#333' : '#ddd',
          },
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
            borderColor: isDark ? '#333' : '#ddd',
          },
        ]}
        placeholder="Senha (mín. 6 caracteres)"
        placeholderTextColor={isDark ? '#888' : '#bbb'}
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegistro} disabled={carregando}>
        <Text style={styles.buttonText}>{carregando ? 'CADASTRANDO...' : 'CADASTRAR'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
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
  link: { textAlign: 'center', fontWeight: '500' },
});
