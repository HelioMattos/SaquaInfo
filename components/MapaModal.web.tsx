import React, { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { obterLocalizacaoAtual } from '../hooks/useLocalizacao';
import { configurarIconesLeaflet, criarIconeEventoLeaflet } from '../utils/mapa';
import { buscarRota, Coordenada, InfoRota } from '../utils/rota';
import MapaRotaControls from './MapaRotaControls';

interface MapaModalProps {
  latitude: number;
  longitude: number;
  titulo: string;
  categoria?: string;
  isDark: boolean;
  styles: {
    mapWrapper: object;
    mapWrapperRota?: object;
    map: object;
  };
}

export default function MapaModal({
  latitude,
  longitude,
  titulo,
  categoria,
  isDark,
  styles,
}: MapaModalProps) {
  const containerRef = useRef<View>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const rotaLayer = useRef<import('leaflet').Polyline | null>(null);

  const destino: Coordenada = { latitude, longitude };

  const [rota, setRota] = useState<InfoRota | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mapaPronto, setMapaPronto] = useState(false);

  const adicionarMarcadorEvento = (
    L: typeof import('leaflet'),
    mapa: import('leaflet').Map,
    cor = '#007bff'
  ) => {
    const icone =
      cor === '#dc3545'
        ? criarIconeEventoLeaflet(L, categoria)
        : L.divIcon({
            className: '',
            html: `<div style="
              background:#007bff;
              border:2px solid #fff;
              border-radius:50%;
              width:28px;
              height:28px;
              display:flex;
              align-items:center;
              justify-content:center;
              color:#fff;
              font-size:14px;
              box-shadow:0 2px 6px rgba(0,0,0,0.25);
            ">●</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

    return L.marker([latitude, longitude], { icon: icone }).addTo(mapa).bindPopup(titulo);
  };

  useEffect(() => {
    let cancelado = false;

    const iniciarMapa = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      configurarIconesLeaflet(L);

      if (cancelado) return;

      const el = containerRef.current as unknown as HTMLElement | null;
      if (!el) return;

      mapInstance.current?.remove();

      const mapa = L.map(el, { scrollWheelZoom: false }).setView([latitude, longitude], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(mapa);

      adicionarMarcadorEvento(L, mapa, '#dc3545');

      mapInstance.current = mapa;
      setMapaPronto(true);
    };

    iniciarMapa();

    return () => {
      cancelado = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [latitude, longitude, titulo, categoria]);

  const limparCamadasExcetoTiles = async () => {
    const mapa = mapInstance.current;
    if (!mapa) return;

    const L = (await import('leaflet')).default;
    mapa.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        mapa.removeLayer(layer);
      }
    });

    rotaLayer.current = null;
  };

  const desenharRota = async (origem: Coordenada, infoRota: InfoRota) => {
    const L = (await import('leaflet')).default;
    configurarIconesLeaflet(L);
    const mapa = mapInstance.current;
    if (!mapa) return;

    await limparCamadasExcetoTiles();

    L.marker([origem.latitude, origem.longitude]).addTo(mapa).bindPopup('Você está aqui');
    adicionarMarcadorEvento(L, mapa, '#dc3545');

    const polyline = L.polyline(
      infoRota.coordenadas.map((c) => [c.latitude, c.longitude] as [number, number]),
      { color: '#007bff', weight: 4 }
    ).addTo(mapa);

    rotaLayer.current = polyline;
    mapa.fitBounds(polyline.getBounds(), { padding: [30, 30] });
  };

  const handleTracarRota = async () => {
    if (!mapaPronto) return;

    setCarregando(true);
    try {
      const origem = await obterLocalizacaoAtual();
      if (!origem) return;

      const infoRota = await buscarRota(origem, destino);
      if (!infoRota) {
        Alert.alert('Rota indisponível', 'Não foi possível calcular o trajeto. Tente novamente.');
        return;
      }

      setRota(infoRota);
      await desenharRota(origem, infoRota);
    } finally {
      setCarregando(false);
    }
  };

  const handleLimparRota = async () => {
    setRota(null);
    await limparCamadasExcetoTiles();

    const L = (await import('leaflet')).default;
    configurarIconesLeaflet(L);
    const mapa = mapInstance.current;
    if (!mapa) return;

    adicionarMarcadorEvento(L, mapa, '#dc3545');
    mapa.setView([latitude, longitude], 14);
  };

  return (
    <View>
      <View style={[styles.mapWrapper, rota && styles.mapWrapperRota]}>
        <View ref={containerRef} style={styles.map} />
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
