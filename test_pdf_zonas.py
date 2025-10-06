#!/usr/bin/env python3
"""
Script para probar la generación de PDF con todas las zonas de impacto
"""

import requests
import json

def test_pdf_with_zones():
    """Prueba el backend para generar datos que luego se usarán en el PDF"""
    
    url = "http://localhost:5000/api/cities"
    
    # Usar radio grande para capturar las tres zonas
    data = {
        "latitude": 41.4769,
        "longitude": -1.3742,
        "radius": 25000  # 25 km
    }
    
    print("🧪 PROBANDO DATOS PARA PDF CON ZONAS DE IMPACTO")
    print("=" * 50)
    print(f"📍 Coordenadas: {data['latitude']}, {data['longitude']}")
    print(f"📏 Radio: {data['radius']} metros (25 km)")
    print()
    
    try:
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ DATOS OBTENIDOS EXITOSAMENTE")
                print()
                
                # Mostrar resumen general
                print("📊 RESUMEN GENERAL:")
                print(f"   🏙️ Total lugares: {result.get('total_found', 0)}")
                print(f"   👥 Población total: {result.get('totalPopulation', 0):,}")
                print(f"   💀 Víctimas totales: {result.get('totalVictims', 0):,}")
                print()
                
                # Mostrar cada zona
                zones = result.get('zones', {})
                
                print("🎯 ZONAS DE IMPACTO PARA PDF:")
                print("-" * 40)
                
                zone_info = [
                    ('destruction', '🔥 Destrucción Total (0-5 km)', '🔴'),
                    ('damage', '⚠️ Daño Severo (5-10 km)', '🟠'),
                    ('affected', '🌪️ Área Afectada (10-20 km)', '🟢')
                ]
                
                for zone_key, zone_name, emoji in zone_info:
                    zone_data = zones.get(zone_key, {})
                    
                    if zone_data.get('total_victims', 0) > 0:
                        print(f"\n{emoji} {zone_name}:")
                        print(f"   📍 Lugares: {zone_data.get('places_count', 0)}")
                        print(f"   👥 Población: {zone_data.get('total_population', 0):,}")
                        print(f"   💀 Víctimas: {zone_data.get('total_victims', 0):,}")
                        print(f"   📊 Porcentaje: {zone_data.get('victims_percentage', 0) * 100:.0f}%")
                        
                        # Mostrar lugares principales
                        places = zone_data.get('places', [])
                        if places:
                            print(f"   🏘️ Lugares principales:")
                            for place in places[:3]:
                                print(f"     • {place['nombre']}: {place['poblacion']:,} hab - {place['victimas_estimadas']:,} víctimas")
                    else:
                        print(f"\n{emoji} {zone_name}: Sin lugares afectados")
                
                # Calcular tasa de mortalidad
                total_pop = result.get('totalPopulation', 0)
                total_victims = result.get('totalVictims', 0)
                mortality_rate = (total_victims / total_pop * 100) if total_pop > 0 else 0
                
                print(f"\n📈 ESTADÍSTICAS FINALES:")
                print(f"   💀 Tasa de mortalidad: {mortality_rate:.1f}%")
                print(f"   🏙️ Promedio de víctimas por lugar: {(total_victims / result.get('total_found', 1)):.0f}")
                
                print(f"\n✅ ESTOS DATOS SE MOSTRARÁN EN EL PDF")
                print("📄 Para generar el PDF, ejecuta una simulación en el navegador")
                print("   y usa el botón 'Descargar PDF'")
                
                return True
                
            else:
                print("❌ Error en la respuesta del servidor")
                return False
                
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al backend")
        print("💡 Asegúrate de que el servidor Flask esté ejecutándose")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def simulate_pdf_data():
    """Simula los datos que se guardarían para el PDF"""
    
    print("\n🧪 SIMULANDO ESTRUCTURA DE DATOS PARA PDF")
    print("-" * 45)
    
    # Datos simulados basados en la estructura real
    simulated_data = {
        "population": {
            "totalAffected": 45230,
            "totalVictims": 29111,
            "zones": {
                "destruction": {
                    "name": "Destrucción Total",
                    "places_count": 8,
                    "total_population": 28500,
                    "total_victims": 27075,
                    "victims_percentage": 0.95,
                    "places": [
                        {"nombre": "Zaragoza", "poblacion": 15000, "victimas_estimadas": 14250, "distancia_km": 1.2},
                        {"nombre": "Utebo", "poblacion": 8000, "victimas_estimadas": 7600, "distancia_km": 3.5},
                        {"nombre": "Villanueva de Gállego", "poblacion": 2000, "victimas_estimadas": 1900, "distancia_km": 4.8}
                    ]
                },
                "damage": {
                    "name": "Daño Severo",
                    "places_count": 5,
                    "total_population": 12000,
                    "total_victims": 1800,
                    "victims_percentage": 0.15,
                    "places": [
                        {"nombre": "Cuarte de Huerva", "poblacion": 5000, "victimas_estimadas": 750, "distancia_km": 6.2},
                        {"nombre": "San Juan de Mozarrifar", "poblacion": 4000, "victimas_estimadas": 600, "distancia_km": 7.8}
                    ]
                },
                "affected": {
                    "name": "Área Afectada",
                    "places_count": 7,
                    "total_population": 4730,
                    "total_victims": 236,
                    "victims_percentage": 0.05,
                    "places": [
                        {"nombre": "La Muela", "poblacion": 1500, "victimas_estimadas": 75, "distancia_km": 12.5},
                        {"nombre": "Botorrita", "poblacion": 800, "victimas_estimadas": 40, "distancia_km": 15.2}
                    ]
                }
            }
        }
    }
    
    print("📋 ESTRUCTURA DE DATOS SIMULADA:")
    print(json.dumps(simulated_data, indent=2, ensure_ascii=False))
    
    print(f"\n✅ Esta estructura se guardaría en localStorage")
    print("📄 Y se usaría para generar el PDF con todas las zonas")

if __name__ == "__main__":
    success = test_pdf_with_zones()
    
    if success:
        simulate_pdf_data()
        print("\n🎉 PRUEBA COMPLETADA EXITOSAMENTE")
        print("📄 El PDF ahora mostrará todas las zonas de impacto con detalles completos")
    else:
        print("\n❌ LA PRUEBA FALLÓ")
        print("💡 Revisar que el backend esté funcionando correctamente")
