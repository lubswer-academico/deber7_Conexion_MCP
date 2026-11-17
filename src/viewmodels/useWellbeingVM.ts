import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  calcularBienestarMascota,
  mapearVitalidadAPose,
  POSE_VOLANDO,
} from '@/models/wellbeingModel';
import { repositorioLimites } from '@/data/repositories/limitsRepository';
import { fuenteEstadisticasUso } from '@/data/sources/usageStatsSource';
import {
  BienestarViewModel,
  DependenciasBienestarVM,
  EstadoAnimoMascota,
  EstadoAppVigilada,
  ReglaApp,
} from '@/types/wellbeing';


export function useWellbeingVM(
  dependencias: DependenciasBienestarVM = {}
): BienestarViewModel {
  const repositorio = dependencias.repositorio ?? repositorioLimites;
  const fuente = dependencias.fuente ?? fuenteEstadisticasUso;

  const [reglas, setReglas] = useState<ReglaApp[]>([]);
  const [vitalidad, setVitalidad] = useState<number>(100);
  const [vitalidadManual, setVitalidadManual] = useState<number | null>(null);
  const [estadoAnimo, setEstadoAnimo] = useState<EstadoAnimoMascota>('feliz');
  const [contadorMuertes, setContadorMuertes] = useState<number>(0);
  const [poseTemporalToque, setPoseTemporalToque] = useState<number | null>(null);
  const [apps, setApps] = useState<EstadoAppVigilada[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaApp | null>(null);

  const temporizadorToqueRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const estabaMuertaRef = useRef<boolean>(false);

  const puenteNativoDisponible = fuente.estaDisponibleNativo();
  const [modoSimulacion, setModoSimulacion] = useState<boolean>(
    !puenteNativoDisponible
  );
  const [tienePermisoUso, setTienePermisoUso] = useState<boolean>(false);

  const sincronizarEstado = useCallback(
    async (reglasActuales: ReglaApp[], usarSimulacion: boolean) => {
      const nombresPaquetes = reglasActuales.map((r) => r.nombrePaquete);
      const registros = await fuente.obtenerUsoHoy(nombresPaquetes, usarSimulacion);
      const calculado = calcularBienestarMascota(reglasActuales, registros);

      setVitalidad(calculado.vitalidad);
      setEstadoAnimo(calculado.estadoAnimo);
      setApps(calculado.apps);
    },
    [fuente]
  );

  const actualizarUso = useCallback(async () => {
    setCargando(true);
    try {
      const [reglasCargadas, muertesGuardadas] = await Promise.all([
        repositorio.obtenerTodas(),
        repositorio.obtenerContadorMuertes(),
      ]);
      setReglas(reglasCargadas);
      setContadorMuertes(muertesGuardadas);

      if (puenteNativoDisponible) {
        const permiso = await fuente.tienePermiso();
        setTienePermisoUso(permiso);
      }

      await sincronizarEstado(reglasCargadas, modoSimulacion);
    } finally {
      setCargando(false);
    }
  }, [fuente, modoSimulacion, puenteNativoDisponible, repositorio, sincronizarEstado]);

  useEffect(() => {
    void actualizarUso();
  }, [actualizarUso]);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        void actualizarUso();
      }
    });
    return () => suscripcion.remove();
  }, [actualizarUso]);

  useEffect(() => {
    return () => {
      if (temporizadorToqueRef.current) {
        clearTimeout(temporizadorToqueRef.current);
      }
    };
  }, []);

  const abrirModalCrear = useCallback(() => {
    setReglaEnEdicion(null);
    setModalVisible(true);
  }, []);

  const abrirModalEditar = useCallback((regla: ReglaApp) => {
    setReglaEnEdicion(regla);
    setModalVisible(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const ajustarVitalidadManual = useCallback((valor: number) => {
    const limitado = Math.max(0, Math.min(100, Math.round(valor)));
    setVitalidadManual(limitado);
  }, []);

  const guardarRegla = useCallback(
    async (regla: ReglaApp) => {
      const actualizadas = await repositorio.guardar(regla);
      setReglas(actualizadas);
      await sincronizarEstado(actualizadas, modoSimulacion);
    },
    [modoSimulacion, repositorio, sincronizarEstado]
  );

  const eliminarRegla = useCallback(
    async (id: string) => {
      const actualizadas = await repositorio.eliminar(id);
      setReglas(actualizadas);
      await sincronizarEstado(actualizadas, modoSimulacion);
    },
    [modoSimulacion, repositorio, sincronizarEstado]
  );

  const restaurarPorDefecto = useCallback(async () => {
    const actualizadas = await repositorio.restaurarPorDefecto();
    setReglas(actualizadas);
    await sincronizarEstado(actualizadas, modoSimulacion);
  }, [modoSimulacion, repositorio, sincronizarEstado]);

  const alternarModoSimulacion = useCallback(() => {
    setModoSimulacion((previo) => !previo);
  }, []);

  const simularUso = useCallback(
    async (nombrePaquete: string, deltaMinutos: number) => {
      fuente.simularAgregarMinutos(nombrePaquete, deltaMinutos);
      await sincronizarEstado(reglas, true);
    },
    [fuente, reglas, sincronizarEstado]
  );

  const simularDescanso = useCallback(
    async (minutos: number) => {
      fuente.simularTiempoDescanso(minutos);
      await sincronizarEstado(reglas, true);
    },
    [fuente, reglas, sincronizarEstado]
  );

  const alTocarMascota = useCallback(async () => {
    if (temporizadorToqueRef.current) {
      clearTimeout(temporizadorToqueRef.current);
    }
    setPoseTemporalToque(POSE_VOLANDO);
    temporizadorToqueRef.current = setTimeout(() => {
      setPoseTemporalToque(null);
    }, 1500);

    if (modoSimulacion) {
      await simularDescanso(20);
    }
  }, [modoSimulacion, simularDescanso]);

  const solicitarPermisoAndroid = useCallback(async () => {
    await fuente.solicitarPermiso();
    const permiso = await fuente.tienePermiso();
    setTienePermisoUso(permiso);
  }, [fuente]);

  const vitalidadMostrada = vitalidadManual ?? vitalidad;
  const estaMuerta = vitalidadMostrada <= 5;

  // Registra +1 muerte solo en la transición de viva (> 0) a muerta (0)
  useEffect(() => {
    if (estaMuerta && !estabaMuertaRef.current) {
      estabaMuertaRef.current = true;
      setContadorMuertes((previo) => {
        const siguiente = previo + 1;
        void repositorio.guardarContadorMuertes(siguiente);
        return siguiente;
      });
    } else if (!estaMuerta) {
      estabaMuertaRef.current = false;
    }
  }, [estaMuerta, repositorio]);

  const poseMascota = poseTemporalToque ?? mapearVitalidadAPose(vitalidadMostrada);

  return {
    vitalidad: vitalidadMostrada,
    estadoAnimo,
    poseMascota,
    estaMuerta,
    contadorMuertes,
    apps,
    cargando,
    modoSimulacion,
    puenteNativoDisponible,
    tienePermisoUso,
    modalVisible,
    reglaEnEdicion,
    actualizarUso,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    ajustarVitalidadManual,
    guardarRegla,
    eliminarRegla,
    restaurarPorDefecto,
    alternarModoSimulacion,
    simularUso,
    simularDescanso,
    alTocarMascota,
    solicitarPermisoAndroid,
  };
}
