// Test específico para verificar que la población se muestra correctamente en el PDF

async function testPDFPopulation() {
    console.log('🧪 Probando población en PDF...');
    
    try {
        // Verificar que las funciones están disponibles
        if (typeof saveImpacto === 'undefined' || typeof downloadSimulationPDF === 'undefined') {
            console.error('❌ Las funciones necesarias no están disponibles');
            console.log('💡 Asegúrate de cargar main.js primero');
            return false;
        }
        
        // Crear datos de prueba con población específica
        const testData = {
            diameter: 150,
            velocity: 25000,
            angle: 45,
            composition: 'rocky',
            latitude: 41.4769,
            longitude: -1.3742,
            impactEnergy: 15.5,
            craterDiameter: 2300,
            destructionRadius: 5000,
            affectedPopulation: 25000, // Población específica para probar
            calculations: {
                impactEnergy: 15.5,
                craterDiameter: 2300,
                destructionRadius: 5000,
                damageRadius: 8000,
                airPressureRadius: 12000
            },
            population: {
                totalAffected: 25000,
                cities: [
                    { name: 'Zaragoza', population: 15000, distance: 1.2, type: 'city' },
                    { name: 'Utebo', population: 8000, distance: 3.5, type: 'town' },
                    { name: 'Villanueva de Gállego', population: 2000, distance: 4.8, type: 'village' }
                ],
                message: '25,000 personas en 3 lugares poblados'
            },
            environment: {
                mostAffectedFauna: 'Mamíferos urbanos',
                mostAffectedFlora: 'Vegetación urbana'
            },
            location: {
                latitude: 41.4769,
                longitude: -1.3742,
                city: 'Zaragoza',
                country: 'Spain',
                continent: 'Europe'
            },
            metadata: {
                calculationTime: 2500,
                apiCalls: 3,
                confidence: 0.85
            }
        };
        
        console.log('💾 Guardando datos de prueba...');
        const savedData = await saveImpacto(testData);
        
        if (!savedData) {
            console.log('❌ No se pudieron guardar los datos');
            return false;
        }
        
        console.log('✅ Datos guardados exitosamente');
        console.log(`📊 Población guardada: ${savedData.population.totalAffected.toLocaleString()} personas`);
        console.log(`🏙️ Ciudades guardadas: ${savedData.population.cities.length}`);
        
        // Limpiar currentFullResults para forzar uso de datos guardados
        console.log('📄 Generando PDF con datos guardados...');
        const originalCurrentFullResults = window.currentFullResults;
        window.currentFullResults = null;
        
        // Generar PDF
        downloadSimulationPDF();
        
        // Restaurar
        window.currentFullResults = originalCurrentFullResults;
        
        console.log('✅ PDF generado exitosamente');
        console.log('📋 Verificaciones a realizar en el PDF:');
        console.log('   1. Debe mostrar "25,000 personas" en la sección "Población Afectada"');
        console.log('   2. Debe mostrar información de ciudades en la sección de análisis de población');
        console.log('   3. NO debe mostrar "No hay población significativa en la zona de impacto"');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en testPDFPopulation:', error);
        return false;
    }
}

// Función para probar sin datos guardados (debe mostrar mensaje por defecto)
function testPDFNoPopulation() {
    console.log('🧪 Probando PDF sin datos de población...');
    
    try {
        // Limpiar datos guardados
        clearImpactoData();
        
        // Limpiar currentFullResults
        const originalCurrentFullResults = window.currentFullResults;
        window.currentFullResults = null;
        
        // Intentar generar PDF sin datos
        downloadSimulationPDF();
        
        // Restaurar
        window.currentFullResults = originalCurrentFullResults;
        
        console.log('✅ PDF generado sin datos');
        console.log('📋 Verificaciones a realizar en el PDF:');
        console.log('   1. Debe mostrar "No hay población significativa en la zona de impacto"');
        console.log('   2. O debe mostrar "0 personas" si no hay datos');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error en testPDFNoPopulation:', error);
        return false;
    }
}

// Función para comparar ambos casos
async function comparePDFPopulation() {
    console.log('🧪 Comparando PDF con y sin población...');
    
    console.log('\n📄 CASO 1: PDF con población calculada');
    await testPDFPopulation();
    
    console.log('\n📄 CASO 2: PDF sin población');
    testPDFNoPopulation();
    
    console.log('\n✅ Comparación completada');
    console.log('💡 Revisa ambos PDFs generados para verificar las diferencias');
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.testPDFPopulation = testPDFPopulation;
    window.testPDFNoPopulation = testPDFNoPopulation;
    window.comparePDFPopulation = comparePDFPopulation;
}

// Ejecutar automáticamente si se ejecuta directamente
if (typeof window !== 'undefined' && window.location) {
    console.log('🚀 Test de población en PDF cargado');
    console.log('💡 Ejecuta testPDFPopulation() para probar con población');
    console.log('💡 Ejecuta testPDFNoPopulation() para probar sin población');
    console.log('💡 Ejecuta comparePDFPopulation() para comparar ambos casos');
}
