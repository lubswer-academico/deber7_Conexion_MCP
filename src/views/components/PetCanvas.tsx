import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Alignment,
  Fit,
  RiveLog,
  RiveView,
  useRiveFile,
  useRiveNumber,
  useViewModelInstance,
} from '@rive-app/react-native';

RiveLog.setLogLevel('error');


const TAMANO_ICONO_SLIDER = 62;

interface PropiedadesBarraVitalidad {
  vitalidad: number;
  alCambiarVitalidad: (valor: number) => void;
}

interface PropiedadesLienzoMascota {
  numeroPose: number;
  estaMuerta: boolean;
  contadorMuertes: number;
  alTocarMascota?: () => void;
}


export function VitalityBar({
  vitalidad,
  alCambiarVitalidad,
}: PropiedadesBarraVitalidad) {
  const anchoPistaRef = useRef(1);
  const alCambiarRef = useRef(alCambiarVitalidad);
  alCambiarRef.current = alCambiarVitalidad;

  const actualizarDesdeX = (x: number) => {
    const ancho = Math.max(1, anchoPistaRef.current);
    const porcentaje = Math.max(0, Math.min(100, (x / ancho) * 100));
    alCambiarRef.current(porcentaje);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evento) => {
        actualizarDesdeX(evento.nativeEvent.locationX);
      },
      onPanResponderMove: (evento) => {
        actualizarDesdeX(evento.nativeEvent.locationX);
      },
    })
  ).current;

  return (
    <View style={estilos.contenedorSlider}>
      <View
        style={estilos.zonaPista}
        onLayout={(evento) => {
          anchoPistaRef.current = evento.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View style={estilos.pistaVitalidad}>
          <View
            style={[
              estilos.rellenoVitalidad,
              { width: `${vitalidad}%` },
            ]}
          />
        </View>

        <View
          pointerEvents="none"
          style={[estilos.iconoContenedor, { left: `${vitalidad}%` }]}
        >
          <Image
            source={require('../../../assets/cabezaGoblin.png')}
            style={estilos.iconoSlider}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}




export function PetCanvas({
  numeroPose,
  estaMuerta,
  contadorMuertes,
  alTocarMascota,
}: PropiedadesLienzoMascota) {

  // 1. Goblin "vivo"
  const { riveFile, isLoading, error } = useRiveFile(
    require('../../../assets/animations/pet.riv')
  );

  const { instance: instanciaViewModel, error: errorViewModel } =
    useViewModelInstance(riveFile, {
      artboardName: 'new_JSON',
      async: true,
      onInit: (vmi) => {
        vmi.numberProperty('numberProperty')?.set(numeroPose);
      },
    });

  const { setValue: asignarNumeroPose, error: errorPropiedad } = useRiveNumber(
    'numberProperty',
    instanciaViewModel
  );

  useEffect(() => {
    if (!instanciaViewModel) return;
    asignarNumeroPose(numeroPose);
  }, [numeroPose, instanciaViewModel, asignarNumeroPose]);

  // 2. Goblin muerto "lapida"
  const { riveFile: archivoRip, error: errorArchivoRip } = useRiveFile(
    require('../../../assets/animations/petRIP.riv')
  );

  const { instance: instanciaRip, error: errorInstanciaRip } =
    useViewModelInstance(archivoRip, {
      artboardName: 'Artboard',
      async: true,
      onInit: (vmi) => {
        vmi.numberProperty('Death Count')?.set(contadorMuertes);
      },
    });

  const { setValue: asignarMuertes, error: errorPropiedadRip } = useRiveNumber(
    'Death Count',
    instanciaRip
  );

  useEffect(() => {
    if (!instanciaRip) return;
    asignarMuertes(contadorMuertes);
  }, [contadorMuertes, instanciaRip, asignarMuertes]);

  const mensajeError =
    error?.message ??
    errorViewModel?.message ??
    errorPropiedad?.message ??
    errorArchivoRip?.message ??
    errorInstanciaRip?.message ??
    errorPropiedadRip?.message;

  return (
    <Pressable
      style={estilos.escenario}
      onPress={estaMuerta ? undefined : alTocarMascota}
    >
      {isLoading && (
        <ActivityIndicator size="large" color="#60A5FA" />
      )}

      {mensajeError && (
        <Text style={estilos.textoError}>Error Rive: {mensajeError}</Text>
      )}

      {riveFile && instanciaViewModel && (
        <RiveView
          file={riveFile}
          artboardName="new_JSON"
          stateMachineName="State Machine 1"
          dataBind={instanciaViewModel}
          fit={Fit.Contain}
          alignment={Alignment.BottomCenter}
          autoPlay={true}
          style={[estilos.rive, estaMuerta && estilos.oculto]}
        />
      )}

      {archivoRip && instanciaRip && (
        <RiveView
          file={archivoRip}
          artboardName="Artboard"
          stateMachineName="State Machine 1"
          dataBind={instanciaRip}
          fit={Fit.Contain}
          alignment={Alignment.BottomCenter}
          autoPlay={true}
          style={[estilos.riveRip, !estaMuerta && estilos.oculto]}
        />
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  escenario: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  rive: {
    width: '100%',
    height: 550,
    transform: [{ translateY: 140 }],
  },
  riveRip: {
    width: 700,
    height: 700,
  },
  oculto: {
    display: 'none',
  },
  textoError: {
    color: '#FCA5A5',
    fontSize: 12,
    textAlign: 'center',
  },
  contenedorSlider: {
    width: '100%',
    paddingHorizontal: TAMANO_ICONO_SLIDER / 2,
    paddingVertical: 10,
    justifyContent: 'center',
    overflow: 'visible',
  },
  zonaPista: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  iconoContenedor: {
    width: TAMANO_ICONO_SLIDER,
    height: TAMANO_ICONO_SLIDER,
    position: 'absolute',
    top: '50%',
    marginTop: -(TAMANO_ICONO_SLIDER / 2),
    marginLeft: -(TAMANO_ICONO_SLIDER / 2),
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  iconoSlider: {
    width: '100%',
    height: '100%',
  },
  pistaVitalidad: {
    width: '100%',
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
  },
  rellenoVitalidad: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
});
