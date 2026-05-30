import { StyleSheet } from 'react-native';

export const getModalStyles = (isDark: boolean) => {
  const theme = {
    fundo: isDark ? '#121212' : '#fff',
    texto: isDark ? '#fff' : '#333',
    subtexto: isDark ? '#aaa' : '#666',
    card: isDark ? '#1e1e1e' : '#f8f9fa',
    border: isDark ? '#333' : '#eee',
    icon: isDark ? '#fff' : '#333'
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.fundo },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingBottom: 15, 
      paddingTop: 50, 
      borderBottomWidth: 1, 
      borderBottomColor: theme.border 
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.texto },
    actionButtons: { flexDirection: 'row' },
    iconBtn: { marginLeft: 15 },
    content: { padding: 20 },
    rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap' },
    tituloText: { fontSize: 26, fontWeight: 'bold', color: theme.texto, marginRight: 10 },
    tag: { backgroundColor: '#e1f0ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    tagTexto: { color: '#007bff', fontWeight: 'bold', fontSize: 12 },
    
    // LINHAS DE INFO (DATA/LOCAL)
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    infoTextGroup: { marginLeft: 12 },
    infoLabel: { fontSize: 12, color: theme.subtexto, textTransform: 'uppercase', fontWeight: 'bold' },
    infoValue: { fontSize: 16, color: theme.texto, fontWeight: '500' },
    
    descricaoContainer: { marginTop: 10 },
    labelVerde: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 8 },
    descricaoText: { fontSize: 16, color: theme.texto, lineHeight: 24 },
    
    mapWrapper: { height: 220, marginTop: 25, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
    map: { flex: 1 }
  });

  return { ...styles, colors: theme };
};