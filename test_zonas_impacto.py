#!/usr/bin/env python3
"""
Script para probar las zonas de impacto del endpoint /api/cities
"""

import requests
import json

def test_impact_zones():
    """Prueba las zonas de impacto"""
    
    url = "http://localhost:5000/api/cities"
    
    # Usar un radio más grande para capturar las tres zonas
    data = {
        "latitude": 41.4769,
        "longitude": -1.3742,
        "radius": 25000  # 25 km para capturar todas las zonas
    }
    
    print("🧪 PROBANDO ZONAS DE IMPACTO")
    print("=" * 40)
    print(f"📍 Coordenadas: {data['latitude']}, {data['longitude']}")
    print(f"📏 Radio: {data['radius']} metros (25 km)")
    print()
    
    try:
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ CONSULTA EXITOSA")
                print(f"🏙️ Total lugares: {result.get('total_found', 0)}")
                print(f"👥 Población total: {result.get('totalPopulation', 0):,}")
                print(f"💀 Víctimas totales: {result.get('totalVictims', 0):,}")
                print()
                
                # Mostrar zonas de impacto
                zones = result.get('zones', {})
                
                print("🎯 ZONAS DE IMPACTO:")
                print("-" * 30)
                
                for zone_key, zone_data in zones.items():
                    zone_name = zone_data.get('name', zone_key)
                    places_count = zone_data.get('places_count', 0)
                    total_pop = zone_data.get('total_population', 0)
                    total_victims = zone_data.get('total_victims', 0)
                    radius = zone_data.get('radius_km', 0)
                    percentage = zone_data.get('victims_percentage', 0) * 100
                    
                    print(f"\n{zone_name}:")
                    print(f"  📏 Radio: 0-{radius} km")
                    print(f"  📍 Lugares: {places_count}")
                    print(f"  👥 Población: {total_pop:,}")
                    print(f"  💀 Víctimas: {total_victims:,} ({percentage:.0f}%)")
                    
                    # Mostrar algunos lugares de esta zona
                    places = zone_data.get('places', [])
                    if places:
                        print(f"  🏘️ Lugares principales:")
                        for place in places[:3]:  # Mostrar solo 3
                            print(f"    • {place['nombre']} - {place['poblacion']:,} hab - {place['victimas_estimadas']:,} víctimas")
                        if len(places) > 3:
                            print(f"    ... y {len(places) - 3} más")
                
                # Verificar que tenemos las tres zonas
                expected_zones = ['destruction', 'damage', 'affected']
                missing_zones = []
                
                for zone in expected_zones:
                    if zone not in zones:
                        missing_zones.append(zone)
                
                if missing_zones:
                    print(f"\n⚠️ Zonas faltantes: {', '.join(missing_zones)}")
                else:
                    print(f"\n✅ Todas las zonas de impacto están presentes")
                
                return True
                
            else:
                print("❌ Error en la respuesta del servidor")
                print(f"Error: {result.get('error', 'Desconocido')}")
                return False
                
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al backend")
        print("💡 Asegúrate de que el servidor Flask esté ejecutándose")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_specific_zone():
    """Prueba con radio específico para una zona"""
    
    url = "http://localhost:5000/api/cities"
    
    # Radio pequeño para capturar solo zona de destrucción
    data = {
        "latitude": 41.4769,
        "longitude": -1.3742,
        "radius": 5000  # 5 km - solo zona de destrucción
    }
    
    print("\n🧪 PROBANDO ZONA DE DESTRUCCIÓN (5 km)")
    print("-" * 40)
    
    try:
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                zones = result.get('zones', {})
                destruction_zone = zones.get('destruction', {})
                
                print(f"🔥 Zona Destrucción: {destruction_zone.get('places_count', 0)} lugares")
                print(f"💀 Víctimas: {destruction_zone.get('total_victims', 0):,}")
                
                return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success1 = test_impact_zones()
    success2 = test_specific_zone()
    
    print("\n" + "=" * 40)
    if success1 and success2:
        print("✅ TODAS LAS PRUEBAS PASARON")
        print("🎯 Las zonas de impacto están funcionando correctamente")
    else:
        print("❌ ALGUNAS PRUEBAS FALLARON")
        print("💡 Revisar logs del servidor para más detalles")
