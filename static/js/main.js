/**
 * ASTEROID IMPACT SIMULATOR - Main JavaScript
 * NASA Hackathon 2025
 */

// ============================================
// MODE SWITCHING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Setup mode switching
    setupModeSwitching();
    
    // Setup simulation mode
    setupSimulationMode();
    
    // Setup mitigation mode
    setupMitigationMode();
    
    // Load asteroids from NASA
    loadNEOData();
}

// ============================================
// THEME TOGGLE
// ============================================

function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme, themeIcon);
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
        
        // Update map theme
        updateMapTheme(newTheme);
    });
}

function updateThemeIcon(theme, iconElement) {
    iconElement.textContent = theme === 'dark' ? '◐' : '◑';
}

function updateMapTheme(theme) {
    if (!impactMap || !currentTileLayer) return;
    
    // Remove current tile layer
    impactMap.removeLayer(currentTileLayer);
    
    // Add new tile layer based on theme
    if (theme === 'dark') {
        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 1
        });
    } else {
        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 1
        });
    }
    
    currentTileLayer.addTo(impactMap);
}

function setupModeSwitching() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            
            // Update buttons
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update sections
            document.getElementById('simulation-controls').classList.remove('active');
            document.getElementById('mitigation-controls').classList.remove('active');
            
            if (mode === 'simulation') {
                document.getElementById('simulation-controls').classList.add('active');
            } else {
                document.getElementById('mitigation-controls').classList.add('active');
            }
        });
    });
}

// ============================================
// SIMULATION MODE
// ============================================

let currentAsteroidData = null;
let impactMap = null;
let currentMarker = null;
let currentCircles = [];
let currentFullResults = null;
let currentTileLayer = null;

function setupSimulationMode() {
    // Range inputs
    setupRangeInput('diameter', 'diameter-value', ' m');
    setupRangeInput('velocity', 'velocity-value', ' km/s');
    setupRangeInput('angle', 'angle-value', '°');
    
    // Asteroid selection
    const asteroidSelect = document.getElementById('asteroid-select');
    if (asteroidSelect) {
        asteroidSelect.addEventListener('change', handleAsteroidSelection);
    }
    
    // Simulate button
    const simulateBtn = document.getElementById('simulate-btn');
    if (simulateBtn) {
        simulateBtn.addEventListener('click', runImpactSimulation);
    }
    
        // NASA data loading removed - simplified interface
    
    // Initialize map
    initializeImpactMap();
}

function setupRangeInput(id, displayId, suffix = '') {
    const input = document.getElementById(id);
    const display = document.getElementById(displayId);
    
    if (input && display) {
        input.addEventListener('input', (e) => {
            display.textContent = e.target.value + suffix;
        });
    }
}

function handleAsteroidSelection(e) {
    const asteroidId = e.target.value;
    
    if (asteroidId === 'custom') {
        return;
    }
    
    // Find asteroid in loaded data
    if (currentAsteroidData && currentAsteroidData.asteroids) {
        const asteroid = currentAsteroidData.asteroids.find(a => a.id === asteroidId);
        if (asteroid) {
            // Auto-fill parameters
            const avgDiameter = (asteroid.diameter_min_m + asteroid.diameter_max_m) / 2;
            document.getElementById('diameter').value = Math.round(avgDiameter);
            document.getElementById('diameter-value').textContent = Math.round(avgDiameter) + ' m';
            
            const velocity = asteroid.velocity_km_s;
            document.getElementById('velocity').value = Math.round(velocity);
            document.getElementById('velocity-value').textContent = Math.round(velocity) + ' km/s';
        }
    }
}

// Función eliminada - interfaz simplificada

