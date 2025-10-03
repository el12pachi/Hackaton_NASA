# Asteroid Impact Simulator

## Descripción

Herramienta web interactiva para simular impactos de asteroides y evaluar estrategias de mitigación. Interfaz limpia tipo mapa satelital con controles laterales y visualización geográfica en tiempo real.

## 🚀 Características

### Interfaz Moderna
- **Diseño Limpio**: Sidebar blanco con controles y mapa a pantalla completa
- **Navegación Simple**: Dos modos principales (Simulación y Mitigación)
- **Visualización Clara**: Mapa interactivo con círculos de impacto codificados por color

### Simulación Física
- **Mecánica Orbital**: Modelado de trayectorias usando elementos keplerianos
- **Cálculo de Impacto**: Energía cinética, tamaño de cráter, magnitud sísmica
- **Efectos Ambientales**: Tsunamis, ondas sísmicas, evaluación de daños

### Visualización
- **Mapa 2D Interactivo**: Leaflet.js para selección y visualización de zonas
- **Círculos de Impacto**: Destrucción total, daño severo, área afectada
- **Tiempo Real**: Actualizaciones dinámicas basadas en parámetros

### Mitigación
- **Impactador Cinético**: Simulación de deflexión por impacto
- **Tractor de Gravedad**: Deflexión gradual
- **Análisis de Tiempo**: Optimización del momento de intervención

### Educación
- **Tooltips Interactivos**: Explicaciones de conceptos complejos
- **Modo Gamificado**: "Defender la Tierra" con desafíos
- **Escenarios Realistas**: Impactor-2025 y otros NEOs

## 📋 Requisitos

- Python 3.8+
- Navegador moderno (Chrome, Firefox, Edge)

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

2. **Configurar API Key de NASA (opcional):**
Crea un archivo `.env` o usa la demo key:
```
NASA_API_KEY=DEMO_KEY
```

3. **Ejecutar la aplicación:**
```bash
python app.py
```

4. **Abrir en navegador:**
```
http://localhost:5000
```

## 🎮 Uso

### Modo Simulación
1. **Selecciona un asteroide** de la base de datos NEO o introduce parámetros personalizados
2. **Ajusta variables**: tamaño, velocidad, ángulo de entrada, punto de impacto
3. **Visualiza resultados**: trayectoria 3D, zona de impacto, efectos calculados

### Modo Mitigación
1. **Elige estrategia** de deflexión (impactador cinético, tractor de gravedad)
2. **Configura parámetros**: tiempo de intervención, masa del impactador
3. **Compara resultados**: trayectoria original vs deflectada

### Modo Defender la Tierra
1. **Escenario aleatorio** con tiempo límite
2. **Selecciona estrategia** óptima
3. **Gana puntos** por salvar regiones pobladas

## 📊 Fuentes de Datos

- **NASA NEO API**: Características de asteroides reales (tamaño, velocidad, órbita)
- **OpenStreetMap**: Mapas base para visualización geográfica
- **Modelos Físicos**: Cálculos validados científicamente

## 🧪 Modelos Científicos

### Energía de Impacto
```
E = 0.5 * m * v²
```
Donde:
- m = masa (kg) = volumen × densidad (~3000 kg/m³)
- v = velocidad (m/s)

### Tamaño de Cráter
```
D = 1.8 * (E / ρg)^0.22
```
Donde:
- D = diámetro del cráter (m)
- E = energía (J)
- ρ = densidad del terreno
- g = gravedad

### Deflexión Cinética
```
Δv = (m_impactor * v_impact) / m_asteroid
```

## 🎨 Tecnologías

- **Backend**: Python 3.8+, Flask
- **Frontend**: HTML5, CSS3 (Flexbox), JavaScript ES6+
- **Mapas**: Leaflet.js
- **Fuente**: Inter (Google Fonts)
- **Cálculos**: NumPy, SciPy

## 🌟 Características Destacadas

- ✅ Interfaz limpia estilo Google Maps
- ✅ Datos reales de NASA NEO API
- ✅ Simulaciones físicas precisas
- ✅ Mapa interactivo a pantalla completa
- ✅ Visualización de zonas de impacto
- ✅ Múltiples estrategias de mitigación
- ✅ Sidebar con todos los controles
- ✅ Diseño responsivo
- ✅ Alto contraste y accesibilidad

## 📝 Licencia

MIT License - Hackathon NASA 2025

## 👥 Autores

Equipo de desarrollo para el NASA Space Apps Challenge

---

**¡Defiende la Tierra! 🛡️🌍**

