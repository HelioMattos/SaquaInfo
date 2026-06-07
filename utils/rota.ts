export interface Coordenada {
  latitude: number;
  longitude: number;
}

export interface InfoRota {
  coordenadas: Coordenada[];
  distanciaMetros: number;
  duracaoSegundos: number;
}

export async function buscarRota(
  origem: Coordenada,
  destino: Coordenada
): Promise<InfoRota | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.[0]) return null;

    const route = data.routes[0];
    const coordenadas: Coordenada[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      })
    );

    return {
      coordenadas,
      distanciaMetros: route.distance,
      duracaoSegundos: route.duration,
    };
  } catch {
    return null;
  }
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}

export function formatarDuracao(segundos: number): string {
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