// Función eliminada - interfaz simplificada
function displayNasaAsteroidData_ELIMINADA(data) {
    console.log('📊 Datos de la NASA cargados:', data);
    
    // Crear modal para mostrar datos detallados
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
        align-items: center; justify-content: center; padding: 2rem;
    `;
    
    const orbital = data.orbital_elements;
    const diameter = data.diameter_km ? data.diameter_km * 1000 : 'N/A';
    
    modal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 12px; padding: 2rem; max-width: 800px; max-height: 90vh; overflow-y: auto; border: 2px solid #00A8E8;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #00A8E8; margin: 0;">🔬 Datos Científicos de la NASA</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: #A0A0A0; font-size: 24px; cursor: pointer; padding: 0; margin-left: auto;">×</button>
            </div>
            
            <div style="background: rgba(0,168,232,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="color: #00A8E8; margin: 0 0 0.5rem 0;">${data.name}</h3>
                <p style="margin: 0; color: #A0A0A0; font-size: 14px;">
                    Designación: ${data.designation || 'N/A'} | 
                    Clasificación: ${data.classification || 'N/A'} | 
                    Fuente: ${data.source}
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(255,193,7,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #FFC107;">
                    <h4 style="color: #FFC107; margin: 0 0 0.5rem 0;">📏 Parámetros Físicos</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Diámetro:</strong> ${diameter !== 'N/A' ? diameter.toFixed(0) + ' m' : 'N/A'}<br>
                        <strong>Albedo:</strong> ${data.albedo || 'N/A'}<br>
                        <strong>Período de rotación:</strong> ${data.rotation_period_h ? data.rotation_period_h + ' h' : 'N/A'}<br>
                        <strong>Magnitud absoluta:</strong> ${data.absolute_magnitude || 'N/A'}
                    </div>
                </div>
                
                <div style="background: rgba(0,230,118,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #00E676;">
                    <h4 style="color: #00E676; margin: 0 0 0.5rem 0;">🌍 Elementos Orbitales</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Semieje mayor:</strong> ${orbital.semi_major_axis_au ? orbital.semi_major_axis_au.toFixed(3) + ' AU' : 'N/A'}<br>
                        <strong>Excentricidad:</strong> ${orbital.eccentricity || 'N/A'}<br>
                        <strong>Inclinación:</strong> ${orbital.inclination_deg ? orbital.inclination_deg.toFixed(2) + '°' : 'N/A'}<br>
                        <strong>Período orbital:</strong> ${orbital.orbital_period_days ? orbital.orbital_period_days.toFixed(0) + ' días' : 'N/A'}
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(156,39,176,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #9C27B0;">
                <h4 style="color: #9C27B0; margin: 0 0 0.5rem 0;">🎯 Parámetros de Impacto Estimados</h4>
                <div style="font-size: 14px; line-height: 1.6;">
                    <strong>Diámetro promedio:</strong> ${diameter !== 'N/A' ? (diameter/2).toFixed(0) + ' m' : 'Estimado 150 m'}<br>
                    <strong>Velocidad típica:</strong> 15-25 km/s (promedio: 20 km/s)<br>
                    <strong>Densidad estimada:</strong> 3000 kg/m³ (asteroide rocoso)<br>
                    <strong>Masa estimada:</strong> ${diameter !== 'N/A' ? formatNumber((4/3) * Math.PI * Math.pow(diameter/2, 3) * 3000) + ' kg' : '~2.1 × 10¹² kg'}
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="applyNasaDataToSimulation('${data.asteroid_id}', ${diameter !== 'N/A' ? diameter/2 : 150}, 20)" 
                        style="background: #00A8E8; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; margin-right: 1rem;">
                    🚀 Usar estos datos en la simulación
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: #666; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer;">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Función eliminada - interfaz simplificada
function displayNasaNEOData_ELIMINADA(asteroid) {
    console.log('📊 Datos de la NASA NEO API cargados:', asteroid);
    
    // Crear modal para mostrar datos de la NASA NEO API
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
        align-items: center; justify-content: center; padding: 2rem;
    `;
    
    const avgDiameter = (asteroid.diameter_min_m + asteroid.diameter_max_m) / 2;
    
    modal.innerHTML = `
        <div style="background: var(--bg-primary); border-radius: 12px; padding: 2rem; max-width: 700px; max-height: 90vh; overflow-y: auto; border: 2px solid #00A8E8;">
            <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #00A8E8; margin: 0;">🛰️ Datos de la NASA NEO API</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: #A0A0A0; font-size: 24px; cursor: pointer; padding: 0; margin-left: auto;">×</button>
            </div>
            
            <div style="background: rgba(255,193,7,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="color: #FFC107; margin: 0 0 0.5rem 0;">⚠️ Datos Limitados</h3>
                <p style="margin: 0; color: #A0A0A0; font-size: 14px;">
                    La NASA JPL Small Body Database no está disponible para este asteroide. 
                    Mostrando datos básicos de la NASA NEO API.
                </p>
            </div>
            
            <div style="background: rgba(0,168,232,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="color: #00A8E8; margin: 0 0 0.5rem 0;">${asteroid.name}</h3>
                <p style="margin: 0; color: #A0A0A0; font-size: 14px;">
                    ID: ${asteroid.id} | Fuente: ${asteroid.source || 'NASA NEO API'}
                </p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(255,193,7,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #FFC107;">
                    <h4 style="color: #FFC107; margin: 0 0 0.5rem 0;">📏 Parámetros Físicos</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Diámetro mínimo:</strong> ${asteroid.diameter_min_m.toFixed(0)} m<br>
                        <strong>Diámetro máximo:</strong> ${asteroid.diameter_max_m.toFixed(0)} m<br>
                        <strong>Diámetro promedio:</strong> ${avgDiameter.toFixed(0)} m<br>
                        <strong>Potencialmente peligroso:</strong> ${asteroid.is_hazardous ? 'SÍ ⚠️' : 'No'}
                    </div>
                </div>
                
                <div style="background: rgba(0,230,118,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #00E676;">
                    <h4 style="color: #00E676; margin: 0 0 0.5rem 0;">🚀 Parámetros de Aproximación</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Velocidad relativa:</strong> ${asteroid.velocity_km_s.toFixed(2)} km/s<br>
                        <strong>Distancia de fallo:</strong> ${asteroid.miss_distance_km.toLocaleString()} km<br>
                        <strong>Fecha de acercamiento:</strong> ${asteroid.approach_date}<br>
                        <strong>Masa estimada:</strong> ${formatNumber((4/3) * Math.PI * Math.pow(avgDiameter/2, 3) * 3000)} kg
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(156,39,176,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #9C27B0;">
                <h4 style="color: #9C27B0; margin: 0 0 0.5rem 0;">🎯 Parámetros de Impacto Estimados</h4>
                <div style="font-size: 14px; line-height: 1.6;">
                    <strong>Diámetro para simulación:</strong> ${avgDiameter.toFixed(0)} m<br>
                    <strong>Velocidad típica:</strong> ${asteroid.velocity_km_s.toFixed(1)} km/s<br>
                    <strong>Densidad estimada:</strong> 3000 kg/m³ (asteroide rocoso)<br>
                    <strong>Energía de impacto estimada:</strong> ~${formatNumber(0.5 * (4/3) * Math.PI * Math.pow(avgDiameter/2, 3) * 3000 * Math.pow(asteroid.velocity_km_s * 1000, 2) / 4.184e15)} MT TNT
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center;">
                <button onclick="applyNasaDataToSimulation('${asteroid.id}', ${avgDiameter}, ${asteroid.velocity_km_s})" 
                        style="background: #00A8E8; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; margin-right: 1rem;">
                    🚀 Usar estos datos en la simulación
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: #666; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer;">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function applyNasaDataToSimulation(asteroidId, diameter, velocity) {
    // Aplicar datos de la NASA a los controles
    document.getElementById('asteroid-select').value = asteroidId;
    document.getElementById('diameter').value = Math.round(diameter);
    document.getElementById('diameter-value').textContent = Math.round(diameter) + ' m';
    document.getElementById('velocity').value = velocity;
    document.getElementById('velocity-value').textContent = velocity + ' km/s';
    
    // Cerrar modal
    const modal = document.querySelector('[style*="z-index: 10000"]');
    if (modal) modal.remove();
    
    console.log(`✅ Datos de ${asteroidId} aplicados a la simulación`);
}

async function loadNEOData() {
    const asteroidSelect = document.getElementById('asteroid-select');
    
    try {
        console.log('🔄 Cargando datos de asteroides de la NASA...');
        
        const response = await fetch('/api/neo/recent');
        const data = await response.json();
        
        if (data.success && data.asteroids && data.asteroids.length > 0) {
            currentAsteroidData = data;
            populateAsteroidSelector(data.asteroids);
            console.log(`✅ Cargados ${data.count} asteroides de la NASA`);
        } else {
            throw new Error(data.message || 'No se pudieron obtener datos de asteroides');
        }
    } catch (error) {
        console.error('❌ Error cargando datos de la NASA:', error);
        
        // Limpiar selector y mostrar error
        while (asteroidSelect.children.length > 1) {
            asteroidSelect.removeChild(asteroidSelect.lastChild);
        }
        
        // Agregar opción de error
        const errorOption = document.createElement('option');
        errorOption.value = 'error';
        errorOption.textContent = '❌ Error cargando datos de la NASA';
        errorOption.disabled = true;
        asteroidSelect.appendChild(errorOption);
    }
}

function populateAsteroidSelector(asteroids) {
    const select = document.getElementById('asteroid-select');
    
    // Limpiar opciones anteriores (mantener solo "Personalizado")
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Agregar asteroides reales de la NASA
    asteroids.forEach(asteroid => {
        const option = document.createElement('option');
        option.value = asteroid.id;
        
        // Crear texto descriptivo
        let displayText = asteroid.name;
        if (asteroid.is_hazardous) {
            displayText += ' ⚠️ [PELIGROSO]';
        }
        
        // Agregar información adicional
        const diameter = (asteroid.diameter_min_m + asteroid.diameter_max_m) / 2;
        displayText += ` (${Math.round(diameter)}m, ${asteroid.velocity_km_s.toFixed(1)} km/s)`;
        
        option.textContent = displayText;
        select.appendChild(option);
    });
    
    console.log(`✅ ${asteroids.length} asteroides agregados al selector`);
}

async function runImpactSimulation() {
    showLoading(true);
    
    try {
        const params = {
            diameter: parseFloat(document.getElementById('diameter').value),
            velocity: parseFloat(document.getElementById('velocity').value) * 1000,
            angle: parseFloat(document.getElementById('angle').value),
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            composition: document.getElementById('composition').value  // NUEVO
        };
        
        
        const response = await fetch('/api/simulate/impact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        
        const result = await response.json();
        
        if (result.success) {
            
        if (result.usgs_context) {
            // logUSGSData(result.usgs_context);  // Comentado temporalmente
            console.log('📊 USGS Context:', result.usgs_context);
        }
            // Get location info with impact radii for population calculation
            const destructionRadius = result.calculations.destruction_radius_km;
            const damageRadius = result.calculations.damage_radius_km;
            
            // ============================================
            // LLAMADAS A APIs EXTERNAS DESDE EL FRONTEND
            // ============================================
            
            // 1. Obtener ciudades cercanas (Overpass API)
            const airPressureRadius = damageRadius * 1.5;
            const maxRadius = Math.max(destructionRadius, damageRadius, airPressureRadius);
            
            try {
                const citiesResponse = await fetch('/api/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: params.latitude,
                        longitude: params.longitude,
                        radius: maxRadius * 1000
                    })
                });
                
                const citiesData = await citiesResponse.json();
                if (citiesData.success) {
                    result.cities = citiesData.cities;
                    console.log(`✅ ${citiesData.cities.length} ciudades encontradas`);
                } else {
                    result.cities = [];
                }
            } catch (error) {
                console.warn('❌ Error obteniendo ciudades:', error);
                result.cities = [];
            }
            
            // 2. Correlación sísmica con USGS (opcional)
            try {
                const seismicResponse = await fetch('/api/usgs/earthquake-correlation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        impact_energy_megatons: result.calculations.energy_megatons_tnt
                    })
                });
                
                if (seismicResponse.ok) {
                    const seismicData = await seismicResponse.json();
                    if (seismicData.success) {
                        result.seismic_analysis = seismicData;
                        console.log('✅ Análisis sísmico obtenido del USGS');
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener análisis sísmico del USGS:', error);
            }
            
            // 3. Análisis de tsunami con NASA-NOAA (solo si está cerca de costa)
            if (destructionRadius < 200) { // Solo si está cerca de la costa
                try {
                    const tsunamiResponse = await fetch('/api/nasa-noaa/tsunami-analysis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            latitude: params.latitude,
                            longitude: params.longitude,
                            energy_megatons: result.calculations.energy_megatons_tnt,
                            radius_km: Math.min(200, damageRadius)
                        })
                    });
                    
                    if (tsunamiResponse.ok) {
                        const tsunamiData = await tsunamiResponse.json();
                        if (tsunamiData.success) {
                            result.tsunami_analysis = tsunamiData;
                            console.log('✅ Análisis de tsunami obtenido de NASA-NOAA');
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ No se pudo obtener análisis de tsunami de NASA-NOAA:', error);
                }
            }
            
            // 4. Análisis de impacto en flora y fauna (GBIF)
            try {
                const floraFaunaResponse = await fetch('/api/impact/flora-fauna', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: params.latitude,
                        longitude: params.longitude,
                        impact_radius_km: damageRadius, // Usar el radio de daño real de la explosión
                        impact_energy_megatons: result.calculations.energy_megatons_tnt,
                        destruction_radius_km: destructionRadius // Radio de destrucción total
                    })
                });
                
                if (floraFaunaResponse.ok) {
                    const floraFaunaData = await floraFaunaResponse.json();
                    if (floraFaunaData.success) {
                        result.flora_fauna_analysis = floraFaunaData;
                        console.log('✅ Análisis de flora y fauna obtenido de GBIF');
                        console.log(`🌿 ${floraFaunaData.flora_species.length} especies de flora encontradas`);
                        console.log(`🦋 ${floraFaunaData.fauna_species.length} especies de fauna encontradas`);
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener análisis de flora y fauna de GBIF:', error);
            }
            
            displayImpactResults(result);
            await updateImpactMap(result);
            
        } else {
            alert('Error en la simulación: ' + result.error);
        }
    } catch (error) {
        console.error('Simulation error:', error);
        alert('Error al ejecutar la simulación');
    } finally {
        showLoading(false);
    }
}

function displayImpactResults(result) {
    // Guardar resultados completos para el modal
    currentFullResults = result;
    
    const container = document.getElementById('results-content');
    
    // No mostrar nada en la barra lateral, solo limpiar el contenido
    container.innerHTML = `
        <div class="placeholder">Simulación completada. Haz clic en "Ver Resultados Completos" para ver todos los detalles.</div>
    `;
    
    // Mostrar botón para ver resultados completos
    const viewBtn = document.getElementById('view-full-results-btn');
    if (viewBtn) {
        viewBtn.style.display = 'block';
    }
}

function getImpactInterpretation(calc, popData) {
    const megatons = calc.energy_megatons_tnt;
    let interpretation = '';
    
    if (megatons < 1) {
        interpretation = 'Impacto menor. Daño principalmente local. Comparable a explosiones industriales grandes.';
    } else if (megatons < 100) {
        interpretation = 'Impacto moderado. Destrucción de ciudades. Efectos regionales significativos.';
    } else if (megatons < 10000) {
        interpretation = 'Impacto severo. Devastación continental. Efectos climáticos globales temporales.';
    } else {
        interpretation = 'Evento de extinción. Destrucción global masiva. Cambios climáticos permanentes.';
    }
    
    // Añadir contexto de población si está disponible
    if (popData && popData.totalPopulation > 0) {
        interpretation += `<br><br>`;
        if (popData.totalPopulation > 5000000) {
            interpretation += `<strong>ALERTA MÁXIMA:</strong> Millones de personas en zona de impacto. Evacuación masiva urgente requerida.`;
        } else if (popData.totalPopulation > 1000000) {
            interpretation += `<strong>EMERGENCIA MAYOR:</strong> Más de un millón de personas en riesgo. Plan de evacuación inmediato.`;
        } else if (popData.totalPopulation > 100000) {
            interpretation += `<strong>EMERGENCIA:</strong> Cientos de miles de personas afectadas. Respuesta de emergencia necesaria.`;
        } else if (popData.totalPopulation > 10000) {
            interpretation += `Decenas de miles de personas en zona de riesgo. Evacuación preventiva recomendada.`;
        } else if (popData.totalPopulation > 0) {
            interpretation += `Población en riesgo en el área. Evacuación de zona de impacto recomendada.`;
        }
    }
    
    return interpretation;
}

function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' billones';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' mil millones';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' millones';
    return num.toLocaleString();
}

// ============================================
// LOCATION & POPULATION DATA
// ============================================

async function getLocationInfo(lat, lon, destructionRadiusKm, damageRadiusKm) {
    console.log(`🗺️ Obteniendo información de ubicación para: ${lat}, ${lon}`);
    
    try {
        // 1. Usar Nominatim de OpenStreetMap para reverse geocoding
        console.log('🔍 Consultando Nominatim para geocoding inverso...');
        const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&extratags=1`,
            {
                headers: {
                    'User-Agent': 'AsteroidImpactSimulator/1.0'
                }
            }
        );
        
        if (!nominatimResponse.ok) {
            throw new Error('Geocoding API error');
        }
        
        const data = await nominatimResponse.json();
        const address = data.address || {};
        let displayName = data.display_name || 'Ubicación desconocida';
        
        console.log('Ubicación identificada:', displayName);
        
        // 2. Obtener población REAL de la zona usando GeoNames API
        console.log('Consultando APIs de población...');
        const populationData = await getPopulationFromGeoNames(lat, lon, destructionRadiusKm, damageRadiusKm);
        
        console.log('Datos de población obtenidos:', populationData);
        
        return {
            display_name: displayName,
            city: address.city || address.town || address.village || address.county,
            country: address.country,
            state: address.state,
            countryCode: address.country_code,
            address: address,
            populationData: populationData
        };
        
    } catch (error) {
        console.error('❌ Error getting location info:', error);
        return {
            display_name: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
            populationData: null
        };
    }
}

