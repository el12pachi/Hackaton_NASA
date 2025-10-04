#!/usr/bin/env python3
import requests
import math

# Coordenadas específicas
lat, lon = 41.4769, -1.3742
radio = 5000

# Consulta Overpass
query = f"[out:json];(node[\"place\"~\"city|town|village|hamlet\"](around:{radio}, {lat}, {lon}););out;"

try:
    url = "http://overpass-api.de/api/interpreter"
    response = requests.get(url, params={'data': query}, timeout=30)
    
    if response.status_code == 200:
        data = response.json()
        lugares = data.get('elements', [])
        
        # Densidades por tipo
        densidades = {'city': 3000, 'town': 1500, 'village': 500, 'hamlet': 100}
        areas = {'city': 50, 'town': 10, 'village': 2, 'hamlet': 0.5}
        
        for lugar in lugares:
            tags = lugar.get('tags', {})
            nombre = tags.get('name', '')
            tipo = tags.get('place', 'unknown')
            poblacion_exacta = int(tags.get('population', 0))
            
            # Estimar población
            if poblacion_exacta <= 0:
                area_km2 = areas.get(tipo, 5)
                poblacion = int(area_km2 * densidades.get(tipo, 800))
            else:
                poblacion = poblacion_exacta
            
            # Calcular distancia y víctimas
            lat_lugar = lugar.get('lat', lat)
            lon_lugar = lugar.get('lon', lon)
            distancia_km = math.sqrt((lat - lat_lugar)**2 + (lon - lon_lugar)**2) * 111
            
            if distancia_km <= 2.5:
                victimas = int(poblacion * 0.95)
            elif distancia_km <= 5:
                victimas = int(poblacion * 0.15)
            else:
                victimas = int(poblacion * 0.05)
            
            # Solo imprimir el número
            print(victimas)
            
except:
    print("0")
