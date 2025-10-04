/**
 * PDF GENERATOR - Improved version using backend API
 * NASA Hackathon 2025
 */

async function downloadSimulationPDF() {
    if (!currentFullResults) {
        showNotification('No hay datos de simulación para exportar', 'warning');
        return;
    }

    try {
        showNotification('Generando informe científico completo...', 'info');
        
        // Preparar todos los datos necesarios para el PDF
        const pdfData = {
            impact_data: {
                input: {
                    diameter_m: parseFloat(document.getElementById('diameter')?.value) || 0,
                    velocity_m_s: parseFloat(document.getElementById('velocity')?.value) * 1000 || 0, // Convertir km/s a m/s
                    angle_deg: parseFloat(document.getElementById('angle')?.value) || 45,
                    composition: document.getElementById('composition')?.value || 'rocky',
                    impact_location: {
                        lat: parseFloat(document.getElementById('latitude')?.value) || 0,
                        lon: parseFloat(document.getElementById('longitude')?.value) || 0
                    }
                },
                calculations: currentFullResults.calculations || {},
                composition_data: currentFullResults.composition_data || {},
                usgs_context: currentFullResults.usgs_context || {},
                secondary_effects: currentFullResults.secondary_effects || [],
                severity: currentFullResults.severity || {}
            },
            population_data: {
                total_population_affected: currentFullResults.locationInfo?.populationData?.totalPopulation || 0,
                casualties: currentFullResults.casualty_breakdown || {}
            },
            trajectory_data: {
                orbital_elements: currentFullResults.trajectory || {},
                minimum_earth_distance_km: currentFullResults.trajectory?.perihelion_au ? currentFullResults.trajectory.perihelion_au * 149597870.7 : 0,
                relative_velocity_kms: currentFullResults.trajectory?.orbital_velocity_kms || 0,
                approach_angle_deg: parseFloat(document.getElementById('angle')?.value) || 45
            },
            flora_fauna_data: currentFullResults.flora_fauna_analysis || {},
            mitigation_data: {
                primary_strategy: currentFullResults.mitigation_strategies?.primary_strategy || null,
                alternative_strategies: currentFullResults.mitigation_strategies?.alternative_strategies || []
            }
        };

        // Llamar al endpoint del backend
        const response = await fetch('/api/generate-scientific-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pdfData)
        });

        if (!response.ok) {
            throw new Error('Error al generar el PDF');
        }

        // Descargar el PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Informe_Impacto_Asteroidal_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('Informe científico descargado exitosamente', 'success');

    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar el informe. Intenta nuevamente.', 'error');
    }
}

