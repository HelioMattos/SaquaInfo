// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext'; // 1. IMPORTAR O TEMA
import { auth } from '../firebaseConfig';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (isInitializing) setIsInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    // Verifica se estamos nas telas de Login ou Registro
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'registrar';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isInitializing, segments]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // 2. ENVOLVER O RETORNO COM O THEMEPROVIDER
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registrar" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="cadastrar" 
          options={{ 
            headerShown: true, 
            title: 'Gerenciar Evento',
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}