async function getPopulationFromGeoNames(lat, lon, destructionRadiusKm, damageRadiusKm) {
    console.log('🌍 Intentando GeoNames API como primera opción...');
    
    try {
        // Usar la API de GeoNames para buscar todos los asentamientos humanos
        // Username gratuito de GeoNames (reemplazar con uno propio para producción)
        const username = 'demo'; // Usar 'demo' para pruebas
        
        // Buscar en un radio más amplio para asegurar detección
        const maxRadius = Math.max(destructionRadiusKm, damageRadiusKm, 25); // Mínimo 25km para mejor cobertura
        
        console.log(`📡 Radio de búsqueda GeoNames: ${maxRadius}km`);
        
        // Hacer múltiples consultas para obtener todos los tipos de asentamientos
        const queries = [
            // Ciudades, pueblos y aldeas (featureClass=P)
            `https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&radius=${maxRadius}&maxRows=500&username=${username}&style=FULL&featureClass=P`,
            // Divisiones administrativas con población (featureClass=A)
            `https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&radius=${maxRadius}&maxRows=200&username=${username}&style=FULL&featureClass=A`
        ];
        
        const allPlaces = [];
        
        for (let i = 0; i < queries.length; i++) {
            try {
                console.log(`🔍 Consultando GeoNames query ${i + 1}/${queries.length}...`);
                const response = await fetch(queries[i]);
                if (response.ok) {
        const data = await response.json();
                    if (data.geonames && data.geonames.length > 0) {
                        console.log(`✅ GeoNames query ${i + 1}: ${data.geonames.length} lugares encontrados`);
                        allPlaces.push(...data.geonames);
                    } else {
                        console.log(`GeoNames query ${i + 1}: Sin lugares encontrados`);
                    }
                }
                // Esperar un poco entre consultas para no saturar la API
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.warn(`❌ Error in GeoNames query ${i + 1}:`, error);
            }
        }
        
        // Combinar y eliminar duplicados
        const uniquePlaces = [];
        const seenNames = new Set();
        
        for (const place of allPlaces) {
            const key = `${place.name}-${place.lat}-${place.lng}`;
            if (!seenNames.has(key) && place.population && parseInt(place.population) > 0) {
                seenNames.add(key);
                uniquePlaces.push(place);
            }
        }
        
        if (uniquePlaces.length === 0) {
            return {
                totalPopulation: 0,
                nearestCity: null,
                citiesInRange: [],
                message: 'Área deshabitada o sin datos de población disponibles'
            };
        }
        
        // Calcular población en cada zona
        const citiesInDestructionZone = [];
        const citiesInDamageZone = [];
        let totalPopInDestruction = 0;
        let totalPopInDamage = 0;
        
        uniquePlaces.forEach(place => {
            // Calcular distancia desde el punto de impacto
            const placeLat = parseFloat(place.lat);
            const placeLng = parseFloat(place.lng);
            const distance = calculateDistance(lat, lon, placeLat, placeLng);
            const population = parseInt(place.population) || 0;
            
            if (population > 0) {
            const cityInfo = {
                name: place.name,
                population: population,
                distance: distance,
                    countryName: place.countryName || place.adminName1,
                    featureCode: place.fcode || 'unknown'
            };
            
            if (distance <= destructionRadiusKm) {
                citiesInDestructionZone.push(cityInfo);
                totalPopInDestruction += population;
            } else if (distance <= damageRadiusKm) {
                citiesInDamageZone.push(cityInfo);
                totalPopInDamage += population;
                }
            }
        });
        
        // Ordenar por población (mayor a menor)
        citiesInDestructionZone.sort((a, b) => b.population - a.population);
        citiesInDamageZone.sort((a, b) => b.population - a.population);
        
        return {
            totalPopulation: totalPopInDestruction + totalPopInDamage,
            populationInDestructionZone: totalPopInDestruction,
            populationInDamageZone: totalPopInDamage,
            nearestCity: uniquePlaces[0] || null,
            citiesInDestructionZone: citiesInDestructionZone,
            citiesInDamageZone: citiesInDamageZone,
            message: null
        };
        
    } catch (error) {
        console.error('Error fetching population from GeoNames:', error);
        return await getPopulationAlternative(lat, lon, destructionRadiusKm, damageRadiusKm);
    }
}

async function getPopulationAlternative(lat, lon, destructionRadiusKm, damageRadiusKm) {
    // Usar múltiples APIs públicas para obtener datos reales de población
    try {
        console.log('Using alternative APIs for population data:', lat, lon);
        
        // Intentar con OpenStreetMap Nominatim + Overpass API
        const osmData = await getPopulationFromOSM(lat, lon, destructionRadiusKm, damageRadiusKm);
        if (osmData.totalPopulation > 0) {
            return osmData;
        }
        
        // Si OSM falla, intentar con REST Countries API para datos de densidad
        const countryData = await getPopulationFromCountryAPI(lat, lon, destructionRadiusKm, damageRadiusKm);
        if (countryData.totalPopulation > 0) {
            return countryData;
        }
        
        // Último recurso: cálculo basado en densidad poblacional global
        return getPopulationFromDensityGuess(lat, lon, destructionRadiusKm, damageRadiusKm);
        
    } catch (error) {
        console.error('Error in alternative population calculation:', error);
            return {
            totalPopulation: 0,
            message: 'No se pudo obtener datos de población de APIs externas'
        };
    }
}

// Nueva función: Usar OpenStreetMap Overpass API para datos de población
async function getPopulationFromOSM(lat, lon, destructionRadiusKm, damageRadiusKm) {
    try {
        const radius = Math.max(destructionRadiusKm, damageRadiusKm, 25);
        const radiusMeters = radius * 1000;
        
        // Consulta exactamente como tu ejemplo
        const overpassQuery = `
            [out:json];
            (
              node["place"~"city|town|village"](around:${radiusMeters}, ${lat}, ${lon});
            );
            out;
        `;
        
        const url = "http://overpass-api.de/api/interpreter";
        const response = await fetch(url + '?data=' + encodeURIComponent(overpassQuery));
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const rawData = await response.json();
        
        // Mostrar solo la lista simple de ciudades cercanas
        if (rawData.elements && rawData.elements.length > 0) {
            console.log('CIUDADES CERCANAS:');
            rawData.elements.forEach((element, index) => {
                const name = element.tags?.name || 'Sin nombre';
                const place = element.tags?.place || 'desconocido';
                const population = element.tags?.population ? ` - ${element.tags.population} hab.` : '';
                console.log(`${index + 1}. ${name} (${place})${population}`);
            });
        } else {
            console.log('❌ No se encontraron ciudades cercanas');
        }
        
        // Procesar solo si hay datos
        if (!rawData.elements || rawData.elements.length === 0) {
        return {
            totalPopulation: 0,
            populationInDestructionZone: 0,
            populationInDamageZone: 0,
                nearestCity: null,
            citiesInDestructionZone: [],
            citiesInDamageZone: [],
                message: 'Overpass API: Sin lugares poblados encontrados',
                rawData: rawData
            };
        }
        
        // Procesar elementos para clasificación por zonas
        const processedData = processOverpassElements(rawData.elements, lat, lon, destructionRadiusKm, damageRadiusKm);
        
        return {
            ...processedData,
            rawData: rawData // Incluir datos raw para debug
        };
        
    } catch (error) {
        console.error('❌ Error en Overpass API:', error);
        return {
            totalPopulation: 0,
            message: `Error consultando Overpass: ${error.message}`,
            error: error
        };
    }
}

// Nueva función para procesar elementos directos de Overpass
function processOverpassElements(elements, impactLat, impactLon, destructionRadiusKm, damageRadiusKm) {
    const citiesInDestructionZone = [];
    const citiesInDamageZone = [];
    
    elements.forEach(element => {
        if (!element.tags?.name) return;
        
        const lat = element.lat;
        const lon = element.lon;
        const name = element.tags.name;
        const placeType = element.tags.place;
        const population = parseInt(element.tags.population) || 0;
        
        if (!lat || !lon) return;
        
        const distance = calculateDistance(impactLat, impactLon, lat, lon);
        
        const cityInfo = {
            name: name,
            population: population,
            distance: distance,
            placeType: placeType,
            coordinates: [lat, lon],
            rawTags: element.tags, // Incluir todos los tags originales
            elementId: element.id,
            elementType: element.type
        };
        
        if (distance <= destructionRadiusKm) {
            citiesInDestructionZone.push(cityInfo);
        } else if (distance <= damageRadiusKm) {
            citiesInDamageZone.push(cityInfo);
        }
    });
    
    // Ordenar por población (mayor a menor)
    citiesInDestructionZone.sort((a, b) => b.population - a.population);
    citiesInDamageZone.sort((a, b) => b.population - a.population);
    
    const totalPopDestruction = citiesInDestructionZone.reduce((sum, city) => sum + city.population, 0);
    const totalPopDamage = citiesInDamageZone.reduce((sum, city) => sum + city.population, 0);
    const nearestCity = elements.reduce((nearest, element) => {
        if (!element.lat || !element.lon) return nearest;
        const currentDistance = calculateDistance(impactLat, impactLon, element.lat, element.lon);
        return (!nearest || currentDistance < nearest.distance) ? {
            name: element.tags.name,
            distance: currentDistance,
            population: parseInt(element.tags.population) || 0,
            placeType: element.tags.place
        } : nearest;
    }, null);
    
    // Mostrar ciudades por zonas si las hay
    if (citiesInDestructionZone.length > 0) {
        console.log(`ZONA CRÍTICA (${citiesInDestructionZone.length} ciudades):`);
        citiesInDestructionZone.forEach((city, index) => {
            console.log(`   ${index + 1}. ${city.name} (${city.population} hab.)`);
        });
    }
    
    if (citiesInDamageZone.length > 0) {
        console.log(`ZONA AMARILLA (${citiesInDamageZone.length} ciudades):`);
        citiesInDamageZone.forEach((city, index) => {
            console.log(`   ${index + 1}. ${city.name} (${city.population} hab.)`);
        });
    }
    
    return {
        totalPopulation: totalPopDestruction + totalPopDamage,
        populationInDestructionZone: totalPopDestruction,
        populationInDamageZone: totalPopDamage,
        nearestCity: nearestCity,
        citiesInDestructionZone: citiesInDestructionZone,
        citiesInDamageZone: citiesInDamageZone,
        message: `Overpass API: ${elements.length} lugares encontrados`
    };
}

