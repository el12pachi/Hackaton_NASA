# APIs Públicas Utilizadas en el Proyecto

## 🔑 Credenciales Hardcodeadas
- **NASA API Key**: `btXo212rjwe6lTcZjPSonG2XUGa2C6OxIefooRua`
- **GeoNames Username**: `demo` (usuario de prueba gratuito)

---

## 📡 Backend (app.py)

### NASA APIs
1. **NASA NEO API** (Near-Earth Objects)
   - URL: `https://api.nasa.gov/neo/rest/v1/neo/browse`
   - **Propósito**: Obtener datos sobre asteroides cercanos a la Tierra (NEOs)
   - **Uso**: Catálogo de asteroides reales con sus características físicas

2. **NASA NEO Feed API**
   - URL: `https://api.nasa.gov/neo/rest/v1/feed`
   - **Propósito**: Feed de asteroides cercanos a la Tierra por rango de fechas
   - **Uso**: Obtener asteroides que pasan cerca de la Tierra en períodos específicos

3. **NASA SBDB API** (Small Body Database)
   - URL: `https://ssd-api.jpl.nasa.gov/sbdb.api`
   - **Propósito**: Base de datos completa de cuerpos pequeños del sistema solar (JPL)
   - **Uso**: Información detallada sobre asteroides específicos

4. **NASA Planetary API** (APOD)
   - URL: `https://api.nasa.gov/planetary/apod`
   - **Propósito**: Astronomía Picture of the Day - datos planetarios adicionales
   - **Uso**: Datos adicionales para enriquecer la información del proyecto

5. **NASA Earthdata API**
   - URL: `https://cmr.earthdata.nasa.gov/search/granules.json`
   - **Propósito**: Datos oceanográficos y de observación de la Tierra
   - **Uso**: Información sobre océanos y superficie terrestre

### USGS APIs (United States Geological Survey)
6. **USGS Earthquake API**
   - URL: `https://earthquake.usgs.gov/fdsnws/event/1/query`
   - **Propósito**: Datos sísmicos y terremotos en tiempo real
   - **Uso**: Comparar impactos de asteroides con actividad sísmica real

7. **USGS Elevation API** (National Map)
   - URL: `https://nationalmap.gov/epqs/pqs.php`
   - URL alternativa: `https://epqs.nationalmap.gov/v1/json`
   - **Propósito**: Obtener datos de elevación del terreno
   - **Uso**: Calcular altura del punto de impacto para simulaciones precisas

8. **USGS Coastal API** (NOAA)
   - URL: `https://coast.noaa.gov/api/v1/`
   - **Propósito**: Datos costeros
   - **Uso**: Información sobre zonas costeras para impactos en el mar

### NOAA APIs (National Oceanic and Atmospheric Administration)
9. **NOAA Tsunami API**
   - URL: `https://www.tsunami.gov/events.json`
   - **Propósito**: Datos de tsunamis en tiempo real
   - **Uso**: Modelar posibles tsunamis generados por impactos oceánicos

10. **NOAA Sea Level API** (Tides and Currents)
    - URL: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`
    - **Propósito**: Datos de nivel del mar y mareas
    - **Uso**: Calcular efectos de impactos oceánicos en mareas

11. **NOAA Coastal API** (Digital Coast)
    - URL: `https://coast.noaa.gov/digitalcoast/api`
    - **Propósito**: Datos costeros digitales
    - **Uso**: Información detallada de zonas costeras

### Otras APIs de Backend
12. **Open Elevation API**
    - URL: `https://api.open-elevation.com/api/v1/lookup`
    - **Propósito**: API alternativa para obtener elevación del terreno
    - **Uso**: Fallback cuando USGS no está disponible

13. **Overpass API** (OpenStreetMap)
    - URL: `http://overpass-api.de/api/interpreter`
    - **Propósito**: Consultar datos de infraestructura de OpenStreetMap
    - **Uso**: Obtener datos de edificios, carreteras, infraestructura en zona de impacto

