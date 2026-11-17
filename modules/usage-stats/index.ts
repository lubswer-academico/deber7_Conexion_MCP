import { requireOptionalNativeModule } from 'expo-modules-core';
import { RegistroUsoApp } from '@/types/wellbeing';

interface ModuloNativoUso {
  tienePermisoUso(): Promise<boolean>;
  solicitarPermisoUso(): Promise<void>;
  obtenerUsoHoy(nombresPaquetes: string[]): Promise<RegistroUsoApp[]>;
}

export default requireOptionalNativeModule<ModuloNativoUso>('UsageStats');
