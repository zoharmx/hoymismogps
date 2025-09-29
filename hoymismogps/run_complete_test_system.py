#!/usr/bin/env python3
"""
HoyMismoGPS - Sistema Completo de Pruebas y Simulación
Script maestro que ejecuta todo el sistema de datos de prueba y validación
"""

import asyncio
import subprocess
import sys
import time
import json
from pathlib import Path
import logging
from datetime import datetime
import signal
import threading
from typing import Optional, List

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/ubuntu/HoyMismoGPS/logs/complete_test_system.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('CompleteTestSystem')

class HoyMismoGPSTestSystem:
    """Sistema completo de pruebas HoyMismoGPS"""
    
    def __init__(self):
        self.base_dir = Path("/home/ubuntu/HoyMismoGPS")
        self.running_processes = []
        self.shutdown_requested = False
        
        # URLs por defecto (pueden ser sobreescritas)
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        
        # Configurar manejo de señales
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Manejador de señales para shutdown graceful"""
        logger.info(f"🛑 Señal recibida ({signum}), iniciando shutdown...")
        self.shutdown_requested = True
    
    def setup_environment(self):
        """Configura el entorno necesario"""
        logger.info("🔧 Configurando entorno...")
        
        # Crear directorios necesarios
        directories = [
            "logs", "data-simulators/generated_routes", "data-simulators/test_data",
            "monitoring/data", "testing/reports", "security"
        ]
        
        for directory in directories:
            (self.base_dir / directory).mkdir(parents=True, exist_ok=True)
        
        # Instalar dependencias de Python si es necesario
        try:
            import aiohttp
            import firebase_admin
            import psutil
        except ImportError:
            logger.info("📦 Instalando dependencias necesarias...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", 
                "aiohttp", "firebase-admin", "psutil", "websockets"
            ], check=True)
        
        logger.info("✅ Entorno configurado correctamente")
    
    def generate_test_data(self):
        """Genera todos los datos de prueba"""
        logger.info("📊 Generando datos de prueba...")
        
        try:
            # 1. Generar trayectorias GPS
            logger.info("🗺️ Generando trayectorias GPS...")
            result = subprocess.run([
                sys.executable, 
                str(self.base_dir / "data-simulators/gps_trajectory_generator.py")
            ], capture_output=True, text=True, cwd=str(self.base_dir))
            
            if result.returncode != 0:
                logger.error(f"❌ Error generando trayectorias GPS: {result.stderr}")
                return False
            
            logger.info("✅ Trayectorias GPS generadas")
            
            # 2. Generar datos de organizaciones, usuarios, geocercas y alertas
            logger.info("🏢 Generando datos de organizaciones y usuarios...")
            result = subprocess.run([
                sys.executable, 
                str(self.base_dir / "data-simulators/test_data_generator.py")
            ], capture_output=True, text=True, cwd=str(self.base_dir))
            
            if result.returncode != 0:
                logger.error(f"❌ Error generando datos de prueba: {result.stderr}")
                return False
            
            logger.info("✅ Datos de prueba generados")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error durante generación de datos: {e}")
            return False
    
    def start_monitoring(self):
        """Inicia el sistema de monitoreo"""
        logger.info("📊 Iniciando sistema de monitoreo...")
        
        try:
            # Iniciar monitor de métricas en un hilo separado
            def run_monitoring():
                subprocess.run([
                    sys.executable,
                    str(self.base_dir / "monitoring/metrics_monitor.py")
                ], cwd=str(self.base_dir))
            
            monitoring_thread = threading.Thread(target=run_monitoring, daemon=True)
            monitoring_thread.start()
            
            logger.info("✅ Sistema de monitoreo iniciado")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error iniciando monitoreo: {e}")
            return False
    
    def start_gps_simulator(self):
        """Inicia el simulador GPS en tiempo real"""
        logger.info("🛰️ Iniciando simulador GPS...")
        
        try:
            # Iniciar simulador GPS en proceso separado
            gps_process = subprocess.Popen([
                sys.executable,
                str(self.base_dir / "data-simulators/real_time_gps_simulator.py")
            ], cwd=str(self.base_dir))
            
            self.running_processes.append(("GPS Simulator", gps_process))
            
            # Esperar un poco para que el simulador se inicialice
            time.sleep(5)
            
            # Verificar que el proceso sigue corriendo
            if gps_process.poll() is None:
                logger.info("✅ Simulador GPS iniciado correctamente")
                return True
            else:
                logger.error("❌ El simulador GPS se cerró inesperadamente")
                return False
            
        except Exception as e:
            logger.error(f"❌ Error iniciando simulador GPS: {e}")
            return False
    
    async def wait_for_services(self, max_wait_time: int = 60):
        """Espera a que los servicios estén disponibles"""
        logger.info("⏳ Esperando servicios...")
        
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            # Esperar backend
            backend_ready = False
            for attempt in range(max_wait_time):
                try:
                    async with session.get(f"{self.backend_url}/health", timeout=5) as response:
                        if response.status == 200:
                            backend_ready = True
                            logger.info("✅ Backend disponible")
                            break
                except:
                    pass
                
                if attempt % 10 == 0:
                    logger.info(f"⏳ Esperando backend... ({attempt}/{max_wait_time})")
                
                await asyncio.sleep(1)
            
            if not backend_ready:
                logger.warning("⚠️ Backend no disponible, continuando con tests limitados")
            
            # Esperar frontend (opcional)
            frontend_ready = False
            for attempt in range(30):  # Menos tiempo para frontend
                try:
                    async with session.get(f"{self.frontend_url}", timeout=5) as response:
                        if response.status == 200:
                            frontend_ready = True
                            logger.info("✅ Frontend disponible")
                            break
                except:
                    pass
                
                await asyncio.sleep(1)
            
            if not frontend_ready:
                logger.warning("⚠️ Frontend no disponible, algunos tests pueden fallar")
            
            return backend_ready, frontend_ready
    
    async def run_acceptance_tests(self):
        """Ejecuta los tests de criterios de aceptación"""
        logger.info("🧪 Ejecutando tests de criterios de aceptación...")
        
        try:
            # Importar y ejecutar validador
            sys.path.insert(0, str(self.base_dir / "testing"))
            from acceptance_criteria_validator import AcceptanceCriteriaValidator
            
            validator = AcceptanceCriteriaValidator(self.backend_url, self.frontend_url)
            results = await validator.run_all_tests()
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Error ejecutando tests de aceptación: {e}")
            return None
    
    def generate_final_report(self, acceptance_results=None, execution_time: float = 0):
        """Genera reporte final del sistema completo"""
        logger.info("📋 Generando reporte final...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "system": "HoyMismoGPS Complete Test System",
            "version": "1.0.0",
            "execution_time_seconds": execution_time,
            "backend_url": self.backend_url,
            "frontend_url": self.frontend_url,
            "components": {
                "test_data_generated": True,
                "gps_simulator_started": len([p for n, p in self.running_processes if "GPS" in n]) > 0,
                "monitoring_active": True,
                "acceptance_tests_run": acceptance_results is not None
            },
            "acceptance_criteria": {}
        }
        
        if acceptance_results:
            report["acceptance_criteria"] = {
                "overall_passed": acceptance_results.overall_passed,
                "latency_test_passed": acceptance_results.latency_test.passed,
                "load_test_passed": acceptance_results.load_test.passed,
                "security_test_passed": acceptance_results.security_test.passed,
                "ui_test_passed": acceptance_results.ui_test.passed,
                "details": {
                    "latency": acceptance_results.latency_test.message,
                    "load": acceptance_results.load_test.message,
                    "security": acceptance_results.security_test.message,
                    "ui": acceptance_results.ui_test.message
                }
            }
        
        # Guardar reporte
        report_file = self.base_dir / "testing/reports" / f"complete_system_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Mostrar resumen
        logger.info("\n" + "="*80)
        logger.info("🎯 HOYMISMOGPS COMPLETE SYSTEM TEST REPORT")
        logger.info("="*80)
        logger.info(f"📁 Reporte completo guardado en: {report_file}")
        logger.info(f"⏱️ Tiempo total de ejecución: {execution_time:.2f} segundos")
        
        if acceptance_results:
            status = "✅ SYSTEM READY" if acceptance_results.overall_passed else "⚠️ NEEDS ATTENTION"
            logger.info(f"\n{status}")
            
            logger.info("\n📊 Resumen de Criterios de Aceptación:")
            criteria = [
                ("Latency < 2s", acceptance_results.latency_test.passed),
                ("Handle 20 devices", acceptance_results.load_test.passed),
                ("Multi-tenant security", acceptance_results.security_test.passed),
                ("UI functional & responsive", acceptance_results.ui_test.passed)
            ]
            
            for criterion, passed in criteria:
                status_icon = "✅" if passed else "❌"
                logger.info(f"  {status_icon} {criterion}")
        
        logger.info(f"\n🚀 Sistema HoyMismoGPS listo para producción!" if acceptance_results and acceptance_results.overall_passed else "\n🔧 Revisar componentes marcados como fallidos")
        logger.info("="*80)
        
        return report
    
    def cleanup(self):
        """Limpia procesos y recursos"""
        logger.info("🧹 Limpiando procesos...")
        
        for name, process in self.running_processes:
            if process.poll() is None:  # Proceso sigue corriendo
                logger.info(f"⏹️ Deteniendo {name}...")
                process.terminate()
                try:
                    process.wait(timeout=10)
                    logger.info(f"✅ {name} detenido correctamente")
                except subprocess.TimeoutExpired:
                    logger.warning(f"⚠️ Forzando cierre de {name}...")
                    process.kill()
        
        self.running_processes.clear()
    
    async def run_complete_system(self):
        """Ejecuta el sistema completo de pruebas"""
        start_time = time.time()
        
        logger.info("🚀 INICIANDO SISTEMA COMPLETO DE PRUEBAS HOYMISMOGPS")
        logger.info("="*70)
        
        try:
            # 1. Configurar entorno
            self.setup_environment()
            
            # 2. Generar datos de prueba
            if not self.generate_test_data():
                logger.error("❌ Falló la generación de datos de prueba")
                return False
            
            # 3. Iniciar monitoreo
            self.start_monitoring()
            
            # 4. Iniciar simulador GPS
            if not self.start_gps_simulator():
                logger.error("❌ Falló el inicio del simulador GPS")
                return False
            
            # 5. Esperar servicios
            backend_ready, frontend_ready = await self.wait_for_services()
            
            # 6. Esperar un poco para que el simulador genere algunos datos
            logger.info("⏳ Esperando que el simulador genere datos iniciales...")
            await asyncio.sleep(30)
            
            # 7. Ejecutar tests de aceptación
            acceptance_results = None
            if backend_ready:
                acceptance_results = await self.run_acceptance_tests()
            else:
                logger.warning("⚠️ Saltando tests de aceptación (backend no disponible)")
            
            # 8. Generar reporte final
            execution_time = time.time() - start_time
            self.generate_final_report(acceptance_results, execution_time)
            
            # 9. Mantener simuladores corriendo si todo salió bien
            if acceptance_results and acceptance_results.overall_passed:
                logger.info("\n🎉 ¡Sistema completamente funcional!")
                logger.info("🔄 Los simuladores seguirán corriendo...")
                logger.info("💡 Presiona Ctrl+C para detener el sistema")
                
                # Mantener corriendo hasta interrupción
                try:
                    while not self.shutdown_requested:
                        await asyncio.sleep(10)
                        # Verificar que los procesos siguen corriendo
                        for name, process in self.running_processes:
                            if process.poll() is not None:
                                logger.warning(f"⚠️ Proceso {name} se detuvo inesperadamente")
                except KeyboardInterrupt:
                    logger.info("⏹️ Shutdown solicitado por usuario")
            
            return acceptance_results is not None and acceptance_results.overall_passed
            
        except Exception as e:
            logger.error(f"❌ Error crítico en sistema completo: {e}")
            return False
        finally:
            self.cleanup()

def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description="HoyMismoGPS Complete Test System")
    parser.add_argument("--backend", default="http://localhost:8000",
                       help="Backend URL")
    parser.add_argument("--frontend", default="http://localhost:3000", 
                       help="Frontend URL")
    parser.add_argument("--quick", action="store_true",
                       help="Ejecutar solo validación rápida (sin simuladores)")
    
    args = parser.parse_args()
    
    print("🎯 HoyMismoGPS - Sistema Completo de Pruebas")
    print("="*60)
    print(f"Backend: {args.backend}")
    print(f"Frontend: {args.frontend}")
    print(f"Modo: {'Rápido' if args.quick else 'Completo'}")
    print()
    
    system = HoyMismoGPSTestSystem()
    system.backend_url = args.backend
    system.frontend_url = args.frontend
    
    try:
        if args.quick:
            # Modo rápido: solo validación de criterios
            async def quick_validation():
                system.setup_environment()
                backend_ready, frontend_ready = await system.wait_for_services(10)
                if backend_ready:
                    return await system.run_acceptance_tests()
                return None
            
            results = asyncio.run(quick_validation())
            success = results is not None and results.overall_passed
        else:
            # Sistema completo
            success = asyncio.run(system.run_complete_system())
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        logger.info("\n⏹️ Sistema interrumpido por usuario")
        sys.exit(2)
    except Exception as e:
        logger.error(f"❌ Error fatal: {e}")
        sys.exit(3)

if __name__ == "__main__":
    main()
