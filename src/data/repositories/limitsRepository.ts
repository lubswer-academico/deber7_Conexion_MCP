import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGLAS_POR_DEFECTO } from '@/models/wellbeingModel';
import { IRepositorioLimites, ReglaApp } from '@/types/wellbeing';

const CLAVE_ALMACENAMIENTO = '@wellbeing_app_rules_v1';
const CLAVE_MUERTES = '@wellbeing_death_count_v1';

export const repositorioLimites: IRepositorioLimites = {
  async obtenerTodas(): Promise<ReglaApp[]> {
    try {
      const guardado = await AsyncStorage.getItem(CLAVE_ALMACENAMIENTO);
      if (!guardado) {
        await AsyncStorage.setItem(
          CLAVE_ALMACENAMIENTO,
          JSON.stringify(REGLAS_POR_DEFECTO)
        );
        return REGLAS_POR_DEFECTO;
      }
      return JSON.parse(guardado) as ReglaApp[];
    } catch (error) {
      console.error('[repositorioLimites.obtenerTodas]', error);
      return REGLAS_POR_DEFECTO;
    }
  },

  async guardar(regla: ReglaApp): Promise<ReglaApp[]> {
    const actuales = await this.obtenerTodas();
    const indice = actuales.findIndex((item) => item.id === regla.id);

    const actualizadas =
      indice >= 0
        ? actuales.map((item) => (item.id === regla.id ? regla : item))
        : [...actuales, regla];

    await AsyncStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(actualizadas));
    return actualizadas;
  },

  async eliminar(id: string): Promise<ReglaApp[]> {
    const actuales = await this.obtenerTodas();
    const actualizadas = actuales.filter((item) => item.id !== id);
    await AsyncStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(actualizadas));
    return actualizadas;
  },

  async restaurarPorDefecto(): Promise<ReglaApp[]> {
    await AsyncStorage.setItem(
      CLAVE_ALMACENAMIENTO,
      JSON.stringify(REGLAS_POR_DEFECTO)
    );
    return REGLAS_POR_DEFECTO;
  },

  async obtenerContadorMuertes(): Promise<number> {
    try {
      const guardado = await AsyncStorage.getItem(CLAVE_MUERTES);
      return guardado ? Math.max(0, parseInt(guardado, 10) || 0) : 0;
    } catch (error) {
      console.error('[repositorioLimites.obtenerContadorMuertes]', error);
      return 0;
    }
  },

  async guardarContadorMuertes(total: number): Promise<void> {
    try {
      await AsyncStorage.setItem(CLAVE_MUERTES, String(Math.max(0, total)));
    } catch (error) {
      console.error('[repositorioLimites.guardarContadorMuertes]', error);
    }
  },
};
