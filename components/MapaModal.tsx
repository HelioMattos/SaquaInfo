import React, { useCallback, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { obterLocalizacaoAtual } from '../hooks/useLocalizacao';
import { buscarRota, Coordenada, InfoRota } from '../utils/rota';
import MapaRotaControls from './MapaRotaControls';

interface MapaModalProps {
  latitude: number;
  longitude: number;
  titulo: string;
  isDark: boolean;
  styles: {
    mapWrapper: object;
    mapWrapperRota?: object;
    map: object;
  };
}

export default function MapaModal({ latitude, longitude, titulo, isDark, styles }: MapaModalProps) {
  const mapRef = useRef<MapView>(null);
  const destino: Coordenada = { latitude, longitude };

  const [rota, setRota] = useState<InfoRota | null>(null);
  const [minhaPosicao, setMinhaPosicao] = useState<Coordenada | null>(null);
  const [carregando, setCarregando] = useState(false);

  const ajustarMapa = useCallback((origem: Coordenada, infoRota: InfoRota) => {
    const pontos = [origem, destino, ...infoRota.coordenadas];
    mapRef.current?.fitToCoordinates(pontos, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }, [destino]);

  const handleTracarRota = async () => {
    setCarregando(true);
    try {
      const origem = await obterLocalizacaoAtual();
      if (!origem) return;

      const infoRota = await buscarRota(origem, destino);
      if (!infoRota) {
        Alert.alert('Rota indisponível', 'Não foi possível calcular o trajeto. Tente novamente.');
        return;
      }

      setMinhaPosicao(origem);
      setRota(infoRota);
      ajustarMapa(origem, infoRota);
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparRota = () => {
    setRota(null);
    setMinhaPosicao(null);
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View>
      <View style={[styles.mapWrapper, rota && styles.mapWrapperRota]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          userInterfaceStyle={isDark ? 'dark' : 'light'}
          showsUserLocation
          showsMyLocationButton
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={destino} title={titulo} pinColor="#dc3545" />

          {minhaPosicao && (
            <Marker coordinate={minhaPosicao} title="Você está aqui" pinColor="#007bff" />
          )}

          {rota && (
            <Polyline
              coordinates={rota.coordenadas}
              strokeColor="#007bff"
              strokeWidth={4}
            />
          )}
        </MapView>
      </View>

      <MapaRotaControls
        carregando={carregando}
        rota={rota}
        isDark={isDark}
        onTracarRota={handleTracarRota}
        onLimparRota={rota ? handleLimparRota : undefined}
      />
    </View>
  );
}
