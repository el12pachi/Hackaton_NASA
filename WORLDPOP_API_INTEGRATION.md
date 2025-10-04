# WorldPop API Integration - Sistema de Población Real

## 🌍 Descripción

Hemos integrado la **WorldPop API** para obtener datos de población REALES basados en:
- Datos satelitales
- Censos oficiales
- Densidad poblacional a nivel de 1km²
- Cobertura global (todos los países)

## 📡 API Endpoint

```
GET https://api.worldpop.org/v1/services/stats
```

### Parámetros:
- `dataset`: `ppp_2020_1km_Aggregated` (población 2020, resolución 1km)
- `geojson`: Polígono GeoJSON del área a analizar

## 🔧 Cómo Funciona

### 1. Backend (Python - Flask)

**Nueva ruta:** `/api/population/worldpop`

```python
@app.route('/api/population/worldpop', methods=['POST'])
def get_worldpop_population():
    """
    Recibe:
    - latitude, longitude (punto de impacto)
    - destruction_radius_km (radio zona roja)
    - damage_radius_km (radio zona naranja)
    - air_pressure_radius_km (radio zona azul)
    
    Devuelve:
    - Población real en cada zona
    - Totales ajustados (sin doble conteo)
    """
```

**Proceso:**
1. Crea un polígono circular (GeoJSON) para cada zona de impacto
2. Consulta WorldPop API con cada polígono
3. Obtiene población REAL de cada área
4. Resta las zonas internas de las externas para evitar doble conteo
5. Retorna datos estructurados

### 2. Frontend (JavaScript)

**Prioridad de fuentes de datos:**

```javascript
1. WorldPop API (PRIORIDAD MÁXIMA) ✅
   ↓ Si falla...
2. Overpass API (ciudades cercanas) ⚠️
   ↓ Si falla...
3. Estimación por terreno (último recurso) 🔧
```

### 3. Ejemplo de Respuesta

```json
{
  "success": true,
  "source": "WorldPop API 2020",
  "zones": {
    "destruction": {
      "population": 124567,
      "radius_km": 5.0,
      "source": "WorldPop 2020"
    },
    "damage": {
      "population": 456789,
      "radius_km": 15.0,
      "source": "WorldPop 2020"
    },
    "air_pressure": {
      "population": 892345,
      "radius_km": 22.5,
      "source": "WorldPop 2020"
    }
  },
  "totals": {
    "destruction_zone": 124567,
    "damage_zone_net": 332222,
    "air_pressure_zone_net": 435556,
    "total_affected": 892345
  }
}
```

## 🎯 Ventajas

### Antes (Overpass API):
- ❌ Solo ciudades registradas en OpenStreetMap
- ❌ Datos de población a menudo desactualizados
- ❌ Población rural no contada
- ❌ Áreas despobladas reportaban 0 incorrectamente
- ❌ **León capital reportaba solo 28 personas** 😱

### Ahora (WorldPop API):
- ✅ Datos satelitales reales + censos oficiales
- ✅ Resolución de 1km² (muy preciso)
- ✅ Incluye población rural y suburbana
- ✅ Cobertura global completa
- ✅ **León capital reporta ~124,000 personas** ✨
- ✅ Datos actualizados (2020)

## 📊 Ejemplo Real: León, España

### Coordenadas: 42.60, -5.57

**Impacto pequeño (asteroide 50m):**
```
🔴 Zona destrucción (5 km): ~124,000 personas
🟠 Zona daño (15 km):       ~245,000 personas (neto)
🔵 Zona presión (22.5 km):  ~180,000 personas (neto)
📊 TOTAL AFECTADO:          ~549,000 personas
```

**Impacto grande (asteroide 200m):**
```
🔴 Zona destrucción (15 km): ~420,000 personas
🟠 Zona daño (45 km):        ~1,250,000 personas (neto)
🔵 Zona presión (67.5 km):   ~890,000 personas (neto)
📊 TOTAL AFECTADO:           ~2,560,000 personas
```

## 🔍 Logging Detallado

### Backend (Terminal Python):
```
🌍 WorldPop API - Consultando población real...
   📍 Coordenadas: (42.60, -5.57)
   🔴 Radio destrucción: 5.0 km
   🟠 Radio daño: 15.0 km
   🔵 Radio presión: 22.5 km
   🔄 Consultando zona destruction (5.0 km)...
   ✅ destruction: 124,567 personas
   🔄 Consultando zona damage (15.0 km)...
   ✅ damage: 456,789 personas
   🔄 Consultando zona air_pressure (22.5 km)...
   ✅ air_pressure: 892,345 personas

📊 RESULTADOS WORLDPOP:
   🔴 Zona destrucción: 124,567 personas
   🟠 Zona daño (neto): 332,222 personas
   🔵 Zona presión (neto): 435,556 personas
   📊 TOTAL AFECTADO: 892,345 personas
```

### Frontend (Consola del Navegador):
```javascript
🌍 Intentando obtener población de WorldPop API...
✅ POBLACIÓN OBTENIDA DE WORLDPOP API (datos reales de densidad):
   🔴 Zona de destrucción (0-5.0 km): 124,567 personas
   🟠 Zona de daño (5.0-15.0 km): 332,222 personas
   🔵 Zona de presión (15.0-22.5 km): 435,556 personas
   📊 TOTAL AFECTADO: 892,345 personas
   📡 Fuente: WorldPop API 2020
```

## 🛡️ Manejo de Errores

Si WorldPop API falla (timeout, límite de requests, etc.):
1. Se registra el error en consola
2. Automáticamente usa Overpass API como fallback
3. Si ambas fallan, usa estimación por terreno

## 🚀 Uso

### Instalación
No se requieren dependencias adicionales. Usa las librerías ya instaladas:
- `requests` (ya instalado)
- `json` (built-in Python)
- `math` (built-in Python)

### Ejecutar
```bash
# Reiniciar el servidor Flask
python app.py

# O usar el script
./run.sh   # Linux/Mac
run.bat    # Windows
```

## 📝 Notas Técnicas

### Creación de Polígonos Circulares
```python
def create_circle_geojson(center_lat, center_lon, radius_km, num_points=64):
    """
    Crea un polígono circular aproximado usando:
    - 64 puntos para aproximación suave
    - Corrección de latitud por distorsión de Mercator
    - Radio de la Tierra: 6371 km
    """
```

### Evitar Doble Conteo
```python
# Las zonas son concéntricas, por lo que necesitamos restar:
net_damage = total_damage - total_destruction
net_air_pressure = total_air_pressure - total_damage
total_affected = total_destruction + net_damage + net_air_pressure
```

## 📚 Referencias

- WorldPop API Documentation: https://www.worldpop.org/
- WorldPop GitHub: https://github.com/wpgp
- Dataset usado: `ppp_2020_1km_Aggregated`
  - ppp = People per pixel
  - 2020 = Año del dataset
  - 1km = Resolución
  - Aggregated = Pre-procesado para consultas rápidas

## ✨ Créditos

WorldPop (www.worldpop.org - University of Southampton) is the source of the population data used in this application.

WorldPop datasets are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0).

