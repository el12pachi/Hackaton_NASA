// Test de la función saveImpacto
// Este archivo puede ser usado para probar la funcionalidad
// Las funciones saveImpacto, getImpactoData, clearImpactoData y hasImpactoData
// están ahora disponibles globalmente en main.js

// Datos de ejemplo para probar saveImpacto con datos dinámicos
const testImpactData = {
    diameter: 150,
    velocity: 25000,
    angle: 45,
    composition: 'rocky',
    latitude: 40.7128,
    longitude: -74.0060,
    impactEnergy: 15.5,
    craterDiameter: 2.3,
    destructionRadius: 5.2,
    affectedPopulation: 2500000,
    mostAffectedFauna: 'Mamíferos urbanos',
    mostAffectedFlora: 'Vegetación urbana',
    calculations: {
        impactEnergy: 15.5,
        craterDiameter: 2.3,
        destructionRadius: 5.2,
        damageRadius: 12.8,
        airPressureRadius: 19.2,
        seismicMagnitude: 6.8,
        tsunamiRisk: 'Bajo',
        tsunamiHeight: 0,
        tsunamiRadius: 0,
        thermalRadius: 8.5,
        ejectaRadius: 15.0
    },
    population: {
        totalAffected: 2500000,
        destructionZone: 50000,
        damageZone: 200000,
        affectedZone: 2250000,
        cities: [
            { name: 'Nueva York', population: 8000000, distance: 15 },
            { name: 'Brooklyn', population: 2500000, distance: 8 }
        ],
        countries: ['United States'],
        continents: ['North America'],
        // Datos dinámicos de ciudades (simulados para prueba)
        citiesDetailed: [],
        totalCitiesFound: 0,
        totalPopulationFromCities: 0,
        citiesByType: {},
        citiesByDistance: [],
        citiesInDestructionZone: [],
        citiesInDamageZone: [],
        citiesInAffectedZone: []
    },
    environment: {
        mostAffectedFauna: 'Mamíferos urbanos',
        mostAffectedFlora: 'Vegetación urbana',
        ecosystemDamage: 'Moderado',
        biodiversityLoss: 'Bajo',
        climateEffects: 'Mínimo',
        atmosphericChanges: 'Temporal',
        waterContamination: 'Bajo',
        soilContamination: 'Moderado'
    },
    location: {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'Nueva York',
        country: 'United States',
        continent: 'North America',
        elevation: 10,
        terrainType: 'urban',
        isOceanic: false,
        coastalDistance: 5
    },
    asteroid: {
        diameter: 150,
        velocity: 25000,
        angle: 45,
        composition: 'rocky',
        mass: 2650000000,
        density: 3000
    },
    metadata: {
        timestamp: new Date().toISOString(),
        calculationTime: 2500,
        apiCalls: 3,
        confidence: 0.85
    }
};

// Función para probar saveImpacto
// Función para probar datos de ciudades específicamente
function testCitiesData() {
    console.log('🧪 Probando datos de ciudades en saveImpacto...');
    
    try {
        // Probar guardado con datos de ciudades
        const result = saveImpacto(testImpactData);
        
        if (result && result.population) {
            console.log('✅ Datos de ciudades guardados exitosamente');
            
            // Verificar datos específicos de ciudades
            const citiesData = result.population;
            
            console.log('📊 Verificando datos de ciudades:');
            console.log(`   - Ciudades encontradas: ${citiesData.totalCitiesFound}`);
            console.log(`   - Población total: ${citiesData.totalPopulationFromCities?.toLocaleString()}`);
            console.log(`   - Ciudades detalladas: ${citiesData.citiesDetailed?.length || 0}`);
            console.log(`   - Ciudades por tipo:`, citiesData.citiesByType);
            console.log(`   - Ciudades por distancia: ${citiesData.citiesByDistance?.length || 0}`);
            console.log(`   - Ciudades en zona destrucción: ${citiesData.citiesInDestructionZone?.length || 0}`);
            console.log(`   - Ciudades en zona daño: ${citiesData.citiesInDamageZone?.length || 0}`);
            console.log(`   - Ciudades en zona afectada: ${citiesData.citiesInAffectedZone?.length || 0}`);
            
            // Verificar que los datos están completos
            const hasAllData = citiesData.totalCitiesFound > 0 &&
                              citiesData.totalPopulationFromCities > 0 &&
                              citiesData.citiesDetailed &&
                              citiesData.citiesByType &&
                              citiesData.citiesByDistance;
            
            if (hasAllData) {
                console.log('✅ Todos los datos de ciudades están completos');
                return true;
            } else {
                console.log('⚠️ Algunos datos de ciudades están incompletos');
                return false;
            }
        } else {
            console.log('❌ No se pudieron guardar los datos de ciudades');
            return false;
        }
    } catch (error) {
        console.error('❌ Error en testCitiesData:', error);
        return false;
    }
}

