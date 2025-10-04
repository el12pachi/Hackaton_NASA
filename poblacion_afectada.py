#!/usr/bin/env python3
"""
Script simple para mostrar solo las poblaciones afectadas por impacto de meteorito
"""

import requests
import json
import math

def obtener_poblacion_afectada(lat, lon, radio_metros=5000):
    """
    Obtiene y muestra solo las poblaciones afectadas
    
    Args:
        lat: Latitud
        lon: Longitud  
        radio_metros: Radio en metros
    """
    
    # Densidades de población por tipo
    densidades = {
        'city': 3000,      # Ciudad: 3000 hab/km²
        'town': 1500,      # Pueblo: 1500 hab/km²
        'village': 500,    # Aldea: 500 hab/km²
        'hamlet': 100      # Caserío: 100 hab/km²
    }
    
    # Consulta Overpass
    query = f"""
[out:json];
(
  node["place"~"city|town|village|hamlet"](around:{radio_metros}, {lat}, {lon});
);
out;
"""
    
    try:
        url = "http://overpass-api.de/api/interpreter"
        response = requests.get(url, params={'data': query}, timeout=30)
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            return
        
        data = response.json()
        lugares = data.get('elements', [])
        
        if not lugares:
            print("No hay población significativa en la zona de impacto")
            return
        
        total_poblacion = 0
        total_victimas = 0
        
        for lugar in lugares:
            tags = lugar.get('tags', {})
            nombre = tags.get('name', 'Sin nombre')
            tipo = tags.get('place', 'unknown')
            poblacion_exacta = int(tags.get('population', 0))
            
            # Estimar población si no está disponible
            if poblacion_exacta <= 0:
                areas_tipicas = {'city': 50, 'town': 10, 'village': 2, 'hamlet': 0.5}
                area_km2 = areas_tipicas.get(tipo, 5)
                poblacion = int(area_km2 * densidades.get(tipo, 800))
            else:
                poblacion = poblacion_exacta
            
            # Calcular distancia
            lat_lugar = lugar.get('lat', lat)
            lon_lugar = lugar.get('lon', lon)
            distancia_km = math.sqrt((lat - lat_lugar)**2 + (lon - lon_lugar)**2) * 111
            
            # Determinar porcentaje de víctimas por distancia
            if distancia_km <= 2.5:
                porcentaje_victimas = 0.95  # Destrucción total
            elif distancia_km <= 5:
                porcentaje_victimas = 0.15  # Daños severos
            else:
                porcentaje_victimas = 0.05  # Zona afectada
            
            victimas = int(poblacion * porcentaje_victimas)
            
            total_poblacion += poblacion
            total_victimas += victimas
            
            # Solo imprimir población afectada
            print(f"{victimas}")
        
    except Exception as e:
        print("Error consultando datos de población")

def main():
    """Función principal"""
    
    # Coordenadas específicas
    lat = 41.4769
    lon = -1.3742
    radio = 5000  # 5000 metros
    
    # Obtener solo las poblaciones afectadas
    obtener_poblacion_afectada(lat, lon, radio)

if __name__ == "__main__":
    main()
