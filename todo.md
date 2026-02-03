# Hoymismogps - Motor Cabalístico de Inteligencia Astrológica

## Funcionalidades Principales

### Motor de Conversión de Calendario
- [x] Implementar algoritmo de conversión gregoriano a hebreo con precisión astronómica
- [x] Integrar ciclos de intercalación de 19 años (12 años de 12 meses, 7 años de 13 meses)
- [x] Calcular Adar II en años de 13 meses
- [x] Implementar ajuste de zona horaria a Jerusalem
- [x] Considerar que días hebreos inician a las 7pm

### Calculadora de Carta Natal Cabalística
- [x] Mapear días de la semana con planetas según sistema hebreo
- [x] Domingo → Júpiter (Jesed)
- [x] Lunes → Marte (Guevurah)
- [x] Martes → Sol (Tifferet)
- [x] Miércoles → Venus (Netzaj)
- [x] Jueves → Mercurio (Hod)
- [x] Viernes → Luna (Yesod)
- [x] Sábado → Saturno (Binah)
- [x] Calcular influencias planetarias según hora, día, mes y año de nacimiento

### Analizador de Mazal
- [x] Generar perfiles de personalidad según día de nacimiento
- [x] Domingo: completamente bueno o completamente malo (luz y oscuridad)
- [x] Lunes: persona de mal genio (división de aguas)
- [x] Martes: rico y promiscuo (vegetación abundante)
- [x] Miércoles: sabio e ilustrado (luces celestiales)
- [x] Jueves: actos de bondad (peces y aves)
- [x] Viernes: buscador de sabiduría (creación del hombre)
- [x] Sábado: piadoso y observante (día de descanso)
- [x] Integrar referencias del Talmud (Shabat 156a:11-156b:3)
- [x] Integrar citas de Zohar y textos cabalísticos

### Sistema de Geolocalización
- [x] Implementar API de geolocalización para capturar lugar de nacimiento
- [x] Calcular diferencia horaria entre lugar de nacimiento y Jerusalem
- [x] Ajustar fecha/hora de nacimiento a hora local de Jerusalem
- [x] Determinar día hebreo correcto considerando inicio a las 7pm

### Dashboard Interactivo
- [ ] Visualización de los 10 niveles cosmogónicos (Sefirot)
- [ ] Nivel 10: Keter (conexión con EinSof)
- [ ] Niveles 2-9: Sistema Astral (Zeir Anpin)
- [ ] Nivel 1: Maljut (mundo material)
- [ ] Representación gráfica del sistema geocéntrico cabalístico
- [ ] Mapa interactivo de influencias planetarias
- [ ] Timeline de eventos astrológicos personales

### Base de Datos
- [x] Tabla de usuarios con autenticación
- [x] Tabla de cartas natales con campos:
  - Fecha gregoriana de nacimiento
  - Fecha hebrea de nacimiento
  - Lugar de nacimiento (lat/lon)
  - Hora local de nacimiento
  - Hora Jerusalem ajustada
  - Día de la semana hebreo
  - Planeta regente
  - Mes hebreo
  - Año hebreo
  - Ciclo de intercalación
- [x] Tabla de análisis de mazal
- [x] Tabla de reportes generados
- [x] Historial de consultas por usuario

### Generador de Reportes PDF
- [ ] Diseño de plantilla PDF elegante con estética cabalística
- [ ] Sección de datos de nacimiento (gregoriano y hebreo)
- [ ] Sección de influencias planetarias
- [ ] Sección de análisis de mazal y personalidad
- [ ] Sección de referencias textuales (Talmud, Zohar, Maimónides)
- [ ] Gráficos del sistema astral personalizado
- [ ] Exportación y descarga de PDF

### Interfaz de Usuario
- [x] Página de inicio con introducción a cosmogonología cabalística
- [x] Formulario de ingreso de datos de nacimiento
- [x] Selector de fecha con calendario dual (gregoriano/hebreo)
- [ ] Selector de ubicación con mapa interactivo
- [x] Selector de hora con visualización de ajuste a Jerusalem
- [x] Dashboard de carta natal con visualizaciones
- [x] Página de perfil de usuario con historial
- [ ] Galería de reportes generados

### Diseño Visual
- [x] Paleta de colores elegante (azul profundo, dorado, blanco puro)
- [x] Tipografía sofisticada (serif para títulos, sans-serif para texto)
- [x] Iconografía cabalística (símbolos hebreos, sefirot, planetas)
- [x] Animaciones sutiles para transiciones
- [x] Modo oscuro por defecto con opción de modo claro
- [x] Diseño responsive para móvil y desktop

### Testing y Validación
- [x] Tests unitarios para conversión de calendario
- [x] Tests de precisión astronómica
- [x] Tests de cálculo de mazal
- [x] Tests de geolocalización
- [ ] Tests de generación de PDF
- [x] Validación de datos de usuario

### Documentación
- [ ] Documentación de API
- [ ] Guía de usuario
- [ ] Referencias bibliográficas (Talmud, Zohar, Maimónides)
- [ ] Explicación de metodología cabalística


## Bugs Reportados

- [x] Corregir conversión de fechas hebreas: 4 de enero 1988 13:25 Jerusalem debería ser 14 de Tevet 5748, error corregido
- [x] Validar ajuste de día hebreo cuando hora es después de 19:00 (7pm) - implementado correctamente
