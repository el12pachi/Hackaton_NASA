@ -8,6 +8,7 @@ from flask_cors import CORS
import requests
import numpy as np
import math
import time
from datetime import datetime, timedelta

def calculate_distance_haversine(lat1, lon1, lat2, lon2):
@ -25,8 +26,29 @@ def calculate_distance_haversine(lat1, lon1, lat2, lon2):
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance
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
@ -429,12 +451,6 @@ class AsteroidSimulator:
    
    @staticmethod
    def calculate_tsunami_risk(energy, distance_to_coast_km):
<<<<<<< Updated upstream
        if distance_to_coast_km > 100:
            return {"risk": "low", "wave_height": 0}
        
        min_energy = 4.184e15
=======
        """
        Evalúa riesgo de tsunami basado en modelos científicos de la NASA
        Usa parámetros realistas basados en estudios de impacto de asteroides
@ -444,15 +460,10 @@ class AsteroidSimulator:
        
        # Energía mínima para tsunami significativo (basado en estudios de la NASA)
        min_energy = 4.184e15  # 1 MT TNT
        
>>>>>>> Stashed changes
        if energy < min_energy:
            return {"risk": "minimal", "wave_height": 0, "penetration_km": 0}
        
<<<<<<< Updated upstream
=======
        # Convertir energía a megatones
>>>>>>> Stashed changes
        megatons = energy / 4.184e15
        
        # Modelo realista de tsunami basado en estudios de impacto
@ -533,10 +544,6 @@ def index():

@app.route('/api/neo/recent', methods=['GET'])
def get_recent_neos():
<<<<<<< Updated upstream
=======
    """Obtiene asteroides cercanos recientes de la NASA API - Solo datos reales"""
>>>>>>> Stashed changes
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
@ -558,33 +565,26 @@ def get_recent_neos():
                if neo.get('close_approach_data') and len(neo['close_approach_data']) > 0:
                    asteroid = {
                        'id': str(neo['id']),  # Convertir a string para consistencia
                        'name': neo['name'],
                        'diameter_min_m': neo['estimated_diameter']['meters']['estimated_diameter_min'],
                        'diameter_max_m': neo['estimated_diameter']['meters']['estimated_diameter_max'],
                        'is_hazardous': neo['is_potentially_hazardous_asteroid'],
                        'velocity_km_s': float(neo['close_approach_data'][0]['relative_velocity']['kilometers_per_second']),
                        'miss_distance_km': float(neo['close_approach_data'][0]['miss_distance']['kilometers']),
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
                }
                asteroids.append(asteroid)
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
<<<<<<< Updated upstream
            'asteroids': asteroids[:20]
        })
    
    except Exception as e:
=======
            'asteroids': asteroids[:20],  # Limitar a 20 para rendimiento
            'data_source': 'NASA NEO API',
            'date_range': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        })
    
    except requests.exceptions.RequestException as e:
>>>>>>> Stashed changes
        return jsonify({
            'success': False,
            'error': f'Error de conexión con la NASA API: {str(e)}',
@ -602,11 +602,7 @@ def get_recent_neos():

@app.route('/api/simulate/impact', methods=['POST'])
def simulate_impact():
<<<<<<< Updated upstream
    """Simula un impacto de asteroide - MEJORADO CON USGS"""
=======
    """Simula un impacto de asteroide con integración de datos NASA/USGS"""
>>>>>>> Stashed changes
    try:
        data = request.json
        
@ -616,15 +612,11 @@ def simulate_impact():
        lat = float(data.get('latitude', 0))
        lon = float(data.get('longitude', 0))
        
<<<<<<< Updated upstream
        # ===== INTEGRACIÓN USGS =====
        print(f"🌍 Obteniendo contexto geográfico USGS para {lat}, {lon}...")
        usgs_context = get_usgs_geographic_context(lat, lon)
        
        # Calcular impacto
=======
        # Calcular impacto básico
>>>>>>> Stashed changes
        sim = AsteroidSimulator()
        mass = sim.calculate_mass(diameter)
        energy = sim.calculate_impact_energy(mass, velocity)
@ -663,15 +655,12 @@ def simulate_impact():
                'tsunami': tsunami
            },
            'severity': classify_severity(tnt_megatons),
<<<<<<< Updated upstream
            'usgs_context': usgs_context  # ¡NUEVO! Datos USGS incluidos
=======
            'usgs_context': usgs_context,  # ¡NUEVO! Datos USGS incluidos
            'data_sources': {
                'impact_calculations': 'NASA Asteroid Impact Physics Models',
                'asteroid_data': 'NASA NEO API',
                'population_data': 'OpenStreetMap Overpass API'
            }
>>>>>>> Stashed changes
        }
        
        return jsonify(result)
@ -835,33 +824,6 @@ def get_cities():
        })


<<<<<<< Updated upstream
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
=======
@app.route('/api/nasa/sbdb/<asteroid_id>', methods=['GET'])
def get_asteroid_sbdb_data(asteroid_id):
    """
@ -875,7 +837,6 @@ def get_asteroid_sbdb_data(asteroid_id):
            'orb': 1,  # Incluir elementos orbitales
            'phys-par': 1,  # Incluir parámetros físicos
            'cov': 1  # Incluir covarianza
>>>>>>> Stashed changes
        }
        
        response = requests.get(NASA_SBDB_API, params=params, timeout=10)
@ -1732,7 +1693,556 @@ def get_deflection_recommendation(result):
        }


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
        
        print(f"🌿 Analizando impacto en flora y fauna: {lat}, {lon}, radio explosión: {impact_radius_km}km, radio destrucción: {destruction_radius_km}km")
        
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


if __name__ == '__main__':
    print("Starting Asteroid Impact Simulator with USGS Integration...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
    app.run(debug=True, host='0.0.0.0', port=5000)