// Nueva función: Usar REST Countries API para estimación por país
async function getPopulationFromCountryAPI(lat, lon, destructionRadiusKm, damageRadiusKm) {
    try {
        // Primero obtener el país usando Nominatim
        const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            { headers: { 'User-Agent': 'AsteroidImpactSimulator/1.0' } }
        );
        
        const nominatimData = await nominatimResponse.json();
        const countryCode = nominatimData.address?.country_code?.toUpperCase();
        
        if (!countryCode) {
            throw new Error('No country found');
        }
        
        // Obtener datos del país
        const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = await countryResponse.json();
        
        if (countryData.length === 0) {
            throw new Error('Country data not found');
        }
        
        const country = countryData[0];
        const estimatedPopulation = Math.round(
            (country.population / country.area) * 
            (Math.PI * Math.pow(Math.max(destructionRadiusKm, damageRadiusKm), 2)) * 
            0.1 // Factor de corrección urbana
        );
        
        return {
            totalPopulation: estimatedPopulation,
            populationInDestructionZone: Math.round(estimatedPopulation * 0.3),
            populationInDamageZone: Math.round(estimatedPopulation * 0.7),
            nearestCity: {
                name: nominatimData.address?.city || nominatimData.address?.town || country.name?.common,
                population: estimatedPopulation,
                distance: 0
            },
            citiesInDestructionZone: [],
            citiesInDamageZone: [],
            message: `Estimación basada en densidad de ${country.name?.common}: ${estimatedPopulation.toLocaleString()} personas estimadas en área de impacto`
        };
        
    } catch (error) {
        console.error('Country API error:', error);
        return { totalPopulation: 0 };
    }
}

// Nueva función: Estimación basada en densidad poblacional global
function getPopulationFromDensityGuess(lat, lon, destructionRadiusKm, damageRadiusKm) {
    try {
        // Densidades población por tipo de área (personas/km²)
        const densities = {
            urban: 2500,      // Ciudades grandes
            suburban: 800,    // Suburbios
            rural: 120,       // Áreas rurales
            remote: 15        // Áreas remotas
        };
        
        // Determinar si es área urbana basado en proximidad a ciudades principales
        const isUrban = (lat >= 35 && lat <= 50) && (lon >= -10 && lon <= 10); // Europa Occidental
        const density = isUrban ? densities.suburban : densities.rural;
        
        const areaKm2 = Math.PI * Math.pow(Math.max(destructionRadiusKm, damageRadiusKm), 2);
        const estimatedPopulation = Math.round(areaKm2 * density);
        
        return {
            totalPopulation: estimatedPopulation,
            populationInDestructionZone: Math.round(estimatedPopulation * 0.2),
            populationInDamageZone: Math.round(estimatedPopulation * 0.8),
            nearestCity: null,
            citiesInDestructionZone: [],
            citiesInDamageZone: [],
            message: `Estimación poblacional global: ${estimatedPopulation.toLocaleString()} personas estimadas en área de ${areaKm2.toFixed(0)} km²`
        };
        
    } catch (error) {
        console.error('Density estimation error:', error);
        return { totalPopulation: 0, message: 'No se pudo estimar población' };
    }
}

// Función helper para procesar datos de ciudades
function processCitiesData(citiesArray, destructionRadiusKm, damageRadiusKm, source) {
    const citiesInDestructionZone = [];
    const citiesInDamageZone = [];

    citiesArray.forEach(city => {
        if (city.distance <= destructionRadiusKm) {
            citiesInDestructionZone.push(city);
        } else if (city.distance <= damageRadiusKm) {
            citiesInDamageZone.push(city);
        }
    });

    const totalPopDestruction = citiesInDestructionZone.reduce((sum, city) => sum + city.population, 0);
    const totalPopDamage = citiesInDamageZone.reduce((sum, city) => sum + city.population, 0);

    return {
        totalPopulation: totalPopDestruction + totalPopDamage,
        populationInDestructionZone: totalPopDestruction,
        populationInDamageZone: totalPopDamage,
        nearestCity: citiesArray.reduce((nearest, city) => 
            !nearest || city.distance < nearest.distance ? city : nearest, null),
        citiesInDestructionZone: citiesInDestructionZone.sort((a, b) => b.population - a.population),
        citiesInDamageZone: citiesInDamageZone.sort((a, b) => b.population - a.population),
        message: `Datos de ${source}`
    };
}

// Base de datos local eliminada - ahora solo usamos APIs externas

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Fórmula de Haversine para calcular distancia entre dos puntos en km
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getCityPopulationFromDB(city, country) {
    // Base de datos de población de ciudades principales (2024)
    const cityPopulations = {
        'Tokyo': 37400000, 'Delhi': 32900000, 'Shanghai': 29200000,
        'São Paulo': 22600000, 'Mexico City': 22300000, 'Cairo': 22200000,
        'Mumbai': 21300000, 'Beijing': 21200000, 'Dhaka': 21700000,
        'Osaka': 19100000, 'New York': 18800000, 'Karachi': 17000000,
        'Buenos Aires': 15400000, 'Istanbul': 15600000, 'Kolkata': 15100000,
        'Manila': 14200000, 'Lagos': 15400000, 'Rio de Janeiro': 13700000,
        'Guangzhou': 13300000, 'Los Angeles': 12400000, 'Moscow': 12600000,
        'Paris': 11200000, 'London': 9600000, 'Chicago': 8900000,
        'Bogotá': 11300000, 'Jakarta': 11100000, 'Lima': 11200000,
        'Bangkok': 11000000, 'Seoul': 9500000, 'Nagoya': 9500000,
        'Madrid': 6700000, 'Barcelona': 5600000, 'Rome': 4300000,
        'Berlin': 3800000, 'Toronto': 6300000, 'Miami': 6200000,
        'Singapore': 5900000, 'Hong Kong': 7500000, 'Sydney': 5400000,
        'Melbourne': 5200000, 'Montreal': 4300000, 'Vancouver': 2800000
    };
    
    return cityPopulations[city] || null;
}

function getCountryPopulation(countryName) {
    // Datos aproximados de población de países principales (2024)
    const countryPopulations = {
        'United States': 334914895,
        'Estados Unidos': 334914895,
        'China': 1425671352,
        'India': 1428627663,
        'Brazil': 216422446,
        'Brasil': 216422446,
        'Russia': 144444359,
        'Rusia': 144444359,
        'Japan': 123294513,
        'Japón': 123294513,
        'Mexico': 128455567,
        'México': 128455567,
        'Germany': 83294633,
        'Alemania': 83294633,
        'France': 64756584,
        'Francia': 64756584,
        'United Kingdom': 67736802,
        'Reino Unido': 67736802,
        'Italy': 58870762,
        'Italia': 58870762,
        'Spain': 47519628,
        'España': 47519628,
        'Canada': 38781291,
        'Canadá': 38781291,
        'Australia': 26439111,
        'Argentina': 45510318,
        'Colombia': 52085168,
        'Poland': 41026067,
        'Polonia': 41026067,
        'Ukraine': 38000000,
        'Ucrania': 38000000
    };
    
    return countryPopulations[countryName] || null;
}

// ============================================
// MAP FUNCTIONALITY
// ============================================

