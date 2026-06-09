export interface Evento {
  id: string;
  titulo: string;
  local: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  dataInicio: string;
  dataTermino: string;
  imagens?: string | string[];
}

export function parseImagens(imagens?: string | string[]): string[] {
  if (!imagens) return [];
  if (Array.isArray(imagens)) return imagens.map((url) => url.trim()).filter(Boolean);

  const texto = imagens.trim();
  if (!texto) return [];

  if (texto.startsWith('[')) {
    try {
      const lista = JSON.parse(texto);
      if (Array.isArray(lista)) return lista.map((url) => String(url).trim()).filter(Boolean);
    } catch {
      // segue para outros formatos
    }
  }

  if (texto.startsWith('data:image/')) return [texto];

  return texto
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}
