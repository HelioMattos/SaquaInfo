import { Alert, Linking, Platform } from 'react-native';
import { SITE_URL } from './site';

type ParamsEvento = Record<string, string | string[] | undefined>;

function valorParam(params: ParamsEvento, chave: string): string | undefined {
  const valor = params[chave];
  if (!valor) return undefined;
  return Array.isArray(valor) ? valor[0] : valor;
}

export function gerarLinkEvento(params: ParamsEvento): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.href;
  }

  const id = valorParam(params, 'id');
  if (id) {
    return `${SITE_URL}/modal?id=${encodeURIComponent(id)}`;
  }

  const search = new URLSearchParams();
  const campos = ['id', 'titulo', 'local', 'dataInicio'];

  campos.forEach((campo) => {
    const valor = valorParam(params, campo);
    if (valor) search.set(campo, valor);
  });

  const query = search.toString();
  return query ? `${SITE_URL}/modal?${query}` : SITE_URL;
}

export function compartilharEventoWhatsApp(
  params: ParamsEvento,
  formatarData: (data?: string) => string
) {
  const link = gerarLinkEvento(params);
  const titulo = valorParam(params, 'titulo') || 'Evento';
  const local = valorParam(params, 'local') || 'Saquarema';

  const mensagem =
    `Confira este evento no *SaquaInfo*! 🌊\n\n` +
    `🎉 *${titulo}*\n` +
    `📍 *Local:* ${local}\n` +
    `📅 *Quando:* ${formatarData(valorParam(params, 'dataInicio'))}\n\n` +
    `🔗 *Veja todas as fotos e detalhes aqui:*\n${link}`;

  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  Linking.openURL(url).catch(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('Não foi possível abrir o WhatsApp.');
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    }
  });
}