function initializeImpactMap() {
    // Esperar a que el DOM y Leaflet estén listos
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    
    
    try {
        // Eliminar mapa anterior si existe
        if (impactMap) {
            impactMap.remove();
            impactMap = null;
        }
        
        // Crear el mapa con configuración explícita
        impactMap = L.map('map-container', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            attributionControl: true,
            preferCanvas: false,
            renderer: L.canvas()
        });
        
        
        // Add theme-appropriate tile layer
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (currentTheme === 'dark') {
            currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 1
            });
        } else {
            currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap © CARTO',
                subdomains: 'abcd',
                maxZoom: 19,
                minZoom: 1
            });
        }
        
        currentTileLayer.addTo(impactMap);
        
        // Click to select impact point
        impactMap.on('click', (e) => {
            const lat = e.latlng.lat.toFixed(4);
            const lng = e.latlng.lng.toFixed(4);
            
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Clear previous marker
            if (currentMarker) {
                impactMap.removeLayer(currentMarker);
            }
            
            // Clear previous circles
            currentCircles.forEach(circle => {
                impactMap.removeLayer(circle);
            });
            currentCircles = [];
            
            // Add new marker with better visibility
            currentMarker = L.marker([e.latlng.lat, e.latlng.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="
                        background: #FF4444; 
                        width: 16px; 
                        height: 16px; 
                        border-radius: 50%; 
                        border: 3px solid white;
                        box-shadow: 0 0 10px rgba(255, 68, 68, 0.8), 0 0 20px rgba(255, 68, 68, 0.4);
                    "></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                })
            }).addTo(impactMap);
            
            currentMarker.bindPopup(`
                <div style="background: #1A1A1A; color: #E0E0E0; padding: 8px; border-radius: 4px;">
                    <strong style="color: #FF4444;">Punto Seleccionado</strong><br>
                    Latitud: ${lat}<br>
                    Longitud: ${lng}
                </div>
            `).openPopup();
        });
        
        
        // Force map to resize multiple times to ensure it displays
        setTimeout(() => {
            if (impactMap) {
                impactMap.invalidateSize();
            }
        }, 100);
        
        setTimeout(() => {
            if (impactMap) {
                impactMap.invalidateSize();
            }
        }, 500);
        
        setTimeout(() => {
            if (impactMap) {
                impactMap.invalidateSize();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing map:', error);
        // Intentar mostrar un mensaje visual si el mapa falla
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #FF4444; flex-direction: column; padding: 2rem; text-align: center;">
                    <h2>Error al cargar el mapa</h2>
                    <p style="margin-top: 1rem; color: #A0A0A0;">Error: ${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #00A8E8; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Recargar Página
                    </button>
                </div>
            `;
        }
    }
}

async function updateImpactMap(result) {
    if (!impactMap) {
        console.error('Map not initialized');
        return;
    }
    
    const calc = result.calculations;
    const lat = result.input.impact_location.lat;
    const lon = result.input.impact_location.lon;
    
    // Clear previous marker
    if (currentMarker) {
        impactMap.removeLayer(currentMarker);
    }
    
    // Clear previous circles
    currentCircles.forEach(circle => {
        impactMap.removeLayer(circle);
    });
    currentCircles = [];
    
    // Center on impact point
    impactMap.setView([lat, lon], 8);
    
    // Construir información de ubicación para el popup
    let locationText = '';
    locationText = `<strong>Coordenadas:</strong><br>${lat.toFixed(4)}, ${lon.toFixed(4)}<br><br>`;
    
    // Construir información de ciudades encontradas por zonas
    let citiesText = '';
    if (result.cities && result.cities.length > 0) {
        const airPressureRadius = calc.damage_radius_km * 1.5;
        const destructionRadius = calc.destruction_radius_km;
        const damageRadius = calc.damage_radius_km;
        
        // Clasificar ciudades por zonas usando distancias reales del backend
        const citiesInDestructionZone = [];
        const citiesInDamageZone = [];
        const citiesInAirPressureZone = [];
        
        result.cities.forEach(city => {
            const distance = city.distancia_km || 999; // Fallback si no viene distancia
            
            if (distance <= destructionRadius) {
                citiesInDestructionZone.push(city);
            } else if (distance <= damageRadius) {
                citiesInDamageZone.push(city);
            } else if (distance <= airPressureRadius) {
                citiesInAirPressureZone.push(city);
            }
        });
        
        // Encontrar la ciudad más grande de cada zona
        const getLargestCity = (cities) => {
            if (cities.length === 0) return null;
            return cities.reduce((largest, current) => {
                const largestPop = largest.poblacion ? parseInt(largest.poblacion) : 0;
                const currentPop = current.poblacion ? parseInt(current.poblacion) : 0;
                return currentPop > largestPop ? current : largest;
            });
        };
        
        const largestDestructionCity = getLargestCity(citiesInDestructionZone);
        const largestDamageCity = getLargestCity(citiesInDamageZone);
        const largestAirPressureCity = getLargestCity(citiesInAirPressureZone);
        
        citiesText = `<strong>Ciudades Principales Afectadas:</strong><br>`;
        
        if (largestDestructionCity) {
            const population = largestDestructionCity.poblacion ? formatNumber(largestDestructionCity.poblacion) + ' hab.' : 'Población N/A';
            citiesText += `<strong style="color: #FF4444;">Zona Roja (${destructionRadius.toFixed(1)}km)</strong>: ${largestDestructionCity.nombre} - ${population}<br>`;
        }
        
        if (largestDamageCity) {
            const population = largestDamageCity.poblacion ? formatNumber(largestDamageCity.poblacion) + ' hab.' : 'Población N/A';
            citiesText += `<strong style="color: #FFB84D;">Zona Naranja (${damageRadius.toFixed(1)}km)</strong>: ${largestDamageCity.nombre} - ${population}<br>`;
        }
        
        if (largestAirPressureCity) {
            const population = largestAirPressureCity.poblacion ? formatNumber(largestAirPressureCity.poblacion) + ' hab.' : 'Población N/A';
            citiesText += `<strong style="color: #4169E1;">Zona Azul (${airPressureRadius.toFixed(1)}km)</strong>: ${largestAirPressureCity.nombre} - ${population}<br>`;
        }
    }
    
    // Add impact marker with same style
    currentMarker = L.marker([lat, lon], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: #FF4444; 
                width: 20px; 
                height: 20px; 
                border-radius: 50%; 
                border: 3px solid white;
                box-shadow: 0 0 15px rgba(255, 68, 68, 1), 0 0 30px rgba(255, 68, 68, 0.6);
                animation: pulse-marker 1.5s ease-in-out infinite;
            "></div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        })
    }).addTo(impactMap);
    
    currentMarker.bindPopup(`
        <div style="background: #1A1A1A; color: #E0E0E0; padding: 12px; border-radius: 4px; min-width: 240px; max-width: 280px;">
            <strong style="color: #FF4444; font-size: 14px;">Punto de Impacto</strong><br>
            <hr style="border-color: #3A3A3A; margin: 8px 0;">
            ${citiesText}
            <strong>Energía:</strong><br>
            ${calc.energy_megatons_tnt.toFixed(2)} MT TNT<br><br>
            <strong>Radio de Destrucción:</strong><br>
            ${calc.destruction_radius_km.toFixed(2)} km
        </div>
    `).openPopup();
    
    // Add air pressure wave zone first (largest circle, behind everything)
    const airPressureRadius = calc.damage_radius_km * 1.5; // 50% más grande que zona de daño
    const airPressureCircle = L.circle([lat, lon], {
        radius: airPressureRadius * 1000,
        color: '#4169E1',
        weight: 2,
        fillColor: '#4169E1',
        fillOpacity: 0.2,
        className: 'impact-circle air-pressure-zone'
    }).addTo(impactMap);
    
    airPressureCircle.bindPopup(`
        <strong style="color: #4169E1;">Zona de Ondas Atmosféricas</strong><br>
        Radio: ${airPressureRadius.toFixed(2)} km<br>
        Efectos: Ventanales rotos, ondas de presión
    `);
    
    // Add damage zone second (middle layer)
    const damageCircle = L.circle([lat, lon], {
        radius: calc.damage_radius_km * 1000,
        color: '#FFB84D',
        weight: 2,
        fillColor: '#FFB84D',
        fillOpacity: 0.3,
        className: 'impact-circle'
    }).addTo(impactMap);
    
    damageCircle.bindPopup(`
        <strong style="color: #FFB84D;">Zona de Daño Significativo</strong><br>
        Radio: ${calc.damage_radius_km.toFixed(2)} km
    `);
    
    // Add destruction zone second (smaller circle, on top)
    const destructionCircle = L.circle([lat, lon], {
        radius: calc.destruction_radius_km * 1000,
        color: '#FF4444',
        weight: 3,
        fillColor: '#FF4444',
        fillOpacity: 0.7,
        className: 'impact-circle destruction-zone'
    }).addTo(impactMap);
    
    destructionCircle.bindPopup(`
        <strong style="color: #FF4444;">Zona de Destrucción Total</strong><br>
        Radio: ${calc.destruction_radius_km.toFixed(2)} km
    `);
    
    // Ensure destruction circle is always on top and stops event propagation
    destructionCircle.on('click', function(e) {
        e.originalEvent.stopPropagation();
        
        // Create popup at click location
        const popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(`
                <strong style="color: #FF4444;">Zona de Destrucción Total</strong><br>
                Radio: ${calc.destruction_radius_km.toFixed(2)} km
            `)
            .openOn(impactMap);
    });
    
    airPressureCircle.on('click', function(e) {
        // Only open if click is not within damage zone
        const clickPoint = e.latlng;
        const centerPoint = L.latLng(lat, lon);
        const distanceToCenter = clickPoint.distanceTo(centerPoint);
        
        if (distanceToCenter > calc.damage_radius_km * 1000) {
            const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                    <strong style="color: #4169E1;">Zona de Ondas Atmosféricas</strong><br>
                    Radio: ${airPressureRadius.toFixed(2)} km<br>
                    Efectos: Ventanales rotos, ondas de presión
                `)
                .openOn(impactMap);
        }
    });
    
    damageCircle.on('click', function(e) {
        // Only open if click is not within destruction zone
        const clickPoint = e.latlng;
        const centerPoint = L.latLng(lat, lon);
        const distanceToCenter = clickPoint.distanceTo(centerPoint);
        
        if (distanceToCenter > calc.destruction_radius_km * 1000) {
            // Create popup at click location
            const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`
        <strong style="color: #FFB84D;">Zona de Daño Significativo</strong><br>
        Radio: ${calc.damage_radius_km.toFixed(2)} km
                `)
                .openOn(impactMap);
        }
    });
    
    currentCircles.push(airPressureCircle, damageCircle, destructionCircle);
}

// ============================================
// MITIGATION MODE
// ============================================

function setupMitigationMode() {
    // Range inputs
    setupRangeInput('mit-diameter', 'mit-diameter-value', ' m');
    setupRangeInput('mit-velocity', 'mit-velocity-value', ' km/s');
    setupRangeInput('time-before-impact', 'time-before-impact-value', ' días');
    setupRangeInput('impactor-mass', 'impactor-mass-value', ' kg');
    setupRangeInput('impactor-velocity', 'impactor-velocity-value', ' km/s');
    
    // Strategy selection
    const strategySelect = document.getElementById('strategy-select');
    if (strategySelect) {
        strategySelect.addEventListener('change', handleStrategyChange);
    }
    
    // Deflection button
    const deflectionBtn = document.getElementById('deflection-btn');
    if (deflectionBtn) {
        deflectionBtn.addEventListener('click', runDeflectionSimulation);
    }
}

function handleStrategyChange(e) {
    const strategy = e.target.value;
    const kineticParams = document.getElementById('kinetic-params');
    
    if (kineticParams) {
        if (strategy === 'kinetic_impactor') {
            kineticParams.style.display = 'block';
        } else {
            kineticParams.style.display = 'none';
        }
    }
}

