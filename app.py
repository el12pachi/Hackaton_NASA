"""
Asteroid Impact Simulator - Backend Flask
Hackathon NASA 2025
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
    
    # Convertir grados a radianes
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Diferencia de coordenadas
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Fórmula de Haversine
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance

app = Flask(__name__)
CORS(app)

# NASA API Configuration
NASA_API_KEY = "btXo212rjwe6lTcZjPSonG2XUGa2C6OxIefooRua"  # Cambiar por tu API key
NASA_NEO_API = "https://api.nasa.gov/neo/rest/v1/neo/browse"
NASA_NEO_FEED = "https://api.nasa.gov/neo/rest/v1/feed"

# Physical Constants
G = 6.67430e-11  # Gravitational constant (m^3 kg^-1 s^-2)
EARTH_MASS = 5.972e24  # kg
EARTH_RADIUS = 6371000  # meters
EARTH_MU = 3.986004418e14  # Earth's gravitational parameter (m^3/s^2)
ASTEROID_DENSITY = 3000  # kg/m^3 (typical rocky asteroid)
GROUND_DENSITY = 2500  # kg/m^3
GRAVITY = 9.81  # m/s^2

class AsteroidSimulator:
    """Simulador de impactos de asteroides con física realista"""
    
    @staticmethod
    def calculate_mass(diameter_m):
        """Calcula la masa del asteroide basada en el diámetro"""
        radius = diameter_m / 2
        volume = (4/3) * math.pi * radius**3
        mass = volume * ASTEROID_DENSITY
        return mass
    
    @staticmethod
    def calculate_impact_energy(mass, velocity):
        """Calcula la energía cinética del impacto en Joules"""
        energy = 0.5 * mass * velocity**2
        return energy
    
    @staticmethod
    def energy_to_tnt(energy_joules):
        """Convierte energía a megatones de TNT"""
        tnt_joules = 4.184e15  # 1 megatón TNT = 4.184e15 J
        megatons = energy_joules / tnt_joules
        return megatons
    
    @staticmethod
    def calculate_crater_diameter(energy, angle=45):
        """
        Calcula el diámetro del cráter usando relaciones de escala
        angle: ángulo de entrada en grados (45° por defecto)
        """
        # Escala de cráter simplificada
        # D = C * (E / (ρg))^0.22
        # Donde C es una constante ~1.8 para impactos en roca
        C = 1.8
        D = C * ((energy / (GROUND_DENSITY * GRAVITY)) ** 0.22)
        
        # Ajustar por ángulo (impactos oblicuos crean cráteres más pequeños)
        angle_factor = math.sin(math.radians(angle))
        D_adjusted = D * angle_factor
        
        return D_adjusted
    
    @staticmethod
    def calculate_seismic_magnitude(energy):
        """Calcula la magnitud sísmica equivalente"""
        # Relación Gutenberg-Richter modificada
        # M = (2/3) * log10(E) - 2.9
        if energy <= 0:
            return 0
        magnitude = (2/3) * math.log10(energy) - 2.9
        return max(0, magnitude)
    
    @staticmethod
    def calculate_tsunami_risk(energy, distance_to_coast_km):
        """Evalúa riesgo de tsunami"""
        if distance_to_coast_km > 100:
            return {"risk": "low", "wave_height": 0}
        
        # Energía mínima para tsunami significativo (~1MT)
        min_energy = 4.184e15
        if energy < min_energy:
            return {"risk": "low", "wave_height": 0}
        
        # Altura de ola estimada (muy simplificada)
        # Depende de energía y distancia a costa
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
        """
        Calcula el cambio de trayectoria debido a impactador cinético
        Retorna el cambio de velocidad (delta-v) en m/s
        """
        # Conservación de momento
        delta_v = (impactor_mass * impactor_velocity) / asteroid_mass
        
        # Distancia desviada después del tiempo dado
        # d = delta_v * t
        time_seconds = time_before_impact_days * 86400
        deflection_distance = delta_v * time_seconds
        
        return {
            "delta_v": delta_v,
            "deflection_km": deflection_distance / 1000,
            "success": deflection_distance > EARTH_RADIUS
        }
    
    @staticmethod
    def orbital_position(semi_major_axis, eccentricity, time_fraction):
        """
        Calcula posición orbital usando elementos keplerianos simplificados
        time_fraction: fracción del período orbital (0-1)
        Retorna (x, y, z) en metros
        """
        # Anomalía media
        M = 2 * math.pi * time_fraction
        
        # Resolver ecuación de Kepler para anomalía excéntrica (método iterativo simple)
        E = M
        for _ in range(10):  # Iteraciones Newton-Raphson
            E = M + eccentricity * math.sin(E)
        
        # Coordenadas en el plano orbital
        r = semi_major_axis * (1 - eccentricity * math.cos(E))
        x = r * math.cos(E)
        y = r * math.sqrt(1 - eccentricity**2) * math.sin(E)
        z = 0  # Simplificado para plano eclíptico
        
        return {"x": x, "y": y, "z": z, "r": r}


@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')


@app.route('/api/neo/recent', methods=['GET'])
def get_recent_neos():
    """Obtiene asteroides cercanos recientes de la NASA API"""
    try:
        # Obtener datos de los últimos 7 días
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        params = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'api_key': NASA_API_KEY
        }
        
        response = requests.get(NASA_NEO_FEED, params=params, timeout=10)
        data = response.json()
        
        # Procesar y simplificar datos
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
            'asteroids': asteroids[:20]  # Limitar a 20 para rendimiento
        })
    
    except Exception as e:
        # Fallback con datos simulados si la API falla
        return jsonify({
            'success': False,
            'message': str(e),
            'asteroids': get_sample_asteroids()
        })


@app.route('/api/simulate/impact', methods=['POST'])
def simulate_impact():
    """Simula un impacto de asteroide"""
    try:
        data = request.json
        
        # Parámetros del asteroide
        diameter = float(data.get('diameter', 100))  # metros
        velocity = float(data.get('velocity', 20000))  # m/s
        angle = float(data.get('angle', 45))  # grados
        lat = float(data.get('latitude', 0))
        lon = float(data.get('longitude', 0))
        
        # Calcular impacto
        sim = AsteroidSimulator()
        mass = sim.calculate_mass(diameter)
        energy = sim.calculate_impact_energy(mass, velocity)
        tnt_megatons = sim.energy_to_tnt(energy)
        crater_diameter = sim.calculate_crater_diameter(energy, angle)
        magnitude = sim.calculate_seismic_magnitude(energy)
        
        # Estimar distancia a costa (simplificado - en realidad usaríamos USGS data)
        distance_to_coast = estimate_distance_to_coast(lat, lon)
        tsunami = sim.calculate_tsunami_risk(energy, distance_to_coast)
        
        # Zona de destrucción (aproximación)
        destruction_radius_km = crater_diameter / 2000  # Radio de destrucción total
        damage_radius_km = destruction_radius_km * 5  # Radio de daño significativo
        
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
            'severity': classify_severity(tnt_megatons)
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/simulate/deflection', methods=['POST'])
def simulate_deflection():
    """Simula una estrategia de deflexión"""
    try:
        data = request.json
        
        # Parámetros del asteroide
        asteroid_diameter = float(data.get('asteroid_diameter', 100))
        asteroid_velocity = float(data.get('asteroid_velocity', 20000))
        
        # Parámetros de la misión
        strategy = data.get('strategy', 'kinetic_impactor')
        time_before_impact_days = float(data.get('time_before_impact', 365))
        impactor_mass = float(data.get('impactor_mass', 1000))  # kg
        impactor_velocity = float(data.get('impactor_velocity', 10000))  # m/s
        
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
            # Simplificación de tractor de gravedad
            # Deflexión mucho más gradual pero continua
            spacecraft_mass = 1000  # kg
            distance = 100  # metros del asteroide
            time_seconds = time_before_impact_days * 86400
            
            # Fuerza gravitacional entre nave y asteroide
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
    """Calcula trayectoria orbital"""
    try:
        data = request.json
        
        # Parámetros orbitales
        semi_major_axis = float(data.get('semi_major_axis', 1.5e11))  # 1 AU aprox
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
    """Obtener ciudades cercanas usando Overpass API"""
    try:
        data = request.get_json()
        lat = data.get('latitude')
        lon = data.get('longitude')
        radius = data.get('radius', 25000)  # Radio en metros, default 25km
        
        if not lat or not lon:
            return jsonify({
                'success': False,
                'error': 'Latitud y longitud son requeridos'
            }), 400
            
        # Consulta Overpass: ciudades, pueblos o aldeas en el radio especificado
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
        
        # Procesar resultados
        places = []
        for element in ovrpress_data.get("elements", []):
            name = element.get("tags", {}).get("name")
            place_type = element.get("tags", {}).get("place")
            population = element.get("tags", {}).get("population")
            
            # Obtener coordenadas
            city_lat = element.get("lat")
            city_lon = element.get("lon")
            
            if name and city_lat and city_lon:
                # Calcular distancia usando la fórmula de Haversine
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
        # En caso de error, devolver lista vacía sin mostrar error
        return jsonify({
            'success': True,
            'cities': [],
            'total_found': 0
        })


def get_sample_asteroids():
    """Datos de muestra cuando la API no está disponible"""
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
        },
        {
            'id': '101955',
            'name': '101955 Bennu (1999 RQ36)',
            'diameter_min_m': 490,
            'diameter_max_m': 492,
            'is_hazardous': True,
            'velocity_km_s': 27.7,
            'miss_distance_km': 480000,
            'approach_date': '2135-09-25'
        }
    ]


def estimate_distance_to_coast(lat, lon):
    """
    Estimación simplificada de distancia a costa
    En implementación real usaríamos datos USGS
    """
    # Simplificación: asumimos que puntos oceánicos están cerca de costa
    # y puntos continentales tienen distancias variables
    
    # Regiones oceánicas aproximadas
    if -180 <= lon <= -30 and -60 <= lat <= 60:  # Atlántico
        return np.random.uniform(0, 50)
    elif 30 <= lon <= 180 and -60 <= lat <= 60:  # Pacífico
        return np.random.uniform(0, 50)
    else:  # Continental
        return np.random.uniform(100, 5000)


def classify_severity(megatons):
    """Clasifica la severidad del impacto"""
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
    """Genera recomendaciones basadas en resultado de deflexión"""
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
    print("Starting Asteroid Impact Simulator...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

