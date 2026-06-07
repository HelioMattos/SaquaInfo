import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { formatarDistancia, formatarDuracao, InfoRota } from '../utils/rota';

interface MapaRotaControlsProps {
  carregando: boolean;
  rota: InfoRota | null;
  isDark: boolean;
  onTracarRota: () => void;
  onLimparRota?: () => void;
}

export default function MapaRotaControls({
  carregando,
  rota,
  isDark,
  onTracarRota,
  onLimparRota,
}: MapaRotaControlsProps) {
  const subtexto = isDark ? '#aaa' : '#666';
  const fundo = isDark ? '#1e1e1e' : '#f8f9fa';
  const borda = isDark ? '#333' : '#eee';

  return (
    <View style={{ marginTop: 12 }}>
      <TouchableOpacity
        onPress={onTracarRota}
        disabled={carregando}
        style={{
          backgroundColor: '#007bff',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: carregando ? 0.7 : 1,
        }}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="navigate" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
              Como chegar (minha localização)
            </Text>
          </>
        )}
      </TouchableOpacity>

      {rota && (
        <View
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: fundo,
            borderWidth: 1,
            borderColor: borda,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="car" size={18} color="#007bff" />
              <Text style={{ marginLeft: 6, color: subtexto, fontWeight: '600' }}>
                {formatarDistancia(rota.distanciaMetros)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time" size={18} color="#28a745" />
              <Text style={{ marginLeft: 6, color: subtexto, fontWeight: '600' }}>
                {formatarDuracao(rota.duracaoSegundos)}
              </Text>
            </View>
          </View>

          {onLimparRota && (
            <TouchableOpacity onPress={onLimparRota}>
              <Ionicons name="close-circle" size={22} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
