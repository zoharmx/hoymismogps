#!/bin/bash

# HoyMismoGPS - Script de Inicio Completo
# Este script inicia todo el sistema de simulación y pruebas

echo "🛰️ HoyMismoGPS - Sistema Completo de Simulación GPS"
echo "=================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio HoyMismoGPS"
    exit 1
fi

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "OPCIONES:"
    echo "  --quick          Ejecutar solo validación rápida"
    echo "  --generate-only  Solo generar datos de prueba"
    echo "  --simulate       Solo ejecutar simulador GPS"
    echo "  --test           Solo ejecutar tests de aceptación"
    echo "  --monitor        Solo ejecutar sistema de monitoreo"
    echo "  --help           Mostrar esta ayuda"
    echo ""
    echo "Sin opciones: Ejecuta el sistema completo"
    echo ""
    echo "EJEMPLOS:"
    echo "  ./start_hoymismogps.sh                    # Sistema completo"
    echo "  ./start_hoymismogps.sh --quick            # Validación rápida"
    echo "  ./start_hoymismogps.sh --generate-only    # Solo datos"
    exit 0
}

# Función para generar solo datos
generate_data_only() {
    echo "📊 Generando datos de prueba..."
    
    echo "🗺️ Generando trayectorias GPS..."
    python data-simulators/gps_trajectory_generator.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Trayectorias GPS generadas"
    else
        echo "❌ Error generando trayectorias GPS"
        exit 1
    fi
    
    echo "🏢 Generando organizaciones y usuarios..."
    python data-simulators/test_data_generator.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Datos de prueba generados"
        echo ""
        echo "📁 Archivos generados:"
        echo "  • $(ls -1 data-simulators/generated_routes/*.json | wc -l) rutas de vehículos"
        echo "  • $(ls -1 data-simulators/test_data/*.json | wc -l) archivos de datos de prueba"
        echo ""
        echo "🎉 ¡Datos de prueba listos para uso!"
    else
        echo "❌ Error generando datos de prueba"
        exit 1
    fi
}

# Función para ejecutar solo simulador
simulate_only() {
    echo "🛰️ Iniciando simulador GPS..."
    echo "⚠️ Asegúrate de que el backend esté corriendo en http://localhost:8000"
    echo ""
    python data-simulators/real_time_gps_simulator.py
}

# Función para ejecutar solo tests
test_only() {
    echo "🧪 Ejecutando tests de criterios de aceptación..."
    python testing/acceptance_criteria_validator.py
}

# Función para ejecutar solo monitoreo
monitor_only() {
    echo "📊 Iniciando sistema de monitoreo..."
    python monitoring/metrics_monitor.py
}

# Verificar Python y dependencias
check_dependencies() {
    echo "🔍 Verificando dependencias..."
    
    if ! command -v python &> /dev/null; then
        echo "❌ Python no encontrado. Por favor instala Python 3.8+"
        exit 1
    fi
    
    # Verificar dependencias críticas
    python -c "import asyncio, aiohttp, json, datetime" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "📦 Instalando dependencias..."
        pip install aiohttp asyncio-mqtt websockets psutil
    fi
    
    echo "✅ Dependencias verificadas"
}

# Crear estructura de directorios si no existe
setup_directories() {
    echo "📁 Configurando directorios..."
    
    mkdir -p logs
    mkdir -p data-simulators/generated_routes
    mkdir -p data-simulators/test_data
    mkdir -p monitoring/data
    mkdir -p testing/reports
    mkdir -p security
    
    echo "✅ Directorios configurados"
}

# Función principal del sistema completo
run_complete_system() {
    echo "🚀 Iniciando sistema completo HoyMismoGPS..."
    echo ""
    
    check_dependencies
    setup_directories
    
    echo "🎯 Ejecutando sistema completo..."
    python run_complete_test_system.py
}

# Función para validación rápida
run_quick_validation() {
    echo "⚡ Ejecutando validación rápida..."
    check_dependencies
    setup_directories
    
    python run_complete_test_system.py --quick
}

# Procesar argumentos de línea de comandos
case "$1" in
    --help|-h)
        show_help
        ;;
    --generate-only)
        check_dependencies
        setup_directories
        generate_data_only
        ;;
    --simulate)
        check_dependencies
        simulate_only
        ;;
    --test)
        check_dependencies
        test_only
        ;;
    --monitor)
        check_dependencies
        monitor_only
        ;;
    --quick)
        run_quick_validation
        ;;
    "")
        run_complete_system
        ;;
    *)
        echo "❌ Opción desconocida: $1"
        echo "Usa --help para ver las opciones disponibles"
        exit 1
        ;;
esac

echo ""
echo "🎉 Ejecución completada!"
echo "📚 Ver README.md para más información"
echo "📞 Soporte: support@hoymismogps.com"
