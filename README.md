# Bienestar Digital · Mascota Virtual (`deber7`)

Aplicación móvil **Local-First** desarrollada en **Expo (SDK 57) + TypeScript** que gamifica el control del tiempo de pantalla mediante una mascota virtual animada con **Rive**.

---

## Qué hace la aplicación

* **Lectura de tiempo de uso en Android:** Consulta el tiempo en primer plano del día actual para **YouTube**, **TikTok**, **Instagram** y **Chrome** mediante un módulo nativo propio en Kotlin (`UsageStatsManager`).
* **CRUD de metas locales (`AsyncStorage`):** Al tocar cualquier aplicación de la lista se abre un modal para editar su nombre, `packageName`, límite diario en minutos y tiempo de descanso/recuperación.
* **Mascota reactiva con Rive (Data Binding):**
  * `assets/animations/pet.riv`: Cambia automáticamente entre poses (`HAPPY`, `IDLE`, `SAD`, `FEAR`, `CRY` y `FLYING` al tocarla) según la vitalidad (`0–100%`) mediante `ViewModel1.numberProperty`.
  * `assets/animations/petRIP.riv`: Cuando la vitalidad cae a nivel crítico (`<= 5%`), reemplaza al personaje por una lápida animada e incrementa un contador persistente (`Death Count`) en `AsyncStorage`.
* **Slider táctil de prueba:** Permite ajustar manualmente la vitalidad sobre la barra superior para probar en tiempo real todas las transiciones y la animación R.I.P.

---

## Arquitectura (MVVM)

El proyecto sigue el patrón **MVVM** adaptado a React Native con Custom Hooks e inversión de dependencias mediante contratos:

```text
src/
├── app/               # Expo Router (rutas y StatusBar)
├── types/             # Contratos e interfaces (IRepositorioLimites, IFuenteEstadisticasUso, BienestarViewModel)
├── models/            # Lógica pura de dominio (cálculo de vitalidad y mapeo a poses)
├── data/
│   ├── repositories/  # CRUD y contador de muertes sobre AsyncStorage
│   └── sources/       # Adaptador para UsageStatsModule.kt + respaldo de simulación
├── viewmodels/        # useWellbeingVM.ts (estado reactivo, ciclo AppState y comandos)
└── views/             # WellbeingView.tsx y componentes puros (PetCanvas, AppUsageCard, RuleFormModal)

modules/usage-stats/   # Módulo nativo local en Kotlin (Android UsageStatsManager)
```

---

## Configuración y Uso de Servidores MCP

Los servidores MCP están encapsulados a **nivel de proyecto** como plugin de Antigravity para aislar el contexto y evitar consumo innecesario de tokens en otros repositorios:

```text
.agents/
├── plugins/deber7-mcp/
│   ├── plugin.json        # Declara el plugin local "deber7-mcp"
│   └── mcp_config.json    # Configura los servidores y sus transportes
└── skills/
    ├── context7-mcp/      # Reglas de uso de Context7
    └── rive/              # Guía de Rive Scripting y State Machines
```

### Servidores configurados en `mcp_config.json`

| Servidor | Transporte | Cómo se trabajó con él |
| :--- | :--- | :--- |
| **`rive`** | Streamable HTTP (`http://127.0.0.1:9791/mcp`) | Conectado a **Rive Desktop** para inspeccionar artboards, State Machines y propiedades de Data Binding (`numberProperty` en `pet.riv` y `Death Count` en `petRIP.riv`). |
| **`context7`** | `stdio` (`npx -y @upstash/context7-mcp`) | Consultado para obtener documentación oficial vigente por versión (`expo`, `react-native`, `@rive-app/react-native`). |
| **`figma` / `supabase`** | Streamable HTTP (OAuth) | Registrados en el manifiesto como respaldo por si el proyecto escalara a diseño en Figma o sincronización en la nube. |

---

## Cómo ejecutar y compilar

> Debido a que `@rive-app/react-native` y el módulo Kotlin `UsageStats` usan código nativo, la app requiere un **Development Build** (no corre en Expo Go).

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Compilar el APK de desarrollo (EAS Build):**
   ```bash
   eas login
   eas build -p android --profile development
   ```
   *(Para generar el APK cerrado de entrega final usar `--profile preview`).*

3. **Iniciar el servidor de desarrollo y conectar el teléfono:**
   ```bash
   npx expo start --dev-client
   ```

4. **Permiso de Android para lectura real:**  
   En el teléfono, ir a **Ajustes > Aplicaciones > Acceso especial > Acceso a datos de uso > `deber7` > Activar** *(en Android 13+, habilitar antes "Permitir ajustes restringidos" en los detalles de la app)*.

---

## Créditos
* Personaje base de Rive adaptado de *Character poses* por **avocadenko** (Rive Community, licencia **CC BY 4.0**).
