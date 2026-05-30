import { Platform, StyleSheet } from 'react-native';

export const getIndexStyles = (isDark: boolean) => {
  const theme = {
    fundo: isDark ? '#121212' : '#f8f9fa',
    card: isDark ? '#1e1e1e' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    header: isDark ? '#1e1e1e' : '#fff',
    border: isDark ? '#333' : '#eee'
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.fundo 
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 20, 
      paddingTop: Platform.OS === 'ios' ? 60 : 45, 
      paddingBottom: 15, 
      backgroundColor: theme.header,
      borderBottomWidth: 1, 
      borderBottomColor: theme.border 
    },
    tituloHeader: { 
      fontSize: 22, 
      fontWeight: 'bold' 
    },
    botaoAdd: { 
      backgroundColor: '#007bff', 
      width: 40, 
      height: 40, 
      borderRadius: 20, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    card: { 
      padding: 15, 
      borderRadius: 15, 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 12, 
      borderWidth: 1,
      backgroundColor: theme.card,
      borderColor: theme.border
    },
    cardInfo: { 
      flex: 1 
    },
    cardTitulo: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      marginBottom: 4,
      color: theme.texto
    }
  });

  // Retorno unificado para evitar erro de tipo no TypeScript
  return { ...styles, colors: theme };
};