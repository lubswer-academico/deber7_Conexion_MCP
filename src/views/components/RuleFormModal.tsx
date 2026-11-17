import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ReglaApp } from '@/types/wellbeing';

interface PropiedadesModalFormularioRegla {
  visible: boolean;
  reglaEnEdicion: ReglaApp | null;
  alCerrar: () => void;
  alGuardar: (regla: ReglaApp) => Promise<void>;
}

export function RuleFormModal({
  visible,
  reglaEnEdicion,
  alCerrar,
  alGuardar,
}: PropiedadesModalFormularioRegla) {
  const [nombreVisible, setNombreVisible] = useState('');
  const [nombrePaquete, setNombrePaquete] = useState('');
  const [limiteDiario, setLimiteDiario] = useState('30');
  const [minutosDescanso, setMinutosDescanso] = useState('15');
  const [alturaTeclado, setAlturaTeclado] = useState(0);

  useEffect(() => {
    const eventoMostrar =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const eventoOcultar =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subMostrar = Keyboard.addListener(eventoMostrar, (evento) => {
      setAlturaTeclado(evento.endCoordinates.height);
    });
    const subOcultar = Keyboard.addListener(eventoOcultar, () => {
      setAlturaTeclado(0);
    });

    return () => {
      subMostrar.remove();
      subOcultar.remove();
    };
  }, []);

  useEffect(() => {
    if (reglaEnEdicion) {
      setNombreVisible(reglaEnEdicion.nombreVisible);
      setNombrePaquete(reglaEnEdicion.nombrePaquete);
      setLimiteDiario(String(reglaEnEdicion.limiteDiarioMinutos));
      setMinutosDescanso(String(reglaEnEdicion.minutosDescanso));
    } else {
      setNombreVisible('');
      setNombrePaquete('');
      setLimiteDiario('30');
      setMinutosDescanso('15');
    }
  }, [reglaEnEdicion, visible]);

  const manejarGuardar = async () => {
    const nombreLimpio = nombreVisible.trim();
    if (!nombreLimpio) return;

    const regla: ReglaApp = {
      id: reglaEnEdicion?.id ?? `${Date.now()}`,
      nombreVisible: nombreLimpio,
      nombrePaquete:
        nombrePaquete.trim() ||
        `com.custom.${nombreLimpio.toLowerCase().replace(/\s+/g, '')}`,
      limiteDiarioMinutos: Math.max(1, parseInt(limiteDiario, 10) || 30),
      minutosDescanso: Math.max(1, parseInt(minutosDescanso, 10) || 15),
    };

    await alGuardar(regla);
    alCerrar();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={alCerrar}
    >
      <View style={[estilos.fondoOscuro, { paddingBottom: alturaTeclado }]}>
        <View style={estilos.hoja}>
          <Text style={estilos.titulo}>
            {reglaEnEdicion ? 'Editar App y Tiempo de uso' : 'Nueva app vigilada'}
          </Text>

          <Text style={estilos.etiqueta}>Nombre de la aplicación</Text>
          <TextInput
            style={estilos.entrada}
            value={nombreVisible}
            onChangeText={setNombreVisible}
            placeholder="Ej. TikTok, YouTube..."
            placeholderTextColor="#94A3B8"
          />

          <Text style={estilos.etiqueta}>Package Name Android (opcional)</Text>
          <TextInput
            style={estilos.entrada}
            value={nombrePaquete}
            onChangeText={setNombrePaquete}
            placeholder="Ej. com.zhiliaoapp.musically"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
          />

          <View style={estilos.fila}>
            <View style={estilos.mitad}>
              <Text style={estilos.etiqueta}>Límite diario (min)</Text>
              <TextInput
                style={estilos.entrada}
                value={limiteDiario}
                onChangeText={setLimiteDiario}
                keyboardType="numeric"
              />
            </View>
            <View style={estilos.mitad}>
              <Text style={estilos.etiqueta}>Descanso (min)</Text>
              <TextInput
                style={estilos.entrada}
                value={minutosDescanso}
                onChangeText={setMinutosDescanso}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={estilos.botones}>
            <Pressable style={estilos.botonCancelar} onPress={alCerrar}>
              <Text style={estilos.textoCancelar}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={estilos.botonGuardar}
              onPress={() => void manejarGuardar()}
            >
              <Text style={estilos.textoGuardar}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondoOscuro: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  hoja: {
    backgroundColor: 'rgba(10, 12, 18, 0.88)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 4,
  },
  entrada: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  fila: {
    flexDirection: 'row',
    gap: 12,
  },
  mitad: {
    flex: 1,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#CBD5E1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#000000',
    fontWeight: '700',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoGuardar: {
    color: '#000000',
    fontWeight: '700',
  },
});
