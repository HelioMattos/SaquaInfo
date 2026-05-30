import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importando o tema
import { auth } from '../firebaseConfig';

export default function Registrar() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();
  const { isDark } = useTheme(); // Pegando o estado do tema

  const handleRegistro = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      Alert.alert('Sucesso', 'Conta criada!');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao registrar');
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
        placeholderTextColor={isDark ? '#888' : '#bbb'} // Cor do texto de ajuda corrigida
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
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
        placeholder="Senha" 
        placeholderTextColor={isDark ? '#888' : '#bbb'} // Cor do texto de ajuda corrigida
        value={senha} 
        onChangeText={setSenha} 
        secureTextEntry 
      />

      <TouchableOpacity style={styles.button} onPress={handleRegistro}>
        <Text style={styles.buttonText}>CADASTRAR</Text>
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
  link: { textAlign: 'center', fontWeight: '500' }
});