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
  imagens?: string;
}

export function parseImagens(imagens?: string): string[] {
  if (!imagens) return [];
  return imagens.split(',').map((url) => url.trim()).filter(Boolean);
}
