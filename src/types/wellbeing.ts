export type EstadoAnimoMascota = 'feliz' | 'cansada' | 'critica';

export interface ReglaApp {
  id: string;
  nombrePaquete: string;
  nombreVisible: string;
  limiteDiarioMinutos: number;
  minutosDescanso: number;
}

export interface RegistroUsoApp {
  nombrePaquete: string;
  minutosUsadosHoy: number;
  ultimoUsoTimestamp: number;
}

export interface EstadoAppVigilada extends ReglaApp {
  minutosUsadosHoy: number;
  minutosExcedidos: number;
  minutosDesdeUltimoUso: number;
  estaExcedida: boolean;
  enRecuperacion: boolean;
  progresoRecuperacion: number; // 0 a 1
}

export interface EstadoBienestarMascota {
  vitalidad: number; // 0 a 100
  estadoAnimo: EstadoAnimoMascota;
  apps: EstadoAppVigilada[];
}

export interface IRepositorioLimites {
  obtenerTodas(): Promise<ReglaApp[]>;
  guardar(regla: ReglaApp): Promise<ReglaApp[]>;
  eliminar(id: string): Promise<ReglaApp[]>;
  restaurarPorDefecto(): Promise<ReglaApp[]>;
  obtenerContadorMuertes(): Promise<number>;
  guardarContadorMuertes(total: number): Promise<void>;
}

export interface IFuenteEstadisticasUso {
  estaDisponibleNativo(): boolean;
  tienePermiso(): Promise<boolean>;
  solicitarPermiso(): Promise<void>;
  obtenerUsoHoy(
    nombresPaquetes: string[],
    usarSimulacion: boolean
  ): Promise<RegistroUsoApp[]>;
  simularAgregarMinutos(nombrePaquete: string, deltaMinutos: number): void;
  simularTiempoDescanso(minutosSinUso: number): void;
}

export interface DependenciasBienestarVM {
  repositorio?: IRepositorioLimites;
  fuente?: IFuenteEstadisticasUso;
}

export interface BienestarViewModel {
  vitalidad: number;
  estadoAnimo: EstadoAnimoMascota;
  poseMascota: number;
  estaMuerta: boolean;
  contadorMuertes: number;
  apps: EstadoAppVigilada[];
  cargando: boolean;
  modoSimulacion: boolean;
  puenteNativoDisponible: boolean;
  tienePermisoUso: boolean;
  modalVisible: boolean;
  reglaEnEdicion: ReglaApp | null;
  actualizarUso: () => Promise<void>;
  abrirModalCrear: () => void;
  abrirModalEditar: (regla: ReglaApp) => void;
  cerrarModal: () => void;
  ajustarVitalidadManual: (valor: number) => void;
  guardarRegla: (regla: ReglaApp) => Promise<void>;
  eliminarRegla: (id: string) => Promise<void>;
  restaurarPorDefecto: () => Promise<void>;
  alternarModoSimulacion: () => void;
  simularUso: (nombrePaquete: string, deltaMinutos: number) => Promise<void>;
  simularDescanso: (minutos: number) => Promise<void>;
  alTocarMascota: () => Promise<void>;
  solicitarPermisoAndroid: () => Promise<void>;
}
