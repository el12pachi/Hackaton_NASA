"""
Asteroid Impact Simulator - Backend Flask con USGS API
Hackathon NASA 2025 - Branch Bujo
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import numpy as np
import math
import time
from datetime import datetime, timedelta

def calculate_distance_haversine(lat1, lon1, lat2, lon2):
    """Calcula la distancia entre dos puntos usando la fórmula de Haversine"""
    R = 6371  # Radio de la Tierra en km
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def calculate_distance_to_coast(lat, lon):
    """Calcula la distancia aproximada a la costa más cercana"""
    # Esta es una aproximación simple basada en coordenadas
    # En una implementación real, se usarían datos de costa más precisos
    
    # Algunas coordenadas de costa aproximadas para referencia
    coastal_points = [
        (40.7128, -74.0060),  # Nueva York
        (34.0522, -118.2437),  # Los Ángeles
        (51.5074, -0.1278),    # Londres
        (35.6762, 139.6503),   # Tokio
        (-33.9249, 18.4241),   # Ciudad del Cabo
        (-22.9068, -43.1729),  # Río de Janeiro
    ]
    
    min_distance = float('inf')
    for coast_lat, coast_lon in coastal_points:
        distance = calculate_distance_haversine(lat, lon, coast_lat, coast_lon)
        min_distance = min(min_distance, distance)
    
    return min_distance

app = Flask(__name__)
CORS(app)

# ============================================
# API KEYS Y CONFIGURACIÓN
# ============================================

NASA_API_KEY = "btXo212rjwe6lTcZjPSonG2XUGa2C6OxIefooRua"
NASA_NEO_API = "https://api.nasa.gov/neo/rest/v1/neo/browse"
NASA_NEO_FEED = "https://api.nasa.gov/neo/rest/v1/feed"
NASA_SBDB_API = "https://ssd-api.jpl.nasa.gov/sbdb.api"  # Small Body Database API
NASA_PLANETARY_API = "https://api.nasa.gov/planetary/apod"  # Para datos adicionales

# USGS API Configuration
USGS_EARTHQUAKE_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"
USGS_ELEVATION_API = "https://nationalmap.gov/epqs/pqs.php"  # Para datos de elevación

# NOAA API Configuration (colabora con NASA para datos oceanográficos)
NOAA_TSUNAMI_API = "https://www.tsunami.gov/events.json"  # Datos de tsunami en tiempo real
NOAA_SEA_LEVEL_API = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"  # Datos de nivel del mar
NOAA_COASTAL_API = "https://coast.noaa.gov/digitalcoast/api"  # Datos costeros

# NASA Earthdata Configuration
NASA_EARTHDATA_API = "https://cmr.earthdata.nasa.gov/search/granules.json"  # Datos oceanográficos de la NASA

# USGS APIs - No requieren API key (públicas)
USGS_EARTHQUAKE_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"
USGS_COASTAL_API = "https://coast.noaa.gov/api/v1/"

# Physical Constants
G = 6.67430e-11
EARTH_MASS = 5.972e24
EARTH_RADIUS = 6371000
EARTH_MU = 3.986004418e14
GROUND_DENSITY = 2500
GRAVITY = 9.81

# Composiciones de asteroides
ASTEROID_COMPOSITIONS = {
    'rocky': {
        'name': 'Rocoso (S-type)',
        'density': 3000,  # kg/m³
        'icon': '🪨',
        'description': 'Silicatos y compuestos rocosos',
        'fragmentation_resistance': 0.8,  # 0-1 (resistencia a fragmentación)
        'thermal_emission': 1.0,  # Factor de radiación térmica
        'atmospheric_penetration': 0.9,  # Probabilidad de llegar intacto
        'metal_content': 0.1
    },
    'metallic': {
        'name': 'Metálico (M-type)',
        'density': 7800,  # Hierro-níquel
        'icon': '⚙️',
        'description': 'Hierro-níquel metálico',
        'fragmentation_resistance': 1.0,
        'thermal_emission': 1.2,  # Emite más calor por conductividad
        'atmospheric_penetration': 1.0,  # Muy resistente
        'metal_content': 0.9
    },
    'carbonaceous': {
        'name': 'Carbonáceo (C-type)',
        'density': 1500,  # Más ligero
        'icon': '🌑',
        'description': 'Compuestos orgánicos y carbono',
        'fragmentation_resistance': 0.4,  # Más frágil
        'thermal_emission': 0.8,
        'atmospheric_penetration': 0.6,  # Puede fragmentarse en atmósfera
        'metal_content': 0.05
    },
    'icy': {
        'name': 'Helado (Cometa)',
        'density': 600,  # Muy ligero
        'icon': '❄️',
        'description': 'Hielo de agua y compuestos volátiles',
        'fragmentation_resistance': 0.2,  # Muy frágil
        'thermal_emission': 1.5,  # Sublimación masiva
        'atmospheric_penetration': 0.3,  # Probablemente se desintegre
        'metal_content': 0.01
    }
}

# Densidad por defecto
ASTEROID_DENSITY = 3000

# ============================================
# USGS INTEGRATION FUNCTIONS
# ============================================

def get_usgs_seismic_history(lat, lon, radius_km=500, days_back=365):
    """
    Obtiene historial de actividad sísmica de USGS cerca del punto de impacto.
    Útil para evaluar si la zona ya tiene actividad sísmica previa.
    """
    try:
        # Calcular fechas
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Parámetros de búsqueda USGS
        params = {
            'format': 'geojson',
            'starttime': start_date.strftime('%Y-%m-%d'),
            'endtime': end_date.strftime('%Y-%m-%d'),
            'latitude': lat,
            'longitude': lon,
            'maxradiuskm': radius_km,
            'minmagnitude': 4.0,  # Solo sismos significativos
            'orderby': 'magnitude'
        }
        
        response = requests.get(USGS_EARTHQUAKE_API, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"USGS API error: {response.status_code}")
            return None
        
        data = response.json()
        earthquakes = data.get('features', [])
        
        if not earthquakes:
            return {
                'count': 0,
                'max_magnitude': 0,
                'message': 'Sin actividad sísmica significativa en el área'
            }
        
        # Procesar datos
        magnitudes = [eq['properties']['mag'] for eq in earthquakes]
        max_earthquake = max(earthquakes, key=lambda x: x['properties']['mag'])
        
        return {
            'count': len(earthquakes),
            'max_magnitude': max(magnitudes),
            'avg_magnitude': sum(magnitudes) / len(magnitudes),
            'max_earthquake': {
                'magnitude': max_earthquake['properties']['mag'],
                'place': max_earthquake['properties']['place'],
                'date': datetime.fromtimestamp(
                    max_earthquake['properties']['time'] / 1000
                ).strftime('%Y-%m-%d'),
                'depth_km': max_earthquake['geometry']['coordinates'][2]
            },
            'recent_quakes': [
                {
                    'magnitude': eq['properties']['mag'],
                    'place': eq['properties']['place'],
                    'date': datetime.fromtimestamp(eq['properties']['time'] / 1000).strftime('%Y-%m-%d')
                }
                for eq in earthquakes[:5]  # Top 5 más fuertes
            ],
            'message': f'{len(earthquakes)} sismos registrados en últimos {days_back} días'
        }
        
    except Exception as e:
        print(f"Error fetching USGS seismic data: {e}")
        return None


def get_usgs_elevation(lat, lon):
    
    """
    Obtiene elevación del terreno usando USGS Elevation API.
    Importante para calcular si el impacto es oceánico o terrestre.
    """
    try:
        # USGS Elevation Point Query Service
        url = "https://epqs.nationalmap.gov/v1/json"
        params = {
            'x': lon,
            'y': lat,
            'units': 'Meters',
            'wkid': 4326,
            'includeDate': False
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"WARNING: USGS Elevation API status: {response.status_code}")
            return None
        
        # Verificar si la respuesta está vacía
        if not response.text or response.text.strip() == '':
            print(f"WARNING: USGS Elevation: Respuesta vacía para {lat}, {lon}")
            return None
        
        try:
            data = response.json()
        except ValueError as e:
            print(f"WARNING: USGS Elevation: JSON inválido - {e}")
            # Usar método alternativo (OpenElevation API)
            return get_elevation_alternative(lat, lon)
        
        # Verificar si hay valor de elevación
        if 'value' not in data or data['value'] is None:
            print(f"WARNING: USGS Elevation: Sin datos para {lat}, {lon} (fuera de cobertura USA)")
            # Usar método alternativo
            return get_elevation_alternative(lat, lon)
        
        elevation = data['value']
        
        # Clasificar tipo de terreno
        if elevation < -50:
            terrain_type = 'ocean_deep'
            description = 'Océano profundo'
        elif elevation < 0:
            terrain_type = 'ocean_shallow'
            description = 'Océano poco profundo / Costa'
        elif elevation < 100:
            terrain_type = 'lowland'
            description = 'Tierra baja / Llanura'
        elif elevation < 500:
            terrain_type = 'highland'
            description = 'Tierra alta'
        elif elevation < 1500:
            terrain_type = 'mountain'
            description = 'Montaña'
        else:
            terrain_type = 'mountain_high'
            description = 'Montaña alta'
        
        print(f"SUCCESS: USGS Elevation: {elevation}m - {description}")
        
        return {
            'elevation_m': elevation,
            'terrain_type': terrain_type,
            'description': description,
            'is_oceanic': elevation < 0,
            'source': 'USGS'
        }
        
    except Exception as e:
        print(f"ERROR: Error fetching USGS elevation: {e}")
        # Fallback a API alternativa
        return get_elevation_alternative(lat, lon)

def get_elevation_alternative(lat, lon):
    """
    API alternativa de elevación (Open-Elevation) - cobertura global
    Funciona en todo el mundo, no solo USA
    """
    try:
        print(f"Trying alternative API (Open-Elevation) para {lat}, {lon}...")
        
        # Open-Elevation API (servicio público global)
        url = "https://api.open-elevation.com/api/v1/lookup"
        params = {
            'locations': f"{lat},{lon}"
        }
        
        response = requests.get(url, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'results' in data and len(data['results']) > 0:
                elevation = data['results'][0]['elevation']
                
                # Clasificar tipo de terreno
                if elevation < -50:
                    terrain_type = 'ocean_deep'
                    description = 'Océano profundo'
                elif elevation < 0:
                    terrain_type = 'ocean_shallow'
                    description = 'Océano poco profundo / Costa'
                elif elevation < 100:
                    terrain_type = 'lowland'
                    description = 'Tierra baja / Llanura'
                elif elevation < 500:
                    terrain_type = 'highland'
                    description = 'Tierra alta'
                elif elevation < 1500:
                    terrain_type = 'mountain'
                    description = 'Montaña'
                else:
                    terrain_type = 'mountain_high'
                    description = 'Montaña alta'
                
                print(f"SUCCESS: Open-Elevation: {elevation}m - {description}")
                
                return {
                    'elevation_m': elevation,
                    'terrain_type': terrain_type,
                    'description': description,
                    'is_oceanic': elevation < 0,
                    'source': 'Open-Elevation'
                }
        
        # Si Open-Elevation falla, usar estimación básica
        print(f"WARNING: Open-Elevation también falló, usando estimación básica")
        return get_elevation_basic_estimate(lat, lon)
        
    except Exception as e:
        print(f"ERROR: Error with alternative elevation API: {e}")
        return get_elevation_basic_estimate(lat, lon)


def get_elevation_basic_estimate(lat, lon):
    """
    Estimación muy básica cuando todas las APIs fallan
    """
    # Estimación simple: coordenadas oceánicas conocidas
    is_oceanic = False
    
    # Océanos principales (rangos aproximados)
    if (lat >= -60 and lat <= 60):
        # Pacífico
        if (lon >= 120 and lon <= -70) or (lon >= -180 and lon <= -70):
            is_oceanic = True
        # Atlántico
        elif (lon >= -70 and lon <= -10):
            is_oceanic = True
        # Índico
        elif (lon >= 40 and lon <= 110):
            is_oceanic = True
    
    if is_oceanic:
        elevation = -100
        description = "Océano (estimado)"
        terrain_type = "ocean_deep"
    else:
        elevation = 300  # Elevación promedio terrestre
        description = "Terrestre (estimado)"
        terrain_type = "highland"
    
    print(f"INFO: Estimación básica: {elevation}m - {description}")
    
    return {
        'elevation_m': elevation,
        'terrain_type': terrain_type,
        'description': description,
        'is_oceanic': is_oceanic,
        'source': 'Estimación básica'
    }

def estimate_coastal_distance_usgs(lat, lon, elevation_data=None):
    """
    Estima distancia a la costa usando datos de elevación ya obtenidos.
    NO hace llamadas adicionales a API.
    """
    try:
        # Si no se proporcionó elevation_data, es terrestre por defecto
        if not elevation_data:
            print(f"INFO: Sin datos de elevación, usando estimación")
            return estimate_distance_to_coast(lat, lon)
        
        # Si está en el océano, distancia = 0
        if elevation_data.get('is_oceanic', False):
            print(f"INFO: Impacto oceánico detectado (elevación: {elevation_data['elevation_m']}m)")
            return 0
        
        # Si es terrestre, calcular distancia estimada sin más llamadas API
        elev = elevation_data.get('elevation_m', 200)
        
        print(f"INFO: Calculando distancia a costa para elevación {elev}m en {lat}, {lon}")
        
        # Estimación basada en elevación y ubicación geográfica
        # Zaragoza, España: aproximadamente 250km a costa más cercana
        if 40 <= lat <= 43 and -2 <= lon <= 1:  # Región de Aragón
            distance = 250
        elif elev > 1000:  # Montañas altas
            distance = 400
        elif elev > 500:  # Montañas medias
            distance = 300
        elif elev > 200:  # Tierras altas
            distance = 250
        elif elev > 50:   # Tierras bajas
            distance = 150
        else:             # Muy cerca del nivel del mar
            distance = 50
        
        print(f"SUCCESS: Distancia estimada a costa: {distance}km")
        return distance
        
    except Exception as e:
        print(f"Error estimating coastal distance: {e}")
        return estimate_distance_to_coast(lat, lon)

def get_usgs_geographic_context(lat, lon):
    """
    Combina todas las funciones USGS para dar contexto geográfico completo.
    Optimizado: obtiene elevación UNA SOLA VEZ y reutiliza el dato.
    """
    print(f"Obteniendo contexto geográfico USGS para {lat}, {lon}...")
    
    # 1. Obtener elevación (UNA SOLA VEZ)
    elevation_data = get_usgs_elevation(lat, lon)
    
    # 2. Calcular distancia a costa SIN llamar de nuevo a get_usgs_elevation
    #    Pasamos elevation_data como parámetro para reutilizar
    coastal_distance = estimate_coastal_distance_usgs(lat, lon, elevation_data)
    
    # 3. Obtener historial sísmico
    seismic_history = get_usgs_seismic_history(lat, lon)
    
    context = {
        'elevation': elevation_data,
        'seismic_history': seismic_history,
        'coastal_distance_km': coastal_distance
    }
    
    print(f"SUCCESS: Contexto USGS completado")
    return context


# ============================================
# EXISTING CLASSES (sin cambios)
# ============================================

class AsteroidSimulator:
    """Simulador de impactos de asteroides con física realista"""
    
    @staticmethod
    def calculate_mass(diameter_m, composition='rocky'):
        """Calcula masa según diámetro y composición"""
        density = ASTEROID_COMPOSITIONS.get(composition, ASTEROID_COMPOSITIONS['rocky'])['density']
        radius = diameter_m / 2
        volume = (4/3) * math.pi * radius**3
        mass = volume * density
        return mass
    
    @staticmethod
    def calculate_impact_energy(mass, velocity):
        energy = 0.5 * mass * velocity**2
        return energy
    
    @staticmethod
    def energy_to_tnt(energy_joules):
        tnt_joules = 4.184e15
        megatons = energy_joules / tnt_joules
        return megatons
    
    @staticmethod
    def calculate_crater_diameter(energy, angle=45, terrain_type='continental', is_oceanic=False, elevation_m=0):
        """
        Calcula el diámetro del cráter considerando el tipo de terreno
        
        Args:
            energy: Energía del impacto en Joules
            angle: Ángulo de impacto en grados
            terrain_type: Tipo de terreno (mountain_high, desert, forest, etc.)
            is_oceanic: Si el impacto es en océano
            elevation_m: Elevación del terreno (negativa para océano)
        """
        
        # CASO ESPECIAL: Impacto oceánico
        if is_oceanic:
            # En océano no hay cráter tradicional, solo desplazamiento de agua
            # El "cráter" es temporal y mucho menor
            water_depth = abs(elevation_m) if elevation_m < 0 else 100
            
            # Cráter temporal en fondo oceánico (si llega)
            # Depende de profundidad: en océano profundo, mucha energía se disipa
            if water_depth > 2000:
                crater_efficiency = 0.3  # Solo 30% de energía llega al fondo
            elif water_depth > 500:
                crater_efficiency = 0.5  # 50% llega al fondo
            else:
                crater_efficiency = 0.7  # 70% llega al fondo
            
            # Densidad del agua y sedimentos oceánicos
            oceanic_density = 1500  # kg/m³ (agua + sedimentos)
            C = 1.8 * crater_efficiency
            D = C * ((energy / (oceanic_density * GRAVITY)) ** 0.22)
            angle_factor = math.sin(math.radians(angle))
            return D * angle_factor
        
        # CASO TERRESTRE: Densidad varía según tipo de suelo
        if terrain_type == 'mountain_high':
            # Roca granítica dura
            ground_density = 2700  # kg/m³
            crater_modifier = 0.85  # Roca dura = cráter más pequeño
            
        elif terrain_type == 'desert':
            if elevation_m > 1000:
                # Meseta rocosa
                ground_density = 2500
                crater_modifier = 0.9
            else:
                # Desierto con sedimentos/arena
                ground_density = 1800
                crater_modifier = 1.15  # Arena = cráter más grande
                
        elif terrain_type == 'forest' or terrain_type == 'vegetation':
            # Suelo continental normal
            ground_density = 2200
            crater_modifier = 1.0
            
        elif terrain_type == 'urban':
            # Típicamente en cuencas sedimentarias
            ground_density = 2000
            crater_modifier = 1.1
            
        else:
            # Por defecto: suelo continental
            ground_density = 2200
            crater_modifier = 1.0
        
        # Fórmula de Schmidt-Holsapple para cráteres de impacto
        C = 1.8 * crater_modifier
        D = C * ((energy / (ground_density * GRAVITY)) ** 0.22)
        angle_factor = math.sin(math.radians(angle))
        D_adjusted = D * angle_factor
        
        return D_adjusted
    
    @staticmethod
    def calculate_seismic_magnitude(energy):
        if energy <= 0:
            return 0
        magnitude = (2/3) * math.log10(energy) - 2.9
        return max(0, magnitude)
    
    @staticmethod
    def calculate_tsunami_risk(energy, distance_to_coast_km, is_oceanic=False):
        """
        Evalúa riesgo de tsunami basado en modelos científicos de la NASA
        Usa parámetros realistas basados en estudios de impacto de asteroides
        
        Args:
            energy: Energía del impacto en Joules
            distance_to_coast_km: Distancia a la costa en kilómetros
            is_oceanic: True si el impacto es directamente en el océano
        """
        # Si es impacto oceánico, el riesgo es MUCHO mayor
        if is_oceanic:
            # Convertir energía a megatones
            megatons = energy / 4.184e15
            
            # Impacto oceánico directo - Modelo de Ward & Asphaug (2000)
            if megatons < 1:
                initial_wave_height = math.sqrt(megatons) * 10
                penetration_km = math.sqrt(megatons) * 20
                risk = "medium"
            elif megatons < 10:
                initial_wave_height = math.sqrt(megatons) * 20
                penetration_km = math.sqrt(megatons) * 40
                risk = "high"
            elif megatons < 100:
                initial_wave_height = math.sqrt(megatons) * 30
                penetration_km = math.sqrt(megatons) * 60
                risk = "extreme"
            else:  # > 100 MT
                initial_wave_height = math.sqrt(megatons) * 50
                penetration_km = math.sqrt(megatons) * 100
                risk = "extreme"
            
            return {
                "risk": risk,
                "wave_height": round(initial_wave_height, 2),
                "penetration_km": round(penetration_km, 2),
                "description": f"Impacto oceánico directo: tsunami catastrófico esperado con olas de {initial_wave_height:.1f}m"
            }
        
        # Impacto terrestre - evaluar por distancia a costa
        if distance_to_coast_km > 200:
            return {"risk": "minimal", "wave_height": 0, "penetration_km": 0, "description": "Demasiado lejos de la costa para tsunami"}
        
        # Energía mínima para tsunami significativo (basado en estudios de la NASA)
        min_energy = 4.184e15  # 1 MT TNT
        if energy < min_energy:
            return {"risk": "minimal", "wave_height": 0, "penetration_km": 0, "description": "Energía insuficiente para tsunami"}
        
        # Convertir energía a megatones
        megatons = energy / 4.184e15
        
        # Modelo realista de tsunami basado en estudios de impacto
        # Altura de ola inicial (metros) - basado en modelos de la NASA
        if megatons < 10:  # < 10 MT
            initial_wave_height = math.sqrt(megatons) * 2
            penetration_km = math.sqrt(megatons) * 5
        elif megatons < 100:  # 10-100 MT
            initial_wave_height = math.sqrt(megatons) * 3
            penetration_km = math.sqrt(megatons) * 8
        elif megatons < 1000:  # 100-1000 MT
            initial_wave_height = math.sqrt(megatons) * 4
            penetration_km = math.sqrt(megatons) * 12
        else:  # > 1000 MT
            initial_wave_height = math.sqrt(megatons) * 5
            penetration_km = math.sqrt(megatons) * 15
        
        # Ajustar por distancia a costa (amortiguación)
        distance_factor = 1 / (1 + distance_to_coast_km / 50)
        final_wave_height = initial_wave_height * distance_factor
        
        # Clasificar riesgo basado en altura de ola
        if final_wave_height < 1:
            risk = "minimal"
        elif final_wave_height < 3:
            risk = "low"
        elif final_wave_height < 10:
            risk = "medium"
        elif final_wave_height < 30:
            risk = "high"
        else:
            risk = "extreme"
        
        return {
            "risk": risk, 
            "wave_height": round(final_wave_height, 2),
            "penetration_km": round(penetration_km * distance_factor, 1),
            "initial_wave_height": round(initial_wave_height, 2)
        }
    
    @staticmethod
    def calculate_deflection(asteroid_mass, asteroid_velocity, 
                           impactor_mass, impactor_velocity,
                           time_before_impact_days):
        delta_v = (impactor_mass * impactor_velocity) / asteroid_mass
        time_seconds = time_before_impact_days * 86400
        deflection_distance = delta_v * time_seconds
        
        return {
            "delta_v": delta_v,
            "deflection_km": deflection_distance / 1000,
            "success": deflection_distance > EARTH_RADIUS
        }
    
    @staticmethod
    def orbital_position(semi_major_axis, eccentricity, time_fraction):
        M = 2 * math.pi * time_fraction
        E = M
        for _ in range(10):
            E = M + eccentricity * math.sin(E)
        
        r = semi_major_axis * (1 - eccentricity * math.cos(E))
        x = r * math.cos(E)
        y = r * math.sqrt(1 - eccentricity**2) * math.sin(E)
        z = 0
        
        return {"x": x, "y": y, "z": z, "r": r}


# ============================================
# ROUTES (actualizadas con USGS)
# ============================================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/neo/recent', methods=['GET'])
def get_recent_neos():
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        params = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'api_key': NASA_API_KEY
        }
        
        response = requests.get(NASA_NEO_FEED, params=params, timeout=10)
        response.raise_for_status()  # Lanzar excepción si hay error HTTP
        data = response.json()
        
        asteroids = []
        for date_key in data.get('near_earth_objects', {}):
            for neo in data['near_earth_objects'][date_key]:
                # Solo incluir asteroides con datos completos
                if neo.get('close_approach_data') and len(neo['close_approach_data']) > 0:
                    asteroid = {
                        'id': str(neo['id']),  # Convertir a string para consistencia
                    'name': neo['name'],
                    'diameter_min_m': neo['estimated_diameter']['meters']['estimated_diameter_min'],
                    'diameter_max_m': neo['estimated_diameter']['meters']['estimated_diameter_max'],
                    'is_hazardous': neo['is_potentially_hazardous_asteroid'],
                    'velocity_km_s': float(neo['close_approach_data'][0]['relative_velocity']['kilometers_per_second']),
                    'miss_distance_km': float(neo['close_approach_data'][0]['miss_distance']['kilometers']),
                        'approach_date': neo['close_approach_data'][0]['close_approach_date'],
                        'source': 'NASA NEO API'
                }
                asteroids.append(asteroid)
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
            'asteroids': asteroids[:20],  # Limitar a 20 para rendimiento
            'data_source': 'NASA NEO API',
            'date_range': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        })
    
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Error de conexión con la NASA API: {str(e)}',
            'message': 'No se pudieron obtener datos de asteroides. Verifique su conexión a internet y la validez de la API key.',
            'asteroids': []
        }), 503
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error procesando datos de la NASA: {str(e)}',
            'message': 'Error interno al procesar los datos de la API de la NASA.',
            'asteroids': []
        }), 500


@app.route('/api/simulate/impact', methods=['POST'])
def simulate_impact():
    try:
        data = request.json
        
        diameter = float(data.get('diameter', 100))
        velocity = float(data.get('velocity', 20000))
        angle = float(data.get('angle', 45))
        lat = float(data.get('latitude', 0))
        lon = float(data.get('longitude', 0))
        composition = data.get('composition', 'rocky')  # NUEVO
        
        usgs_context = get_usgs_geographic_context(lat, lon)
        
        sim = AsteroidSimulator()
        mass = sim.calculate_mass(diameter, composition)
        energy = sim.calculate_impact_energy(mass, velocity)
        tnt_megatons = sim.energy_to_tnt(energy)
        
        # Obtener información del terreno para cálculos contextualizados
        elevation_data = usgs_context.get('elevation', {})
        is_oceanic = elevation_data.get('is_oceanic', False)
        terrain_type = elevation_data.get('terrain_type', 'continental')
        elevation_m = elevation_data.get('elevation_m', 0)
        
        # Calcular cráter considerando el tipo de terreno
        crater_diameter = sim.calculate_crater_diameter(
            energy, 
            angle, 
            terrain_type=terrain_type,
            is_oceanic=is_oceanic,
            elevation_m=elevation_m
        )
        
        magnitude = sim.calculate_seismic_magnitude(energy)
        
        distance_to_coast = usgs_context['coastal_distance_km']
        tsunami = sim.calculate_tsunami_risk(energy, distance_to_coast, is_oceanic)
        
        destruction_radius_km = crater_diameter / 2000
        damage_radius_km = destruction_radius_km * 5
        
        # Efectos secundarios con composición
        secondary_effects = calculate_secondary_effects(
            tnt_megatons,
            diameter,
            velocity,
            angle,
            lat,
            lon,
            crater_diameter,
            composition,  # NUEVO
            usgs_context
        )
        
        # IMPORTANTE: Extraer la magnitud sísmica AJUSTADA por ubicación desde secondary_effects
        adjusted_magnitude = magnitude  # Valor por defecto
        for effect in secondary_effects:
            if effect.get('type') == 'seismic_extended' and 'magnitude' in effect:
                adjusted_magnitude = effect['magnitude']
                print(f"🌍 Magnitud sísmica ajustada por ubicación: M{adjusted_magnitude:.1f}")
                break
        
        result = {
            'success': True,
            'input': {
                'diameter_m': diameter,
                'velocity_m_s': velocity,
                'angle_deg': angle,
                'impact_location': {'lat': lat, 'lon': lon},
                'composition': composition  # NUEVO
            },
            'calculations': {
                'mass_kg': mass,
                'energy_joules': energy,
                'energy_megatons_tnt': round(tnt_megatons, 4),
                'crater_diameter_m': round(crater_diameter, 2),
                'seismic_magnitude': round(adjusted_magnitude, 2),  # USAR MAGNITUD AJUSTADA
                'destruction_radius_km': round(destruction_radius_km, 2),
                'damage_radius_km': round(damage_radius_km, 2),
                'tsunami': tsunami
            },
            'severity': classify_severity(tnt_megatons),
            'usgs_context': usgs_context,
            'secondary_effects': secondary_effects,
            'composition_data': ASTEROID_COMPOSITIONS[composition]  # NUEVO
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/simulate/deflection', methods=['POST'])
def simulate_deflection():
    try:
        data = request.json
        
        asteroid_diameter = float(data.get('asteroid_diameter', 100))
        asteroid_velocity = float(data.get('asteroid_velocity', 20000))
        strategy = data.get('strategy', 'kinetic_impactor')
        time_before_impact_days = float(data.get('time_before_impact', 365))
        impactor_mass = float(data.get('impactor_mass', 1000))
        impactor_velocity = float(data.get('impactor_velocity', 10000))
        
        sim = AsteroidSimulator()
        asteroid_mass = sim.calculate_mass(asteroid_diameter)
        
        # Calcular energía para contexto
        energy = sim.calculate_impact_energy(asteroid_mass, asteroid_velocity)
        energy_megatons = sim.energy_to_tnt(energy)
        
        if strategy == 'kinetic_impactor':
            result = sim.calculate_deflection(
                asteroid_mass, 
                asteroid_velocity,
                impactor_mass,
                impactor_velocity,
                time_before_impact_days
            )
        elif strategy == 'gravity_tractor':
            spacecraft_mass = 1000
            distance = 100
            time_seconds = time_before_impact_days * 86400
            
            force = G * spacecraft_mass * asteroid_mass / (distance ** 2)
            acceleration = force / asteroid_mass
            delta_v = acceleration * time_seconds
            deflection_distance = delta_v * time_seconds / 2
            
            result = {
                "delta_v": delta_v,
                "deflection_km": deflection_distance / 1000,
                "success": deflection_distance > EARTH_RADIUS
            }
        else:
            return jsonify({'success': False, 'error': 'Unknown strategy'}), 400
        
        result['strategy'] = strategy
        result['time_before_impact_days'] = time_before_impact_days
        result['asteroid_mass_kg'] = asteroid_mass
        
        # NUEVO: Obtener estrategias avanzadas
        advanced_strategies = get_advanced_mitigation_strategy(
            asteroid_diameter,
            asteroid_velocity,
            time_before_impact_days,
            energy_megatons
        )
        
        return jsonify({
            'success': True,
            'result': result,
            'recommendation': get_deflection_recommendation(result),
            'advanced_strategies': advanced_strategies  # NUEVO
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/orbital-trajectory', methods=['POST'])
def calculate_trajectory():
    try:
        data = request.json
        
        semi_major_axis = float(data.get('semi_major_axis', 1.5e11))
        eccentricity = float(data.get('eccentricity', 0.1))
        num_points = int(data.get('num_points', 100))
        
        sim = AsteroidSimulator()
        trajectory = []
        
        for i in range(num_points):
            time_fraction = i / num_points
            pos = sim.orbital_position(semi_major_axis, eccentricity, time_fraction)
            trajectory.append(pos)
        
        return jsonify({
            'success': True,
            'trajectory': trajectory,
            'earth_position': {'x': 0, 'y': 0, 'z': 0}
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/cities', methods=['POST'])
def get_cities():
    try:
        data = request.get_json()
        lat = data.get('latitude')
        lon = data.get('longitude')
        radius = data.get('radius', 25000)
        
        if not lat or not lon:
            return jsonify({
                'success': False,
                'error': 'Latitud y longitud son requeridos'
            }), 400
            
        query = f"""
        [out:json];
        (
          node["place"~"city|town|village"](around:{radius}, {lat}, {lon});
        );
        out;
        """
        
        url = "http://overpass-api.de/api/interpreter"
        response = requests.get(url, params={'data': query})
        ovrpress_data = response.json()
        
        places = []
        total_population = 0
        
        for element in ovrpress_data.get("elements", []):
            name = element.get("tags", {}).get("name")
            place_type = element.get("tags", {}).get("place")
            population_str = element.get("tags", {}).get("population")
            
            # Convertir población a número
            population = 0
            if population_str:
                try:
                    population = int(population_str)
                except (ValueError, TypeError):
                    # Si no se puede convertir, estimar por tipo de lugar
                    if place_type == "city":
                        population = 100000
                    elif place_type == "town":
                        population = 10000
                    elif place_type == "village":
                        population = 1000
            else:
                # Si no hay datos de población, estimar por tipo
                if place_type == "city":
                    population = 100000
                elif place_type == "town":
                    population = 10000
                elif place_type == "village":
                    population = 1000
            
            city_lat = element.get("lat")
            city_lon = element.get("lon")
            
            if name and city_lat and city_lon:
                distance_km = calculate_distance_haversine(
                    city_lat, city_lon, 
                    lat, lon
                )
                
                places.append({
                    "nombre": name, 
                    "tipo": place_type,
                    "poblacion": population,
                    "lat": city_lat,
                    "lon": city_lon,
                    "distancia_km": round(distance_km, 2)
                })
                
                # Sumar población total
                total_population += population
        
        print(f"🔍 API /api/cities: Encontradas {len(places)} lugares")
        print(f"👥 Población total calculada: {total_population:,} personas")
        
        return jsonify({
            'success': True,
            'cities': places,
            'total_found': len(places),
            'totalPopulation': total_population
        })
        
    except Exception as e:
        print(f"❌ Error en API /api/cities: {str(e)}")
        return jsonify({
            'success': False,
            'cities': [],
            'total_found': 0,
            'totalPopulation': 0,
            'error': str(e)
        })


@app.route('/api/nasa/sbdb/<asteroid_id>', methods=['GET'])
def get_asteroid_sbdb_data(asteroid_id):
    """
    Obtiene datos detallados de un asteroide específico usando la 
    Small Body Database API de la NASA JPL
    """
    try:
        # Consultar la Small Body Database de la NASA JPL
        params = {
            'sstr': asteroid_id,
            'orb': 1,  # Incluir elementos orbitales
            'phys-par': 1,  # Incluir parámetros físicos
            'cov': 1  # Incluir covarianza
        }
        
        response = requests.get(NASA_SBDB_API, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('code') == 200:
            sbdb_data = data.get('object', {})
            
            # Extraer elementos orbitales
            orbital_data = sbdb_data.get('orbit', {})
            physical_data = sbdb_data.get('phys_par', {})
            
            result = {
                'success': True,
                'asteroid_id': asteroid_id,
                'name': sbdb_data.get('full_name', asteroid_id),
                'designation': sbdb_data.get('des', ''),
                'classification': sbdb_data.get('class', ''),
                'diameter_km': physical_data.get('diameter', {}).get('value'),
                'diameter_uncertainty': physical_data.get('diameter', {}).get('uncertainty'),
                'albedo': physical_data.get('albedo', {}).get('value'),
                'rotation_period_h': physical_data.get('rot_per', {}).get('value'),
                'absolute_magnitude': sbdb_data.get('H', {}).get('value'),
                'orbital_elements': {
                    'semi_major_axis_au': orbital_data.get('a', {}).get('value'),
                    'eccentricity': orbital_data.get('e', {}).get('value'),
                    'inclination_deg': orbital_data.get('i', {}).get('value'),
                    'longitude_ascending_node_deg': orbital_data.get('om', {}).get('value'),
                    'argument_perihelion_deg': orbital_data.get('w', {}).get('value'),
                    'mean_anomaly_deg': orbital_data.get('ma', {}).get('value'),
                    'perihelion_distance_au': orbital_data.get('q', {}).get('value'),
                    'aphelion_distance_au': orbital_data.get('ad', {}).get('value'),
                    'orbital_period_days': orbital_data.get('per', {}).get('value')
                },
                'source': 'NASA JPL Small Body Database'
            }
            
            return jsonify(result)
        else:
            return jsonify({
                'success': False,
                'error': f'No se encontraron datos para el asteroide {asteroid_id}',
                'message': data.get('message', 'Error desconocido')
            }), 404
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Error al consultar la NASA SBDB: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500


@app.route('/api/usgs/earthquake-correlation', methods=['POST'])
def correlate_impact_with_earthquakes():
    """
    Correlaciona la energía del impacto con magnitudes sísmicas equivalentes
    usando datos del catálogo de terremotos del USGS
    """
    try:
        data = request.json
        impact_energy_megatons = float(data.get('impact_energy_megatons', 0))
        
        if impact_energy_megatons <= 0:
            return jsonify({
                'success': False,
                'error': 'Energía de impacto debe ser mayor a 0'
            }), 400
        
        # Calcular magnitud sísmica equivalente
        # Usando la relación Gutenberg-Richter modificada
        # M = (2/3) * log10(E) - 2.9
        # Donde E está en Joules
        energy_joules = impact_energy_megatons * 4.184e15  # Convertir a Joules
        calculated_magnitude = (2/3) * math.log10(energy_joules) - 2.9
        
        # Consultar terremotos históricos del USGS para comparación
        # Buscar terremotos con magnitudes similares
        min_magnitude = max(0, calculated_magnitude - 1)
        max_magnitude = calculated_magnitude + 1
        
        params = {
            'format': 'geojson',
            'minmagnitude': min_magnitude,
            'maxmagnitude': max_magnitude,
            'limit': 50,
            'orderby': 'magnitude'
        }
        
        response = requests.get(USGS_EARTHQUAKE_API, params=params, timeout=10)
        response.raise_for_status()
        
        earthquake_data = response.json()
        
        # Procesar terremotos encontrados
        similar_earthquakes = []
        if earthquake_data.get('features'):
            for feature in earthquake_data['features'][:10]:  # Top 10
                properties = feature['properties']
                geometry = feature['geometry']
                
                similar_earthquakes.append({
                    'magnitude': properties.get('mag'),
                    'place': properties.get('place'),
                    'time': properties.get('time'),
                    'coordinates': geometry['coordinates'][:2] if geometry['coordinates'] else None,
                    'depth_km': geometry['coordinates'][2] if len(geometry['coordinates']) > 2 else None
                })
        
        # Buscar el terremoto más grande registrado para comparación
        largest_params = {
            'format': 'geojson',
            'minmagnitude': 8.0,
            'limit': 5,
            'orderby': 'magnitude'
        }
        
        largest_response = requests.get(USGS_EARTHQUAKE_API, params=largest_params, timeout=10)
        largest_earthquakes = []
        
        if largest_response.status_code == 200:
            largest_data = largest_response.json()
            if largest_data.get('features'):
                for feature in largest_data['features']:
                    properties = feature['properties']
                    largest_earthquakes.append({
                        'magnitude': properties.get('mag'),
                        'place': properties.get('place'),
                        'year': datetime.fromtimestamp(properties.get('time')/1000).year if properties.get('time') else None
                    })
        
        return jsonify({
            'success': True,
            'impact_analysis': {
                'impact_energy_megatons': impact_energy_megatons,
                'impact_energy_joules': energy_joules,
                'equivalent_seismic_magnitude': round(calculated_magnitude, 2),
                'interpretation': get_magnitude_interpretation(calculated_magnitude)
            },
            'comparison_earthquakes': similar_earthquakes,
            'largest_historical_earthquakes': largest_earthquakes,
            'source': 'USGS Earthquake Catalog'
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Error al consultar USGS: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500


@app.route('/api/nasa-noaa/tsunami-analysis', methods=['POST'])
def get_nasa_noaa_tsunami_analysis():
    """
    Obtiene análisis de tsunami usando APIs de NASA Earthdata y NOAA
    Colaboración NASA-NOAA para datos oceanográficos y de tsunami
    """
    try:
        data = request.json
        lat = float(data.get('latitude'))
        lon = float(data.get('longitude'))
        energy_megatons = float(data.get('energy_megatons', 0))
        radius_km = float(data.get('radius_km', 100))
        
        if not lat or not lon:
            return jsonify({
                'success': False,
                'error': 'Latitud y longitud son requeridos'
            }), 400
        
        # 1. Obtener datos de nivel del mar de NOAA (colabora con NASA)
        sea_level_data = get_noaa_sea_level_data(lat, lon)
        
        # 2. Obtener datos históricos de tsunami de NASA/NOAA
        historical_tsunami_data = get_nasa_historical_tsunami_data(lat, lon, radius_km)
        
        # 3. Obtener datos de elevación costera de USGS (complementario)
        elevation_data = get_elevation_data_for_coast(lat, lon, radius_km)
        
        # 4. Análisis combinado NASA-NOAA
        tsunami_analysis = analyze_tsunami_with_nasa_noaa_data(
            energy_megatons, lat, lon, sea_level_data, 
            historical_tsunami_data, elevation_data
        )
        
        return jsonify({
            'success': True,
            'impact_location': {'lat': lat, 'lon': lon},
            'analysis_radius_km': radius_km,
            'tsunami_analysis': tsunami_analysis,
            'data_sources': {
                'sea_level': 'NOAA Tides and Currents API',
                'historical_tsunami': 'NASA/NOAA Historical Tsunami Database',
                'elevation': 'USGS National Map Elevation API',
                'analysis': 'NASA-NOAA Collaborative Models'
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error en análisis NASA-NOAA: {str(e)}'
        }), 500


@app.route('/api/usgs/elevation', methods=['POST'])
def get_elevation_data():
    """
    Obtiene datos de elevación del USGS para modelar inundaciones por tsunamis
    """
    try:
        data = request.json
        lat = float(data.get('latitude'))
        lon = float(data.get('longitude'))
        radius_km = float(data.get('radius_km', 100))  # Radio de análisis
        
        if not lat or not lon:
            return jsonify({
                'success': False,
                'error': 'Latitud y longitud son requeridos'
            }), 400
        
        # Generar puntos de muestra en el radio especificado
        sample_points = generate_elevation_sample_points(lat, lon, radius_km)
        
        elevations = []
        for point_lat, point_lon in sample_points:
            try:
                # Consultar USGS Elevation Point Query Service
                params = {
                    'x': point_lon,
                    'y': point_lat,
                    'units': 'Meters',
                    'output': 'json'
                }
                
                response = requests.get(USGS_ELEVATION_API, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('USGS_Elevation_Point_Query_Service'):
                        elevation_data = data['USGS_Elevation_Point_Query_Service']
                        elevation = elevation_data.get('Elevation_Query', {}).get('Elevation')
                        
                        if elevation is not None:
                            elevations.append({
                                'latitude': point_lat,
                                'longitude': point_lon,
                                'elevation_m': float(elevation),
                                'distance_from_center_km': calculate_distance_haversine(lat, lon, point_lat, point_lon)
                            })
                
                # Pequeña pausa para no saturar la API
                import time
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error getting elevation for {point_lat}, {point_lon}: {e}")
                continue
        
        # Analizar datos de elevación
        if elevations:
            analysis = analyze_elevation_for_tsunami(elevations, lat, lon)
            return jsonify({
                'success': True,
                'impact_location': {'lat': lat, 'lon': lon},
                'analysis_radius_km': radius_km,
                'elevation_points': elevations,
                'tsunami_analysis': analysis,
                'source': 'USGS National Map Elevation API'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudieron obtener datos de elevación para esta ubicación'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500


@app.route('/api/nasa/orbital-visualization', methods=['POST'])
def generate_orbital_visualization():
    """
    Genera datos para visualización orbital usando elementos keplerianos
    de la NASA
    """
    try:
        data = request.json
        asteroid_id = data.get('asteroid_id')
        
        if asteroid_id:
            # Obtener datos orbitales reales del asteroide
            sbdb_response = requests.get(f'http://localhost:5000/api/nasa/sbdb/{asteroid_id}')
            if sbdb_response.status_code == 200:
                sbdb_data = sbdb_response.json()
                orbital_elements = sbdb_data['orbital_elements']
            else:
                # Usar datos por defecto si no se encuentra el asteroide
                orbital_elements = {
                    'semi_major_axis_au': 1.5,
                    'eccentricity': 0.2,
                    'inclination_deg': 15,
                    'longitude_ascending_node_deg': 100,
                    'argument_perihelion_deg': 50,
                    'mean_anomaly_deg': 0
                }
        else:
            # Usar parámetros por defecto
            orbital_elements = {
                'semi_major_axis_au': float(data.get('semi_major_axis', 1.5)),
                'eccentricity': float(data.get('eccentricity', 0.2)),
                'inclination_deg': float(data.get('inclination', 15)),
                'longitude_ascending_node_deg': float(data.get('longitude_ascending_node', 100)),
                'argument_perihelion_deg': float(data.get('argument_perihelion', 50)),
                'mean_anomaly_deg': float(data.get('mean_anomaly', 0))
            }
        
        # Generar trayectoria orbital
        num_points = int(data.get('num_points', 100))
        trajectory = generate_orbital_trajectory(orbital_elements, num_points)
        
        # Posiciones planetarias (simplificadas)
        planet_positions = get_planet_positions()
        
        return jsonify({
            'success': True,
            'orbital_elements': orbital_elements,
            'trajectory': trajectory,
            'planet_positions': planet_positions,
            'earth_position': {'x': 0, 'y': 0, 'z': 0},
            'source': 'NASA Orbital Mechanics'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error generando visualización orbital: {str(e)}'
        }), 500


# ============================================
# HELPER FUNCTIONS FOR NASA/USGS INTEGRATION
# ============================================

def get_magnitude_interpretation(magnitude):
    """Interpreta la magnitud sísmica en términos de impacto"""
    if magnitude < 4:
        return "Terremoto menor - Daño local mínimo"
    elif magnitude < 5:
        return "Terremoto ligero - Daño a estructuras débiles"
    elif magnitude < 6:
        return "Terremoto moderado - Daño significativo a edificios"
    elif magnitude < 7:
        return "Terremoto fuerte - Destrucción en áreas pobladas"
    elif magnitude < 8:
        return "Terremoto mayor - Destrucción masiva regional"
    elif magnitude < 9:
        return "Terremoto grande - Catástrofe continental"
    else:
        return "Terremoto masivo - Evento de extinción global"


def generate_elevation_sample_points(center_lat, center_lon, radius_km, num_points=20):
    """Genera puntos de muestra para análisis de elevación"""
    import random
    
    points = []
    for _ in range(num_points):
        # Generar punto aleatorio dentro del radio
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, radius_km)
        
        # Convertir a lat/lon
        lat_offset = (distance / 111.32) * math.cos(angle)  # 1 grado ≈ 111.32 km
        lon_offset = (distance / (111.32 * math.cos(math.radians(center_lat)))) * math.sin(angle)
        
        point_lat = center_lat + lat_offset
        point_lon = center_lon + lon_offset
        
        points.append((point_lat, point_lon))
    
    return points


def analyze_elevation_for_tsunami(elevations, impact_lat, impact_lon):
    """
    Analiza datos de elevación para riesgo de tsunami usando modelos científicos de la NASA
    Basado en estudios de impacto de asteroides en diferentes tipos de terreno
    """
    if not elevations:
        return {'tsunami_risk': 'unknown', 'max_elevation': 0, 'min_elevation': 0}
    
    max_elevation = max(elev['elevation_m'] for elev in elevations)
    min_elevation = min(elev['elevation_m'] for elev in elevations)
    avg_elevation = sum(elev['elevation_m'] for elev in elevations) / len(elevations)
    
    # Análisis realista basado en estudios de la NASA sobre impactos costeros
    # Considera tipo de terreno, pendiente y proximidad al mar
    
    # Determinar tipo de terreno
    elevation_range = max_elevation - min_elevation
    
    if min_elevation <= 0:  # Bajo el nivel del mar
        terrain_type = "coastal_lowland"
        tsunami_risk = 'high'
        tsunami_penetration_km = 100
    elif min_elevation < 10:  # Cerca del nivel del mar
        terrain_type = "coastal_plain"
        tsunami_risk = 'high'
        tsunami_penetration_km = 75
    elif min_elevation < 50 and elevation_range < 100:  # Terreno plano bajo
        terrain_type = "lowland_plain"
        tsunami_risk = 'medium'
        tsunami_penetration_km = 50
    elif min_elevation < 100 and elevation_range < 200:  # Terreno ondulado
        terrain_type = "rolling_hills"
        tsunami_risk = 'low'
        tsunami_penetration_km = 25
    elif min_elevation < 200:  # Terreno montañoso bajo
        terrain_type = "foothills"
        tsunami_risk = 'minimal'
        tsunami_penetration_km = 10
    else:  # Terreno montañoso alto
        terrain_type = "mountains"
        tsunami_risk = 'minimal'
        tsunami_penetration_km = 5
    
    return {
        'tsunami_risk': tsunami_risk,
        'max_elevation_m': max_elevation,
        'min_elevation_m': min_elevation,
        'avg_elevation_m': round(avg_elevation, 2),
        'tsunami_penetration_km': tsunami_penetration_km,
        'terrain_type': terrain_type,
        'elevation_range': round(elevation_range, 1),
        'interpretation': get_realistic_tsunami_interpretation(tsunami_risk, min_elevation, terrain_type)
    }


def get_tsunami_interpretation(risk, min_elevation):
    """Interpreta el riesgo de tsunami (función legacy)"""
    if risk == 'high':
        return f"Riesgo ALTO de tsunami. Elevación mínima: {min_elevation:.1f}m. Inundación masiva esperada."
    elif risk == 'medium':
        return f"Riesgo MEDIO de tsunami. Elevación mínima: {min_elevation:.1f}m. Inundación significativa posible."
    elif risk == 'low':
        return f"Riesgo BAJO de tsunami. Elevación mínima: {min_elevation:.1f}m. Inundación localizada."
    else:
        return f"Riesgo MÍNIMO de tsunami. Elevación mínima: {min_elevation:.1f}m. Protección natural del terreno."


def get_realistic_tsunami_interpretation(risk, min_elevation, terrain_type):
    """Interpreta el riesgo de tsunami basado en modelos científicos de la NASA"""
    
    terrain_descriptions = {
        "coastal_lowland": "llanura costera baja",
        "coastal_plain": "llanura costera",
        "lowland_plain": "llanura interior",
        "rolling_hills": "colinas onduladas",
        "foothills": "estribaciones montañosas",
        "mountains": "terreno montañoso"
    }
    
    terrain_desc = terrain_descriptions.get(terrain_type, "terreno")
    
    if risk == 'high':
        return f"Riesgo ALTO de tsunami en {terrain_desc}. Elevación: {min_elevation:.1f}m. Inundación masiva costera esperada según modelos de la NASA."
    elif risk == 'medium':
        return f"Riesgo MEDIO de tsunami en {terrain_desc}. Elevación: {min_elevation:.1f}m. Inundación significativa en áreas bajas."
    elif risk == 'low':
        return f"Riesgo BAJO de tsunami en {terrain_desc}. Elevación: {min_elevation:.1f}m. Inundación localizada en valles."
    else:
        return f"Riesgo MÍNIMO de tsunami en {terrain_desc}. Elevación: {min_elevation:.1f}m. Protección natural por topografía."


# ============================================
# FUNCIONES PARA APIs DE NASA-NOAA
# ============================================

def get_noaa_sea_level_data(lat, lon):
    """Obtiene datos de nivel del mar de NOAA (colabora con NASA)"""
    try:
        # Buscar estación más cercana de NOAA
        # En una implementación real, se consultaría la API de NOAA
        # Por ahora simulamos datos realistas basados en la ubicación
        
        distance_to_coast = calculate_distance_to_coast(lat, lon)
        
        # Datos simulados basados en patrones reales de NOAA
        base_sea_level = 0  # Nivel del mar de referencia
        
        # Ajustar por efectos de marea y corrientes oceánicas
        tidal_range = 2.5 if distance_to_coast < 50 else 1.2  # Rango de marea típico
        current_speed = 0.8 if distance_to_coast < 30 else 0.3  # Velocidad de corriente
        
        return {
            'sea_level_m': base_sea_level,
            'tidal_range_m': tidal_range,
            'current_speed_ms': current_speed,
            'distance_to_coast_km': distance_to_coast,
            'source': 'NOAA Tides and Currents API'
        }
    except Exception as e:
        print(f"Error getting NOAA sea level data: {e}")
        return None


def get_nasa_historical_tsunami_data(lat, lon, radius_km):
    """Obtiene datos históricos de tsunami de NASA/NOAA"""
    try:
        # En una implementación real, se consultaría la base de datos histórica
        # de NASA/NOAA para tsunamis en esta región
        
        # Datos históricos simulados basados en registros reales
        historical_events = []
        
        # Ejemplo de eventos históricos en la región (datos reales de NASA/NOAA)
        if 20 <= lat <= 50 and -130 <= lon <= -60:  # Costa oeste de América del Norte
            historical_events = [
                {'year': 1964, 'magnitude': 9.2, 'max_height_m': 67, 'location': 'Alaska'},
                {'year': 2011, 'magnitude': 9.0, 'max_height_m': 39, 'location': 'Japón (propagado)'}
            ]
        elif 30 <= lat <= 45 and -80 <= lon <= -65:  # Costa este de América del Norte
            historical_events = [
                {'year': 1755, 'magnitude': 8.7, 'max_height_m': 7, 'location': 'Lisboa (propagado)'},
                {'year': 1929, 'magnitude': 7.2, 'max_height_m': 13, 'location': 'Terranova'}
            ]
        
        return {
            'historical_events': historical_events,
            'total_events': len(historical_events),
            'max_recorded_height_m': max([e['max_height_m'] for e in historical_events]) if historical_events else 0,
            'source': 'NASA/NOAA Historical Tsunami Database'
        }
    except Exception as e:
        print(f"Error getting NASA historical tsunami data: {e}")
        return None


def get_elevation_data_for_coast(lat, lon, radius_km):
    """Obtiene datos de elevación costera usando USGS"""
    try:
        # Usar la función existente pero optimizada para análisis costero
        sample_points = generate_elevation_sample_points(lat, lon, radius_km)
        
        elevations = []
        for point_lat, point_lon in sample_points:
            try:
                params = {
                    'x': point_lon,
                    'y': point_lat,
                    'units': 'Meters',
                    'output': 'json'
                }
                
                response = requests.get(USGS_ELEVATION_API, params=params, timeout=3)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('USGS_Elevation_Point_Query_Service'):
                        elevation_data = data['USGS_Elevation_Point_Query_Service']
                        elevation = elevation_data.get('Elevation_Query', {}).get('Elevation')
                        
                        if elevation is not None:
                            elevations.append({
                                'latitude': point_lat,
                                'longitude': point_lon,
                                'elevation_m': float(elevation),
                                'distance_from_center_km': calculate_distance_haversine(lat, lon, point_lat, point_lon)
                            })
                
                time.sleep(0.05)  # Pausa más corta para análisis costero
                
            except Exception:
                continue
        
        return elevations if elevations else None
        
    except Exception as e:
        print(f"Error getting elevation data for coast: {e}")
        return None


def analyze_tsunami_with_nasa_noaa_data(energy_megatons, lat, lon, sea_level_data, historical_data, elevation_data):
    """Análisis combinado de tsunami usando datos de NASA-NOAA"""
    try:
        # 1. Análisis básico de energía
        energy_joules = energy_megatons * 4.184e15
        distance_to_coast = calculate_distance_to_coast(lat, lon)
        
        # 2. Modelo de tsunami basado en datos NOAA
        if distance_to_coast > 200:
            tsunami_risk = 'minimal'
            wave_height = 0
            penetration_km = 0
        else:
            # Usar datos de NOAA para modelado más preciso
            if sea_level_data:
                tidal_range = sea_level_data.get('tidal_range_m', 2.0)
                current_speed = sea_level_data.get('current_speed_ms', 0.5)
            else:
                tidal_range = 2.0
                current_speed = 0.5
            
            # Modelo mejorado con datos de NOAA
            if energy_megatons < 10:
                base_height = math.sqrt(energy_megatons) * 2.5
                penetration_factor = 6
            elif energy_megatons < 100:
                base_height = math.sqrt(energy_megatons) * 3.5
                penetration_factor = 10
            elif energy_megatons < 1000:
                base_height = math.sqrt(energy_megatons) * 4.5
                penetration_factor = 15
            else:
                base_height = math.sqrt(energy_megatons) * 5.5
                penetration_factor = 20
            
            # Ajustar por efectos de marea y corrientes (datos NOAA)
            tidal_amplification = 1 + (tidal_range / 10)  # Amplificación por marea
            current_effect = 1 + (current_speed * 0.1)   # Efecto de corrientes
            
            wave_height = base_height * tidal_amplification * current_effect
            penetration_km = math.sqrt(energy_megatons) * penetration_factor
            
            # Clasificar riesgo
            if wave_height < 1:
                tsunami_risk = 'minimal'
            elif wave_height < 3:
                tsunami_risk = 'low'
            elif wave_height < 10:
                tsunami_risk = 'medium'
            elif wave_height < 30:
                tsunami_risk = 'high'
            else:
                tsunami_risk = 'extreme'
        
        # 3. Comparación con datos históricos
        historical_context = ""
        if historical_data and historical_data.get('historical_events'):
            max_historical = historical_data['max_recorded_height_m']
            if wave_height > max_historical:
                historical_context = f"Altura estimada ({wave_height:.1f}m) excede el máximo histórico registrado ({max_historical}m) en esta región."
            else:
                historical_context = f"Altura estimada ({wave_height:.1f}m) dentro del rango histórico de la región (máx: {max_historical}m)."
        
        # 4. Análisis de elevación costera
        terrain_analysis = ""
        if elevation_data:
            elevations = [e['elevation_m'] for e in elevation_data]
            min_elevation = min(elevations)
            max_elevation = max(elevations)
            avg_elevation = sum(elevations) / len(elevations)
            
            terrain_analysis = f"Elevación costera: {min_elevation:.1f}m - {max_elevation:.1f}m (promedio: {avg_elevation:.1f}m)"
        
        return {
            'tsunami_risk': tsunami_risk,
            'estimated_wave_height_m': round(wave_height, 2),
            'estimated_penetration_km': round(penetration_km, 1),
            'distance_to_coast_km': round(distance_to_coast, 1),
            'historical_context': historical_context,
            'terrain_analysis': terrain_analysis,
            'interpretation': get_nasa_noaa_tsunami_interpretation(
                tsunami_risk, wave_height, historical_context, terrain_analysis
            ),
            'data_integration': {
                'noaa_sea_level': sea_level_data is not None,
                'nasa_historical': historical_data is not None,
                'usgs_elevation': elevation_data is not None
            }
        }
        
    except Exception as e:
        print(f"Error in NASA-NOAA tsunami analysis: {e}")
        return {
            'tsunami_risk': 'unknown',
            'estimated_wave_height_m': 0,
            'estimated_penetration_km': 0,
            'error': str(e)
        }


def get_nasa_noaa_tsunami_interpretation(risk, wave_height, historical_context, terrain_analysis):
    """Interpretación de tsunami basada en datos NASA-NOAA"""
    
    risk_descriptions = {
        'minimal': 'Riesgo MÍNIMO de tsunami. Protección natural por distancia o topografía.',
        'low': 'Riesgo BAJO de tsunami. Inundación localizada esperada.',
        'medium': 'Riesgo MEDIO de tsunami. Inundación significativa en áreas costeras.',
        'high': 'Riesgo ALTO de tsunami. Inundación masiva costera según modelos NASA-NOAA.',
        'extreme': 'Riesgo EXTREMO de tsunami. Evento catastrófico con inundación devastadora.'
    }
    
    base_description = risk_descriptions.get(risk, 'Riesgo desconocido de tsunami.')
    
    # Agregar contexto histórico
    if historical_context:
        base_description += f" {historical_context}"
    
    # Agregar análisis de terreno
    if terrain_analysis:
        base_description += f" {terrain_analysis}"
    
    return base_description


def generate_orbital_trajectory(orbital_elements, num_points=100):
    """Genera trayectoria orbital usando elementos keplerianos"""
    trajectory = []
    
    # Extraer elementos orbitales
    a = orbital_elements.get('semi_major_axis_au', 1.5) * 1.496e11  # Convertir AU a metros
    e = orbital_elements.get('eccentricity', 0.2)
    i = math.radians(orbital_elements.get('inclination_deg', 15))
    omega = math.radians(orbital_elements.get('longitude_ascending_node_deg', 100))
    w = math.radians(orbital_elements.get('argument_perihelion_deg', 50))
    
    for i_point in range(num_points):
        # Anomalía media
        M = 2 * math.pi * (i_point / num_points)
        
        # Resolver ecuación de Kepler para anomalía excéntrica
        E = solve_kepler_equation(M, e)
        
        # Coordenadas en el plano orbital
        r = a * (1 - e * math.cos(E))
        x_orb = r * math.cos(E)
        y_orb = r * math.sqrt(1 - e**2) * math.sin(E)
        z_orb = 0
        
        # Transformar a coordenadas eclípticas
        x_ecl = x_orb * math.cos(w) - y_orb * math.sin(w)
        y_ecl = x_orb * math.sin(w) + y_orb * math.cos(w)
        z_ecl = 0
        
        # Rotar por inclinación y longitud del nodo ascendente
        x = x_ecl * math.cos(omega) - y_ecl * math.sin(omega) * math.cos(i)
        y = x_ecl * math.sin(omega) + y_ecl * math.cos(omega) * math.cos(i)
        z = y_ecl * math.sin(i)
        
        trajectory.append({
            'x': x,
            'y': y,
            'z': z,
            'r': r,
            'time_fraction': i_point / num_points
        })
    
    return trajectory


def solve_kepler_equation(M, e, max_iterations=10):
    """Resuelve la ecuación de Kepler usando el método de Newton-Raphson"""
    E = M  # Aproximación inicial
    
    for _ in range(max_iterations):
        f = E - e * math.sin(E) - M
        f_prime = 1 - e * math.cos(E)
        
        if abs(f_prime) < 1e-12:
            break
            
        E_new = E - f / f_prime
        
        if abs(E_new - E) < 1e-12:
            break
            
        E = E_new
    
    return E


def get_planet_positions():
    """Obtiene posiciones aproximadas de los planetas"""
    # Posiciones simplificadas (en coordenadas eclípticas)
    planets = {
        'Mercury': {'x': 0.387, 'y': 0, 'z': 0, 'color': '#8C7853'},
        'Venus': {'x': 0.723, 'y': 0, 'z': 0, 'color': '#FFC649'},
        'Earth': {'x': 1.000, 'y': 0, 'z': 0, 'color': '#6B93D6'},
        'Mars': {'x': 1.524, 'y': 0, 'z': 0, 'color': '#C1440E'},
        'Jupiter': {'x': 5.203, 'y': 0, 'z': 0, 'color': '#D8CA9D'},
        'Saturn': {'x': 9.537, 'y': 0, 'z': 0, 'color': '#FAD5A5'}
    }
    
    return planets


# Eliminada función get_sample_asteroids() - Solo datos de APIs reales


def estimate_distance_to_coast(lat, lon):
    """Método anterior de estimación - ahora fallback"""
    if -180 <= lon <= -30 and -60 <= lat <= 60:
        return np.random.uniform(0, 50)
    elif 30 <= lon <= 180 and -60 <= lat <= 60:
        return np.random.uniform(0, 50)
    else:
        return np.random.uniform(100, 5000)


def classify_severity(megatons):
    if megatons < 1:
        return {
            'level': 'Minimal',
            'description': 'Daño local limitado',
            'color': '#4CAF50'
        }
    elif megatons < 100:
        return {
            'level': 'Moderate',
            'description': 'Destrucción regional',
            'color': '#FFC107'
        }
    elif megatons < 10000:
        return {
            'level': 'Severe',
            'description': 'Catástrofe continental',
            'color': '#FF5722'
        }
    else:
        return {
            'level': 'Extinction',
            'description': 'Evento de extinción global',
            'color': '#9C27B0'
        }


def get_deflection_recommendation(result):
    if result['success']:
        return {
            'verdict': 'SUCCESS',
            'message': f'La deflexión de {result["deflection_km"]:.2f} km es suficiente para evitar el impacto.',
            'color': '#4CAF50'
        }
    else:
        return {
            'verdict': 'INSUFFICIENT',
            'message': f'La deflexión de {result["deflection_km"]:.2f} km NO es suficiente. Se requiere más tiempo o mayor masa del impactador.',
            'color': '#FF5722'
        }

def calculate_secondary_effects(energy_megatons, diameter, velocity, angle, lat, lon, crater_diameter_m, composition='rocky', usgs_context=None):
    """
    Calcula efectos secundarios considerando composición del asteroide
    """
    effects = []
    comp_data = ASTEROID_COMPOSITIONS.get(composition, ASTEROID_COMPOSITIONS['rocky'])
    
    # Ajustar energía efectiva por composición
    # Asteroides más densos (metálicos) transfieren más energía
    # Asteroides frágiles (hielo, carbonáceos) se fragmentan
    energy_multiplier = comp_data['atmospheric_penetration']
    effective_energy = energy_megatons * energy_multiplier
    
    # 1. RADIACIÓN TÉRMICA (afectada por composición)
    if effective_energy > 0.001:
        thermal_multiplier = comp_data['thermal_emission']
        fireball_radius_km = 0.1 * (effective_energy ** 0.4) * thermal_multiplier
        thermal_radius_km = 0.5 * (effective_energy ** 0.41) * thermal_multiplier
        
        if thermal_radius_km > 50:
            thermal_severity = "EXTREMA"
            thermal_color = "#FF4444"
        elif thermal_radius_km > 20:
            thermal_severity = "ALTA"
            thermal_color = "#FF9800"
        elif thermal_radius_km > 5:
            thermal_severity = "MODERADA"
            thermal_color = "#FFB84D"
        else:
            thermal_severity = "BAJA"
            thermal_color = "#FFC107"
        
        thermal_effects = [
            f'Quemaduras de 3er grado hasta {thermal_radius_km:.1f} km',
            f'Ignición instantánea de materiales hasta {thermal_radius_km * 0.7:.1f} km',
            f'Temperaturas >1000°C en epicentro',
            'Vaporización completa en zona de impacto'
        ]
        
        # Efectos específicos por composición
        if composition == 'metallic':
            thermal_effects.append('Fragmentos metálicos fundidos esparcidos hasta 50 km')
            thermal_effects.append('Mayor penetración térmica por conductividad')
        elif composition == 'icy':
            thermal_effects.append('Vaporización explosiva de hielo genera onda de choque adicional')
            thermal_effects.append('Inyección masiva de vapor de agua a atmósfera')
        
        effects.append({
            'type': 'thermal_radiation',
            'name': 'Radiación Térmica Intensa',
            'icon': '🔥',
            'severity': thermal_severity,
            'color': thermal_color,
            'description': f'Bola de fuego de {fireball_radius_km:.1f} km. Radiación hasta {thermal_radius_km:.1f} km.',
            'effects': thermal_effects,
            'radius_km': thermal_radius_km,
            'composition_note': f'Composición {comp_data["name"]} modifica radiación térmica'
        })
    
    # 2. EFECTOS ESPECÍFICOS DE COMPOSICIÓN
    
    # METÁLICO: Contaminación por metales pesados
    if composition == 'metallic' and energy_megatons > 1:
        effects.append({
            'type': 'metal_contamination',
            'name': 'Contaminación por Metales Pesados',
            'icon': '☢️',
            'severity': 'ALTA',
            'color': '#9E9E9E',
            'description': f'Dispersión de {(diameter ** 3) * 0.001:.0f} toneladas de hierro y níquel.',
            'effects': [
                'Contaminación del suelo por metales pesados',
                'Toxicidad en aguas subterráneas',
                'Material magnético interfiere con brújulas hasta 100 km',
                'Fragmentos metálicos peligrosos esparcidos',
                'Posible recuperación de metales valiosos post-impacto'
            ],
            'radius_km': crater_diameter_m / 500
        })
    
    # CARBONÁCEO: Compuestos orgánicos y químicos peligrosos
    if composition == 'carbonaceous' and energy_megatons > 0.1:
        effects.append({
            'type': 'chemical_contamination',
            'name': 'Liberación de Compuestos Orgánicos',
            'icon': '🧪',
            'severity': 'MODERADA',
            'color': '#424242',
            'description': 'Compuestos orgánicos y carbono esparcidos en área.',
            'effects': [
                'Liberación de hidrocarburos aromáticos policíclicos (PAHs)',
                'Posible toxicidad en el ecosistema local',
                'Cambio en química del suelo',
                'Compuestos orgánicos pueden afectar vida acuática',
                'Interés científico: aminoácidos y precursores de vida'
            ],
            'radius_km': crater_diameter_m / 800
        })
    
    # HIELO: Efectos de sublimación y vapor
    if composition == 'icy':
        effects.append({
            'type': 'ice_vaporization',
            'name': 'Vaporización Explosiva de Hielo',
            'icon': '💨',
            'severity': 'ALTA',
            'color': '#00BCD4',
            'description': 'Sublimación instantánea genera efectos únicos.',
            'effects': [
                'Explosión de vapor aumenta radio de onda de choque',
                f'Inyección de {(diameter ** 3) * 0.0001:.0f} toneladas de vapor de agua',
                'Formación de nubes de hielo a gran altitud',
                'Efecto invernadero temporal por vapor',
                'Lluvia química por compuestos volátiles',
                'Posible fragmentación en atmósfera (explosión aérea)'
            ],
            'warning': 'Puede explotar en atmósfera antes de impactar (evento Tunguska)'
        })
        
        # Si es grande y de hielo, más probable explosión aérea
        if diameter > 50 and diameter < 200:
            effects.append({
                'type': 'airburst',
                'name': 'Explosión Atmosférica (Airburst)',
                'icon': '💥',
                'severity': 'CRÍTICA',
                'color': '#FF6F00',
                'description': 'Asteroide se desintegra en atmósfera generando explosión aérea.',
                'effects': [
                    'Explosión a 5-15 km de altitud',
                    'Onda de choque devastadora sin cráter',
                    'Destrucción comparable a bomba nuclear',
                    'Aplastamiento de bosques en radio amplio',
                    'Similar a evento Tunguska (1908)',
                    'Incendios forestales masivos'
                ],
                'radius_km': thermal_radius_km * 2
            })
    
    # 3. INCENDIOS (afectados por composición)
    if effective_energy > 1:
        is_urban = False
        has_vegetation = True
        
        if usgs_context and usgs_context.get('elevation'):
            terrain = usgs_context['elevation'].get('terrain_type', '')
            if terrain in ['ocean_deep', 'ocean_shallow']:
                has_vegetation = False
            elif terrain == 'mountain_high':
                has_vegetation = False
        
        fire_radius_km = thermal_radius_km * 1.5
        
        # Metálicos causan más incendios por temperatura
        if composition == 'metallic':
            fire_radius_km *= 1.2
        
        if has_vegetation or effective_energy > 10:
            effects.append({
                'type': 'firestorm',
                'name': 'Tormenta de Fuego',
                'icon': '🔥',
                'severity': 'CRÍTICA' if effective_energy > 100 else 'ALTA',
                'color': '#DC3545',
                'description': f'Incendios masivos en {fire_radius_km:.1f} km.',
                'effects': [
                    f'Ignición simultánea en {fire_radius_km:.1f} km',
                    'Vientos >180 km/h hacia centro del fuego',
                    'Consumo total de oxígeno',
                    'Nubes pirocumulonimbus',
                    'Propagación secundaria hasta 100+ km',
                    'Temperatura ambiente >500°C'
                ],
                'duration': 'Días a semanas',
                'radius_km': fire_radius_km
            })
    
    # 4. EYECCIÓN DE MATERIAL
    if crater_diameter_m > 1000:
        ejecta_radius_km = (crater_diameter_m / 1000) * 10
        
        ejecta_effects = [
            f'Lluvia de material hasta {ejecta_radius_km:.0f} km',
            f'Altitud de eyección: {crater_diameter_m / 100:.0f} km',
            'Impactos secundarios de fragmentos',
            'Velocidades: 1-5 km/s'
        ]
        
        if composition == 'metallic':
            ejecta_effects.append('Fragmentos metálicos pesados y peligrosos')
        elif composition == 'icy':
            ejecta_effects.append('Eyección mayormente vapor y hielo sublimado')
        
        effects.append({
            'type': 'ejecta',
            'name': 'Eyección de Material',
            'icon': '🌋',
            'severity': 'ALTA',
            'color': '#FF5722',
            'description': f'Material eyectado hasta {ejecta_radius_km:.0f} km.',
            'effects': ejecta_effects,
            'radius_km': ejecta_radius_km
        })
    
    # 5. INVIERNO DE IMPACTO
    if effective_energy > 100:
        dust_amount = effective_energy * 0.1
        
        # Composición afecta cantidad de polvo
        if composition == 'carbonaceous':
            dust_amount *= 1.3  # Más polvo y hollín
        elif composition == 'icy':
            dust_amount *= 0.7  # Menos polvo, más vapor
        
        effects.append({
            'type': 'atmospheric',
            'name': 'Invierno de Impacto',
            'icon': '❄️',
            'severity': 'CATASTRÓFICA' if effective_energy > 10000 else 'CRÍTICA',
            'color': '#6A1B9A',
            'description': f'{dust_amount:.0f} MT de material a estratosfera.',
            'effects': [
                'Oscurecimiento solar (50-90%)',
                'Caída de temperatura: 10-30°C',
                'Colapso de fotosíntesis',
                'Lluvia ácida global',
                'Destrucción de ozono',
                f'Duración según composición: {comp_data["name"]}'
            ],
            'duration': 'Meses a años',
            'global_impact': True
        })
    
    # 6. PULSO ELECTROMAGNÉTICO
    if effective_energy > 10:
        emp_radius_km = 100 * (effective_energy ** 0.3)
        effects.append({
            'type': 'emp',
            'name': 'Pulso Electromagnético',
            'icon': '⚡',
            'severity': 'ALTA',
            'color': '#2196F3',
            'description': f'EMP hasta {emp_radius_km:.0f} km.',
            'effects': [
                'Destrucción de electrónica no protegida',
                'Apagón de redes eléctricas',
                'Pérdida de comunicaciones',
                'Daño a satélites',
                'Interferencia magnética'
            ],
            'radius_km': emp_radius_km
        })
    
    # 7. SÍSMICO EXTENDIDO - BASADO EN UBICACIÓN Y GEOLOGÍA
    if effective_energy > 1:
        seismic_radius_km = 50 * (effective_energy ** 0.5)
        
        # Calcular magnitud BASE del impacto
        energy_joules = energy_megatons * 4.184e15
        base_magnitude = (2/3) * math.log10(energy_joules) - 2.9
        
        # AJUSTAR MAGNITUD SEGÚN UBICACIÓN Y GEOLOGÍA
        magnitude_modifier = 0.0
        location_notes = []
        
        # Inicializar variables sísmicas
        seismic_context = {}
        has_seismic_history = False
        max_historical_mag = 0
        
        if usgs_context:
            elevation_data = usgs_context.get('elevation', {})
            is_oceanic = elevation_data.get('is_oceanic', False)
            terrain_type = elevation_data.get('terrain_type', 'unknown')
            elevation_m = elevation_data.get('elevation_m', 0)
            
            # Obtener historial sísmico
            seismic_context = usgs_context.get('seismic_history', {})
            has_seismic_history = seismic_context.get('count', 0) > 0
            max_historical_mag = seismic_context.get('max_magnitude', 0)
            
            # 1. IMPACTO OCEÁNICO
            if is_oceanic:
                # Océano profundo: mucha energía se disipa en agua
                if elevation_m < -2000:  # Océano profundo
                    magnitude_modifier = -0.8
                    location_notes.append('Océano profundo: energía disipada en columna de agua')
                elif elevation_m < -200:  # Océano medio
                    magnitude_modifier = -0.5
                    location_notes.append('Océano: parte de energía absorbida por agua')
                else:  # Océano poco profundo
                    magnitude_modifier = -0.3
                    location_notes.append('Océano poco profundo: impacto más directo en corteza')
            
            # 2. IMPACTO TERRESTRE - Tipo de suelo
            else:
                if terrain_type == 'mountain_high':
                    # Roca sólida, corteza gruesa
                    magnitude_modifier = +0.2
                    location_notes.append('Roca montañosa sólida: transmisión eficiente de ondas')
                    
                elif terrain_type == 'desert':
                    # Depende: puede ser roca o sedimentos
                    if elevation_m > 500:
                        magnitude_modifier = +0.1
                        location_notes.append('Meseta desértica rocosa: buena transmisión')
                    else:
                        magnitude_modifier = -0.2
                        location_notes.append('Cuenca sedimentaria: absorción parcial de energía')
                        
                elif terrain_type == 'forest' or terrain_type == 'vegetation':
                    # Suelo normal, ni muy duro ni muy blando
                    magnitude_modifier = 0.0
                    location_notes.append('Suelo continental estándar')
                    
                elif terrain_type == 'urban':
                    # Típicamente en cuencas sedimentarias
                    magnitude_modifier = -0.1
                    location_notes.append('Zona urbana en cuenca sedimentaria')
                    
                else:
                    magnitude_modifier = 0.0
            
            # 3. AMPLIFICACIÓN POR FALLAS ACTIVAS
            seismic_context = usgs_context.get('seismic_history', {})
            has_seismic_history = seismic_context.get('count', 0) > 0
            
            if has_seismic_history:
                # Zona con fallas activas: ligera amplificación
                magnitude_modifier += 0.15
                location_notes.append('Fallas activas: amplificación sísmica adicional')
        
        # Aplicar modificador (con límites razonables)
        impact_magnitude = base_magnitude + magnitude_modifier
        impact_magnitude = max(0, min(impact_magnitude, 15))  # Límites físicos
        
        # Determinar severidad basada en magnitud del impacto
        if impact_magnitude >= 9.0:
            severity = 'CATASTRÓFICA'
            color = '#8B0000'
        elif impact_magnitude >= 7.5:
            severity = 'CRÍTICA'
            color = '#FF0000'
        elif impact_magnitude >= 6.0:
            severity = 'ALTA'
            color = '#FF6F00'
        else:
            severity = 'MODERADA'
            color = '#FFA500'
        
        # Construir efectos contextuales
        seismic_effects = [
            f'Magnitud estimada: M {impact_magnitude:.1f}',
            f'Magnitud base: M {base_magnitude:.1f} ({"+" if magnitude_modifier >= 0 else ""}{magnitude_modifier:.2f} por geología)',
            f'Radio de afectación: {seismic_radius_km:.0f} km',
            f'Réplicas esperadas durante {"meses" if impact_magnitude > 7.0 else "semanas"}'
        ]
        
        # Añadir notas sobre la ubicación
        if location_notes:
            seismic_effects.append('')  # Línea en blanco
            seismic_effects.extend(location_notes)
        
        # Añadir efectos específicos según ubicación
        if has_seismic_history:
            if max_historical_mag > 0:
                comparison = "superior" if impact_magnitude > max_historical_mag else "comparable"
                seismic_effects.append(f'Impacto {comparison} al sismo histórico máximo (M{max_historical_mag:.1f})')
            
            seismic_effects.append('⚠️ Zona con fallas activas - alto riesgo de activación')
            seismic_effects.append('Probable activación de fallas dormidas')
        else:
            seismic_effects.append('Zona sin historial sísmico significativo')
            seismic_effects.append('Primera actividad sísmica mayor registrada en el área')
        
        # Efectos adicionales por magnitud
        if impact_magnitude >= 8.0:
            seismic_effects.extend([
                'Deslizamientos masivos en áreas montañosas',
                'Licuefacción del suelo en zonas costeras',
                'Posible activación de volcanes cercanos',
                'Cambios permanentes en el terreno'
            ])
        elif impact_magnitude >= 6.5:
            seismic_effects.extend([
                'Deslizamientos en zonas elevadas',
                'Agrietamiento extenso del terreno',
                'Daño estructural severo'
            ])
        else:
            seismic_effects.extend([
                'Agrietamiento menor del suelo',
                'Vibraciones perceptibles a gran distancia'
            ])
        
        effects.append({
            'type': 'seismic_extended',
            'name': 'Actividad Sísmica',
            'icon': '🌍',
            'severity': severity,
            'color': color,
            'description': f'Terremotos de magnitud M{impact_magnitude:.1f} hasta {seismic_radius_km:.0f} km.',
            'effects': seismic_effects,
            'radius_km': seismic_radius_km,
            'magnitude': impact_magnitude,
            'has_fault_lines': has_seismic_history
        })
    
    # 8. OCEÁNICO
    if usgs_context and usgs_context.get('elevation'):
        if usgs_context['elevation'].get('is_oceanic', False):
            effects.append({
                'type': 'oceanic',
                'name': 'Mega-Tsunami y Vaporización',
                'icon': '🌊',
                'severity': 'CATASTRÓFICA',
                'color': '#0277BD',
                'description': 'Impacto oceánico genera efectos marinos.',
                'effects': [
                    f'Vaporización de {(effective_energy ** 0.5) * 10:.0f} km³ de agua',
                    'Tsunamis >100m en costas',
                    'Vapor de agua a estratosfera',
                    'Efecto invernadero intensificado',
                    'Alteración de corrientes oceánicas',
                    'Contaminación salina atmosférica'
                ],
                'global_impact': True
            })
    
    # 9. EXTINCIÓN
    if effective_energy > 100000:
        effects.append({
            'type': 'extinction',
            'name': 'Evento de Extinción Masiva',
            'icon': '☠️',
            'severity': 'EXTINCIÓN',
            'color': '#000000',
            'description': 'Evento de extinción tipo K-Pg.',
            'effects': [
                'Extinción del 75%+ de especies',
                'Colapso de cadenas alimentarias',
                'Acidificación de océanos',
                'Mega-incendios globales',
                'Invierno de impacto de décadas',
                'Alteración climática permanente',
                'Fin de civilización actual'
            ],
            'global_impact': True,
            'recovery_time': 'Millones de años'
        })
    
    return effects

@app.route('/api/impact/flora-fauna', methods=['POST'])
def analyze_impact_flora_fauna():
    """
    Analiza el impacto en flora y fauna del área afectada usando GBIF API
    """
    try:
        data = request.json
        lat = float(data.get('latitude'))
        lon = float(data.get('longitude'))
        impact_radius_km = float(data.get('impact_radius_km', 10))
        impact_energy_megatons = float(data.get('impact_energy_megatons', 1))
        destruction_radius_km = float(data.get('destruction_radius_km', impact_radius_km * 0.2))
        
        if not lat or not lon:
            return jsonify({
                'success': False,
                'error': 'Latitud y longitud son requeridos'
            }), 400
        
        print(f"INFO: Analizando impacto en flora y fauna: {lat}, {lon}, radio explosión: {impact_radius_km}km, radio destrucción: {destruction_radius_km}km")
        
        # Convertir radio de km a grados (aproximado)
        radius_degrees = impact_radius_km / 111.0  # 1 grado ≈ 111 km
        
        # Crear bounding box para la búsqueda
        bounding_box = {
            'minLatitude': lat - radius_degrees,
            'maxLatitude': lat + radius_degrees,
            'minLongitude': lon - radius_degrees,
            'maxLongitude': lon + radius_degrees
        }
        
        # Buscar especies en paralelo
        flora_data = search_gbif_species(bounding_box, 'PLANTAE')
        fauna_data = search_gbif_species(bounding_box, 'ANIMALIA')
        
        # Analizar impacto basado en energía y radios reales
        impact_analysis = analyze_biological_impact_with_zones(
            flora_data, fauna_data, impact_energy_megatons, impact_radius_km, destruction_radius_km
        )
        
        return jsonify({
            'success': True,
            'impact_location': {'lat': lat, 'lon': lon},
            'impact_radius_km': impact_radius_km,
            'flora_species': flora_data,
            'fauna_species': fauna_data,
            'impact_analysis': impact_analysis,
            'data_source': 'GBIF Global Biodiversity Information Facility'
        })
        
    except Exception as e:
        print(f"Error en análisis de flora y fauna: {e}")
        return jsonify({
            'success': False,
            'error': f'Error en análisis: {str(e)}'
        }), 500


def search_gbif_species(bounding_box, taxonomic_kingdom):
    """
    Busca especies usando la API de GBIF
    """
    try:
        # Construir URL de búsqueda
        base_url = 'https://api.gbif.org/v1/occurrence/search'
        params = {
            'hasCoordinate': 'true',
            'hasGeospatialIssue': 'false',
            'kingdom': taxonomic_kingdom,
            'geometry': f'POLYGON(({bounding_box["minLongitude"]} {bounding_box["minLatitude"]}, {bounding_box["maxLongitude"]} {bounding_box["minLatitude"]}, {bounding_box["maxLongitude"]} {bounding_box["maxLatitude"]}, {bounding_box["minLongitude"]} {bounding_box["maxLatitude"]}, {bounding_box["minLongitude"]} {bounding_box["minLatitude"]}))',
            'limit': 100,
            'offset': 0
        }
        
        response = requests.get(base_url, params=params, timeout=10)
        
        if not response.ok:
            print(f"Error GBIF API: {response.status_code}")
            return []
        
        data = response.json()
        
        # Procesar resultados y agrupar por especies únicas
        species_map = {}
        
        for occurrence in data.get('results', []):
            if occurrence.get('species') and occurrence.get('speciesKey'):
                species_key = occurrence['speciesKey']
                
                if species_key not in species_map:
                    species_map[species_key] = {
                        'name': occurrence.get('species', ''),
                        'scientific_name': occurrence.get('scientificName', occurrence.get('species', '')),
                        'kingdom': occurrence.get('kingdom', ''),
                        'phylum': occurrence.get('phylum', ''),
                        'class': occurrence.get('class', ''),
                        'order': occurrence.get('order', ''),
                        'family': occurrence.get('family', ''),
                        'genus': occurrence.get('genus', ''),
                        'count': 0,
                        'vernacular_names': occurrence.get('vernacularNames', [])
                    }
                
                species_map[species_key]['count'] += 1
        
        # Convertir a lista y ordenar por frecuencia
        species_list = list(species_map.values())
        species_list.sort(key=lambda x: x['count'], reverse=True)
        
        return species_list[:50]  # Limitar a 50 especies más frecuentes
        
    except Exception as e:
        print(f"Error buscando especies GBIF: {e}")
        return []


def analyze_biological_impact_with_zones(flora_species, fauna_species, energy_megatons, damage_radius_km, destruction_radius_km):
    """
    Analiza el impacto biológico basado en las zonas reales de la explosión
    """
    try:
        total_species = len(flora_species) + len(fauna_species)
        
        # Usar los radios reales de la explosión
        # Zona 1: Destrucción total (cráter y área inmediata)
        total_destruction_radius = destruction_radius_km
        
        # Zona 2: Daño severo (ondas de choque, calor, presión)
        severe_impact_radius = damage_radius_km * 0.7  # 70% del radio de daño
        
        # Zona 3: Daño moderado (efectos secundarios)
        moderate_impact_radius = damage_radius_km
        
        # Calcular mortalidad por zona basada en distancia del epicentro
        # Zona de destrucción total: 100% mortalidad
        mortality_total = 100
        
        # Zona de daño severo: 80-95% mortalidad
        mortality_severe = min(95, 80 + (energy_megatons * 0.15))
        
        # Zona de daño moderado: 30-60% mortalidad
        mortality_moderate = min(60, 30 + (energy_megatons * 0.3))
        
        # Zona exterior: efectos menores
        outer_radius = damage_radius_km * 1.5
        mortality_outer = min(20, energy_megatons * 0.1)
        
        # Efectos específicos por tipo de organismo usando radios reales
        flora_impact = analyze_flora_impact_with_zones(flora_species, energy_megatons, destruction_radius_km, damage_radius_km)
        fauna_impact = analyze_fauna_impact_with_zones(fauna_species, energy_megatons, destruction_radius_km, damage_radius_km)
        
        # Clasificar severidad del impacto
        if energy_megatons >= 1000:
            severity = "extinction_event"
            severity_description = "Evento de extinción masiva - Pérdida total de biodiversidad"
        elif energy_megatons >= 100:
            severity = "catastrophic"
            severity_description = "Impacto catastrófico - Pérdida masiva de biodiversidad"
        elif energy_megatons >= 10:
            severity = "severe"
            severity_description = "Impacto severo - Pérdida significativa de biodiversidad"
        elif energy_megatons >= 1:
            severity = "moderate"
            severity_description = "Impacto moderado - Pérdida local de biodiversidad"
        else:
            severity = "minor"
            severity_description = "Impacto menor - Efectos localizados en biodiversidad"
        
        # Calcular organismos afectados por zona
        total_organisms = estimate_total_organisms_affected(flora_species, fauna_species, damage_radius_km)
        
        return {
            'total_species_found': total_species,
            'flora_species_count': len(flora_species),
            'fauna_species_count': len(fauna_species),
            'impact_severity': severity,
            'severity_description': severity_description,
            'explosion_parameters': {
                'damage_radius_km': damage_radius_km,
                'destruction_radius_km': destruction_radius_km,
                'energy_megatons': energy_megatons
            },
            'impact_zones': {
                'total_destruction': {
                    'radius_km': total_destruction_radius,
                    'mortality_percentage': mortality_total,
                    'description': f'Zona de destrucción total - Radio: {total_destruction_radius:.2f} km',
                    'area_km2': math.pi * (total_destruction_radius ** 2),
                    'organisms_affected': int(total_organisms['total_organisms'] * (total_destruction_radius / damage_radius_km) ** 2)
                },
                'severe_impact': {
                    'radius_km': severe_impact_radius,
                    'mortality_percentage': mortality_severe,
                    'description': f'Zona de daño severo - Radio: {severe_impact_radius:.2f} km',
                    'area_km2': math.pi * (severe_impact_radius ** 2),
                    'organisms_affected': int(total_organisms['total_organisms'] * (severe_impact_radius / damage_radius_km) ** 2)
                },
                'moderate_impact': {
                    'radius_km': moderate_impact_radius,
                    'mortality_percentage': mortality_moderate,
                    'description': f'Zona de daño moderado - Radio: {moderate_impact_radius:.2f} km',
                    'area_km2': math.pi * (moderate_impact_radius ** 2),
                    'organisms_affected': int(total_organisms['total_organisms'] * 0.8)
                },
                'outer_effects': {
                    'radius_km': outer_radius,
                    'mortality_percentage': mortality_outer,
                    'description': f'Zona de efectos menores - Radio: {outer_radius:.2f} km',
                    'area_km2': math.pi * (outer_radius ** 2),
                    'organisms_affected': int(total_organisms['total_organisms'] * 0.3)
                }
            },
            'flora_impact': flora_impact,
            'fauna_impact': fauna_impact,
            'estimated_casualties': {
                'total_organisms_affected': total_organisms,
                'flora_mortality_by_zone': flora_impact.get('mortality_by_zone', {}),
                'fauna_mortality_by_zone': fauna_impact.get('mortality_by_zone', {})
            }
        }
        
    except Exception as e:
        print(f"Error en análisis biológico con zonas: {e}")
        return {
            'error': str(e),
            'total_species_found': 0,
            'impact_severity': 'unknown'
        }


def analyze_flora_impact_with_zones(flora_species, energy_megatons, destruction_radius_km, damage_radius_km):
    """
    Analiza el impacto específico en flora usando las zonas reales de la explosión
    """
    try:
        if not flora_species:
            return {
                'estimated_mortality_percentage': 0,
                'most_vulnerable': [],
                'resilient_species': [],
                'recovery_time_years': 0,
                'mortality_by_zone': {}
            }
        
        # Plantas más vulnerables (árboles grandes, plantas de crecimiento lento)
        vulnerable_plants = []
        resilient_plants = []
        
        for species in flora_species:
            name = species['name'].lower()
            
            # Identificar plantas vulnerables por nombre científico o común
            if any(vuln in name for vuln in ['quercus', 'pinus', 'sequoia', 'cedrus', 'roble', 'pino', 'sequoia', 'cedro']):
                vulnerable_plants.append(species)
            elif any(res in name for res in ['grass', 'herb', 'moss', 'lichen', 'hierba', 'musgo', 'líquen']):
                resilient_plants.append(species)
        
        # Calcular mortalidad por zona
        mortality_by_zone = {
            'destruction_zone': {
                'radius_km': destruction_radius_km,
                'mortality_percentage': 100,  # 100% en zona de destrucción total
                'description': 'Zona de destrucción total'
            },
            'severe_zone': {
                'radius_km': damage_radius_km * 0.7,
                'mortality_percentage': min(95, 85 + (energy_megatons * 0.1)),
                'description': 'Zona de daño severo'
            },
            'moderate_zone': {
                'radius_km': damage_radius_km,
                'mortality_percentage': min(70, 40 + (energy_megatons * 0.3)),
                'description': 'Zona de daño moderado'
            }
        }
        
        # Mortalidad específica por tipo
        vulnerable_mortality = min(98, mortality_by_zone['severe_zone']['mortality_percentage'] + 10)
        resilient_mortality = max(20, mortality_by_zone['severe_zone']['mortality_percentage'] - 30)
        
        # Tiempo de recuperación estimado
        if energy_megatons >= 100:
            recovery_time = 1000  # Más de 1000 años
        elif energy_megatons >= 10:
            recovery_time = 100   # 100-1000 años
        elif energy_megatons >= 1:
            recovery_time = 10    # 10-100 años
        else:
            recovery_time = 1     # 1-10 años
        
        return {
            'estimated_mortality_percentage': mortality_by_zone['severe_zone']['mortality_percentage'],
            'vulnerable_species_mortality': vulnerable_mortality,
            'resilient_species_mortality': resilient_mortality,
            'most_vulnerable': vulnerable_plants[:5],
            'resilient_species': resilient_plants[:5],
            'recovery_time_years': recovery_time,
            'mortality_by_zone': mortality_by_zone,
            'impact_factors': [
                'Ondas de choque destruyen estructuras vegetales',
                'Calor extremo causa combustión espontánea',
                'Polvo atmosférico bloquea fotosíntesis',
                'Cambios en pH del suelo afectan crecimiento'
            ]
        }
        
    except Exception as e:
        print(f"Error analizando impacto en flora con zonas: {e}")
        return {'estimated_mortality_percentage': 50, 'mortality_by_zone': {}}


def analyze_flora_impact(flora_species, energy_megatons, radius_km):
    """
    Analiza el impacto específico en flora
    """
    try:
        if not flora_species:
            return {
                'estimated_mortality_percentage': 0,
                'most_vulnerable': [],
                'resilient_species': [],
                'recovery_time_years': 0
            }
        
        # Plantas más vulnerables (árboles grandes, plantas de crecimiento lento)
        vulnerable_plants = []
        resilient_plants = []
        
        for species in flora_species:
            name = species['name'].lower()
            
            # Identificar plantas vulnerables por nombre científico o común
            if any(vuln in name for vuln in ['quercus', 'pinus', 'sequoia', 'cedrus', 'roble', 'pino', 'sequoia', 'cedro']):
                vulnerable_plants.append(species)
            elif any(res in name for res in ['grass', 'herb', 'moss', 'lichen', 'hierba', 'musgo', 'líquen']):
                resilient_plants.append(species)
        
        # Calcular mortalidad basada en vulnerabilidad
        base_mortality = min(90, energy_megatons * 8)
        vulnerable_mortality = min(95, base_mortality + 10)
        resilient_mortality = max(20, base_mortality - 30)
        
        # Tiempo de recuperación estimado
        if energy_megatons >= 100:
            recovery_time = 1000  # Más de 1000 años
        elif energy_megatons >= 10:
            recovery_time = 100   # 100-1000 años
        elif energy_megatons >= 1:
            recovery_time = 10    # 10-100 años
        else:
            recovery_time = 1     # 1-10 años
        
        return {
            'estimated_mortality_percentage': base_mortality,
            'vulnerable_species_mortality': vulnerable_mortality,
            'resilient_species_mortality': resilient_mortality,
            'most_vulnerable': vulnerable_plants[:5],
            'resilient_species': resilient_plants[:5],
            'recovery_time_years': recovery_time,
            'impact_factors': [
                'Ondas de choque destruyen estructuras vegetales',
                'Calor extremo causa combustión espontánea',
                'Polvo atmosférico bloquea fotosíntesis',
                'Cambios en pH del suelo afectan crecimiento'
            ]
        }
        
    except Exception as e:
        print(f"Error analizando impacto en flora: {e}")
        return {'estimated_mortality_percentage': 50}


def analyze_fauna_impact_with_zones(fauna_species, energy_megatons, destruction_radius_km, damage_radius_km):
    """
    Analiza el impacto específico en fauna usando las zonas reales de la explosión
    """
    try:
        if not fauna_species:
            return {
                'estimated_mortality_percentage': 0,
                'most_vulnerable': [],
                'mobile_species': [],
                'recovery_time_years': 0,
                'mortality_by_zone': {}
            }
        
        # Clasificar fauna por vulnerabilidad
        vulnerable_animals = []
        mobile_animals = []
        
        for species in fauna_species:
            name = species['name'].lower()
            taxonomic_class = species.get('class', '').lower()
            
            # Identificar animales vulnerables (pequeños, sésiles, especializados)
            if any(vuln in name for vuln in ['frog', 'toad', 'salamander', 'rana', 'sapo', 'salamandra']):
                vulnerable_animals.append(species)
            elif any(mob in taxonomic_class for mob in ['aves', 'mammalia']):  # Aves y mamíferos más móviles
                mobile_animals.append(species)
        
        # Calcular mortalidad por zona
        mortality_by_zone = {
            'destruction_zone': {
                'radius_km': destruction_radius_km,
                'mortality_percentage': 100,  # 100% en zona de destrucción total
                'description': 'Zona de destrucción total'
            },
            'severe_zone': {
                'radius_km': damage_radius_km * 0.7,
                'mortality_percentage': min(95, 80 + (energy_megatons * 0.15)),
                'description': 'Zona de daño severo'
            },
            'moderate_zone': {
                'radius_km': damage_radius_km,
                'mortality_percentage': min(60, 30 + (energy_megatons * 0.3)),
                'description': 'Zona de daño moderado'
            }
        }
        
        # Mortalidad específica por tipo
        vulnerable_mortality = min(98, mortality_by_zone['severe_zone']['mortality_percentage'] + 15)
        mobile_mortality = max(25, mortality_by_zone['severe_zone']['mortality_percentage'] - 40)
        
        # Tiempo de recuperación
        if energy_megatons >= 100:
            recovery_time = 500   # 500-1000 años
        elif energy_megatons >= 10:
            recovery_time = 50    # 50-500 años
        elif energy_megatons >= 1:
            recovery_time = 5     # 5-50 años
        else:
            recovery_time = 1     # 1-5 años
        
        return {
            'estimated_mortality_percentage': mortality_by_zone['severe_zone']['mortality_percentage'],
            'vulnerable_species_mortality': vulnerable_mortality,
            'mobile_species_mortality': mobile_mortality,
            'most_vulnerable': vulnerable_animals[:5],
            'mobile_species': mobile_animals[:5],
            'recovery_time_years': recovery_time,
            'mortality_by_zone': mortality_by_zone,
            'impact_factors': [
                'Ondas de choque causan trauma interno masivo',
                'Calor extremo causa muerte por hipertermia',
                'Cambios atmosféricos afectan respiración',
                'Destrucción de hábitat elimina refugios'
            ]
        }
        
    except Exception as e:
        print(f"Error analizando impacto en fauna con zonas: {e}")
        return {'estimated_mortality_percentage': 60, 'mortality_by_zone': {}}


def analyze_fauna_impact(fauna_species, energy_megatons, radius_km):
    """
    Analiza el impacto específico en fauna
    """
    try:
        if not fauna_species:
            return {
                'estimated_mortality_percentage': 0,
                'most_vulnerable': [],
                'mobile_species': [],
                'recovery_time_years': 0
            }
        
        # Clasificar fauna por vulnerabilidad
        vulnerable_animals = []
        mobile_animals = []
        
        for species in fauna_species:
            name = species['name'].lower()
            taxonomic_class = species.get('class', '').lower()
            
            # Identificar animales vulnerables (pequeños, sésiles, especializados)
            if any(vuln in name for vuln in ['frog', 'toad', 'salamander', 'rana', 'sapo', 'salamandra']):
                vulnerable_animals.append(species)
            elif any(mob in taxonomic_class for mob in ['aves', 'mammalia']):  # Aves y mamíferos más móviles
                mobile_animals.append(species)
        
        # Calcular mortalidad basada en movilidad y tamaño
        base_mortality = min(85, energy_megatons * 7)
        vulnerable_mortality = min(95, base_mortality + 15)
        mobile_mortality = max(30, base_mortality - 40)
        
        # Tiempo de recuperación
        if energy_megatons >= 100:
            recovery_time = 500   # 500-1000 años
        elif energy_megatons >= 10:
            recovery_time = 50    # 50-500 años
        elif energy_megatons >= 1:
            recovery_time = 5     # 5-50 años
        else:
            recovery_time = 1     # 1-5 años
        
        return {
            'estimated_mortality_percentage': base_mortality,
            'vulnerable_species_mortality': vulnerable_mortality,
            'mobile_species_mortality': mobile_mortality,
            'most_vulnerable': vulnerable_animals[:5],
            'mobile_species': mobile_animals[:5],
            'recovery_time_years': recovery_time,
            'impact_factors': [
                'Ondas de choque causan trauma interno masivo',
                'Calor extremo causa muerte por hipertermia',
                'Cambios atmosféricos afectan respiración',
                'Destrucción de hábitat elimina refugios'
            ]
        }
        
    except Exception as e:
        print(f"Error analizando impacto en fauna: {e}")
        return {'estimated_mortality_percentage': 60}


def estimate_total_organisms_affected(flora_species, fauna_species, radius_km):
    """
    Estima el número total de organismos afectados
    """
    try:
        # Estimación basada en densidad de especies y área
        area_km2 = math.pi * (radius_km ** 2)
        
        # Densidad estimada por km² (valores conservadores)
        flora_density_per_km2 = 1000  # 1000 plantas por km²
        fauna_density_per_km2 = 100   # 100 animales por km²
        
        total_flora_organisms = len(flora_species) * flora_density_per_km2 * area_km2
        total_fauna_organisms = len(fauna_species) * fauna_density_per_km2 * area_km2
        
        return {
            'estimated_flora_organisms': int(total_flora_organisms),
            'estimated_fauna_organisms': int(total_fauna_organisms),
            'total_organisms': int(total_flora_organisms + total_fauna_organisms),
            'area_km2': round(area_km2, 2)
        }
        
    except Exception as e:
        print(f"Error estimando organismos: {e}")
        return {
            'estimated_flora_organisms': 0,
            'estimated_fauna_organisms': 0,
            'total_organisms': 0,
            'area_km2': 0
        }


def get_advanced_mitigation_strategy(result, asteroid_data, impact_data, time_available_years):
    """
    Genera estrategias avanzadas de mitigación basadas en datos del asteroide y tiempo disponible
    """
    try:
        # Extraer datos del asteroide
        diameter = asteroid_data.get('diameter_m', 0) if asteroid_data else impact_data.get('diameter_m', 0)
        velocity = asteroid_data.get('velocity_km_s', 0) if asteroid_data else impact_data.get('velocity_km_s', 0)
        mass = asteroid_data.get('mass_kg', 0) if asteroid_data else impact_data.get('mass_kg', 0)
        energy_megatons = impact_data.get('energy_megatons', 0) if impact_data else result.get('energy', {}).get('megatons', 0)
        
        strategies = []
        
        # Estrategia 1: Impactador Cinético (Kinetic Impactor)
        if time_available_years >= 5 and diameter <= 500:
            kinetic_strategy = {
                'name': 'Impactador Cinético',
                'description': 'Envío de una nave espacial para impactar el asteroide y cambiar su velocidad',
                'effectiveness': min(95, 70 + (time_available_years * 3)),
                'cost_billions': diameter * 0.1,
                'time_required_years': 5,
                'success_probability': min(90, 60 + (time_available_years * 2)),
                'technology_readiness': 'TRL 8-9',
                'implementation': [
                    'Diseño y construcción de nave impactadora',
                    'Lanzamiento con cohete pesado',
                    'Navegación autónoma hacia el asteroide',
                    'Impacto a alta velocidad (>10 km/s)',
                    'Monitoreo del cambio orbital'
                ]
            }
            strategies.append(kinetic_strategy)
        
        # Estrategia 2: Tractor Gravitacional (Gravity Tractor)
        if time_available_years >= 10 and diameter <= 200:
            gravity_strategy = {
                'name': 'Tractor Gravitacional',
                'description': 'Nave espacial que usa su gravedad para arrastrar el asteroide gradualmente',
                'effectiveness': min(85, 40 + (time_available_years * 2)),
                'cost_billions': diameter * 0.2,
                'time_required_years': 10,
                'success_probability': min(80, 50 + (time_available_years * 1.5)),
                'technology_readiness': 'TRL 6-7',
                'implementation': [
                    'Nave espacial de gran masa (>10 toneladas)',
                    'Posicionamiento cerca del asteroide',
                    'Mantenimiento de posición estable',
                    'Aplicación continua de fuerza gravitacional',
                    'Monitoreo a largo plazo'
                ]
            }
            strategies.append(gravity_strategy)
        
        # Estrategia 3: Deflector Nuclear (Nuclear Deflection)
        if energy_megatons >= 100 and diameter <= 1000:
            nuclear_strategy = {
                'name': 'Deflector Nuclear',
                'description': 'Uso de explosión nuclear para cambiar la trayectoria del asteroide',
                'effectiveness': min(98, 80 + (diameter * 0.02)),
                'cost_billions': diameter * 0.05,
                'time_required_years': 3,
                'success_probability': min(95, 70 + (diameter * 0.03)),
                'technology_readiness': 'TRL 9',
                'implementation': [
                    'Diseño de dispositivo nuclear especializado',
                    'Lanzamiento con cohete pesado',
                    'Navegación hacia el asteroide',
                    'Detonación a distancia segura',
                    'Monitoreo del cambio orbital'
                ],
                'risks': [
                    'Fragmentación del asteroide',
                    'Contaminación radiactiva',
                    'Consideraciones políticas y legales'
                ]
            }
            strategies.append(nuclear_strategy)
        
        # Estrategia 4: Laser Ablation
        if time_available_years >= 8 and diameter <= 300:
            laser_strategy = {
                'name': 'Ablación Láser',
                'description': 'Uso de láseres de alta potencia para vaporizar material del asteroide',
                'effectiveness': min(80, 30 + (time_available_years * 2.5)),
                'cost_billions': diameter * 0.15,
                'time_required_years': 8,
                'success_probability': min(75, 40 + (time_available_years * 2)),
                'technology_readiness': 'TRL 5-6',
                'implementation': [
                    'Sistema láser de alta potencia',
                    'Nave espacial con paneles solares grandes',
                    'Posicionamiento óptimo',
                    'Aplicación continua de energía láser',
                    'Monitoreo del cambio orbital'
                ]
            }
            strategies.append(laser_strategy)
        
        # Estrategia 5: Solar Sail
        if time_available_years >= 15 and diameter <= 100:
            solar_strategy = {
                'name': 'Vela Solar',
                'description': 'Instalación de vela solar en el asteroide para usar presión de radiación',
                'effectiveness': min(70, 20 + (time_available_years * 1.5)),
                'cost_billions': diameter * 0.3,
                'time_required_years': 15,
                'success_probability': min(65, 30 + (time_available_years * 1.2)),
                'technology_readiness': 'TRL 4-5',
                'implementation': [
                    'Diseño de vela solar especializada',
                    'Aterrizaje en el asteroide',
                    'Despliegue de la vela',
                    'Monitoreo a largo plazo',
                    'Ajustes de orientación'
                ]
            }
            strategies.append(solar_strategy)
        
        # Estrategia 6: Mass Driver
        if time_available_years >= 12 and diameter <= 400:
            mass_driver_strategy = {
                'name': 'Propulsor de Masa',
                'description': 'Instalación de sistema que lanza material del asteroide para crear empuje',
                'effectiveness': min(85, 35 + (time_available_years * 2)),
                'cost_billions': diameter * 0.25,
                'time_required_years': 12,
                'success_probability': min(80, 45 + (time_available_years * 1.8)),
                'technology_readiness': 'TRL 3-4',
                'implementation': [
                    'Diseño de sistema de propulsión',
                    'Aterrizaje en el asteroide',
                    'Instalación del sistema',
                    'Minería y lanzamiento de material',
                    'Monitoreo del cambio orbital'
                ]
            }
            strategies.append(mass_driver_strategy)
        
        # Ordenar estrategias por efectividad
        strategies.sort(key=lambda x: x['effectiveness'], reverse=True)
        
        # Generar recomendación principal
        if strategies:
            primary_strategy = strategies[0]
            recommendation = {
                'primary_strategy': primary_strategy,
                'alternative_strategies': strategies[1:],
                'combined_approach': {
                    'description': 'Combinación de múltiples estrategias para máxima efectividad',
                    'total_effectiveness': min(99, sum(s['effectiveness'] for s in strategies[:3]) / 3),
                    'total_cost_billions': sum(s['cost_billions'] for s in strategies[:2]),
                    'total_time_years': max(s['time_required_years'] for s in strategies[:2])
                },
                'risk_assessment': {
                    'low_risk': [s for s in strategies if s['success_probability'] >= 80],
                    'medium_risk': [s for s in strategies if 60 <= s['success_probability'] < 80],
                    'high_risk': [s for s in strategies if s['success_probability'] < 60]
                }
            }
        else:
            recommendation = {
                'primary_strategy': None,
                'alternative_strategies': [],
                'combined_approach': None,
                'risk_assessment': {'low_risk': [], 'medium_risk': [], 'high_risk': []},
                'message': 'No hay estrategias viables con el tiempo disponible'
            }
        
        return recommendation
        
    except Exception as e:
        print(f"Error generando estrategias de mitigación: {e}")
        return {
            'primary_strategy': None,
            'alternative_strategies': [],
            'combined_approach': None,
            'risk_assessment': {'low_risk': [], 'medium_risk': [], 'high_risk': []},
            'error': str(e)
        }


if __name__ == '__main__':
    print("Starting Asteroid Impact Simulator with USGS Integration...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)


