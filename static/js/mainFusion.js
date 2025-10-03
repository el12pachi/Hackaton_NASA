@ -461,27 +461,27 @@ async function runImpactSimulation() {
    const maxRadius = Math.max(destructionRadius, damageRadius, airPressureRadius);
    
    try {
        const citiesResponse = await fetch('/api/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: params.latitude,
                longitude: params.longitude,
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
       })
   });
   
   const citiesData = await citiesResponse.json();
   if (citiesData.success) {
       result.cities = citiesData.cities;
            console.log(`✅ ${citiesData.cities.length} ciudades encontradas`);
        } else {
   } else {
            result.cities = [];
        }
    } catch (error) {
        console.warn('❌ Error obteniendo ciudades:', error);
        result.cities = [];
    }
       result.cities = [];
   }
    
    // 2. Correlación sísmica con USGS (opcional)
    try {
@ -530,6 +530,33 @@ async function runImpactSimulation() {
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
    
@ -1663,12 +1690,9 @@ function generateFullResultsHTML(result) {
const severity = result.severity;
const locationInfo = result.locationInfo || {};
const popData = locationInfo.populationData || {};
<<<<<<< Updated upstream
const usgsContext = result.usgs_context;
=======
const seismicData = result.seismic_analysis || null;
const tsunamiData = result.tsunami_analysis || null;
>>>>>>> Stashed changes

// Construir sección de población completa
let populationSection = '';
@ -1859,27 +1883,14 @@ function generateFullResultsHTML(result) {
            ${calc.damage_radius_km.toFixed(2)} km
        </div>
        
        <div class="result-stat">
            <strong>Riesgo de Tsunami:</strong><br>
            ${calc.tsunami.risk.toUpperCase()}<br>
            ${calc.tsunami.wave_height > 0 ? `Altura ola: ${calc.tsunami.wave_height}m` : 'No aplicable'}
        </div>
        
        ${seismicData ? `
            <div class="result-stat" style="background: rgba(255,193,7,0.1); border-left-color: #FFC107;">
                <strong>Magnitud Sísmica Equivalente:</strong><br>
                <span style="font-size: 18px; color: #FFC107;">M ${seismicData.impact_analysis.equivalent_seismic_magnitude}</span><br>
                <span style="font-size: 12px; color: #A0A0A0;">${seismicData.impact_analysis.interpretation}</span>
            </div>
        </div>
        ` : ''}
        
        ${tsunamiData && tsunamiData.tsunami_analysis ? `
            <div class="result-stat" style="background: rgba(33,150,243,0.1); border-left-color: #2196F3;">
                <strong>Análisis de Tsunami (NASA-NOAA):</strong><br>
                <span style="font-size: 16px; color: ${getTsunamiRiskColor(tsunamiData.tsunami_analysis.tsunami_risk)}; text-transform: uppercase;">${tsunamiData.tsunami_analysis.tsunami_risk}</span><br>
                <span style="font-size: 12px; color: #A0A0A0;">${tsunamiData.tsunami_analysis.interpretation}</span>
            </div>
        ` : ''}
        
        <div class="result-stat">
            <strong>Diámetro Asteroide:</strong><br>
@ -1900,11 +1911,306 @@ function generateFullResultsHTML(result) {
</div>

${generateCasualtyEstimates(calc, result.cities || [])}

${result.flora_fauna_analysis ? generateFloraFaunaAnalysisHTML(result.flora_fauna_analysis) : ''}
`;
}

// Funciones de análisis eliminadas - datos integrados en parámetros del impacto

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
@ -2122,7 +2428,7 @@ function displayUSGSContext(usgsContext, result) {
let usgsHTML = `
<div class="collapsible-section" data-section="usgs-data">
    <div class="section-header" onclick="toggleSection('usgs-data')">
        <strong style="font-size: 16px;">📊 CONTEXTO GEOGRÁFICO (USGS)</strong>
        <strong style="font-size: 16px;">CONTEXTO GEOGRÁFICO (USGS)</strong>
        <span class="toggle-icon">▼</span>
    </div>
    <div class="section-content" id="usgs-data-content">
@ -2131,14 +2437,14 @@ function displayUSGSContext(usgsContext, result) {
if (usgsContext.elevation) {
const elev = usgsContext.elevation;
let terrainIcon = elev.is_oceanic ? '🌊' : '🏔️';
let terrainColor = elev.is_oceanic ? '#4169E1' : '#4CAF50';
let terrainBg = elev.is_oceanic ? 'rgba(65,105,225,0.15)' : 'rgba(76,175,80,0.15)';

usgsHTML += `
    <div class="result-stat" style="background: ${elev.is_oceanic ? 'rgba(65,105,225,0.2)' : 'rgba(76,175,80,0.2)'}; border-left-color: ${elev.is_oceanic ? '#4169E1' : '#4CAF50'};">
        <strong>${terrainIcon} Tipo de Terreno:</strong><br>
        <span style="font-size: 18px;">${elev.description}</span><br>
        <span style="font-size: 14px; color: var(--text-medium);">
            Elevación: ${elev.elevation_m.toFixed(1)} metros
        </span>
    <div class="result-stat">
        <strong>Tipo de Terreno:</strong><br>
        ${elev.description}<br>
        <span style="font-size: 0.9em; color: #A0A0A0;">Elevación: ${elev.elevation_m.toFixed(1)} metros</span>
    </div>
`;
}
@ -2146,44 +2452,41 @@ function displayUSGSContext(usgsContext, result) {
if (usgsContext.seismic_history) {
const seismic = usgsContext.seismic_history;
usgsHTML += `
    <div class="result-stat" style="background: rgba(255,152,0,0.2); border-left-color: #FF9800; margin-top: 1rem;">
        <strong>📈 Historial Sísmico:</strong><br>
        <span style="font-size: 16px;">${seismic.count} sismos registrados</span><br>
    <div class="result-stat">
        <strong>Historial Sísmico:</strong><br>
        ${seismic.count} sismos registrados<br>
`;

if (seismic.count > 0) {
    const impactMag = result.calculations.seismic_magnitude;
    usgsHTML += `
        <span style="font-size: 14px; color: var(--text-medium);">
            Máx: ${seismic.max_magnitude.toFixed(1)} | Promedio: ${seismic.avg_magnitude.toFixed(1)}
        </span>
        <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,68,68,0.2); border-radius: 4px;">
            <span style="font-size: 12px;">
                Impacto generaría magnitud <strong>${impactMag.toFixed(1)}</strong>
                (${(impactMag - seismic.max_magnitude).toFixed(1)} puntos más fuerte)
            </span>
        </div>
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

if (usgsContext.coastal_distance_km !== undefined) {
const dist = usgsContext.coastal_distance_km;
let warning = dist === 0 ? '⚠️ IMPACTO OCEÁNICO - TSUNAMI GARANTIZADO' : 
              dist < 50 ? '⚠️ ZONA COSTERA - ALTO RIESGO' : 
              '✅ Zona interior - Tsunami improbable';

// Agregar análisis de tsunami si está disponible
if (result.tsunami_analysis && result.tsunami_analysis.tsunami_analysis) {
const tsunamiData = result.tsunami_analysis.tsunami_analysis;
usgsHTML += `
    <div class="result-stat" style="background: rgba(0,168,232,0.2); border-left-color: #00A8E8; margin-top: 1rem;">
        <strong>🌊 Distancia a Costa:</strong><br>
        <span style="font-size: 18px;">${dist === 0 ? 'Impacto oceánico' : dist.toFixed(1) + ' km'}</span><br>
        <span style="font-size: 13px;">${warning}</span>
    <div class="result-stat">
        <strong>Análisis de Tsunami (NASA-NOAA):</strong><br>
        <span style="font-size: 16px; color: ${getTsunamiRiskColor(tsunamiData.tsunami_risk)}; text-transform: uppercase;">${tsunamiData.tsunami_risk}</span><br>
        <span style="font-size: 12px; color: #A0A0A0;">${tsunamiData.interpretation}</span>
    </div>
`;
}

usgsHTML += `</div></div>`;
usgsHTML += `
    </div>
</div>
`;
return usgsHTML;
}

