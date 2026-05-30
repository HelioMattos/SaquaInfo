import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function MapaExploreWeb() {
  return (
    <View style={styles.container}>
      {/* Aqui entra o mapa embutido do Google Maps para a Web/PWA */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117565.34005891465!2d-42.58550750587285!3d-22.86016629555627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x976bd0d740c00f%3A0xc6eb99672eb70cc8!2sSaquarema%2C%20RJ!5e0!3m2!1spt-BR!2sbr"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
      />
    </View>
  );
}

// Estilos para o mapa ocupar o espaço correto na tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 400, // Ajuste a altura conforme o visual que preferir
  },
});