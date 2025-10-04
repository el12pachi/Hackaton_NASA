#!/usr/bin/env python3
"""
Script que solo imprime las poblaciones afectadas por consola
Usa las coordenadas: lat=41.4769, lon=-1.3742, radio=5000m
"""

import requests
import math

def main():
    # Coordenadas específicas
    lat = 41.4769
    lon = -1.3742
    radio = 5000  # metros
    
    # Consulta Overpass
    query = f"""
[out:json];
(
  node["place"~"city|town|village"](around:{radio}, {lat}, {lon});
);
out;
"""
    
    try:
        url = "http://overpass-api.de/api/interpreter"
        response = requests.get(url, params={'data': query}, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            lugares = data.get('elements', [])
            
            # Densidades de población
            densidades = {
                'city': 3000,
                'town': 1500, 
                'village': 500,
                'hamlet': 100
            }
            
            # Áreas típicas
            areas = {
                'city': 50,
                'town': 10,
                'village': 2,
                'hamlet': 0.5
            }
            
            poblaciones_afectadas = []
            
            for lugar in lugares:
                tags = lugar.get('tags', {})
                tipo = tags.get('place', 'unknown')
                poblacion_exacta = int(tags.get('population', 0))
                
                # Estimar población si no está disponible
                if poblacion_exacta <= 0:
                    area_km2 = areas.get(tipo, 5)
                    poblacion = int(area_km2 * densidades.get(tipo, 800))
                else:
                    poblacion = poblacion_exacta
                
                # Calcular distancia
                lat_lugar = lugar.get('lat', lat)
                lon_lugar = lugar.get('lon', lon)
                distancia_km = math.sqrt((lat - lat_lugar)**2 + (lon - lon_lugar)**2) * 111
                
                # Calcular víctimas según distancia
                if distancia_km <= 2.5:
                    victimas = int(poblacion * 0.95)  # Destrucción total
                elif distancia_km <= 5:
                    victimas = int(poblacion * 0.15)  # Daños severos
                else:
                    victimas = int(poblacion * 0.05)  # Zona afectada
                
                poblaciones_afectadas.append(victimas)
            
            # Imprimir solo las poblaciones afectadas
            for poblacion in poblaciones_afectadas:
                print(poblacion)
                
        else:
            print("Error al consultar datos")
            
    except Exception as e:
        print("Error de conexión")

if __name__ == "__main__":
    main()