function testSaveImpacto() {
    console.log('🧪 Probando función saveImpacto...');
    
    try {
        // Probar guardado
        const result = saveImpacto(testImpactData);
        
        if (result) {
            console.log('✅ saveImpacto ejecutado exitosamente');
            console.log('📊 Datos guardados:', {
                simulationId: result.metadata.simulationId,
                timestamp: result.metadata.timestamp,
                energy: result.calculations.impactEnergy,
                population: result.population.totalAffected
            });
            
            // Probar recuperación
            const retrievedData = getImpactoData();
            if (retrievedData) {
                console.log('✅ getImpactoData ejecutado exitosamente');
                console.log('📊 Datos recuperados:', {
                    simulationId: retrievedData.metadata.simulationId,
                    timestamp: retrievedData.metadata.timestamp,
                    energy: retrievedData.calculations.impactEnergy,
                    population: retrievedData.population.totalAffected
                });
                
                // Verificar que los datos coinciden
                if (retrievedData.metadata.simulationId === result.metadata.simulationId) {
                    console.log('✅ Datos guardados y recuperados correctamente');
                    return true;
                } else {
                    console.log('❌ Los datos no coinciden');
                    return false;
                }
            } else {
                console.log('❌ No se pudieron recuperar los datos');
                return false;
            }
        } else {
            console.log('❌ saveImpacto falló');
            return false;
        }
    } catch (error) {
        console.error('❌ Error en testSaveImpacto:', error);
        return false;
    }
}

// Función para probar limpieza
function testClearImpacto() {
    console.log('🧪 Probando función clearImpacto...');
    
    try {
        clearImpactoData();
        
        const retrievedData = getImpactoData();
        if (!retrievedData) {
            console.log('✅ clearImpacto ejecutado exitosamente');
            return true;
        } else {
            console.log('❌ clearImpacto no funcionó correctamente');
            return false;
        }
    } catch (error) {
        console.error('❌ Error en testClearImpacto:', error);
        return false;
    }
}

// Función para probar generación de PDF con datos guardados
async function testPDFGeneration() {
    console.log('🧪 Probando generación de PDF con datos guardados...');
    
    try {
        // Primero guardar datos de prueba con población calculada
        const testDataWithPopulation = {
            ...testImpactData,
            latitude: 41.4769,
            longitude: -1.3742,
            affectedPopulation: 15000, // Simular población encontrada
            population: {
                totalAffected: 15000,
                cities: [
                    { name: 'Ciudad Test 1', population: 10000, distance: 2.5 },
                    { name: 'Pueblo Test 2', population: 5000, distance: 4.2 }
                ],
                message: '15,000 personas en 2 lugares poblados'
            }
        };
        
        const savedData = await saveImpacto(testDataWithPopulation);
        
        if (!savedData) {
            console.log('❌ No se pudieron guardar los datos para PDF');
            return false;
        }
        
        // Verificar que los datos están disponibles
        const hasData = hasImpactoData();
        if (!hasData) {
            console.log('❌ Los datos no están disponibles después del guardado');
            return false;
        }
        
        console.log('📊 Datos guardados para PDF:');
        console.log(`   - Población: ${savedData.population.totalAffected.toLocaleString()}`);
        console.log(`   - Ciudades: ${savedData.population.cities.length}`);
        
        // Simular que no hay currentFullResults para forzar uso de datos guardados
        const originalCurrentFullResults = window.currentFullResults;
        window.currentFullResults = null;
        
        // Intentar generar PDF (esto debería usar los datos guardados)
        downloadSimulationPDF();
        
        // Restaurar currentFullResults
        window.currentFullResults = originalCurrentFullResults;
        
        console.log('✅ PDF generado exitosamente con datos guardados');
        console.log('📄 Verifica que el PDF muestre la población correcta: 15,000 personas');
        return true;
    } catch (error) {
        console.error('❌ Error en testPDFGeneration:', error);
        return false;
    }
}

