package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

class UsageStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    AsyncFunction("tienePermisoUso") {
      val contexto = appContext.reactContext ?: return@AsyncFunction false
      val appOps = contexto.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val modo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          Process.myUid(),
          contexto.packageName
        )
      } else {
        @Suppress("DEPRECATION")
        appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS,
          Process.myUid(),
          contexto.packageName
        )
      }
      modo == AppOpsManager.MODE_ALLOWED
    }

    AsyncFunction("solicitarPermisoUso") {
      val contexto = appContext.reactContext ?: return@AsyncFunction null
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      contexto.startActivity(intent)
      null
    }

    AsyncFunction("obtenerUsoHoy") { nombresPaquetes: List<String> ->
      val contexto = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any>>()
      val administradorUso =
        contexto.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

      val calendario = Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
      }
      val inicioDia = calendario.timeInMillis
      val ahora = System.currentTimeMillis()

      val estadisticas = administradorUso.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        inicioDia,
        ahora
      ) ?: emptyList()

      val totalesPorPaquete = mutableMapOf<String, Long>()
      val ultimoUsoPorPaquete = mutableMapOf<String, Long>()

      for (registro in estadisticas) {
        val paquete = registro.packageName
        totalesPorPaquete[paquete] = (totalesPorPaquete[paquete] ?: 0L) + registro.totalTimeInForeground
        val ultimoPrevio = ultimoUsoPorPaquete[paquete] ?: 0L
        if (registro.lastTimeUsed > ultimoPrevio) {
          ultimoUsoPorPaquete[paquete] = registro.lastTimeUsed
        }
      }

      nombresPaquetes.map { paquete ->
        val totalMs = totalesPorPaquete[paquete] ?: 0L
        val minutosUsados = (totalMs / 60000L).toInt()
        val ultimoUso = ultimoUsoPorPaquete[paquete] ?: 0L
        mapOf(
          "nombrePaquete" to paquete,
          "minutosUsadosHoy" to minutosUsados,
          "ultimoUsoTimestamp" to ultimoUso
        )
      }
    }
  }
}
