import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EstadoAppVigilada } from '@/types/wellbeing';

interface PropiedadesTarjetaUsoApp {
  app: EstadoAppVigilada;
  modoSimulacion: boolean;
  alEditar: (app: EstadoAppVigilada) => void;
  alSimularUso: (nombrePaquete: string, deltaMinutos: number) => void;
}

const ICONOS_POR_ID: Record<string, ImageSourcePropType> = {
  youtube: require('../../../assets/youtube.png'),
  tiktok: require('../../../assets/tik-tok.png'),
  instagram: require('../../../assets/instagram.png'),
  browser: require('../../../assets/chrome.png'),
};

export function AppUsageCard({
  app,
  modoSimulacion,
  alEditar,
  alSimularUso,
}: PropiedadesTarjetaUsoApp) {
  const proporcion =
    app.limiteDiarioMinutos > 0
      ? Math.min(1, app.minutosUsadosHoy / app.limiteDiarioMinutos)
      : 1;
  const colorBarra = app.estaExcedida ? '#DC2626' : '#dcdddfff';
  const icono = ICONOS_POR_ID[app.id] ?? ICONOS_POR_ID.browser;

  return (
    <Pressable style={estilos.tarjeta} onPress={() => alEditar(app)}>
      <Image source={icono} style={estilos.icono} resizeMode="contain" />

      <View style={estilos.contenidoDerecho}>
        <View style={estilos.filaSuperior}>
          <Text style={estilos.titulo}>{app.nombreVisible}</Text>
          <Text
            style={[estilos.insigniaUso, app.estaExcedida && estilos.insigniaExcedida]}
          >
            {app.minutosUsadosHoy} / {app.limiteDiarioMinutos} min
          </Text>
        </View>

        <View style={estilos.pistaProgreso}>
          <View
            style={[
              estilos.rellenoProgreso,
              { width: `${proporcion * 100}%`, backgroundColor: colorBarra },
            ]}
          />
        </View>

        {(app.estaExcedida || modoSimulacion) && (
          <View style={estilos.filaInferior}>
            {app.estaExcedida ? (
              <Text style={estilos.textoAlerta}>
                +{app.minutosExcedidos}m exceso · Recup.{' '}
                {Math.round(app.progresoRecuperacion * 100)}%
              </Text>
            ) : (
              <Text style={estilos.subtitulo}>
                Descanso: {app.minutosDescanso} min
              </Text>
            )}

            {modoSimulacion && (
              <Pressable
                style={estilos.botonSimular}
                onPress={(evento) => {
                  evento.stopPropagation();
                  alSimularUso(app.nombrePaquete, 15);
                }}
              >
                <Text style={estilos.textoBotonSimular}>+15m</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 6,
    gap: 10,
    paddingTop: 12,
  },
  icono: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  contenidoDerecho: {
    flex: 1,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  insigniaUso: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f5f5f5ff',
  },
  insigniaExcedida: {
    color: '#FCA5A5',
  },
  pistaProgreso: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rellenoProgreso: {
    height: '100%',
    borderRadius: 4,
  },
  filaInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  subtitulo: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  textoAlerta: {
    fontSize: 11,
    color: '#FCA5A5',
    fontWeight: '600',
  },
  botonSimular: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  textoBotonSimular: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
});
