import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useWellbeingVM } from '@/viewmodels/useWellbeingVM';
import { PetCanvas, VitalityBar } from '@/views/components/PetCanvas';
import { AppUsageCard } from '@/views/components/AppUsageCard';
import { RuleFormModal } from '@/views/components/RuleFormModal';

/**
 * Vista pura: cero useState de flujo, cero lógica de negocio.
 * Se enlaza estrictamente a `useWellbeingVM`.
 */
export function WellbeingView() {
  const vm = useWellbeingVM();
  const insets = useSafeAreaInsets();

  return (
    <View style={estilos.raiz}>
      <View style={{ height: insets.top, backgroundColor: '#343d68' }} />
      <ImageBackground
        source={require('../../assets/fondo.png')}
        resizeMode="cover"
        style={estilos.fondo}
      >
        <SafeAreaView style={estilos.areaSegura} edges={['bottom']}>
        <View style={estilos.contenedor}>
          <View style={estilos.contenedorVitalidad}>
            <VitalityBar
              vitalidad={vm.vitalidad}
              alCambiarVitalidad={vm.ajustarVitalidadManual}
            />
          </View>

          {vm.cargando ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 20 }} />
          ) : (
            <View style={estilos.panelApps}>
              <FlatList
                data={vm.apps}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <AppUsageCard
                    app={item}
                    modoSimulacion={vm.modoSimulacion}
                    alEditar={vm.abrirModalEditar}
                    alSimularUso={(paquete, delta) => void vm.simularUso(paquete, delta)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={estilos.separador} />}
                ListFooterComponent={() => <View style={estilos.separador} />}
                contentContainerStyle={estilos.contenidoLista}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {vm.modoSimulacion && (
            <View style={estilos.barraControles}>
              <Pressable
                style={estilos.botonDescanso}
                onPress={() => void vm.simularDescanso(30)}
              >
                <Text style={estilos.textoBotonDescanso}>Simular 30m sin uso</Text>
              </Pressable>
            </View>
          )}

          <View style={estilos.zonaMascota}>
            <PetCanvas
              numeroPose={vm.poseMascota}
              estaMuerta={vm.estaMuerta}
              contadorMuertes={vm.contadorMuertes}
              alTocarMascota={() => void vm.alTocarMascota()}
            />
          </View>

          <RuleFormModal
            visible={vm.modalVisible}
            reglaEnEdicion={vm.reglaEnEdicion}
            alCerrar={vm.cerrarModal}
            alGuardar={vm.guardarRegla}
          />
        </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: '#343d68',
  },
  fondo: {
    flex: 1,
  },
  areaSegura: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contenedor: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  barraControles: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  botonDescanso: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonDescanso: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 13,
  },
  contenedorVitalidad: {
    marginBottom: 8,
    zIndex: 2,
  },
  zonaMascota: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 6,
    zIndex: 1,
  },
  panelApps: {
    flexGrow: 0,
    maxHeight: '55%',
    backgroundColor: '#343d68',
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: -3,
    borderColor: 'rgba(255, 255, 255, 0)',
    overflow: 'hidden',
    zIndex: 2,
    paddingBottom: 15
  },
  separador: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginHorizontal: 14,
  },
  contenidoLista: {
    paddingTop: 2,
    paddingBottom: 10,
  },
});