14. **GBIF API** (Global Biodiversity Information Facility)
    - URL: `https://api.gbif.org/v1/occurrence/search`
    - **Propósito**: Datos de biodiversidad global
    - **Uso**: Evaluar impacto en ecosistemas y especies

---

## 🌐 Frontend (main.js)

### Mapas y Cartografía
15. **CartoDB Basemaps**
    - URL Dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
    - URL Light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
    - **Propósito**: Tiles de mapas base para Leaflet
    - **Uso**: Visualización de mapas interactivos con temas claro/oscuro

### Geocoding y Localización
16. **Nominatim API** (OpenStreetMap)
    - URL: `https://nominatim.openstreetmap.org/reverse`
    - **Propósito**: Geocodificación inversa (coordenadas → ubicación)
    - **Uso**: Convertir coordenadas lat/lon en nombres de lugares legibles
    - **Parámetros**: `lat`, `lon`, `format=json`, `addressdetails=1`, `extratags=1`

17. **GeoNames API**
    - URL: `https://secure.geonames.org/findNearbyPlaceNameJSON`
    - **Propósito**: Obtener población y datos demográficos de ubicaciones
    - **Uso**: Calcular población afectada por el impacto del asteroide
    - **Características**: 
      - `featureClass=P`: Ciudades, pueblos, aldeas
      - `featureClass=A`: Divisiones administrativas
      - Búsqueda por radio (hasta 500 resultados)

18. **RestCountries API**
    - URL: `https://restcountries.com/v3.1/alpha/{countryCode}`
    - **Propósito**: Información detallada de países
    - **Uso**: Obtener datos del país donde ocurre el impacto

### Infraestructura
19. **Overpass API** (OpenStreetMap - Frontend)
    - URL: `http://overpass-api.de/api/interpreter`
    - **Propósito**: Consultar infraestructura de OpenStreetMap desde el frontend
    - **Uso**: Obtener datos de edificios y estructuras en el área de impacto

---

## 📊 Resumen por Categoría

### 🌌 Datos Espaciales (5 APIs)
- NASA NEO API, NEO Feed, SBDB, Planetary, Earthdata
- **Función**: Datos reales de asteroides y cuerpos celestes

### 🌍 Datos Geográficos (3 APIs)
- USGS Elevation, Open Elevation, Nominatim
- **Función**: Elevación del terreno y geocodificación

### 🌊 Datos Oceanográficos (3 APIs)
- NOAA Tsunami, Sea Level, Coastal APIs
- **Función**: Modelar impactos oceánicos y tsunamis

### 🏙️ Datos de Población e Infraestructura (4 APIs)
- GeoNames, Overpass, RestCountries, USGS Coastal
- **Función**: Calcular impacto humano y daños materiales

### 🗺️ Visualización (2 APIs)
- CartoDB, Leaflet tiles
- **Función**: Renderizar mapas interactivos

### 🌿 Datos Ambientales (2 APIs)
- USGS Earthquake, GBIF
- **Función**: Contexto sísmico y de biodiversidad

---

## ⚠️ Notas Importantes

1. **API Key de NASA**: La clave está expuesta en el código. Se recomienda usar variables de entorno.
2. **GeoNames**: El username 'demo' es limitado. Para producción se necesita un usuario registrado.
3. **Rate Limits**: Muchas de estas APIs tienen límites de peticiones por minuto/hora.
4. **Overpass API**: Puede ser lenta con consultas grandes. Usar con moderación.
5. **USGS APIs**: Algunas pueden requerir autenticación para uso intensivo.

## 🔐 Recomendaciones de Seguridad

- Mover la NASA API Key a variables de entorno (.env)
- Registrar un username propio en GeoNames (gratis)
- Implementar caché para reducir llamadas a APIs externas
- Añadir manejo de rate limiting
- Considerar usar proxies para las APIs públicas en producción
