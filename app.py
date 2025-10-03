"""
Asteroid Impact Simulator - Backend Flask con USGS API
Hackathon NASA 2025 - Branch Bujo
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import requests
import numpy as np
import math
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
    
    distance = R * c
    return distance

app = Flask(__name__)
CORS(app)

# ============================================
# API KEYS Y CONFIGURACIÓN
# ============================================

NASA_API_KEY = "btXo212rjwe6lTcZjPSonG2XUGa2C6OxIefooRua"
NASA_NEO_API = "https://api.nasa.gov/neo/rest/v1/neo/browse"
NASA_NEO_FEED = "https://api.nasa.gov/neo/rest/v1/feed"

# USGS APIs - No requieren API key (públicas)
USGS_EARTHQUAKE_API = "https://earthquake.usgs.gov/fdsnws/event/1/query"
USGS_COASTAL_API = "https://coast.noaa.gov/api/v1/"

# Physical Constants
G = 6.67430e-11
EARTH_MASS = 5.972e24
EARTH_RADIUS = 6371000
EARTH_MU = 3.986004418e14
ASTEROID_DENSITY = 3000
GROUND_DENSITY = 2500
GRAVITY = 9.81

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
            print(f"⚠️ USGS Elevation API status: {response.status_code}")
            return None
        
        # Verificar si la respuesta está vacía
        if not response.text or response.text.strip() == '':
            print(f"⚠️ USGS Elevation: Respuesta vacía para {lat}, {lon}")
            return None
        
        try:
            data = response.json()
        except ValueError as e:
            print(f"⚠️ USGS Elevation: JSON inválido - {e}")
            # Usar método alternativo (OpenElevation API)
            return get_elevation_alternative(lat, lon)
        
        # Verificar si hay valor de elevación
        if 'value' not in data or data['value'] is None:
            print(f"⚠️ USGS Elevation: Sin datos para {lat}, {lon} (fuera de cobertura USA)")
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
        
        print(f"✅ USGS Elevation: {elevation}m - {description}")
        
        return {
            'elevation_m': elevation,
            'terrain_type': terrain_type,
            'description': description,
            'is_oceanic': elevation < 0,
            'source': 'USGS'
        }
        
    except Exception as e:
        print(f"❌ Error fetching USGS elevation: {e}")
        # Fallback a API alternativa
        return get_elevation_alternative(lat, lon)

def get_elevation_alternative(lat, lon):
    """
    API alternativa de elevación (Open-Elevation) - cobertura global
    Funciona en todo el mundo, no solo USA
    """
    try:
        print(f"🔄 Intentando API alternativa (Open-Elevation) para {lat}, {lon}...")
        
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
                
                print(f"✅ Open-Elevation: {elevation}m - {description}")
                
                return {
                    'elevation_m': elevation,
                    'terrain_type': terrain_type,
                    'description': description,
                    'is_oceanic': elevation < 0,
                    'source': 'Open-Elevation'
                }
        
        # Si Open-Elevation falla, usar estimación básica
        print(f"⚠️ Open-Elevation también falló, usando estimación básica")
        return get_elevation_basic_estimate(lat, lon)
        
    except Exception as e:
        print(f"❌ Error with alternative elevation API: {e}")
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
    
    print(f"📊 Estimación básica: {elevation}m - {description}")
    
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
            print(f"ℹ️ Sin datos de elevación, usando estimación")
            return estimate_distance_to_coast(lat, lon)
        
        # Si está en el océano, distancia = 0
        if elevation_data.get('is_oceanic', False):
            print(f"🌊 Impacto oceánico detectado (elevación: {elevation_data['elevation_m']}m)")
            return 0
        
        # Si es terrestre, calcular distancia estimada sin más llamadas API
        elev = elevation_data.get('elevation_m', 200)
        
        print(f"🗺️ Calculando distancia a costa para elevación {elev}m en {lat}, {lon}")
        
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
        
        print(f"✅ Distancia estimada a costa: {distance}km")
        return distance
        
    except Exception as e:
        print(f"Error estimating coastal distance: {e}")
        return estimate_distance_to_coast(lat, lon)

def get_usgs_geographic_context(lat, lon):
    """
    Combina todas las funciones USGS para dar contexto geográfico completo.
    Optimizado: obtiene elevación UNA SOLA VEZ y reutiliza el dato.
    """
    print(f"🌍 Obteniendo contexto geográfico USGS para {lat}, {lon}...")
    
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
    
    print(f"✅ Contexto USGS completado")
    return context


# ============================================
# EXISTING CLASSES (sin cambios)
# ============================================

class AsteroidSimulator:
    """Simulador de impactos de asteroides con física realista"""
    
    @staticmethod
    def calculate_mass(diameter_m):
        radius = diameter_m / 2
        volume = (4/3) * math.pi * radius**3
        mass = volume * ASTEROID_DENSITY
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
    def calculate_crater_diameter(energy, angle=45):
        C = 1.8
        D = C * ((energy / (GROUND_DENSITY * GRAVITY)) ** 0.22)
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
    def calculate_tsunami_risk(energy, distance_to_coast_km):
        if distance_to_coast_km > 100:
            return {"risk": "low", "wave_height": 0}
        
        min_energy = 4.184e15
        if energy < min_energy:
            return {"risk": "low", "wave_height": 0}
        
        megatons = energy / 4.184e15
        wave_height = math.sqrt(megatons) * 10 / (1 + distance_to_coast_km/10)
        
        if wave_height < 1:
            risk = "low"
        elif wave_height < 5:
            risk = "medium"
        elif wave_height < 15:
            risk = "high"
        else:
            risk = "extreme"
        
        return {"risk": risk, "wave_height": round(wave_height, 2)}
    
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
        data = response.json()
        
        asteroids = []
        for date_key in data.get('near_earth_objects', {}):
            for neo in data['near_earth_objects'][date_key]:
                asteroid = {
                    'id': neo['id'],
                    'name': neo['name'],
                    'diameter_min_m': neo['estimated_diameter']['meters']['estimated_diameter_min'],
                    'diameter_max_m': neo['estimated_diameter']['meters']['estimated_diameter_max'],
                    'is_hazardous': neo['is_potentially_hazardous_asteroid'],
                    'velocity_km_s': float(neo['close_approach_data'][0]['relative_velocity']['kilometers_per_second']),
                    'miss_distance_km': float(neo['close_approach_data'][0]['miss_distance']['kilometers']),
                    'approach_date': neo['close_approach_data'][0]['close_approach_date']
                }
                asteroids.append(asteroid)
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
            'asteroids': asteroids[:20]
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'asteroids': get_sample_asteroids()
        })


@app.route('/api/simulate/impact', methods=['POST'])
def simulate_impact():
    """Simula un impacto de asteroide - MEJORADO CON USGS"""
    try:
        data = request.json
        
        diameter = float(data.get('diameter', 100))
        velocity = float(data.get('velocity', 20000))
        angle = float(data.get('angle', 45))
        lat = float(data.get('latitude', 0))
        lon = float(data.get('longitude', 0))
        
        # ===== INTEGRACIÓN USGS =====
        print(f"🌍 Obteniendo contexto geográfico USGS para {lat}, {lon}...")
        usgs_context = get_usgs_geographic_context(lat, lon)
        
        # Calcular impacto
        sim = AsteroidSimulator()
        mass = sim.calculate_mass(diameter)
        energy = sim.calculate_impact_energy(mass, velocity)
        tnt_megatons = sim.energy_to_tnt(energy)
        crater_diameter = sim.calculate_crater_diameter(energy, angle)
        magnitude = sim.calculate_seismic_magnitude(energy)
        
        # Usar distancia a costa de USGS
        distance_to_coast = usgs_context['coastal_distance_km']
        tsunami = sim.calculate_tsunami_risk(energy, distance_to_coast)
        
        destruction_radius_km = crater_diameter / 2000
        damage_radius_km = destruction_radius_km * 5
        
        result = {
            'success': True,
            'input': {
                'diameter_m': diameter,
                'velocity_m_s': velocity,
                'angle_deg': angle,
                'impact_location': {'lat': lat, 'lon': lon}
            },
            'calculations': {
                'mass_kg': mass,
                'energy_joules': energy,
                'energy_megatons_tnt': round(tnt_megatons, 4),
                'crater_diameter_m': round(crater_diameter, 2),
                'seismic_magnitude': round(magnitude, 2),
                'destruction_radius_km': round(destruction_radius_km, 2),
                'damage_radius_km': round(damage_radius_km, 2),
                'tsunami': tsunami
            },
            'severity': classify_severity(tnt_megatons),
            'usgs_context': usgs_context  # ¡NUEVO! Datos USGS incluidos
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
        
        return jsonify({
            'success': True,
            'result': result,
            'recommendation': get_deflection_recommendation(result)
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
        for element in ovrpress_data.get("elements", []):
            name = element.get("tags", {}).get("name")
            place_type = element.get("tags", {}).get("place")
            population = element.get("tags", {}).get("population")
            
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
        
        return jsonify({
            'success': True,
            'cities': places,
            'total_found': len(places)
        })
        
    except Exception as e:
        return jsonify({
            'success': True,
            'cities': [],
            'total_found': 0
        })


# ============================================
# HELPER FUNCTIONS
# ============================================

def get_sample_asteroids():
    return [
        {
            'id': 'IMPACTOR-2025',
            'name': 'Impactor-2025',
            'diameter_min_m': 140,
            'diameter_max_m': 310,
            'is_hazardous': True,
            'velocity_km_s': 25.5,
            'miss_distance_km': 75000,
            'approach_date': '2025-12-31'
        },
        {
            'id': '99942',
            'name': '99942 Apophis (2004 MN4)',
            'diameter_min_m': 310,
            'diameter_max_m': 340,
            'is_hazardous': True,
            'velocity_km_s': 7.42,
            'miss_distance_km': 31600,
            'approach_date': '2029-04-13'
        }
    ]


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


if __name__ == '__main__':
    print("Starting Asteroid Impact Simulator with USGS Integration...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)