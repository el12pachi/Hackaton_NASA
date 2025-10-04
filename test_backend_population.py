#!/usr/bin/env python3
"""
Script para probar el endpoint /api/cities del backend
"""

import requests
import json

def test_backend_population():
    """Prueba el endpoint de población del backend"""
    
    # URL del backend
    url = "http://localhost:5000/api/cities"
    
    # Datos de prueba
    data = {
        "latitude": 41.4769,
        "longitude": -1.3742,
        "radius": 5000  # 5000 metros
    }
    
    print("🧪 Probando endpoint /api/cities")
    print(f"📍 Coordenadas: {data['latitude']}, {data['longitude']}")
    print(f"📏 Radio: {data['radius']} metros")
    print()
    
    try:
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ Respuesta exitosa:")
            print(f"   - Éxito: {result.get('success')}")
            print(f"   - Lugares encontrados: {result.get('total_found', 0)}")
            print(f"   - Población total: {result.get('totalPopulation', 0):,}")
            print(f"   - Víctimas estimadas: {result.get('totalVictims', 0):,}")
            
            # Mostrar información por zonas
            if result.get('zones'):
                zones = result['zones']
                print("\n🎯 ZONAS DE IMPACTO:")
                
                if zones.get('destruction'):
                    d = zones['destruction']
                    print(f"   🔥 Destrucción Total: {d['places_count']} lugares, {d['total_victims']:,} víctimas")
                
                if zones.get('damage'):
                    d = zones['damage']
                    print(f"   ⚠️ Daño Severo: {d['places_count']} lugares, {d['total_victims']:,} víctimas")
                
                if zones.get('affected'):
                    d = zones['affected']
                    print(f"   🌪️ Área Afectada: {d['places_count']} lugares, {d['total_victims']:,} víctimas")
            
            if result.get('cities'):
                print("\n🏙️ Lugares encontrados (primeros 5):")
                for city in result['cities'][:5]:
                    zone_info = f" - {city.get('zone_name', 'Unknown')}" if 'zone_name' in city else ""
                    victims_info = f" ({city.get('victimas_estimadas', 0):,} víctimas)" if 'victimas_estimadas' in city else ""
                    print(f"   • {city['nombre']} ({city['tipo']}) - {city['poblacion']:,} habitantes{zone_info}{victims_info} - {city['distancia_km']} km")
            
            return True
            
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al backend")
        print("💡 Asegúrate de que el servidor Flask esté ejecutándose en localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_different_radii():
    """Prueba con diferentes radios"""
    
    url = "http://localhost:5000/api/cities"
    base_data = {
        "latitude": 41.4769,
        "longitude": -1.3742
    }
    
    radii = [1000, 2500, 5000, 10000, 20000]  # metros
    
    print("\n🧪 Probando diferentes radios:")
    print("-" * 30)
    
    for radius in radii:
        data = {**base_data, "radius": radius}
        
        try:
            response = requests.post(url, json=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                population = result.get('totalPopulation', 0)
                places = result.get('total_found', 0)
                
                print(f"Radio {radius/1000:.1f} km: {population:,} habitantes en {places} lugares")
            else:
                print(f"Radio {radius/1000:.1f} km: Error {response.status_code}")
                
        except Exception as e:
            print(f"Radio {radius/1000:.1f} km: Error - {e}")

if __name__ == "__main__":
    print("🌍 PRUEBA DEL ENDPOINT DE POBLACIÓN")
    print("=" * 40)
    
    success = test_backend_population()
    
    if success:
        test_different_radii()
        print("\n✅ Pruebas completadas exitosamente")
    else:
        print("\n❌ Las pruebas fallaron")
        print("\n💡 Soluciones:")
        print("   1. Asegúrate de que Flask esté ejecutándose: python app.py")
        print("   2. Verifica que el puerto 5000 esté disponible")
        print("   3. Revisa los logs del servidor para errores")
