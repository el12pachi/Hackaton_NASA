// Test específico para cálculo de población con Overpass API
// Usando las coordenadas: lat=41.4769, lon=-1.3742, radio=5km

async function testOverpassPopulation() {
    console.log('🧪 Probando cálculo de población con Overpass API...');
    console.log('📍 Coordenadas: 41.4769, -1.3742');
    console.log('📏 Radio: 5 km');
    
    try {
        // Verificar que las funciones están disponibles
        if (typeof calculateAffectedPopulation === 'undefined') {
            console.error('❌ La función calculateAffectedPopulation no está disponible');
            console.log('💡 Asegúrate de cargar main.js primero');
            return false;
        }
        
        // Probar el cálculo de población
        const populationData = await calculateAffectedPopulation(41.4769, -1.3742, 5);
        
        console.log('📊 Resultados:');
        console.log(`   - Población total: ${populationData.totalPopulation.toLocaleString()}`);
        console.log(`   - Ciudades encontradas: ${populationData.cities.length}`);
        console.log(`   - Mensaje: ${populationData.message}`);
        
        if (populationData.cities.length > 0) {
            console.log('🏙️ Ciudades encontradas:');
            populationData.cities.forEach((city, index) => {
                console.log(`   ${index + 1}. ${city.name}`);
                console.log(`      Población: ${city.population.toLocaleString()} personas`);
                console.log(`      Distancia: ${city.distance.toFixed(2)} km`);
                console.log(`      Tipo: ${city.type}`);
                console.log(`      Coordenadas: ${city.lat}, ${city.lon}`);
                console.log('');
            });
        } else {
            console.log('❌ No se encontraron ciudades en el radio especificado');
        }
        
        // Probar guardado de datos
        console.log('💾 Probando guardado de datos...');
        
        const testImpactData = {
            diameter: 150,
            velocity: 25000,
            angle: 45,
            composition: 'rocky',
            latitude: 41.4769,
            longitude: -1.3742,
            impactEnergy: 15.5,
            craterDiameter: 2300,
            destructionRadius: 5000,
            affectedPopulation: populationData.totalPopulation,
            calculations: {
                impactEnergy: 15.5,
                craterDiameter: 2300,
                destructionRadius: 5000,
                damageRadius: 8000,
                airPressureRadius: 12000
            },
            population: {
                totalAffected: populationData.totalPopulation,
                cities: populationData.cities,
                message: populationData.message
            },
            metadata: {
                calculationTime: 2500,
                apiCalls: 3,
                confidence: 0.85
            }
        };
        
        const savedData = await saveImpacto(testImpactData);
        
        if (savedData) {
            console.log('✅ Datos guardados exitosamente');
            console.log(`   - ID de simulación: ${savedData.metadata.simulationId}`);
            console.log(`   - Población guardada: ${savedData.population.totalAffected.toLocaleString()}`);
            console.log(`   - Ciudades guardadas: ${savedData.population.totalCitiesFound}`);
        } else {
            console.log('❌ Error al guardar datos');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        return false;
    }
}

// Función para probar con diferentes radios
async function testMultipleRadii() {
    console.log('🧪 Probando con diferentes radios...');
    
    const radii = [1, 2, 5, 10, 20]; // km
    const results = [];
    
    for (const radius of radii) {
        console.log(`\n📏 Probando radio: ${radius} km`);
        
        try {
            const data = await calculateAffectedPopulation(41.4769, -1.3742, radius);
            results.push({
                radius: radius,
                population: data.totalPopulation,
                cities: data.cities.length,
                message: data.message
            });
            
            console.log(`   - Población: ${data.totalPopulation.toLocaleString()}`);
            console.log(`   - Ciudades: ${data.cities.length}`);
            
        } catch (error) {
            console.error(`   - Error con radio ${radius}km:`, error);
            results.push({
                radius: radius,
                population: 0,
                cities: 0,
                message: `Error: ${error.message}`
            });
        }
    }
    
    console.log('\n📊 Resumen de resultados:');
    console.table(results);
    
    return results;
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.testOverpassPopulation = testOverpassPopulation;
    window.testMultipleRadii = testMultipleRadii;
}

// Ejecutar prueba automáticamente si se ejecuta directamente
if (typeof window !== 'undefined' && window.location) {
    console.log('🚀 Test de población con Overpass API cargado');
    console.log('💡 Ejecuta testOverpassPopulation() para probar');
    console.log('💡 Ejecuta testMultipleRadii() para probar múltiples radios');
}
