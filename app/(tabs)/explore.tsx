import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapaExplore from '../../components/MapaExplore';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      {/* O mapa agora é autossuficiente. Ele mesmo carrega, busca os dados e mostra os pinos */}
      <MapaExplore />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  }
});