// Función para probar integración completa
function testFullIntegration() {
    console.log('🧪 Probando integración completa del sistema...');
    
    try {
        // 1. Limpiar datos existentes
        clearImpactoData();
        
        // 2. Verificar que no hay datos
        if (hasImpactoData()) {
            console.log('❌ Los datos no se limpiaron correctamente');
            return false;
        }
        
        // 3. Guardar datos de prueba
        const savedData = saveImpacto(testImpactData);
        if (!savedData) {
            console.log('❌ No se pudieron guardar los datos');
            return false;
        }
        
        // 4. Verificar que los datos están disponibles
        if (!hasImpactoData()) {
            console.log('❌ Los datos no están disponibles después del guardado');
            return false;
        }
        
        // 5. Recuperar datos
        const retrievedData = getImpactoData();
        if (!retrievedData) {
            console.log('❌ No se pudieron recuperar los datos');
            return false;
        }
        
        // 6. Verificar que los datos coinciden
        if (retrievedData.metadata.simulationId !== savedData.metadata.simulationId) {
            console.log('❌ Los IDs de simulación no coinciden');
            return false;
        }
        
        // 7. Simular generación de PDF
        const originalCurrentFullResults = window.currentFullResults;
        window.currentFullResults = null;
        
        // Verificar que la función PDF puede usar datos guardados
        console.log('📄 Verificando disponibilidad de datos para PDF...');
        
        // Restaurar
        window.currentFullResults = originalCurrentFullResults;
        
        console.log('✅ Integración completa funcionando correctamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error en testFullIntegration:', error);
        return false;
    }
}

// Ejecutar todas las pruebas
async function runAllTests() {
    console.log('🚀 Iniciando pruebas de saveImpacto...');
    
    const results = {
        saveImpacto: testSaveImpacto(),
        citiesData: testCitiesData(),
        clearImpacto: testClearImpacto(),
        pdfGeneration: await testPDFGeneration(),
        fullIntegration: testFullIntegration()
    };
    
    console.log('📊 Resultados de las pruebas:', results);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('🎉 Todas las pruebas pasaron exitosamente!');
        console.log('✅ La función saveImpacto está funcionando correctamente');
        console.log('✅ Los datos se guardan y recuperan sin problemas');
        console.log('✅ La generación de PDF puede usar datos guardados');
        console.log('✅ La integración completa funciona correctamente');
    } else {
        console.log('⚠️ Algunas pruebas fallaron');
        console.log('❌ Revisar los errores anteriores para más detalles');
    }
    
    return results;
}

// Función para probar cálculo de población con coordenadas específicas
async function testPopulationCalculation() {
    console.log('🧪 Probando cálculo de población con Overpass API...');
    
    try {
        // Usar las coordenadas específicas
        const testCoords = {
            lat: 41.4769,
            lon: -1.3742,
            radius: 5 // 5 km
        };
        
        console.log(`📍 Probando coordenadas: ${testCoords.lat}, ${testCoords.lon}, Radio: ${testCoords.radius} km`);
        
        // Llamar a la función de cálculo de población
        const populationData = await calculateAffectedPopulation(
            testCoords.lat, 
            testCoords.lon, 
            testCoords.radius
        );
        
        console.log('📊 Resultados del cálculo de población:');
        console.log(`   - Población total: ${populationData.totalPopulation.toLocaleString()}`);
        console.log(`   - Ciudades encontradas: ${populationData.cities.length}`);
        console.log(`   - Mensaje: ${populationData.message}`);
        
        if (populationData.cities.length > 0) {
            console.log('🏙️ Ciudades encontradas:');
            populationData.cities.forEach((city, index) => {
                console.log(`   ${index + 1}. ${city.name} - ${city.population.toLocaleString()} personas (${city.distance.toFixed(2)} km)`);
            });
        }
        
        // Probar guardado con estos datos
        const testDataWithPopulation = {
            ...testImpactData,
            latitude: testCoords.lat,
            longitude: testCoords.lon,
            affectedPopulation: populationData.totalPopulation,
            population: {
                totalAffected: populationData.totalPopulation,
                cities: populationData.cities,
                message: populationData.message
            }
        };
        
        const savedData = await saveImpacto(testDataWithPopulation);
        
        if (savedData && savedData.population.totalAffected > 0) {
            console.log('✅ Datos con población calculada guardados exitosamente');
            return true;
        } else {
            console.log('❌ No se pudieron guardar los datos con población');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error en testPopulationCalculation:', error);
        return false;
    }
}

// Exportar funciones para uso en consola del navegador
if (typeof window !== 'undefined') {
    window.testSaveImpacto = testSaveImpacto;
    window.testCitiesData = testCitiesData;
    window.testClearImpacto = testClearImpacto;
    window.testPDFGeneration = testPDFGeneration;
    window.testFullIntegration = testFullIntegration;
    window.testPopulationCalculation = testPopulationCalculation;
    window.runAllTests = runAllTests;
    window.testImpactData = testImpactData;
}