async function runDeflectionSimulation() {
    showLoading(true);
    
    try {
        const params = {
            asteroid_diameter: parseFloat(document.getElementById('mit-diameter').value),
            asteroid_velocity: parseFloat(document.getElementById('mit-velocity').value) * 1000,
            strategy: document.getElementById('strategy-select').value,
            time_before_impact: parseFloat(document.getElementById('time-before-impact').value),
            impactor_mass: parseFloat(document.getElementById('impactor-mass').value),
            impactor_velocity: parseFloat(document.getElementById('impactor-velocity').value) * 1000
        };
        
        const response = await fetch('/api/simulate/deflection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayDeflectionResults(data);
            
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Deflection simulation error:', error);
        alert('Error al ejecutar la simulación de deflexión');
    } finally {
        showLoading(false);
    }
}

function displayDeflectionResults(data) {
    const container = document.getElementById('deflection-results');
    const result = data.result;
    const rec = data.recommendation;
    const strategies = data.advanced_strategies || [];
    
    let html = `
        <div class="severity-badge" style="background: ${rec.color}20; border: 2px solid ${rec.color};">
            ${rec.verdict}
        </div>
        
        <div class="result-stat">
            <strong>Estrategia Probada:</strong> ${result.strategy === 'kinetic_impactor' ? 'Impactador Cinético' : 'Tractor de Gravedad'}
        </div>
        
        <div class="result-stat">
            <strong>Cambio de Velocidad (Δv):</strong> ${result.delta_v.toFixed(6)} m/s
        </div>
        
        <div class="result-stat">
            <strong>Distancia Deflectada:</strong> ${result.deflection_km.toLocaleString()} km
        </div>
        
        <div style="margin-top: 1rem; padding: 1rem; background: ${rec.color}20; border-radius: 8px; border: 1px solid ${rec.color};">
            <strong>📋 Veredicto:</strong><br>
            ${rec.message}
        </div>
    `;
    
    // Mostrar estrategias recomendadas
    if (strategies.length > 0) {
        html += `
            <div style="margin-top: 1.5rem;">
                <strong style="font-size: 16px; color: #00A8E8;">💡 ESTRATEGIAS RECOMENDADAS</strong>
                <hr style="border-color: #3A3A3A; margin: 8px 0;">
        `;
        
        strategies.forEach(strat => {
            html += `
                <div style="margin-top: 1rem; padding: 1rem; background: ${strat.color}20; border-radius: 8px; border-left: 4px solid ${strat.color};">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 24px;">${strat.icon}</span>
                        <strong style="font-size: 15px;">${strat.method}</strong>
                    </div>
                    
                    <div style="font-size: 13px; margin-bottom: 0.5rem;">
                        <strong style="color: ${strat.color};">Viabilidad: ${strat.viability}</strong>
                    </div>
                    
                    <div style="font-size: 12px; color: var(--text-medium);">
                        ${strat.reason}
                    </div>
                    
                    ${strat.estimated_cost ? `<div style="margin-top: 0.5rem; font-size: 11px;">💰 Costo estimado: ${strat.estimated_cost}</div>` : ''}
                    ${strat.success_rate ? `<div style="font-size: 11px;">✅ Tasa éxito: ${strat.success_rate}</div>` : ''}
                    ${strat.warning ? `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,68,68,0.2); border-radius: 4px; font-size: 11px;">⚠️ ${strat.warning}</div>` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

function getDeflectionRecommendations(result) {
    if (result.success) {
        return `
            ✅ La deflexión es exitosa con los parámetros actuales.<br>
            • Considere un margen de seguridad adicional<br>
            • Planifique misiones de seguimiento para verificar la nueva trayectoria<br>
            • Mantenga opciones de backup disponibles
        `;
    } else {
        return `
            ❌ Se requieren ajustes para lograr deflexión exitosa:<br>
            • Aumentar el tiempo de intervención (intervenir más temprano)<br>
            • Aumentar la masa o velocidad del impactador<br>
            • Considerar misiones múltiples<br>
            • Evaluar estrategias alternativas
        `;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openResultsModal() {
    if (!currentFullResults) {
        return;
    }
    
    const modal = document.getElementById('results-modal');
    const modalContent = document.getElementById('modal-results-content');
    
    // Generar contenido completo del modal
    modalContent.innerHTML = generateFullResultsHTML(currentFullResults);
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Prevenir scroll en el body
    document.body.style.overflow = 'hidden';
}

function closeResultsModal() {
    const modal = document.getElementById('results-modal');
    modal.style.display = 'none';
    
    // Restaurar scroll en el body
    document.body.style.overflow = '';
}

function generateFullResultsHTML(result) {
    const calc = result.calculations;
    const severity = result.severity;
    const locationInfo = result.locationInfo || {};
    const popData = locationInfo.populationData || {};
    const usgsContext = result.usgs_context;
    const seismicData = result.seismic_analysis || null;
    const tsunamiData = result.tsunami_analysis || null;
    
    // IMPORTANTE: Declarar html aquí
    let html = `
        <div class="severity-badge" style="background: ${severity.color}20; border: 2px solid ${severity.color}; font-size: 16px; padding: 1rem;">
            <strong>${severity.level}:</strong> ${severity.description}
        </div>
    `;

    // USGS Context
    if (usgsContext) {
        html += displayUSGSContext(usgsContext, result);
    }
    
    // ... resto del código existente de población, parámetros, etc ...
    
    // AGREGAR ANÁLISIS DE BIODIVERSIDAD
    if (result.flora_fauna_analysis) {
        html += generateFloraFaunaAnalysisHTML(result.flora_fauna_analysis);
    }
    
    // AGREGAR EFECTOS SECUNDARIOS ANTES DEL RETURN
    if (result.secondary_effects && result.secondary_effects.length > 0) {
        html += `
            <div class="collapsible-section" data-section="secondary-effects">
                <div class="section-header" onclick="toggleSection('secondary-effects')">
                    <strong style="font-size: 16px;">⚠️ EFECTOS SECUNDARIOS Y CATÁSTROFES</strong>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="section-content" id="secondary-effects-content">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
        `;
        
        result.secondary_effects.forEach(effect => {
            html += `
                <div style="background: ${effect.color}20; padding: 1rem; border-radius: 8px; border-left: 4px solid ${effect.color};">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 28px;">${effect.icon}</span>
                        <strong style="font-size: 15px; color: ${effect.color};">${effect.name}</strong>
                    </div>
                    
                    <div style="font-size: 12px; margin-bottom: 0.5rem;">
                        <strong>Severidad: ${effect.severity}</strong>
                    </div>
                    
                    <div style="font-size: 13px; margin-bottom: 0.5rem; color: var(--text-medium);">
                        ${effect.description}
                    </div>
                    
                    ${effect.radius_km ? `<div style="font-size: 12px; margin-bottom: 0.5rem;"><strong>Radio afectado:</strong> ${effect.radius_km.toFixed(1)} km</div>` : ''}
                    ${effect.duration ? `<div style="font-size: 12px; margin-bottom: 0.5rem;"><strong>Duración:</strong> ${effect.duration}</div>` : ''}
                    ${effect.global_impact ? `<div style="font-size: 11px; padding: 0.4rem; background: rgba(255,0,0,0.2); border-radius: 4px; margin-bottom: 0.5rem;"><strong>🌍 IMPACTO GLOBAL</strong></div>` : ''}
                    
                    <div style="margin-top: 0.5rem; font-size: 11px;">
                        <strong>Efectos específicos:</strong>
                        <ul style="margin: 0.3rem 0 0 1rem; padding: 0;">
                            ${effect.effects.map(e => `<li style="margin: 0.2rem 0;">${e}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;  // ← ASEGÚRATE QUE ESTÁ AL FINAL
}

// ============================================
// BIODIVERSITY ANALYSIS (GBIF)
// ============================================

function generateFloraFaunaAnalysisHTML(floraFaunaData) {
    const analysis = floraFaunaData.impact_analysis;
    const floraSpecies = floraFaunaData.flora_species || [];
    const faunaSpecies = floraFaunaData.fauna_species || [];

    if (!analysis) return '';

    // Obtener colores según severidad - usando colores más neutros de la temática
    const severityColors = {
        'extinction_event': { bg: 'rgba(255, 68, 68, 0.15)', border: '#FF4444', text: '#FF4444' },
        'catastrophic': { bg: 'rgba(255, 68, 68, 0.15)', border: '#FF4444', text: '#FF4444' },
        'severe': { bg: 'rgba(255, 184, 77, 0.15)', border: '#FFB84D', text: '#FFB84D' },
        'moderate': { bg: 'rgba(0, 168, 232, 0.15)', border: '#00A8E8', text: '#00A8E8' },
        'minor': { bg: 'rgba(0, 230, 118, 0.15)', border: '#00E676', text: '#00E676' }
    };

    const severityColor = severityColors[analysis.impact_severity] || severityColors['moderate'];

    return `
<div style="background: rgba(0, 168, 232, 0.15); padding: 1.5rem; border-radius: 12px; border: 2px solid #00A8E8; margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0, 168, 232, 0.2);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <strong style="font-size: 18px; color: #00A8E8; display: flex; align-items: center; gap: 0.5rem;">
            IMPACTO EN BIODIVERSIDAD (GBIF)
        </strong>
        <div style="background: rgba(0, 168, 232, 0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 12px; color: #00A8E8;">
            Datos globales
        </div>
    </div>
    <hr style="border: none; height: 2px; background: linear-gradient(90deg, #00A8E8, transparent); margin: 0 0 1.5rem 0;">
    
    <!-- Severidad del Impacto -->
    <div style="background: ${severityColor.bg}; border-radius: 12px; padding: 1.2rem; border-left: 4px solid ${severityColor.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem;">
            <strong style="font-size: 16px; color: ${severityColor.text};">Severidad del Impacto Biológico</strong>
        </div>
        <div style="font-size: 20px; font-weight: 600; color: var(--text-light); margin-bottom: 0.5rem; text-transform: uppercase;">
            ${analysis.severity_description}
        </div>
        <div style="font-size: 14px; color: var(--text-medium); background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 6px;">
            <strong>Especies encontradas:</strong> ${analysis.total_species_found} (${analysis.flora_species_count} flora, ${analysis.fauna_species_count} fauna)
        </div>
    </div>
    
    <!-- Zonas de Impacto -->
    <div style="margin-bottom: 1.5rem;">
        <h4 style="color: #00A8E8; margin-bottom: 1rem; font-size: 16px;">Zonas de Impacto de la Explosión</h4>
        <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <div style="font-size: 14px; color: #B0B0B0; margin-bottom: 0.5rem;">
                <strong>Parámetros de la Explosión:</strong>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; font-size: 13px;">
                <div>Radio Destrucción: <strong style="color: #FF4444;">${analysis.explosion_parameters?.destruction_radius_km?.toFixed(2) || 'N/A'} km</strong></div>
                <div>Radio Daño: <strong style="color: #FFB84D;">${analysis.explosion_parameters?.damage_radius_km?.toFixed(2) || 'N/A'} km</strong></div>
                <div>Energía: <strong style="color: #00A8E8;">${analysis.explosion_parameters?.energy_megatons?.toFixed(1) || 'N/A'} MT</strong></div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            ${Object.entries(analysis.impact_zones).map(([zoneKey, zone]) => {
                const zoneColors = {
                    'total_destruction': { bg: 'rgba(255,68,68,0.15)', border: '#FF4444', text: '#FF4444' },
                    'severe_impact': { bg: 'rgba(255,184,77,0.15)', border: '#FFB84D', text: '#FFB84D' },
                    'moderate_impact': { bg: 'rgba(0,168,232,0.15)', border: '#00A8E8', text: '#00A8E8' },
                    'outer_effects': { bg: 'rgba(0,230,118,0.15)', border: '#00E676', text: '#00E676' }
                };
                const color = zoneColors[zoneKey] || zoneColors['moderate_impact'];
                
                return `
                    <div style="background: ${color.bg}; border-radius: 8px; padding: 1rem; border-left: 4px solid ${color.border};">
                        <div style="font-weight: 600; color: ${color.text}; margin-bottom: 0.5rem;">
                            ${zone.description}
                        </div>
                        <div style="font-size: 18px; font-weight: bold; color: var(--text-light);">
                            ${zone.mortality_percentage.toFixed(1)}% mortalidad
                        </div>
                        <div style="font-size: 14px; color: var(--text-medium);">
                            Radio: ${zone.radius_km.toFixed(2)} km
                        </div>
                        <div style="font-size: 12px; color: var(--text-medium); margin-top: 0.3rem;">
                            Área: ${zone.area_km2?.toFixed(1) || 'N/A'} km²
                        </div>
                        ${zone.organisms_affected ? `
                        <div style="font-size: 12px; color: var(--text-medium);">
                            Organismos: ${formatNumber(zone.organisms_affected)}
                        </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    </div>
    
    <!-- Análisis de Flora -->
    ${analysis.flora_impact ? `
    <div style="margin-bottom: 1.5rem;">
        <h4 style="color: #00A8E8; margin-bottom: 1rem; font-size: 16px;">Impacto en Flora</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            <div style="background: rgba(0, 168, 232, 0.15); border-radius: 8px; padding: 1rem; border-left: 4px solid #00A8E8;">
                <div style="font-weight: 600; color: #00A8E8; margin-bottom: 0.5rem;">Mortalidad Estimada</div>
                <div style="font-size: 24px; font-weight: bold; color: var(--text-light);">
                    ${analysis.flora_impact.estimated_mortality_percentage.toFixed(1)}%
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">
                    Tiempo de recuperación: ${analysis.flora_impact.recovery_time_years} años
                </div>
            </div>
            <div style="background: rgba(255, 68, 68, 0.15); border-radius: 8px; padding: 1rem; border-left: 4px solid #FF4444;">
                <div style="font-weight: 600; color: #FF4444; margin-bottom: 0.5rem;">Especies Vulnerables</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--text-light);">
                    ${analysis.flora_impact.vulnerable_species_mortality.toFixed(1)}% mortalidad
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">
                    Árboles grandes, plantas de crecimiento lento
                </div>
            </div>
            <div style="background: rgba(0, 230, 118, 0.15); border-radius: 8px; padding: 1rem; border-left: 4px solid #00E676;">
                <div style="font-weight: 600; color: #00E676; margin-bottom: 0.5rem;">Especies Resilientes</div>
                <div style="font-size: 18px; font-weight: bold; color: var(--text-light);">
                    ${analysis.flora_impact.resilient_species_mortality.toFixed(1)}% mortalidad
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">
                    Hierbas, musgos, líquenes
                </div>
            </div>
        </div>
        
        <!-- Factores de Impacto en Flora -->
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 8px;">
            <div style="font-weight: 600; color: #00A8E8; margin-bottom: 0.5rem;">Factores de Impacto:</div>
            <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-medium);">
                ${analysis.flora_impact.impact_factors.map(factor => `<li>${factor}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}
    
    <!-- Análisis de Fauna -->
    ${analysis.fauna_impact ? `
    <div style="margin-bottom: 1.5rem;">
        <h4 style="color: #00A8E8; margin-bottom: 1rem; font-size: 16px;">Impacto en Fauna</h4>
        <div class="results-grid">
            <div class="result-stat">
                <strong>Mortalidad Estimada:</strong><br>
                ${analysis.fauna_impact.estimated_mortality_percentage.toFixed(1)}%<br>
                <span style="font-size: 0.9em; color: #A0A0A0;">Tiempo recuperación: ${analysis.fauna_impact.recovery_time_years} años</span>
            </div>
            <div class="result-stat">
                <strong>Especies Vulnerables:</strong><br>
                ${analysis.fauna_impact.vulnerable_species_mortality.toFixed(1)}% mortalidad<br>
                <span style="font-size: 0.9em; color: #A0A0A0;">Anfibios, especies sésiles</span>
            </div>
            <div class="result-stat">
                <strong>Especies Móviles:</strong><br>
                ${analysis.fauna_impact.mobile_species_mortality.toFixed(1)}% mortalidad<br>
                <span style="font-size: 0.9em; color: #A0A0A0;">Aves, mamíferos</span>
            </div>
        </div>
    </div>
    ` : ''}
    
    <!-- Lista de Especies Encontradas -->
    <div style="margin-bottom: 1.5rem;">
        <h4 style="color: #00A8E8; margin-bottom: 1rem; font-size: 16px;">Especies Encontradas en el Área de Impacto</h4>
        
        <!-- Especies de Flora -->
        ${floraSpecies.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #00A8E8; margin-bottom: 0.8rem; font-size: 14px; font-weight: 600;">Flora (${floraSpecies.length} especies)</h5>
            <div style="background: rgba(0,0,0,0.1); border-radius: 8px; padding: 1rem; max-height: 300px; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.8rem;">
                    ${floraSpecies.slice(0, 20).map(species => `
                        <div style="background: rgba(0, 168, 232, 0.1); border-radius: 6px; padding: 0.8rem; border-left: 3px solid #00A8E8;">
                            <div style="font-weight: 600; color: var(--text-light); margin-bottom: 0.3rem;">
                                ${species.name || species.scientific_name || 'Especie sin nombre'}
                            </div>
                            ${species.scientific_name && species.scientific_name !== species.name ? `
                                <div style="font-size: 12px; color: var(--text-medium); font-style: italic; margin-bottom: 0.3rem;">
                                    ${species.scientific_name}
                                </div>
                            ` : ''}
                            <div style="font-size: 11px; color: var(--text-dim);">
                                ${species.family ? `Familia: ${species.family}` : ''}
                                ${species.family && species.class ? ' • ' : ''}
                                ${species.class ? `Clase: ${species.class}` : ''}
                            </div>
                            <div style="font-size: 11px; color: #00A8E8; margin-top: 0.3rem;">
                                Registros: ${species.count}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${floraSpecies.length > 20 ? `
                    <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: 6px; text-align: center;">
                        <span style="font-size: 12px; color: var(--text-medium);">
                            Mostrando 20 de ${floraSpecies.length} especies de flora encontradas
                        </span>
                    </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Especies de Fauna -->
        ${faunaSpecies.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
            <h5 style="color: #00A8E8; margin-bottom: 0.8rem; font-size: 14px; font-weight: 600;">Fauna (${faunaSpecies.length} especies)</h5>
            <div style="background: rgba(0,0,0,0.1); border-radius: 8px; padding: 1rem; max-height: 300px; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.8rem;">
                    ${faunaSpecies.slice(0, 20).map(species => `
                        <div style="background: rgba(255, 184, 77, 0.1); border-radius: 6px; padding: 0.8rem; border-left: 3px solid #FFB84D;">
                            <div style="font-weight: 600; color: var(--text-light); margin-bottom: 0.3rem;">
                                ${species.name || species.scientific_name || 'Especie sin nombre'}
                            </div>
                            ${species.scientific_name && species.scientific_name !== species.name ? `
                                <div style="font-size: 12px; color: var(--text-medium); font-style: italic; margin-bottom: 0.3rem;">
                                    ${species.scientific_name}
                                </div>
                            ` : ''}
                            <div style="font-size: 11px; color: var(--text-dim);">
                                ${species.family ? `Familia: ${species.family}` : ''}
                                ${species.family && species.class ? ' • ' : ''}
                                ${species.class ? `Clase: ${species.class}` : ''}
                            </div>
                            <div style="font-size: 11px; color: #FFB84D; margin-top: 0.3rem;">
                                Registros: ${species.count}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${faunaSpecies.length > 20 ? `
                    <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: 6px; text-align: center;">
                        <span style="font-size: 12px; color: var(--text-medium);">
                            Mostrando 20 de ${faunaSpecies.length} especies de fauna encontradas
                        </span>
                    </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Resumen de especies -->
        <div style="background: rgba(0, 168, 232, 0.1); border-radius: 8px; padding: 1rem; text-align: center;">
            <div style="font-size: 14px; color: #00A8E8; font-weight: 600;">
                Total de especies identificadas: ${floraSpecies.length + faunaSpecies.length}
            </div>
            <div style="font-size: 12px; color: var(--text-medium); margin-top: 0.3rem;">
                ${floraSpecies.length} especies de flora • ${faunaSpecies.length} especies de fauna
            </div>
        </div>
    </div>
    
    <!-- Estadísticas de Organismos Afectados -->
    ${analysis.estimated_casualties ? `
    <div style="margin-bottom: 1.5rem;">
        <h4 style="color: #00A8E8; margin-bottom: 1rem; font-size: 16px;">Organismos Afectados</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: rgba(0, 168, 232, 0.15); border-radius: 8px; padding: 1rem; text-align: center; border-left: 4px solid #00A8E8;">
                <div style="font-size: 24px; font-weight: bold; color: var(--text-light);">
                    ${formatNumber(analysis.estimated_casualties.total_organisms_affected.total_organisms)}
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">Total Organismos</div>
            </div>
            <div style="background: rgba(0, 168, 232, 0.15); border-radius: 8px; padding: 1rem; text-align: center; border-left: 4px solid #00A8E8;">
                <div style="font-size: 20px; font-weight: bold; color: var(--text-light);">
                    ${formatNumber(analysis.estimated_casualties.total_organisms_affected.estimated_flora_organisms)}
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">Plantas Afectadas</div>
            </div>
            <div style="background: rgba(255, 184, 77, 0.15); border-radius: 8px; padding: 1rem; text-align: center; border-left: 4px solid #FFB84D;">
                <div style="font-size: 20px; font-weight: bold; color: var(--text-light);">
                    ${formatNumber(analysis.estimated_casualties.total_organisms_affected.estimated_fauna_organisms)}
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">Animales Afectados</div>
            </div>
            <div style="background: rgba(0, 230, 118, 0.15); border-radius: 8px; padding: 1rem; text-align: center; border-left: 4px solid #00E676;">
                <div style="font-size: 20px; font-weight: bold; color: var(--text-light);">
                    ${analysis.estimated_casualties.total_organisms_affected.area_km2.toFixed(1)} km²
                </div>
                <div style="font-size: 12px; color: var(--text-medium);">Área Afectada</div>
            </div>
        </div>
    </div>
    ` : ''}
    
    <!-- Footer con fuente de datos -->
    <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(0, 168, 232, 0.1); border-radius: 8px; text-align: center;">
        <span style="font-size: 12px; color: #00A8E8;">
            <strong>Fuente:</strong> ${floraFaunaData.data_source}
        </span>
    </div>
</div>
`;
}

function getDataSourceLabel(key) {
    const labels = {
        'impact_calculations': 'Cálculos de Impacto',
        'seismic_correlation': 'Correlación Sísmica', 
        'elevation_data': 'Datos de Elevación',
        'orbital_data': 'Datos Orbitales',
        'population_data': 'Datos de Población'
    };
    return labels[key] || key;
}

function getTsunamiRiskColor(risk) {
    const colors = {
        'extreme': '#8B0000',
        'high': '#FF4444',
        'medium': '#FFB84D', 
        'low': '#FFC107',
        'minimal': '#00E676'
    };
    return colors[risk] || '#A0A0A0';
}

// Función para generar estimaciones de muertes y zonas destruidas
function generateCasualtyEstimates(calc, cities) {
    // Calcular radios de las zonas
    const destructionRadius = calc.destruction_radius_km;
    const damageRadius = calc.damage_radius_km;
    const airPressureRadius = damageRadius * 1.5;
    
    // Clasificar ciudades por zonas usando datos reales
    const citiesInDestructionZone = [];
    const citiesInDamageZone = [];
    const citiesInAirPressureZone = [];
    
    cities.forEach(city => {
        const distance = city.distancia_km || 999;
        
        if (distance <= destructionRadius) {
            citiesInDestructionZone.push(city);
        } else if (distance <= damageRadius) {
            citiesInDamageZone.push(city);
        } else if (distance <= airPressureRadius) {
            citiesInAirPressureZone.push(city);
        }
    });
    
    // Calcular estimaciones de muertes por zona
    const destructionDeaths = calculateZoneCasualties(citiesInDestructionZone, 'destruction', calc.energy_megatons_tnt);
    const damageDeaths = calculateZoneCasualties(citiesInDamageZone, 'damage', calc.energy_megatons_tnt);
    const airPressureDeaths = calculateZoneCasualties(citiesInAirPressureZone, 'airPressure', calc.energy_megatons_tnt);
    
    const totalDeaths = destructionDeaths.total + damageDeaths.total + airPressureDeaths.total;
    
    return `
        <div class="collapsible-section" data-section="casualties">
            <div class="section-header" onclick="toggleSection('casualties')">
                <strong style="font-size: 16px;">ESTIMACIÓN DE VÍCTIMAS Y DAÑOS</strong>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="section-content" id="casualties-content">
            
            <hr style="border-color: #3A3A3A; margin: 12px 0;">
            
            <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="text-align: center; font-size: 20px; color: var(--text-light); font-weight: bold;">
                    ESTIMACIÓN TOTAL DE VÍCTIMAS: ${formatNumber(totalDeaths)}
                </div>
                <div style="text-align: center; font-size: 12px; color: var(--text-secondary); margin-top: 0.5rem;">
                    Basado en modelos de impacto aerolítico y densidad poblacional
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                <!-- Zona de Destrucción Total -->
                <div class="result-stat" style="background: rgba(255,68,68,0.2); border-left-color: #FF4444;">
                    <strong style="color: #FF4444;">ZONA ROJA (0-${destructionRadius.toFixed(1)} km):</strong><br>
                    <span style="font-size: 18px; color: #FF4444;">${formatNumber(destructionDeaths.total)} víctimas mortales</span><br>
                    <span style="font-size: 12px; color: var(--text-secondary);">
                        ${destructionDeaths.cities} ciudades • 95-100% fatalidad
                    </span><br><br>
                    <strong style="color: #FF4444; font-size: 13px;">CIUDADES CRÍTICAS:</strong><br>
                    <div style="font-size: 11px; margin-top: 0.3rem;">
                        ${citiesInDestructionZone.length > 0 ? 
                            citiesInDestructionZone.slice(0, 3).map(city => 
                                `<div style="margin: 0.2rem 0;">• ${city.nombre} (${city.poblacion ? formatNumber(city.poblacion) : 'N/A'} hab.)</div>`
                            ).join('')
                            : '<div style="color: var(--text-secondary);">Sin ciudades en zona crítica</div>'
                        }
                    </div>
                </div>
                
                <!-- Zona de Daño Significativo -->
                <div class="result-stat" style="background: rgba(255,184,77,0.2); border-left-color: #FFB84D;">
                    <strong style="color: #FFB84D;">ZONA NARANJA (${destructionRadius.toFixed(1)}-${damageRadius.toFixed(1)} km):</strong><br>
                    <span style="font-size: 18px; color: #FFB84D;">${formatNumber(damageDeaths.total)} víctimas mortales</span><br>
                    <span style="font-size: 12px; color: var(--text-secondary);">
                        ${damageDeaths.cities} ciudades • 60-80% fatalidad
                    </span><br><br>
                    <strong style="color: #FFB84D; font-size: 13px;">CIUDADES AFECTADAS:</strong><br>
                    <div style="font-size: 11px; margin-top: 0.3rem;">
                        ${citiesInDamageZone.length > 0 ? 
                            citiesInDamageZone.slice(0, 3).map(city => 
                                `<div style="margin: 0.2rem 0;">• ${city.nombre} (${city.poblacion ? formatNumber(city.poblacion) : 'N/A'} hab.)</div><br>`
                            ).join('')
                            : '<div style="color: var(--text-secondary);">Sin ciudades afectadas</div>'
                        }
                    </div>
                </div>
                
                <!-- Zona de Ondas Atmosféricas -->
                <div class="result-stat" style="background: rgba(65,105,225,0.2); border-left-color: #4169E1;">
                    <strong style="color: #4169E1;">ZONA AZUL (${damageRadius.toFixed(1)}-${airPressureRadius.toFixed(1)} km):</strong><br>
                    <span style="font-size: 18px; color: #4169E1;">${formatNumber(airPressureDeaths.total)} víctimas mortales</span><br>
                    <span style="font-size: 12px; color: var(--text-secondary);">
                        ${airPressureDeaths.cities} ciudades • 10-25% fatalidad
                    </span><br><br>
                    <strong style="color: #4169E1; font-size: 13px;">CIUDADES EN RIESGO:</strong><br>
                    <div style="font-size: 11px; margin-top: 0.3rem;">
                        ${citiesInAirPressureZone.length > 0 ? 
                            citiesInAirPressureZone.slice(0, 3).map(city => 
                                `<div style="margin: 0.2rem 0;">• ${city.nombre} (${city.poblacion ? formatNumber(city.poblacion) : 'N/A'} hab.)</div>`
                            ).join('')
                            : '<div style="color: var(--text-secondary);">Sin ciudades en riesgo</div>'
                        }
                    </div>
                </div>
            </div>
            </div>
        </div>
    `;
}

// Función para calcular víctimas por zona
function calculateZoneCasualties(cities, zoneType, energyMegatons) {
    let totalDeaths = 0;
    let totalCities = cities.length;
    
    cities.forEach(city => {
        const population = parseInt(city.poblacion) || 0;
        
        if (population > 0) {
            let fatalityRate;
            switch (zoneType) {
                case 'destruction':
                    fatalityRate = 0.95; // 95% fatalidad en zona roja
                    break;
                case 'damage':
                    fatalityRate = 0.70; // 70% fatalidad en zona naranja
                    break;
                case 'airPressure':
                    fatalityRate = 0.15; // 15% fatalidad en zona azul
                    break;
                default:
                    fatalityRate = 0.20;
            }
            
            totalDeaths += Math.round(population * fatalityRate);
        }
    });
    
    return { total: totalDeaths, cities: totalCities };
}

// Función para alternar secciones minimizables
function toggleSection(sectionName) {
    const content = document.getElementById(sectionName + '-content');
    const icon = document.querySelector(`[data-section="${sectionName}"] .toggle-icon`);
    
    if (content && icon) {
        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            icon.textContent = '▼';
        } else {
            content.style.display = 'none';
            icon.textContent = '▶';
        }
    }
}

// ============================================
// KEYBOARD NAVIGATION (Accessibility)
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        // Submit on Enter in input fields
        const activeMode = document.querySelector('.mode-section.active');
        if (activeMode && activeMode.id === 'simulation-controls') {
            runImpactSimulation();
        }
    }
    
    // Cerrar modal con ESC
    if (e.key === 'Escape') {
        closeResultsModal();
    }
});

// Cerrar modal al hacer clic fuera
// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
    const modal = document.getElementById('results-modal');
    if (e.target === modal) {
        closeResultsModal();
    }
});  // ← AGREGAR ESTE CIERRE

// ============================================
// USGS INTEGRATION
// ============================================

function displayUSGSContext(usgsContext, result) {
    if (!usgsContext) return '';
    
    let usgsHTML = `
        <div class="collapsible-section" data-section="usgs-data">
            <div class="section-header" onclick="toggleSection('usgs-data')">
                <strong style="font-size: 16px;">CONTEXTO GEOGRÁFICO (USGS)</strong>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="section-content" id="usgs-data-content">
    `;
    
    if (usgsContext.elevation) {
        const elev = usgsContext.elevation;
        let terrainIcon = elev.is_oceanic ? '🌊' : '🏔️';
        let terrainColor = elev.is_oceanic ? '#4169E1' : '#4CAF50';
        let terrainBg = elev.is_oceanic ? 'rgba(65,105,225,0.15)' : 'rgba(76,175,80,0.15)';
        
        usgsHTML += `
            <div class="result-stat">
                <strong>Tipo de Terreno:</strong><br>
                ${elev.description}<br>
                <span style="font-size: 0.9em; color: #A0A0A0;">Elevación: ${elev.elevation_m.toFixed(1)} metros</span>
            </div>
        `;
    }
    
    if (usgsContext.seismic_history) {
        const seismic = usgsContext.seismic_history;
        usgsHTML += `
            <div class="result-stat">
                <strong>Historial Sísmico:</strong><br>
                ${seismic.count} sismos registrados<br>
        `;
        
        if (seismic.count > 0) {
            const impactMag = result.calculations.seismic_magnitude;
            usgsHTML += `
                <span style="font-size: 0.9em; color: #A0A0A0;">Máx: ${seismic.max_magnitude.toFixed(1)} | Promedio: ${seismic.avg_magnitude.toFixed(1)}</span><br>
                <span style="font-size: 0.9em; color: #FF4444;">Impacto: M ${impactMag.toFixed(1)}</span>
            `;
        } else {
            usgsHTML += `
                <span style="font-size: 0.9em; color: #A0A0A0;">Sin registros históricos</span>
            `;
        }
        usgsHTML += `</div>`;
    }
    
    // Agregar análisis de tsunami si está disponible
    if (result.tsunami_analysis && result.tsunami_analysis.tsunami_analysis) {
        const tsunamiData = result.tsunami_analysis.tsunami_analysis;
        usgsHTML += `
            <div class="result-stat">
                <strong>Análisis de Tsunami (NASA-NOAA):</strong><br>
                <span style="font-size: 16px; color: ${getTsunamiRiskColor(tsunamiData.tsunami_risk)}; text-transform: uppercase;">${tsunamiData.tsunami_risk}</span><br>
                <span style="font-size: 12px; color: #A0A0A0;">${tsunamiData.interpretation}</span>
            </div>
        `;
    }
    
    usgsHTML += `
            </div>
        </div>
    `;
    return usgsHTML;
}

function logUSGSData(usgsContext) {
    if (!usgsContext) return;
    
    console.log('═══════════════════════════════════════════');
    console.log('📊 DATOS USGS - CONTEXTO GEOGRÁFICO');
    console.log('═══════════════════════════════════════════');
    
    if (usgsContext.elevation) {
        console.log(`\n🏔️ Terreno: ${usgsContext.elevation.description}`);
        console.log(`   Elevación: ${usgsContext.elevation.elevation_m.toFixed(1)}m`);
    }
    
    if (usgsContext.seismic_history && usgsContext.seismic_history.count > 0) {
        console.log(`\n📈 Sismos: ${usgsContext.seismic_history.count}`);
        console.log(`   Magnitud máx: ${usgsContext.seismic_history.max_magnitude.toFixed(1)}`);
    }
    
    if (usgsContext.coastal_distance_km !== undefined) {
        console.log(`\n🌊 Distancia costa: ${usgsContext.coastal_distance_km === 0 ? 'OCEÁNICO' : usgsContext.coastal_distance_km.toFixed(1) + ' km'}`);
    }
    
    console.log('═══════════════════════════════════════════\n');
}

