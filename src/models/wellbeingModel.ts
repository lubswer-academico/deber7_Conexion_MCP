import {
  EstadoAnimoMascota,
  EstadoAppVigilada,
  EstadoBienestarMascota,
  RegistroUsoApp,
  ReglaApp,
} from '@/types/wellbeing';

export const POSE_REPOSO = 1;
export const POSE_FELIZ = 2;
export const POSE_TRISTE = 3;
export const POSE_VOLANDO = 4;
export const POSE_LLORANDO = 7;
export const POSE_ASUSTADO = 8;

export const REGLAS_POR_DEFECTO: ReglaApp[] = [
  {
    id: 'youtube',
    nombrePaquete: 'com.google.android.youtube',
    nombreVisible: 'YouTube',
    limiteDiarioMinutos: 45,
    minutosDescanso: 15,
  },
  {
    id: 'tiktok',
    nombrePaquete: 'com.zhiliaoapp.musically',
    nombreVisible: 'TikTok',
    limiteDiarioMinutos: 30,
    minutosDescanso: 20,
  },
  {
    id: 'instagram',
    nombrePaquete: 'com.instagram.android',
    nombreVisible: 'Instagram',
    limiteDiarioMinutos: 30,
    minutosDescanso: 15,
  },
  {
    id: 'browser',
    nombrePaquete: 'com.android.chrome',
    nombreVisible: 'Navegador',
    limiteDiarioMinutos: 60,
    minutosDescanso: 10,
  },
];

export function mapearVitalidadAPose(vitalidad: number): number {
  if (vitalidad >= 80) return POSE_FELIZ;
  if (vitalidad >= 60) return POSE_REPOSO;
  if (vitalidad >= 40) return POSE_TRISTE;
  if (vitalidad >= 20) return POSE_ASUSTADO;
  return POSE_LLORANDO;
}


export function calcularBienestarMascota(
  reglas: ReglaApp[],
  listaUso: RegistroUsoApp[],
  ahoraMs: number = Date.now()
): EstadoBienestarMascota {
  const mapaUso = new Map(listaUso.map((u) => [u.nombrePaquete, u]));

  let penalizacionTotal = 0;
  let bonificacionRecuperacion = 0;

  const apps: EstadoAppVigilada[] = reglas.map((regla) => {
    const registro = mapaUso.get(regla.nombrePaquete);
    const minutosUsadosHoy = registro?.minutosUsadosHoy ?? 0;
    const ultimoUsoTimestamp = registro?.ultimoUsoTimestamp ?? 0;

    const minutosExcedidos = Math.max(
      0,
      minutosUsadosHoy - regla.limiteDiarioMinutos
    );
    const estaExcedida = minutosExcedidos > 0;

    const minutosDesdeUltimoUso =
      ultimoUsoTimestamp > 0
        ? Math.max(0, Math.floor((ahoraMs - ultimoUsoTimestamp) / 60000))
        : regla.minutosDescanso;

    const progresoRecuperacion =
      regla.minutosDescanso > 0
        ? Math.min(1, minutosDesdeUltimoUso / regla.minutosDescanso)
        : 1;

    const enRecuperacion = estaExcedida && progresoRecuperacion < 1;

    if (estaExcedida) {
      const penalizacionBase = minutosExcedidos * 2;
      const penalizacionMitigada =
        penalizacionBase * (1 - progresoRecuperacion * 0.6);
      penalizacionTotal += penalizacionMitigada;

      if (progresoRecuperacion >= 1) {
        bonificacionRecuperacion += 5;
      }
    }

    return {
      ...regla,
      minutosUsadosHoy,
      minutosExcedidos,
      minutosDesdeUltimoUso,
      estaExcedida,
      enRecuperacion,
      progresoRecuperacion,
    };
  });

  const vitalidad = Math.round(
    Math.max(
      0,
      Math.min(100, 100 - penalizacionTotal + bonificacionRecuperacion)
    )
  );

  let estadoAnimo: EstadoAnimoMascota = 'feliz';
  if (vitalidad < 40) {
    estadoAnimo = 'critica';
  } else if (vitalidad < 75) {
    estadoAnimo = 'cansada';
  }

  return { vitalidad, estadoAnimo, apps };
}
