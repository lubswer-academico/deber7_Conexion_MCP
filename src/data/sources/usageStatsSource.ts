import { Platform } from 'react-native';
import { IFuenteEstadisticasUso, RegistroUsoApp } from '@/types/wellbeing';
import UsoNativo from '../../../modules/usage-stats';

const mapaUsoSimulado = new Map<string, RegistroUsoApp>();


export const fuenteEstadisticasUso: IFuenteEstadisticasUso = {
  estaDisponibleNativo(): boolean {
    return Platform.OS === 'android' && Boolean(UsoNativo?.obtenerUsoHoy);
  },

  async tienePermiso(): Promise<boolean> {
    if (!this.estaDisponibleNativo() || !UsoNativo) {
      return false;
    }
    return UsoNativo.tienePermisoUso();
  },

  async solicitarPermiso(): Promise<void> {
    if (this.estaDisponibleNativo() && UsoNativo) {
      await UsoNativo.solicitarPermisoUso();
    }
  },

  async obtenerUsoHoy(
    nombresPaquetes: string[],
    usarSimulacion: boolean
  ): Promise<RegistroUsoApp[]> {
    if (!usarSimulacion && this.estaDisponibleNativo() && UsoNativo) {
      return UsoNativo.obtenerUsoHoy(nombresPaquetes);
    }

    const ahora = Date.now();
    return nombresPaquetes.map((nombrePaquete) => {
      const existente = mapaUsoSimulado.get(nombrePaquete);
      if (existente) return existente;

      const inicial: RegistroUsoApp = {
        nombrePaquete,
        minutosUsadosHoy: 10,
        ultimoUsoTimestamp: ahora - 30 * 60000,
      };
      mapaUsoSimulado.set(nombrePaquete, inicial);
      return inicial;
    });
  },

  simularAgregarMinutos(nombrePaquete: string, deltaMinutos: number): void {
    const ahora = Date.now();
    const actual = mapaUsoSimulado.get(nombrePaquete) ?? {
      nombrePaquete,
      minutosUsadosHoy: 10,
      ultimoUsoTimestamp: ahora,
    };

    mapaUsoSimulado.set(nombrePaquete, {
      nombrePaquete,
      minutosUsadosHoy: Math.max(0, actual.minutosUsadosHoy + deltaMinutos),
      ultimoUsoTimestamp: deltaMinutos > 0 ? ahora : actual.ultimoUsoTimestamp,
    });
  },

  simularTiempoDescanso(minutosSinUso: number): void {
    const timestampObjetivo = Date.now() - minutosSinUso * 60000;
    for (const [paquete, registro] of mapaUsoSimulado.entries()) {
      mapaUsoSimulado.set(paquete, {
        ...registro,
        ultimoUsoTimestamp: Math.min(registro.ultimoUsoTimestamp, timestampObjetivo),
      });
    }
  },
};
