/**
 * ASTEROID IMPACT SIMULATOR - Main JavaScript
 * NASA Hackathon 2025
 */

// ============================================
// REWARDS SYSTEM
// ============================================

// Sistema de recompensas y logros
let rewardsSystem = {
    points: 0,
    achievements: [],
    simulations: 0,
    challenges: [],
    specialModes: {
        apocalypse: false,
        defender: false,
        scientist: false
    }
};

// Definir logros disponibles
const availableAchievements = [
    {
        id: 'first_simulation',
        title: 'Primera Simulación',
        description: 'Completa tu primera simulación',
        icon: '★',
        points: 10,
        condition: (data) => data.simulations >= 1
    },
    {
        id: 'big_impact',
        title: 'Impacto Masivo',
        description: 'Simula un impacto de más de 1000 MT',
        icon: '★',
        points: 25,
        condition: (data) => data.maxEnergy >= 1000
    },
    {
        id: 'city_destroyer',
        title: 'Destructor de Ciudades',
        description: 'Simula impacto en una ciudad',
        icon: '★',
        points: 30,
        condition: (data) => data.cityImpacts >= 1
    },
    {
        id: 'tsunami_master',
        title: 'Maestro del Tsunami',
        description: 'Simula un tsunami masivo',
        icon: '★',
        points: 20,
        condition: (data) => data.tsunamiSimulations >= 1
    },
    {
        id: 'defender_earth',
        title: 'Defensor de la Tierra',
        description: 'Usa estrategias de mitigación',
        icon: '★',
        points: 40,
        condition: (data) => data.mitigationAttempts >= 1
    },
    {
        id: 'scientist_mode',
        title: 'Modo Científico',
        description: 'Activa el modo científico',
        icon: '★',
        points: 50,
        condition: (data) => data.specialModes.scientist
    },
    {
        id: 'apocalypse_survivor',
        title: 'Superviviente del Apocalipsis',
        description: 'Activa el modo apocalipsis',
        icon: '★',
        points: 75,
        condition: (data) => data.specialModes.apocalypse
    },
    {
        id: 'simulation_master',
        title: 'Maestro de Simulaciones',
        description: 'Completa 10 simulaciones',
        icon: '★',
        points: 100,
        condition: (data) => data.simulations >= 10
    }
];

// Definir desafíos activos
const activeChallenges = [
    {
        id: 'daily_simulator',
        title: 'Simulador Diario',
        description: 'Completa 3 simulaciones hoy',
        icon: '▶',
        progress: 0,
        target: 3,
        reward: 50
    },
    {
        id: 'energy_explorer',
        title: 'Explorador de Energía',
        description: 'Simula impactos de diferentes energías',
        icon: '▶',
        progress: 0,
        target: 5,
        reward: 75
    },
    {
        id: 'location_master',
        title: 'Maestro de Ubicaciones',
        description: 'Simula impactos en 5 continentes diferentes',
        icon: '▶',
        progress: 0,
        target: 5,
        reward: 100
    }
];

// Inicializar sistema de recompensas
function initializeRewardsSystem() {
    // Cargar datos guardados
    const savedData = localStorage.getItem('rewardsSystem');
    if (savedData) {
        rewardsSystem = { ...rewardsSystem, ...JSON.parse(savedData) };
    }
    
    // Actualizar UI
    updateRewardsUI();
    
    // Configurar event listeners
    setupRewardsEventListeners();
}

// Configurar event listeners para el sistema de recompensas
function setupRewardsEventListeners() {
    // Botón de recompensas en el header
    const rewardsBtn = document.querySelector('[data-mode="rewards"]');
    if (rewardsBtn) {
        rewardsBtn.addEventListener('click', () => {
            openModal('rewards-modal');
        });
    }
    
    // Event listener del select de asteroides eliminado - ya no se usa el selector
    
    // Browse asteroids button
    const browseBtn = document.getElementById('browse-asteroids-btn');
    if (browseBtn) {
        browseBtn.addEventListener('click', openAsteroidsBrowser);
    }
}

// Abrir modal genérico
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Actualizar datos si es el modal de recompensas
        if (modalId === 'rewards-modal') {
            updateRewardsUI();
        }
    }
}

// Cerrar modal genérico
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Actualizar UI de recompensas
function updateRewardsUI() {
    // Actualizar estadísticas
    document.getElementById('total-points').textContent = rewardsSystem.points;
    document.getElementById('achievements-count').textContent = rewardsSystem.achievements.length;
    document.getElementById('simulations-count').textContent = rewardsSystem.simulations;
    
    // Actualizar logros
    updateAchievementsGrid();
    
    // Actualizar desafíos
    updateChallengesList();
    
    // Guardar datos
    saveRewardsData();
}

// Actualizar grid de logros
function updateAchievementsGrid() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    availableAchievements.forEach(achievement => {
        const isUnlocked = rewardsSystem.achievements.includes(achievement.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-desc">${achievement.description}</div>
            <div class="achievement-points">${achievement.points} pts</div>
        `;
        
        grid.appendChild(card);
    });
}

// Actualizar lista de desafíos
function updateChallengesList() {
    const list = document.getElementById('challenges-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    activeChallenges.forEach(challenge => {
        const progressPercent = (challenge.progress / challenge.target) * 100;
        
        const item = document.createElement('div');
        item.className = 'challenge-item';
        
        item.innerHTML = `
            <div class="challenge-icon">${challenge.icon}</div>
            <div class="challenge-content">
                <div class="challenge-title">${challenge.title}</div>
                <div class="challenge-desc">${challenge.description}</div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-medium); margin-top: 0.25rem;">
                    ${challenge.progress}/${challenge.target} - Recompensa: ${challenge.reward} pts
                </div>
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Activar modo especial
function activateSpecialMode(mode) {
    rewardsSystem.specialModes[mode] = true;
    
    // Aplicar efectos del modo
    switch(mode) {
        case 'apocalypse':
            showNotification('Modo Apocalipsis activado! Asteroides masivos disponibles.', 'warning');
            // Ajustar rangos para asteroides masivos
            document.getElementById('diameter').max = 5000;
            document.getElementById('velocity').max = 100;
            break;
        case 'defender':
            showNotification('Modo Defensor activado! Enfoque en mitigación.', 'info');
            // Cambiar a modo mitigación
            switchToMode('mitigation');
            break;
        case 'scientist':
            showNotification('Modo Científico activado! Datos precisos habilitados.', 'success');
            // Mostrar datos adicionales
            break;
    }
    
    // Verificar logros
    checkAchievements();
    updateRewardsUI();
}

// Activar modo desafío
function activateChallengeMode() {
    showNotification('Modo Desafío activado! Completa objetivos para ganar puntos.', 'info');
    // Implementar lógica de desafíos específicos
}

// Verificar y desbloquear logros
function checkAchievements() {
    const currentData = {
        simulations: rewardsSystem.simulations,
        maxEnergy: rewardsSystem.maxEnergy || 0,
        cityImpacts: rewardsSystem.cityImpacts || 0,
        tsunamiSimulations: rewardsSystem.tsunamiSimulations || 0,
        mitigationAttempts: rewardsSystem.mitigationAttempts || 0,
        specialModes: rewardsSystem.specialModes
    };
    
    availableAchievements.forEach(achievement => {
        if (!rewardsSystem.achievements.includes(achievement.id) && achievement.condition(currentData)) {
            unlockAchievement(achievement);
        }
    });
}

// Desbloquear logro
function unlockAchievement(achievement) {
    rewardsSystem.achievements.push(achievement.id);
    rewardsSystem.points += achievement.points;
    
    showNotification(`Logro desbloqueado: ${achievement.title}! +${achievement.points} puntos`, 'success');
    
    // Efecto visual
    createAchievementEffect(achievement);
}

// Crear efecto visual para logro
function createAchievementEffect(achievement) {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        font-size: 1.5rem;
        font-weight: bold;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        animation: achievementPop 2s ease-out forwards;
    `;
    
    effect.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 1rem;">${achievement.icon}</div>
        <div>${achievement.title}</div>
        <div style="font-size: 1rem; margin-top: 0.5rem; opacity: 0.9;">+${achievement.points} puntos</div>
    `;
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        document.body.removeChild(effect);
    }, 2000);
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Guardar datos de recompensas
function saveRewardsData() {
    localStorage.setItem('rewardsSystem', JSON.stringify(rewardsSystem));
}

// Registrar simulación
function recordSimulation(energy, location, hasTsunami, hasMitigation) {
    rewardsSystem.simulations++;
    rewardsSystem.sessionSimulations = (rewardsSystem.sessionSimulations || 0) + 1;
    
    if (energy > (rewardsSystem.maxEnergy || 0)) {
        rewardsSystem.maxEnergy = energy;
    }
    
    if (location && location.city) {
        rewardsSystem.cityImpacts = (rewardsSystem.cityImpacts || 0) + 1;
    }
    
    if (location && location.ocean) {
        rewardsSystem.oceansImpacted = (rewardsSystem.oceansImpacted || 0) + 1;
    }
    
    if (hasTsunami) {
        rewardsSystem.tsunamiSimulations = (rewardsSystem.tsunamiSimulations || 0) + 1;
    }
    
    if (energy > 100) { // Simulaciones de alta energía pueden causar terremotos
        rewardsSystem.earthquakeSimulations = (rewardsSystem.earthquakeSimulations || 0) + 1;
    }
    
    if (energy > 1000) { // Simulaciones masivas pueden causar efectos climáticos
        rewardsSystem.climateEffects = (rewardsSystem.climateEffects || 0) + 1;
    }
    
    // Detectar continentes (simplificado)
    if (location && location.country) {
        const continent = getContinentFromCountry(location.country);
        if (continent && !rewardsSystem.exploredContinents) {
            rewardsSystem.exploredContinents = [];
        }
        if (continent && !rewardsSystem.exploredContinents.includes(continent)) {
            rewardsSystem.exploredContinents.push(continent);
            rewardsSystem.continentsExplored = rewardsSystem.exploredContinents.length;
        }
    }
    
    if (hasMitigation) {
        rewardsSystem.mitigationAttempts = (rewardsSystem.mitigationAttempts || 0) + 1;
    }
    
    // Actualizar progreso de desafíos
    updateChallengeProgress();
    
    // Verificar logros
    checkAchievements();
    updateRewardsUI();
    
    // Guardar datos
    saveRewardsData();
}

// Función auxiliar para determinar continente (simplificada)
function getContinentFromCountry(country) {
    const continentMap = {
        'United States': 'North America',
        'Canada': 'North America',
        'Mexico': 'North America',
        'Brazil': 'South America',
        'Argentina': 'South America',
        'Chile': 'South America',
        'Spain': 'Europe',
        'France': 'Europe',
        'Germany': 'Europe',
        'China': 'Asia',
        'Japan': 'Asia',
        'India': 'Asia',
        'Australia': 'Oceania',
        'New Zealand': 'Oceania',
        'South Africa': 'Africa',
        'Egypt': 'Africa',
        'Nigeria': 'Africa'
    };
    
    return continentMap[country] || 'Unknown';
}

// Actualizar progreso de desafíos
function updateChallengeProgress() {
    // Desafío diario
    const today = new Date().toDateString();
    if (rewardsSystem.lastSimulationDate !== today) {
        rewardsSystem.lastSimulationDate = today;
        rewardsSystem.dailySimulations = 0;
    }
    rewardsSystem.dailySimulations = (rewardsSystem.dailySimulations || 0) + 1;
    
    // Actualizar desafíos
    activeChallenges.forEach(challenge => {
        switch(challenge.id) {
            case 'daily_simulator':
                challenge.progress = rewardsSystem.dailySimulations || 0;
                break;
            case 'energy_explorer':
                challenge.progress = Math.min(challenge.progress + 1, challenge.target);
                break;
            case 'location_master':
                // Lógica para diferentes continentes
                break;
        }
    });
}

// ============================================
// ADDITIONAL MODALS FUNCTIONALITY
// ============================================

// Tutorial functionality
let currentTutorialStep = 1;
const totalTutorialSteps = 4;

function nextTutorialStep() {
    if (currentTutorialStep < totalTutorialSteps) {
        document.querySelector(`[data-step="${currentTutorialStep}"]`).classList.remove('active');
        currentTutorialStep++;
        document.querySelector(`[data-step="${currentTutorialStep}"]`).classList.add('active');
        document.getElementById('tutorial-progress').textContent = `${currentTutorialStep} de ${totalTutorialSteps}`;
    }
}

function previousTutorialStep() {
    if (currentTutorialStep > 1) {
        document.querySelector(`[data-step="${currentTutorialStep}"]`).classList.remove('active');
        currentTutorialStep--;
        document.querySelector(`[data-step="${currentTutorialStep}"]`).classList.add('active');
        document.getElementById('tutorial-progress').textContent = `${currentTutorialStep} de ${totalTutorialSteps}`;
    }
}

// Settings functionality
function saveSettings() {
    const settings = {
        theme: document.getElementById('theme-select').value,
        language: document.getElementById('language-select').value,
        precision: document.getElementById('precision-select').value,
        technicalData: document.getElementById('technical-data').checked,
        nasaApiKey: document.getElementById('nasa-api-key').value,
        dataCache: document.getElementById('data-cache').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    showNotification('Configuración guardada exitosamente', 'success');
    
    // Apply settings
    applySettings(settings);
}

function resetSettings() {
    const defaultSettings = {
        theme: 'dark',
        language: 'es',
        precision: 'medium',
        technicalData: true,
        nasaApiKey: '',
        dataCache: true
    };
    
    document.getElementById('theme-select').value = defaultSettings.theme;
    document.getElementById('language-select').value = defaultSettings.language;
    document.getElementById('precision-select').value = defaultSettings.precision;
    document.getElementById('technical-data').checked = defaultSettings.technicalData;
    document.getElementById('nasa-api-key').value = defaultSettings.nasaApiKey;
    document.getElementById('data-cache').checked = defaultSettings.dataCache;
    
    showNotification('Configuración restablecida', 'info');
}

function applySettings(settings) {
    // Apply theme
    if (settings.theme !== 'auto') {
        document.documentElement.setAttribute('data-theme', settings.theme);
        localStorage.setItem('theme', settings.theme);
    }
    
    // Apply language
    if (window.i18n && settings.language) {
        window.i18n.setLanguage(settings.language);
    }
}

// Stats functionality
function updateStatsModal() {
    const stats = {
        totalSimulations: rewardsSystem.simulations || 0,
        sessionSimulations: rewardsSystem.sessionSimulations || 0,
        maxEnergy: rewardsSystem.maxEnergy || 0,
        continentsExplored: rewardsSystem.continentsExplored || 0,
        citiesImpacted: rewardsSystem.cityImpacts || 0,
        oceansImpacted: rewardsSystem.oceansImpacted || 0,
        tsunamisSimulated: rewardsSystem.tsunamiSimulations || 0,
        earthquakesSimulated: rewardsSystem.earthquakeSimulations || 0,
        climateEffects: rewardsSystem.climateEffects || 0
    };
    
    document.getElementById('total-simulations').textContent = stats.totalSimulations;
    document.getElementById('session-simulations').textContent = stats.sessionSimulations;
    document.getElementById('max-energy').textContent = `${stats.maxEnergy} MT`;
    document.getElementById('continents-explored').textContent = stats.continentsExplored;
    document.getElementById('cities-impacted').textContent = stats.citiesImpacted;
    document.getElementById('oceans-impacted').textContent = stats.oceansImpacted;
    document.getElementById('tsunamis-simulated').textContent = stats.tsunamisSimulated;
    document.getElementById('earthquakes-simulated').textContent = stats.earthquakesSimulated;
    document.getElementById('climate-effects').textContent = stats.climateEffects;
}

function exportStats() {
    const stats = {
        totalSimulations: rewardsSystem.simulations || 0,
        maxEnergy: rewardsSystem.maxEnergy || 0,
        achievements: rewardsSystem.achievements.length,
        points: rewardsSystem.points,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `asteroid-simulator-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Estadísticas exportadas exitosamente', 'success');
}

// Asteroid search functionality
function searchAsteroid() {
    const searchTerm = document.getElementById('asteroid-search-input').value.trim();
    if (!searchTerm) {
        showNotification('Por favor ingresa un término de búsqueda', 'warning');
        return;
    }
    
    showNotification('Buscando asteroides...', 'info');
    
    // Simulate asteroid search (in a real implementation, this would call the NASA API)
    setTimeout(() => {
        const mockAsteroids = [
            {
                id: '2000001',
                name: 'Ceres',
                diameter: 950000,
                velocity: 17.9,
                composition: 'rocky',
                hazardous: false
            },
            {
                id: '2000002',
                name: 'Pallas',
                diameter: 512000,
                velocity: 20.6,
                composition: 'metallic',
                hazardous: false
            },
            {
                id: '2000003',
                name: 'Juno',
                diameter: 267000,
                velocity: 18.1,
                composition: 'rocky',
                hazardous: false
            }
        ];
        
        displayAsteroidList(mockAsteroids);
        showNotification('Búsqueda completada', 'success');
    }, 1000);
}

function displayAsteroidList(asteroids) {
    const container = document.getElementById('asteroid-list');
    container.innerHTML = '';
    
    asteroids.forEach(asteroid => {
        const item = document.createElement('div');
        item.className = 'asteroid-item';
        item.onclick = () => showAsteroidDetails(asteroid);
        
        item.innerHTML = `
            <div class="asteroid-name">${asteroid.name}</div>
            <div style="font-size: 0.875rem; color: var(--text-medium);">
                ID: ${asteroid.id} | Diámetro: ${(asteroid.diameter / 1000).toFixed(1)} km
            </div>
            <div style="font-size: 0.75rem; color: var(--text-medium); margin-top: 0.25rem;">
                Velocidad: ${asteroid.velocity} km/s | ${asteroid.hazardous ? 'Peligroso' : 'Seguro'}
            </div>
        `;
        
        container.appendChild(item);
    });
}

function showAsteroidDetails(asteroid) {
    const detailsContainer = document.getElementById('asteroid-details');
    detailsContainer.style.display = 'block';
    
    detailsContainer.innerHTML = `
        <h3>${asteroid.name}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div>
                <strong>ID NASA:</strong><br>
                ${asteroid.id}
            </div>
            <div>
                <strong>Diámetro:</strong><br>
                ${(asteroid.diameter / 1000).toFixed(1)} km
            </div>
            <div>
                <strong>Velocidad:</strong><br>
                ${asteroid.velocity} km/s
            </div>
            <div>
                <strong>Composición:</strong><br>
                ${asteroid.composition === 'rocky' ? 'Rocoso' : asteroid.composition === 'metallic' ? 'Metálico' : 'Carbonáceo'}
            </div>
            <div>
                <strong>Estado:</strong><br>
                ${asteroid.hazardous ? 'Potencialmente Peligroso' : 'No Peligroso'}
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <button class="btn-primary" onclick="useAsteroidInSimulation('${asteroid.id}')">
                Usar en Simulación
            </button>
        </div>
    `;
}

// Función obsoleta eliminada - se usa useAsteroidFromList o la versión sin parámetros

// ============================================
// ASTEROIDS BROWSER FUNCTIONALITY
// ============================================

// Variable para almacenar datos de asteroides
let currentAsteroidData = null;

function openAsteroidsBrowser() {
    if (!currentAsteroidData || !currentAsteroidData.asteroids || currentAsteroidData.asteroids.length === 0) {
        alert('No hay asteroides cargados. Por favor espera un momento.');
        return;
    }
    
    const modal = document.getElementById('asteroids-browser-modal');
    const listContent = document.getElementById('asteroids-list-content');
    
    // Generar lista de asteroides
    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    
    currentAsteroidData.asteroids.forEach((asteroid, index) => {
        const avgDiameter = (asteroid.diameter_min_m + asteroid.diameter_max_m) / 2;
        const isDangerous = asteroid.is_hazardous;
        const dangerIcon = isDangerous ? '!' : '✓';
        const dangerColor = isDangerous ? '#FF4444' : '#4CAF50';
        const dangerText = isDangerous ? 'PELIGROSO' : 'Seguro';
        
        // Icon según tamaño
        let sizeIcon = '●';
        if (avgDiameter >= 500) sizeIcon = '●●●';
        else if (avgDiameter >= 300) sizeIcon = '●●';
        else if (avgDiameter >= 100) sizeIcon = '●';
        else if (avgDiameter >= 50) sizeIcon = '○';
        
        html += `
            <div style="
                background: var(--card-bg);
                border: 2px solid var(--border-color);
                border-radius: 8px;
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: all 0.3s;
                cursor: pointer;
            " onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='var(--border-color)'">
                
                <!-- Icono de tamaño -->
                <div style="font-size: 2.5rem; flex-shrink: 0;">
                    ${sizeIcon}
                </div>
                
                <!-- Información principal -->
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${asteroid.name}
                    </div>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.9rem; color: var(--text-secondary);">
                        <span>${Math.round(avgDiameter)}m</span>
                        <span>${asteroid.velocity_km_s.toFixed(1)} km/s</span>
                        <span style="color: ${dangerColor}; font-weight: 600;">${dangerIcon} ${dangerText}</span>
                    </div>
                </div>
                
                <!-- Botones de acción -->
                <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                    <button 
                        onclick="useAsteroidFromList(${index}); event.stopPropagation();"
                        style="
                            background: var(--primary-color);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            padding: 0.6rem 1.2rem;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.2s;
                        "
                        onmouseover="this.style.transform='scale(1.05)'"
                        onmouseout="this.style.transform='scale(1)'"
                        title="Selecionar"
                    >
                        Selecionar
                    </button>
                    <button 
                        onclick="showAsteroidDetail(${index}); event.stopPropagation();"
                        style="
                            background: transparent;
                            color: var(--primary-color);
                            border: 2px solid var(--primary-color);
                            border-radius: 6px;
                            padding: 0.6rem 1.2rem;
                            cursor: pointer;
                            font-weight: 600;
                            transition: all 0.2s;
                        "
                        onmouseover="this.style.background='var(--primary-color)'; this.style.color='white';"
                        onmouseout="this.style.background='transparent'; this.style.color='var(--primary-color)';"
                        title="Ver información completa"
                    >
                        Mas información
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    listContent.innerHTML = html;
    
    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAsteroidsBrowser() {
    const modal = document.getElementById('asteroids-browser-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

function useAsteroidFromList(index) {
    const asteroid = currentAsteroidData.asteroids[index];
    const avgDiameter = (asteroid.diameter_min_m + asteroid.diameter_max_m) / 2;
    
    // Guardar índice y datos completos del asteroide seleccionado
    window.selectedAsteroidIndex = index;
    window.selectedAsteroidData = asteroid;
    
    // Cargar datos en los controles
    document.getElementById('diameter').value = Math.round(avgDiameter);
    document.getElementById('velocity').value = asteroid.velocity_km_s;
    document.getElementById('angle').value = 45; // Ángulo por defecto
    
    // Actualizar el campo de texto con el nombre del asteroide
    const asteroidNameInput = document.getElementById('asteroid-name');
    const asteroidIdInput = document.getElementById('selected-asteroid-id');
    if (asteroidNameInput) {
        asteroidNameInput.value = `${asteroid.name} (${Math.round(avgDiameter)}m, ${asteroid.velocity_km_s} km/s)`;
        
        // Agregar efecto visual de selección
        asteroidNameInput.style.transition = 'all 0.3s ease';
        asteroidNameInput.style.borderColor = 'var(--success)';
        asteroidNameInput.style.boxShadow = '0 0 0 3px rgba(0, 230, 118, 0.2)';
        
        setTimeout(() => {
            asteroidNameInput.style.borderColor = '';
            asteroidNameInput.style.boxShadow = '';
        }, 1500);
    }
    if (asteroidIdInput) {
        asteroidIdInput.value = asteroid.id;
    }
    
    // Actualizar displays de los sliders
    const diameterDisplay = document.getElementById('diameter-value');
    const velocityDisplay = document.getElementById('velocity-value');
    const angleDisplay = document.getElementById('angle-value');
    
    if (diameterDisplay) {
        diameterDisplay.textContent = Math.round(avgDiameter) + ' m';
    }
    if (velocityDisplay) {
        velocityDisplay.textContent = asteroid.velocity_km_s + ' km/s';
    }
    if (angleDisplay) {
        angleDisplay.textContent = '45°';
    }
    
    // Cerrar todos los modales de asteroides que puedan estar abiertos
    closeAsteroidsBrowser();
    closeAsteroidDetail();
    
    // Mostrar notificación
    showNotification(`Asteroide "${asteroid.name}" cargado en la simulación`, 'success');
}

function showAsteroidDetail(index) {
    const asteroid = currentAsteroidData.asteroids[index];
    const avgDiameter = (asteroid.diameter_min_m + asteroid.diameter_max_m) / 2;
    
    const modal = document.getElementById('asteroid-detail-modal');
    const title = document.getElementById('asteroid-detail-title');
    const content = document.getElementById('asteroid-detail-content');
    
    title.textContent = asteroid.name;
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                <strong>Diámetro</strong><br>
                ${Math.round(asteroid.diameter_min_m)}m - ${Math.round(asteroid.diameter_max_m)}m<br>
                <span style="color: var(--text-secondary);">Promedio: ${Math.round(avgDiameter)}m</span>
            </div>
            <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                <strong>Velocidad</strong><br>
                ${asteroid.velocity_km_s.toFixed(2)} km/s
            </div>
            <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid ${asteroid.is_hazardous ? '#FF4444' : '#4CAF50'};">
                <strong>Estado</strong><br>
                ${asteroid.is_hazardous ? 'PELIGROSO' : 'Seguro'}
            </div>
            <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                <strong>Última Observación</strong><br>
                ${asteroid.last_obs_date || 'N/A'}
            </div>
        </div>
        
        <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>Información Orbital</strong><br>
            <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                ${asteroid.orbital_data ? `
                    Período orbital: ${asteroid.orbital_data.orbital_period || 'N/A'}<br>
                    Excentricidad: ${asteroid.orbital_data.eccentricity || 'N/A'}<br>
                    Inclinación: ${asteroid.orbital_data.inclination || 'N/A'}°
                ` : 'Datos orbitales no disponibles'}
            </div>
        </div>
        
        <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px;">
            <strong>Datos Técnicos</strong><br>
            <div style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                ID NASA: ${asteroid.nasa_jpl_url ? asteroid.nasa_jpl_url.split('/').pop() : 'N/A'}<br>
                Magnitud absoluta: ${asteroid.absolute_magnitude_h || 'N/A'}<br>
                Albedo: ${asteroid.albedo || 'N/A'}
            </div>
        </div>
    `;
    
    // Guardar índice para usar en simulación
    window.selectedAsteroidIndex = index;
    
    // Mostrar modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAsteroidDetail() {
    const modal = document.getElementById('asteroid-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

function useAsteroidInSimulation() {
    if (window.selectedAsteroidIndex !== undefined) {
        useAsteroidFromList(window.selectedAsteroidIndex);
        // No es necesario cerrar aquí, useAsteroidFromList ya cierra todos los modales
    }
}

// ============================================
// MODE SWITCHING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    
    // Asegurar que todos los modales estén ocultos al inicio
    const modals = document.querySelectorAll('.results-modal');
    modals.forEach(modal => {
        if (modal) {
            modal.style.display = 'none';
        }
    });
    
    // Asegurar que solo la sección de simulación esté visible al inicio
    const allControlSections = document.querySelectorAll('.controls-section');
    allControlSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const simulationControls = document.getElementById('simulation-controls');
    if (simulationControls) {
        simulationControls.style.display = 'flex';
        simulationControls.classList.add('active');
    }
    
    // Aplicar traducciones iniciales (español por defecto)
    if (window.i18n) {
        window.i18n.setLanguage('es');
    }
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Setup mode switching
    setupModeSwitching();
    
    // Setup simulation mode
    setupSimulationMode();
    
    // Setup mitigation mode
    setupMitigationMode();
    
    // Initialize rewards system
    initializeRewardsSystem();
    
    // Load asteroids from NASA
    loadNEOData();
    
    // Setup location search
    setupLocationSearch();
    
    // Setup map location search
    setupMapLocationSearch();
    
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

// ============================================
// LOCATION SEARCH
// ============================================

function setupLocationSearch() {
    const searchInput = document.getElementById('location-search');
    const searchBtn = document.getElementById('search-location-btn');
    const resultsDiv = document.getElementById('location-search-results');
    const currentLocationText = document.getElementById('current-location-text');
    
    if (!searchInput || !searchBtn) return;
    
    // Buscar al hacer clic en el botón
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchLocation(query);
        }
    });
    
    // Buscar al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchLocation(query);
            }
        }
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target) && !searchBtn.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });
}

async function searchLocation(query) {
    const resultsDiv = document.getElementById('location-search-results');
    const searchBtn = document.getElementById('search-location-btn');
    
    try {
        // Cambiar botón a estado de carga
        const originalText = searchBtn.textContent;
        searchBtn.textContent = 'Buscando...';
        searchBtn.disabled = true;
        
        // Usar Nominatim de OpenStreetMap para geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
            {
                headers: {
                    'User-Agent': 'AsteroidImpactSimulator/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }
        
        const results = await response.json();
        
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
                    No se encontraron resultados para "${query}"
                </div>
            `;
            resultsDiv.style.display = 'block';
        } else {
            displaySearchResults(results);
        }
        
        // Restaurar botón
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
        
    } catch (error) {
        console.error('Error buscando ubicación:', error);
        resultsDiv.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: var(--danger-color);">
                Error al buscar. Intenta de nuevo.
            </div>
        `;
        resultsDiv.style.display = 'block';
        
        // Restaurar botón
        searchBtn.textContent = 'Buscar';
        searchBtn.disabled = false;
    }
}

function displaySearchResults(results) {
    const resultsDiv = document.getElementById('location-search-results');
    
    resultsDiv.innerHTML = results.map((result, index) => {
        const displayName = result.display_name;
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const type = result.type || 'lugar';
        
        return `
            <div 
                class="location-result-item" 
                onclick="selectLocation(${lat}, ${lon}, '${displayName.replace(/'/g, "\\'")}', ${index})"
                style="
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-color);
                    transition: background 0.2s;
                "
                onmouseover="this.style.background='var(--hover-bg)'"
                onmouseout="this.style.background='transparent'"
            >
                <div style="font-weight: 600; margin-bottom: 0.25rem; color: var(--text-light);">
                    ${result.name || displayName.split(',')[0]}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${displayName}
                </div>
                <div style="font-size: 0.7rem; color: var(--text-medium); margin-top: 0.25rem;">
                    ${type.charAt(0).toUpperCase() + type.slice(1)} • ${lat.toFixed(4)}°, ${lon.toFixed(4)}°
                </div>
            </div>
        `;
    }).join('');
    
    resultsDiv.style.display = 'block';
}

function selectLocation(lat, lon, displayName, index) {
    const resultsDiv = document.getElementById('location-search-results');
    const currentLocationText = document.getElementById('current-location-text');
    const searchInput = document.getElementById('location-search');
    
    // Ocultar resultados
    resultsDiv.style.display = 'none';
    
    // Actualizar display de ubicación actual
    const shortName = displayName.split(',').slice(0, 2).join(',');
    currentLocationText.textContent = shortName;
    currentLocationText.style.color = 'var(--primary-color)';
    currentLocationText.style.fontWeight = '600';
    
    // Limpiar input de búsqueda
    searchInput.value = '';
    
    // Animar el mapa hacia la ubicación
    if (impactMap) {
        impactMap.flyTo([lat, lon], 12, {
            duration: 2,
            easeLinearity: 0.25
        });
    }
    
    // Actualizar los campos de latitud y longitud
    document.getElementById('latitude').value = lat.toFixed(4);
    document.getElementById('longitude').value = lon.toFixed(4);
    
    // Agregar un marcador temporal en la ubicación
    if (window.L && impactMap) {
        // Remover marcador anterior si existe
        if (window.tempLocationMarker) {
            impactMap.removeLayer(window.tempLocationMarker);
        }
        
        // Crear nuevo marcador
        window.tempLocationMarker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'temp-location-marker',
                html: '<div style="background: var(--primary-color); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(impactMap);
        
        // Remover el marcador después de 3 segundos
        setTimeout(() => {
            if (window.tempLocationMarker && impactMap) {
                impactMap.removeLayer(window.tempLocationMarker);
                window.tempLocationMarker = null;
            }
        }, 3000);
    }
    
    console.log(`Ubicación seleccionada: ${displayName} (${lat}, ${lon})`);
}

// ============================================
// MAP LOCATION SEARCH (Control en el mapa)
// ============================================

function setupMapLocationSearch() {
    const searchInput = document.getElementById('map-location-search');
    const searchBtn = document.getElementById('map-search-location-btn');
    const resultsDiv = document.getElementById('map-location-search-results');
    
    if (!searchInput || !searchBtn) return;
    
    // Buscar al hacer clic en el botón
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMapLocation(query);
        }
    });
    
    // Buscar al presionar Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchMapLocation(query);
            }
        }
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.map-search-container')) {
            resultsDiv.style.display = 'none';
        }
    });
}

async function searchMapLocation(query) {
    const resultsDiv = document.getElementById('map-location-search-results');
    const searchBtn = document.getElementById('map-search-location-btn');
    
    try {
        // Cambiar botón a estado de carga
        const originalText = searchBtn.textContent;
        searchBtn.textContent = 'Buscando...';
        searchBtn.disabled = true;
        
        console.log(`Buscando ubicación: ${query}`);
        
        // Usar Nominatim API para búsqueda de ubicaciones
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const results = await response.json();
        
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="search-result-item" style="padding: 1rem; text-align: center; color: var(--text-secondary);">
                    No se encontraron resultados para "${query}"
                </div>
            `;
        } else {
            displayMapSearchResults(results);
        }
        
        resultsDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Error buscando ubicación:', error);
        resultsDiv.innerHTML = `
            <div class="search-result-item" style="padding: 1rem; text-align: center; color: var(--danger-color);">
                Error al buscar. Intenta de nuevo.
            </div>
        `;
        resultsDiv.style.display = 'block';
    } finally {
        // Restaurar botón
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
    }
}

function displayMapSearchResults(results) {
    const resultsDiv = document.getElementById('map-location-search-results');
    
    resultsDiv.innerHTML = results.map((result, index) => {
        const displayName = result.display_name;
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Extraer información relevante
        const city = result.address?.city || result.address?.town || result.address?.village || '';
        const state = result.address?.state || result.address?.county || '';
        const country = result.address?.country || '';
        
        let locationDetails = '';
        if (city) locationDetails += city;
        if (state && state !== city) locationDetails += (locationDetails ? ', ' : '') + state;
        if (country && country !== state) locationDetails += (locationDetails ? ', ' : '') + country;
        
        return `
            <div class="search-result-item" onclick="selectMapLocation(${lat}, ${lon}, '${displayName.replace(/'/g, "\\'")}', ${index})">
                <div class="search-result-name">${displayName}</div>
                <div class="search-result-details">${locationDetails}</div>
            </div>
        `;
    }).join('');
}

function selectMapLocation(lat, lon, displayName, index) {
    const resultsDiv = document.getElementById('map-location-search-results');
    const searchInput = document.getElementById('map-location-search');
    
    // Ocultar resultados
    resultsDiv.style.display = 'none';
    
    // Actualizar el input con el nombre seleccionado
    searchInput.value = displayName;
    
    // Actualizar los campos de coordenadas
    document.getElementById('latitude').value = lat.toFixed(4);
    document.getElementById('longitude').value = lon.toFixed(4);
    
    // Animar el mapa hacia la ubicación
    if (impactMap) {
        impactMap.flyTo([lat, lon], 12, {
            duration: 2,
            easeLinearity: 0.25
        });
    }
    
    console.log(`Ubicación seleccionada: ${displayName} (${lat}, ${lon})`);
}

function updateCurrentLocationDisplay(locationInfo) {
    const currentLocationText = document.getElementById('current-location-text');
    if (currentLocationText && locationInfo) {
        const displayText = `${locationInfo.city || 'Ubicación'}, ${locationInfo.country || 'desconocido'}`;
        currentLocationText.textContent = displayText;
        currentLocationText.style.color = 'var(--text-secondary)';
        currentLocationText.style.fontWeight = 'normal';
    }
}

function updateMapTheme(theme) {
    if (!impactMap) return;
    
    // No actualizar si el usuario está viendo una capa satélite
    // Verificar si la capa actual es satélite comprobando su URL
    const isSatelliteView = currentTileLayer && 
        (currentTileLayer._url?.includes('World_Imagery') || 
         currentTileLayer instanceof L.LayerGroup);
    
    if (isSatelliteView) {
        // Si está en vista satélite, no cambiar la capa
        return;
    }
    
    // Solo cambiar si está en vista normal
    if (currentTileLayer) {
    impactMap.removeLayer(currentTileLayer);
    }
    
    // Add new tile layer based on theme
    if (theme === 'dark') {
        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2,
            noWrap: true  // Evita que el mapa se repita horizontalmente
        });
    } else {
        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2,
            noWrap: true  // Evita que el mapa se repita horizontalmente
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
            
            // Ocultar el Bento dashboard si está visible
            const bentoDashboard = document.querySelector('.bento-dashboard');
            if (bentoDashboard && bentoDashboard.classList.contains('show')) {
                bentoDashboard.classList.remove('show');
            }
            
            // Obtener todas las secciones de controles
            const allControlSections = document.querySelectorAll('.controls-section');
            
            // Ocultar TODAS las secciones primero y limpiar estilos forzados
            allControlSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
                // Limpiar cualquier estilo forzado por showBentoDashboard
                section.style.visibility = '';
                section.style.opacity = '';
                section.style.pointerEvents = '';
            });
            
            // Mostrar solo la sección correspondiente
            if (mode === 'simulation') {
                const simulationControls = document.getElementById('simulation-controls');
                if (simulationControls) {
                    simulationControls.classList.add('active');
                    simulationControls.style.display = 'flex';
                    simulationControls.style.visibility = 'visible';
                    simulationControls.style.opacity = '1';
                    simulationControls.style.pointerEvents = 'auto';
                    console.log('Mostrando controles de simulación');
                }
            } else if (mode === 'mitigation') {
                const mitigationControls = document.getElementById('mitigation-controls');
                if (mitigationControls) {
                    mitigationControls.classList.add('active');
                    mitigationControls.style.display = 'flex';
                    mitigationControls.style.visibility = 'visible';
                    mitigationControls.style.opacity = '1';
                    mitigationControls.style.pointerEvents = 'auto';
                    console.log('Mostrando controles de mitigación');
                }
            }
        });
    });
}

// ============================================
// SIMULATION MODE
// ============================================

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
    
    // Asteroid name field - make it open the browser when clicked
    const asteroidNameInput = document.getElementById('asteroid-name');
    const browseBtn = document.getElementById('browse-asteroids-btn');
    if (asteroidNameInput && browseBtn) {
        asteroidNameInput.addEventListener('click', () => {
            browseBtn.click();
        });
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

// Función handleAsteroidSelection eliminada - ahora se usa el explorador de asteroides para seleccionar

// Función eliminada - interfaz simplificada

// Función eliminada - interfaz simplificada
function displayNasaAsteroidData_ELIMINADA(data) {
    console.log('Datos de la NASA cargados:', data);
    
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
                <h2 style="color: #00A8E8; margin: 0;">Datos Científicos de la NASA</h2>
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
                    <h4 style="color: #FFC107; margin: 0 0 0.5rem 0;">Parámetros Físicos</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Diámetro:</strong> ${diameter !== 'N/A' ? diameter.toFixed(0) + ' m' : 'N/A'}<br>
                        <strong>Albedo:</strong> ${data.albedo || 'N/A'}<br>
                        <strong>Período de rotación:</strong> ${data.rotation_period_h ? data.rotation_period_h + ' h' : 'N/A'}<br>
                        <strong>Magnitud absoluta:</strong> ${data.absolute_magnitude || 'N/A'}
                    </div>
                </div>
                
                <div style="background: rgba(0,230,118,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #00E676;">
                    <h4 style="color: #00E676; margin: 0 0 0.5rem 0;">Elementos Orbitales</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Semieje mayor:</strong> ${orbital.semi_major_axis_au ? orbital.semi_major_axis_au.toFixed(3) + ' AU' : 'N/A'}<br>
                        <strong>Excentricidad:</strong> ${orbital.eccentricity || 'N/A'}<br>
                        <strong>Inclinación:</strong> ${orbital.inclination_deg ? orbital.inclination_deg.toFixed(2) + '°' : 'N/A'}<br>
                        <strong>Período orbital:</strong> ${orbital.orbital_period_days ? orbital.orbital_period_days.toFixed(0) + ' días' : 'N/A'}
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(156,39,176,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #9C27B0;">
                <h4 style="color: #9C27B0; margin: 0 0 0.5rem 0;">Parámetros de Impacto Estimados</h4>
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
                    Usar estos datos en la simulación
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
    console.log('Datos de la NASA NEO API cargados:', asteroid);
    
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
                <h2 style="color: #00A8E8; margin: 0;">Datos de la NASA NEO API</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: #A0A0A0; font-size: 24px; cursor: pointer; padding: 0; margin-left: auto;">×</button>
            </div>
            
            <div style="background: rgba(255,193,7,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="color: #FFC107; margin: 0 0 0.5rem 0;">Datos Limitados</h3>
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
                    <h4 style="color: #FFC107; margin: 0 0 0.5rem 0;">Parámetros Físicos</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Diámetro mínimo:</strong> ${asteroid.diameter_min_m.toFixed(0)} m<br>
                        <strong>Diámetro máximo:</strong> ${asteroid.diameter_max_m.toFixed(0)} m<br>
                        <strong>Diámetro promedio:</strong> ${avgDiameter.toFixed(0)} m<br>
                        <strong>Potencialmente peligroso:</strong> ${asteroid.is_hazardous ? 'SÍ' : 'No'}
                    </div>
                </div>
                
                <div style="background: rgba(0,230,118,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #00E676;">
                    <h4 style="color: #00E676; margin: 0 0 0.5rem 0;">Parámetros de Aproximación</h4>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <strong>Velocidad relativa:</strong> ${asteroid.velocity_km_s.toFixed(2)} km/s<br>
                        <strong>Distancia de fallo:</strong> ${asteroid.miss_distance_km.toLocaleString()} km<br>
                        <strong>Fecha de acercamiento:</strong> ${asteroid.approach_date}<br>
                        <strong>Masa estimada:</strong> ${formatNumber((4/3) * Math.PI * Math.pow(avgDiameter/2, 3) * 3000)} kg
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(156,39,176,0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #9C27B0;">
                <h4 style="color: #9C27B0; margin: 0 0 0.5rem 0;">Parámetros de Impacto Estimados</h4>
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
                    Usar estos datos en la simulación
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
    
    console.log(`Datos de ${asteroidId} aplicados a la simulación`);
}

async function loadNEOData() {
    try {
        console.log('Cargando datos de asteroides de la NASA...');
        
        const response = await fetch('/api/neo/recent');
        const data = await response.json();
        
        if (data.success && data.asteroids && data.asteroids.length > 0) {
            currentAsteroidData = data;
            console.log(`Cargados ${data.count} asteroides de la NASA (disponibles en el explorador)`);
        } else {
            throw new Error(data.message || 'No se pudieron obtener datos de asteroides');
        }
    } catch (error) {
        console.error('Error cargando datos de la NASA:', error);
        // Los datos se cargarán dinámicamente al abrir el explorador si no están disponibles
    }
}

// Función populateAsteroidSelector eliminada - ya no se usa el selector, se usa el explorador de asteroides

async function runImpactSimulation() {
    // Obtener datos del asteroide seleccionado
    let asteroidData = window.selectedAsteroidData || null;
    
    // Log para debug
    if (asteroidData) {
        console.log('🪨 Asteroide seleccionado para animación 3D:', {
            nombre: asteroidData.name,
            diametro_min: asteroidData.diameter_min_m,
            diametro_max: asteroidData.diameter_max_m,
            velocidad: asteroidData.velocity_km_s
        });
    }
    
    // Mostrar pantalla de carga con animación 3D
    showLoading(true, asteroidData);
    
    try {
        const params = {
            diameter: parseFloat(document.getElementById('diameter').value),
            velocity: parseFloat(document.getElementById('velocity').value) * 1000,
            angle: parseFloat(document.getElementById('angle').value),
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            composition: document.getElementById('composition').value  // NUEVO
        };
        
        
        // Actualizar progreso: Enviando datos al servidor
        if (typeof updateProgressBar === 'function') {
            updateProgressBar(10, 'Enviando datos al servidor...');
        }
        
        const response = await fetch('/api/simulate/impact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        
        // Actualizar progreso: Procesando datos del servidor
        if (typeof updateProgressBar === 'function') {
            updateProgressBar(30, 'Procesando datos del servidor...');
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Datos de API recibidos - PROCESANDO todos los datos...');
            console.log('🔄 Asteroide sigue orbitando mientras se procesan los datos...');
            
            // Actualizar progreso: Datos recibidos
            if (typeof updateProgressBar === 'function') {
                updateProgressBar(50, 'Datos recibidos - Preparando simulación...');
            }
            
            // PRIMERO: Procesar TODOS los datos mientras el asteroide orbita
            await processAllSimulationData(result, params);
            
            console.log('✅ TODOS los datos procesados - activando secuencia de impacto...');
            
            // SEGUNDO: Ahora que TODO está listo, activar el impacto
            if (typeof triggerImpact3D === 'function') {
                // Configurar callback para mostrar resultados después del impacto
                window.onImpactComplete3D = function() {
                    console.log('💥 Impacto completado - mostrando resultados...');
                    displayProcessedResults();
                    window.onImpactComplete3D = null;
                };
                
                triggerImpact3D();
            } else {
                // Si no hay animación 3D, mostrar resultados inmediatamente
                displayProcessedResults();
            }
        } else {
            alert('Error en la simulación: ' + result.error);
            // En caso de error, ocultar el loading manualmente
            showLoading(false);
        }
    } catch (error) {
        console.error('Simulation error:', error);
        alert('Error al ejecutar la simulación');
        // En caso de error, ocultar el loading manualmente
        showLoading(false);
    }
    // No hay finally porque el loading se oculta automáticamente después del impacto
}

// Variable global para almacenar resultados procesados
let processedSimulationData = null;

// ============================================
// SISTEMA DE PROGRESO DE CARGA
// ============================================
function updateLoadingProgress(progress, step, statusText = null) {
    const progressBar = document.getElementById('progress-bar');
    const statusTextEl = document.getElementById('loading-status-text');
    const stepElement = document.querySelector(`.loading-step[data-step="${step}"]`);
    
    // Actualizar barra de progreso
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Actualizar texto de estado
    if (statusText && statusTextEl) {
        statusTextEl.textContent = statusText;
    }
    
    // Actualizar paso actual
    if (stepElement) {
        // Marcar paso anterior como completado
        document.querySelectorAll('.loading-step').forEach(s => {
            if (s !== stepElement && s.classList.contains('active')) {
                s.classList.remove('active');
                s.classList.add('completed');
                s.querySelector('.step-icon').textContent = '✅';
                s.querySelector('.step-status').textContent = 'Completado';
            }
        });
        
        // Activar paso actual
        stepElement.classList.add('active');
        stepElement.querySelector('.step-icon').textContent = '⏳';
        stepElement.querySelector('.step-status').textContent = 'En progreso...';
    }
    
    console.log(`📊 Progreso: ${progress}% - ${step} - ${statusText || ''}`);
}

function completeLoadingStep(step) {
    const stepElement = document.querySelector(`.loading-step[data-step="${step}"]`);
    if (stepElement) {
        stepElement.classList.remove('active');
        stepElement.classList.add('completed');
        stepElement.querySelector('.step-icon').textContent = '✅';
        stepElement.querySelector('.step-status').textContent = 'Completado';
    }
}

// Nueva función para procesar TODOS los datos (sin mostrarlos aún)
async function processAllSimulationData(result, params) {
            // Iniciar progreso - Paso 1: Cálculos básicos
            updateLoadingProgress(25, 'impact', 'Calculando impacto...');
            
            
            // Extract data from the result object - more robust mapping
            const getValue = (paths, defaultValue = 0) => {
                for (const path of paths) {
                    const value = path.split('.').reduce((obj, key) => obj?.[key], result);
                    if (value !== undefined && value !== null && value !== 0) {
                        return value;
                    }
                }
                return defaultValue;
            };
            
            const simulationData = {
                impactEnergy: getValue([
                    'calculations.energy_megatons_tnt',
                    'energy_megatons_tnt',
                    'calculations.impact_energy_mt',
                    'impact_energy_mt', 
                    'calculations.energy_mt',
                    'energy_mt'
                ]),
                craterDiameter: getValue([
                    'calculations.crater_diameter_m',
                    'crater_diameter_m',
                    'calculations.crater_diameter_km',
                    'crater_diameter_km'
                ]),
                affectedPopulation: (() => {
                    console.log(' Searching for population data...');
                    
                    // First try direct paths
                    const directValue = getValue([
                        'population_affected',
                        'affected_population',
                        'calculations.population_affected',
                        'calculations.affected_population',
                        'severity.population_affected',
                        'severity.affected_population',
                        'input.population_affected',
                        'input.affected_population',
                        'usgs_context.population_affected',
                        'usgs_context.affected_population'
                    ]);
                    console.log(' Direct population value:', directValue);
                    
                    if (directValue > 0) {
                        console.log(' Found population in direct paths:', directValue);
                        return directValue;
                    }
                    
                    // Then try secondary effects
                    if (result.secondary_effects && Array.isArray(result.secondary_effects)) {
                        console.log(' Searching in secondary effects...');
                        for (let i = 0; i < result.secondary_effects.length; i++) {
                            const effect = result.secondary_effects[i];
                            console.log(` Effect ${i}:`, effect);
                            console.log(` Effect ${i} keys:`, Object.keys(effect));
                            console.log(` Effect ${i} population_affected:`, effect.population_affected);
                            console.log(` Effect ${i} affected_population:`, effect.affected_population);
                            
                            // Look for any key containing 'population' or 'people'
                            const populationKeys = Object.keys(effect).filter(key => 
                                key.toLowerCase().includes('population') || 
                                key.toLowerCase().includes('people') ||
                                key.toLowerCase().includes('inhabitants')
                            );
                            if (populationKeys.length > 0) {
                                console.log(` Effect ${i} population-related keys:`, populationKeys);
                                populationKeys.forEach(key => {
                                    console.log(` Effect ${i} ${key}:`, effect[key]);
                                });
                            }
                            
                            // Check the effects array for population data
                            if (effect.effects && Array.isArray(effect.effects)) {
                                console.log(` Effect ${i} effects array:`, effect.effects);
                                effect.effects.forEach((subEffect, j) => {
                                    console.log(` Effect ${i} sub-effect ${j}:`, subEffect);
                                    if (subEffect && typeof subEffect === 'object') {
                                        const subKeys = Object.keys(subEffect);
                                        console.log(` Effect ${i} sub-effect ${j} keys:`, subKeys);
                                        
                                        // Look for population in sub-effects
                                        const subPopulationKeys = subKeys.filter(key => 
                                            key.toLowerCase().includes('population') || 
                                            key.toLowerCase().includes('people') ||
                                            key.toLowerCase().includes('inhabitants') ||
                                            key.toLowerCase().includes('affected')
                                        );
                                        if (subPopulationKeys.length > 0) {
                                            console.log(` Effect ${i} sub-effect ${j} population keys:`, subPopulationKeys);
                                            subPopulationKeys.forEach(key => {
                                                console.log(` Effect ${i} sub-effect ${j} ${key}:`, subEffect[key]);
                                            });
                                        }
                                    }
                                });
                            }
                            
                            if (effect.population_affected && effect.population_affected > 0) {
                                console.log(' Found population in effect:', effect.population_affected);
                                return effect.population_affected;
                            }
                            if (effect.affected_population && effect.affected_population > 0) {
                                console.log(' Found population in effect:', effect.affected_population);
                                return effect.affected_population;
                            }
                        }
                    }
                    
                    // Finally, try to search in USGS context more thoroughly
                    if (result.usgs_context) {
                        console.log(' Searching in USGS context...');
                        const searchInObject = (obj, path = '') => {
                            for (const key in obj) {
                                if (obj.hasOwnProperty(key)) {
                                    const currentPath = path ? `${path}.${key}` : key;
                                    const value = obj[key];
                                    
                                    if (typeof value === 'object' && value !== null) {
                                        searchInObject(value, currentPath);
                                    } else if (typeof value === 'number' && value > 0 && 
                                               (key.toLowerCase().includes('population') || 
                                                key.toLowerCase().includes('people') ||
                                                key.toLowerCase().includes('inhabitants') ||
                                                key.toLowerCase().includes('affected'))) {
                                        console.log(` Found population in USGS: ${currentPath} = ${value}`);
                                        return value;
                                    }
                                }
                            }
                            return 0;
                        };
                        
                        const usgsPopulation = searchInObject(result.usgs_context);
                        if (usgsPopulation > 0) {
                            return usgsPopulation;
                        }
                    }
                    
                    console.log('❌ No population data found');
                    return 0;
                })(),
                impactProbability: Math.min(100, Math.max(0, getValue([
                    'calculations.energy_megatons_tnt',
                    'energy_megatons_tnt',
                    'calculations.impact_energy_mt',
                    'impact_energy_mt'
                ]) / 100 * 100)),
                asteroidSpeed: params.velocity / 1000,
                destructionRadius: getValue([
                    'calculations.destruction_radius_km',
                    'destruction_radius_km',
                    'calculations.destruction_radius',
                    'destruction_radius'
                ]) * 1000,
                tsunamiRisk: (() => {
                    // Get real tsunami risk from backend calculations
                    const tsunamiData = getValue(['calculations.tsunami', 'tsunami']);
                    if (tsunamiData && typeof tsunamiData === 'object') {
                        return tsunamiData.risk || 'Bajo';
                    }
                    
                    // Check if impact is oceanic
                    if (result.usgs_context && result.usgs_context.elevation) {
                        const isOceanic = result.usgs_context.elevation.is_oceanic;
                        const coastalDistance = result.usgs_context.coastal_distance_km || 999;
                        
                        if (isOceanic) {
                            return 'Extremo';
                        } else if (coastalDistance < 50) {
                            return 'Alto';
                        } else if (coastalDistance < 200) {
                            return 'Medio';
                        }
                    }
                    
                    return 'Bajo';
                })(),
                seismicMagnitude: getValue([
                    'calculations.seismic_magnitude',
                    'seismic_magnitude',
                    'calculations.magnitude',
                    'magnitude'
                ]),
                mostAffectedFauna: 'Cargando...',
                mostAffectedFlora: 'Cargando...'
            };
            
            //Completar cálculos básicos
            completeLoadingStep('impact');
            
            // Get population data BEFORE showing dashboard
            updateLoadingProgress(50, 'population', 'Analizando población...');
            if (typeof updateProgressBar === 'function') {
                updateProgressBar(60, 'Analizando población afectada...');
            }
            
            const destructionRadius = result.calculations.destruction_radius_km;
            const damageRadius = result.calculations.damage_radius_km;
            const airPressureRadius = damageRadius * 1.5;
            const maxRadius = Math.max(destructionRadius, damageRadius, airPressureRadius);
            
            let populationData = { totalPopulation: 0 };
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
                
                if (citiesData.success && citiesData.totalPopulation) {
                    populationData = citiesData;
                } else {
                    console.error('❌ No population data in Overpass response');
                }
            } catch (error) {
                console.warn('❌ Error obteniendo población:', error);
                console.warn('❌ Error details:', error.message);
            }
            
            // Analyze terrain type FIRST to determine population calculation method
            const isOceanic = result.usgs_context?.elevation?.is_oceanic || false;
            const terrainType = result.usgs_context?.elevation?.terrain_type || 'unknown';
            const coastalDistance = result.usgs_context?.coastal_distance_km || 999;
            
            console.log('🔍 Análisis de ubicación para población:');
            console.log(`   Oceánico: ${isOceanic}`);
            console.log(`   Tipo terreno: ${terrainType}`);
            console.log(`   Distancia costa: ${coastalDistance.toFixed(1)} km`);
            
            // For oceanic impacts, ALWAYS use minimal population (ships/platforms)
            if (isOceanic) {
                // Ocean impact: very low population (only ships, platforms)
                // Usar SOLO el radio de DESTRUCCIÓN DIRECTA, no el de daño
                const destructionAreaKm2 = Math.PI * Math.pow(destructionRadius, 2);
                
                // Densidad de barcos según características del océano
                // En océano abierto hay MUY pocos barcos
                let shipDensity = 0.001; // 1 barco cada 1000 km² en océano abierto
                
                // Si está cerca de rutas comerciales (cerca de costa)
                if (coastalDistance < 50) {
                    shipDensity = 0.01; // 1 barco cada 100 km² en rutas costeras
                } else if (coastalDistance < 200) {
                    shipDensity = 0.005; // 1 barco cada 200 km² en rutas medias
                }
                
                const estimatedShips = Math.round(destructionAreaKm2 * shipDensity);
                const peoplePerShip = 20; // average crew
                
                // Población mínima: casi siempre 0 en océano abierto
                simulationData.affectedPopulation = Math.max(0, estimatedShips * peoplePerShip);
                
                console.log('🌊 Impacto oceánico detectado');
                console.log(`   Área de destrucción directa: ${destructionAreaKm2.toFixed(1)} km²`);
                console.log(`   Distancia a costa: ${coastalDistance.toFixed(1)} km`);
                console.log(`   Densidad de barcos: ${shipDensity} barcos/km²`);
                console.log(`   Barcos estimados en área: ${estimatedShips}`);
                console.log(`   Población estimada: ${simulationData.affectedPopulation} personas`);
            }
            // For land impacts, use Overpass data if available
            else if (populationData.totalPopulation && populationData.totalPopulation > 0) {
                simulationData.affectedPopulation = populationData.totalPopulation;
                console.log(`✅ Población obtenida de Overpass: ${simulationData.affectedPopulation.toLocaleString()} personas`);
            }
            // Fallback: Estimate based on terrain type
            else {
                let populationDensityFactor = 1.0; // Default multiplier
                
                if (terrainType === 'desert') {
                    populationDensityFactor = 0.01; // 1% of normal - desiertos casi vacíos
                    console.log('🏜️ Impacto en desierto - densidad muy baja');
                } else if (terrainType === 'mountain_high') {
                    populationDensityFactor = 0.05; // 5% of normal - montañas muy despobladas
                    console.log('⛰️ Impacto en montañas - densidad muy baja');
                } else if (terrainType === 'forest' || terrainType === 'vegetation') {
                    populationDensityFactor = 0.1; // 10% of normal - bosques poco poblados
                    console.log('🌲 Impacto en zona forestal - densidad baja');
                } else if (coastalDistance < 50) {
                    populationDensityFactor = 3.0; // 300% of normal - costas muy pobladas
                    console.log('🏖️ Impacto cerca de costa - densidad alta');
                } else if (coastalDistance < 200) {
                    populationDensityFactor = 1.5; // 150% of normal
                    console.log('🏞️ Impacto cercano a costa - densidad media-alta');
                } else {
                    populationDensityFactor = 0.5; // 50% of normal - interior continental
                    console.log('🏞️ Impacto en zona terrestre interior - densidad media');
                }
                
                // USAR SOLO ÁREA DE DESTRUCCIÓN DIRECTA, NO ZONA DE DAÑO
                // El damageRadius es demasiado grande y sobrestima la población
                const destructionAreaKm2 = Math.PI * Math.pow(destructionRadius, 2);
                
                // Densidad típica rural: 50 personas/km² (más realista)
                const typicalDensity = 50; // persons per km² (rural average)
                const estimatedPopulation = Math.round(destructionAreaKm2 * typicalDensity * populationDensityFactor);
                
                // Cap más bajo: 1M personas máximo en estimación
                simulationData.affectedPopulation = Math.min(estimatedPopulation, 1000000);
                console.log(`🔧 Población estimada por terreno: ${simulationData.affectedPopulation.toLocaleString()} personas`);
                console.log(`   Área de DESTRUCCIÓN: ${destructionAreaKm2.toFixed(1)} km²`);
                console.log(`   Densidad base: ${typicalDensity} personas/km²`);
                console.log(`   Factor de terreno: ${populationDensityFactor}x`);
                console.log(`   Densidad final: ${(typicalDensity * populationDensityFactor).toFixed(1)} personas/km²`);
            }
            
            console.log(' Processed Dashboard Data (initial):', simulationData);
            
            // Completar población
            completeLoadingStep('population');
            updateLoadingProgress(75, 'flora-fauna', 'Identificando especies...');
            if (typeof updateProgressBar === 'function') {
                updateProgressBar(75, 'Identificando especies afectadas...');
            }
            
        if (result.usgs_context) {
            // logUSGSData(result.usgs_context);  // Comentado temporalmente
            console.log(' USGS Context:', result.usgs_context);
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
                        console.log(' Análisis sísmico obtenido del USGS');
                    }
                }
            } catch (error) {
                console.warn(' No se pudo obtener análisis sísmico del USGS:', error);
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
                            console.log(' Análisis de tsunami obtenido de NASA-NOAA');
                        }
                    }
                } catch (error) {
                    console.warn(' No se pudo obtener análisis de tsunami de NASA-NOAA:', error);
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
                        console.log(' Análisis de flora y fauna obtenido de GBIF');
                        console.log(` ${floraFaunaData.flora_species.length} especies de flora encontradas`);
                        console.log(` ${floraFaunaData.fauna_species.length} especies de fauna encontradas`);
                        
                        // Actualizar dashboard con datos reales de fauna y flora - MEJORADO
                        const floraSpecies = floraFaunaData.flora_species || [];
                        const faunaSpecies = floraFaunaData.fauna_species || [];
                        
                        console.log('🔍 Procesando especies para mostrar más relevantes:');
                        console.log(`   Total fauna: ${faunaSpecies.length}`);
                        console.log(`   Total flora: ${floraSpecies.length}`);
                        
                        // Función para seleccionar la especie más representativa
                        const selectMostRelevantSpecies = (species, type) => {
                            if (!species || species.length === 0) return null;
                            
                            // Prioridad 1: Especies con nombre vernáculo (común) en español o inglés
                            const withVernacular = species.filter(s => s.vernacularName && s.vernacularName.trim() !== '');
                            
                            // Prioridad 2: Especies endémicas (si están marcadas)
                            const endemic = withVernacular.filter(s => s.endemic || (s.status && s.status.includes('endemic')));
                            
                            // Prioridad 3: Especies de interés (aves, mamíferos para fauna; árboles para flora)
                            let preferred = [];
                            if (type === 'fauna') {
                                // Preferir vertebrados grandes (mamíferos, aves, reptiles grandes)
                                preferred = withVernacular.filter(s => {
                                    const name = (s.vernacularName + ' ' + (s.scientificName || '')).toLowerCase();
                                    return name.includes('ave') || name.includes('bird') || 
                                           name.includes('mamífero') || name.includes('mammal') ||
                                           name.includes('lobo') || name.includes('wolf') ||
                                           name.includes('oso') || name.includes('bear') ||
                                           name.includes('águila') || name.includes('eagle') ||
                                           name.includes('león') || name.includes('lion') ||
                                           name.includes('puma') || name.includes('deer') ||
                                           name.includes('ciervo') || name.includes('fox') ||
                                           name.includes('zorro');
                                });
                            } else {
                                // Preferir árboles y plantas dominantes
                                preferred = withVernacular.filter(s => {
                                    const name = (s.vernacularName + ' ' + (s.scientificName || '')).toLowerCase();
                                    return name.includes('árbol') || name.includes('tree') ||
                                           name.includes('pino') || name.includes('pine') ||
                                           name.includes('roble') || name.includes('oak') ||
                                           name.includes('abeto') || name.includes('fir') ||
                                           name.includes('eucalipto') || name.includes('eucalyptus') ||
                                           name.includes('bosque') || name.includes('forest');
                                });
                            }
                            
                            // Seleccionar en orden de prioridad
                            const candidates = endemic.length > 0 ? endemic : 
                                             preferred.length > 0 ? preferred :
                                             withVernacular.length > 0 ? withVernacular :
                                             species;
                            
                            // Tomar la primera del grupo más prioritario
                            const selected = candidates[0];
                            
                            // Formatear nombre
                            if (selected.vernacularName) {
                                const vn = selected.vernacularName;
                                const sn = selected.scientificName || '';
                                return sn ? `${vn} (${sn})` : vn;
                            } else if (selected.scientificName) {
                                return selected.scientificName;
                            } else {
                                return selected.species || (type === 'fauna' ? 'Fauna local' : 'Flora local');
                            }
                        };
                        
                        let mostAffectedFauna = selectMostRelevantSpecies(faunaSpecies, 'fauna');
                        let mostAffectedFlora = selectMostRelevantSpecies(floraSpecies, 'flora');
                        
                        console.log(`   Fauna seleccionada: ${mostAffectedFauna || 'ninguna'}`);
                        console.log(`   Flora seleccionada: ${mostAffectedFlora || 'ninguna'}`);
                        
                        // Si no hay especies detectadas, inferir por tipo de terreno
                        if (!mostAffectedFauna || mostAffectedFauna === 'No detectada') {
                            if (result.usgs_context && result.usgs_context.elevation) {
                                const terrainType = result.usgs_context.elevation.terrain_type;
                                const isOceanic = result.usgs_context.elevation.is_oceanic;
                                const elevation = result.usgs_context.elevation.elevation_m || 0;
                                
                                if (isOceanic) {
                                    mostAffectedFauna = 'Fauna marina (peces, cetáceos, aves marinas)';
                                } else if (terrainType === 'desert') {
                                    mostAffectedFauna = 'Reptiles y roedores del desierto';
                                } else if (terrainType === 'mountain_high' || elevation > 2000) {
                                    mostAffectedFauna = 'Aves rapaces y fauna alpina';
                                } else if (terrainType === 'forest') {
                                    mostAffectedFauna = 'Mamíferos y aves forestales';
                                } else {
                                    mostAffectedFauna = 'Fauna local variada';
                                }
                            } else {
                                mostAffectedFauna = 'Fauna local variada';
                            }
                            console.log(`   ⚠️ Fauna inferida por terreno: ${mostAffectedFauna}`);
                        }
                        
                        if (!mostAffectedFlora || mostAffectedFlora === 'No detectada') {
                            if (result.usgs_context && result.usgs_context.elevation) {
                                const terrainType = result.usgs_context.elevation.terrain_type;
                                const isOceanic = result.usgs_context.elevation.is_oceanic;
                                const elevation = result.usgs_context.elevation.elevation_m || 0;
                                
                                if (isOceanic) {
                                    mostAffectedFlora = 'Algas, fitoplancton y vegetación marina';
                                } else if (terrainType === 'desert') {
                                    mostAffectedFlora = 'Cactáceas y vegetación xerófila';
                                } else if (terrainType === 'mountain_high' || elevation > 2000) {
                                    mostAffectedFlora = 'Vegetación alpina y de alta montaña';
                                } else if (terrainType === 'forest') {
                                    mostAffectedFlora = 'Bosques de coníferas y caducifolios';
                                } else {
                                    mostAffectedFlora = 'Vegetación local variada';
                                }
                            } else {
                                mostAffectedFlora = 'Vegetación local variada';
                            }
                            console.log(`   ⚠️ Flora inferida por terreno: ${mostAffectedFlora}`);
                        }
                        
                        // Actualizar datos de simulación con valores reales
                        simulationData.mostAffectedFauna = mostAffectedFauna;
                        simulationData.mostAffectedFlora = mostAffectedFlora;
                        
                        console.log('✅ Datos de flora y fauna obtenidos');
                        console.log(` Fauna más afectada: ${mostAffectedFauna}`);
                        console.log(` Flora más afectada: ${mostAffectedFlora}`);
                    }
                }
            } catch (error) {
                console.warn(' No se pudo obtener análisis de flora y fauna de GBIF:', error);
                
                // Usar inferencia basada en ubicación como fallback
                if (result.usgs_context && result.usgs_context.elevation) {
                    const terrainType = result.usgs_context.elevation.terrain_type;
                    const isOceanic = result.usgs_context.elevation.is_oceanic;
                    
                    let fallbackFauna = 'Fauna local';
                    let fallbackFlora = 'Flora local';
                    
                    if (isOceanic) {
                        fallbackFauna = 'Fauna marina (peces, mamíferos marinos)';
                        fallbackFlora = 'Algas y fitoplancton';
                    } else if (terrainType === 'desert') {
                        fallbackFauna = 'Fauna desértica (reptiles, roedores)';
                        fallbackFlora = 'Vegetación desértica (cactáceas)';
                    } else if (terrainType === 'mountain_high') {
                        fallbackFauna = 'Fauna de montaña (aves rapaces)';
                        fallbackFlora = 'Vegetación alpina';
                    } else if (terrainType === 'forest') {
                        fallbackFauna = 'Fauna forestal (mamíferos, aves)';
                        fallbackFlora = 'Bosques de coníferas o caducifolios';
                    }
                    
                    simulationData.mostAffectedFauna = fallbackFauna;
                    simulationData.mostAffectedFlora = fallbackFlora;
                    
                    console.log('⚠️ Usando inferencia de terreno para flora y fauna');
                }
            }
            
            // Completar flora y fauna
            completeLoadingStep('flora-fauna');
            updateLoadingProgress(95, 'complete', 'Finalizando...');
            
            // Mostrar dashboard ahora que tenemos todos los datos
            console.log(' Mostrando dashboard con todos los datos completos');
            console.log(' Datos finales:', simulationData);
            showBentoDashboard(simulationData);
            
            // Completar todo
            completeLoadingStep('complete');
            updateLoadingProgress(100, 'complete', 'Listo');
            if (typeof updateProgressBar === 'function') {
                updateProgressBar(90, 'Datos procesados - Listo para simulación...');
            }
            
            // Guardar todos los datos procesados para mostrarlos después del impacto
            processedSimulationData = {
                result: result,
                params: params
            };
            
            console.log('✅ Todos los datos procesados y listos para mostrar');
}

// Función para mostrar los resultados ya procesados
async function displayProcessedResults() {
    if (!processedSimulationData) {
        console.error('❌ No hay datos procesados para mostrar');
        return;
    }

    // Asegurar que la leyenda del mapa esté visible cuando termine la simulación
    const mapLegend = document.querySelector('.map-legend');
    if (mapLegend) {
        mapLegend.style.display = 'block';
    }
    
    const { result, params } = processedSimulationData;
    
    console.log('📊 Mostrando resultados procesados...');
    
    // Mostrar en la interfaz
    displayImpactResults(result);
    await updateImpactMap(result);
    
    // Registrar simulación en el sistema de recompensas
    const energy = result.impact_energy_mt || result.energy?.megatons || 0;
    const location = result.population_affected;
    const hasTsunami = result.secondary_effects?.some(effect => effect.type === 'tsunami');
    const hasMitigation = false;
    
    recordSimulation(energy, location, hasTsunami, hasMitigation);
    
    // Limpiar datos procesados
    processedSimulationData = null;
    
    console.log('✅ Resultados mostrados correctamente');
}

function displayImpactResults(result) {
    // Guardar resultados completos para el modal
    currentFullResults = result;
    
    const container = document.getElementById('results-content');
    
    // Limpiar el contenido sin mostrar mensaje
    container.innerHTML = '';
    
    // Ocultar botón para ver resultados completos
    const viewBtn = document.getElementById('view-full-results-btn');
    if (viewBtn) {
        viewBtn.style.display = 'none';
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
    console.log(` Obteniendo información de ubicación para: ${lat}, ${lon}`);
    
    try {
        // 1. Usar Nominatim de OpenStreetMap para reverse geocoding
        console.log(' Consultando Nominatim para geocoding inverso...');
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
        
        // 2. Obtener población REAL de la zona usando Overpass API
        console.log('Consultando Overpass API para datos de población...');
        const populationData = await getPopulationFromOverpass(lat, lon, destructionRadiusKm, damageRadiusKm, airPressureRadiusKm);
        
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

async function getPopulationFromOverpass(lat, lon, destructionRadiusKm, damageRadiusKm, airPressureRadiusKm) {
    console.log('🔍 DEBUG getPopulationFromOverpass:');
    console.log('Parámetros:', { lat, lon, destructionRadiusKm, damageRadiusKm, airPressureRadiusKm });
    
    try {
        // Convertir km a metros para Overpass API
        const destructionRadiusM = Math.round(destructionRadiusKm * 1000);
        const damageRadiusM = Math.round(damageRadiusKm * 1000);
        const airPressureRadiusM = Math.round(airPressureRadiusKm * 1000);
        
        console.log('Radios en metros:', { destructionRadiusM, damageRadiusM, airPressureRadiusM });
        
        // Consulta Overpass para obtener ciudades, pueblos y aldeas
        const query = `
[out:json];
(
  node["place"~"city|town|village"](around:${airPressureRadiusM}, ${lat}, ${lon});
  way["place"~"city|town|village"](around:${airPressureRadiusM}, ${lat}, ${lon});
  relation["place"~"city|town|village"](around:${airPressureRadiusM}, ${lat}, ${lon});
);
out center;
`;
        
        console.log('Query Overpass:', query);
        
        const url = "http://overpass-api.de/api/interpreter";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(query)}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta Overpass:', data);
        
        if (!data.elements || data.elements.length === 0) {
            console.log('❌ No se encontraron lugares en Overpass');
            return {
                totalPopulation: 0,
                total_population: 0,
                destruction_zone_population: 0,
                damage_zone_population: 0,
                air_pressure_zone_population: 0,
                citiesInDestructionZone: [],
                citiesInDamageZone: [],
                citiesInAirPressureZone: [],
                message: 'Área deshabitada o sin datos de población disponibles'
            };
        }
        
        // Procesar resultados y calcular población estimada
        const places = [];
        
        data.elements.forEach(element => {
            const tags = element.tags || {};
            const name = tags.name;
            const placeType = tags.place;
            
            if (name && placeType) {
                // Obtener coordenadas
                let placeLat, placeLon;
                if (element.type === 'node') {
                    placeLat = element.lat;
                    placeLon = element.lon;
                } else if (element.center) {
                    placeLat = element.center.lat;
                    placeLon = element.center.lon;
                } else {
                    return; // Skip si no hay coordenadas
                }
                
                // Calcular distancia desde el punto de impacto
                const distance = calculateDistance(lat, lon, placeLat, placeLon);
                
                // Estimar población basada en el tipo de lugar
                let estimatedPopulation = 0;
                switch (placeType) {
                    case 'city':
                        estimatedPopulation = Math.floor(Math.random() * 500000) + 100000; // 100k-600k
                        break;
                    case 'town':
                        estimatedPopulation = Math.floor(Math.random() * 50000) + 5000; // 5k-55k
                        break;
                    case 'village':
                        estimatedPopulation = Math.floor(Math.random() * 2000) + 100; // 100-2.1k
                        break;
                    default:
                        estimatedPopulation = Math.floor(Math.random() * 1000) + 50; // 50-1k
                }
                
                places.push({
                    name: name,
                    type: placeType,
                    population: estimatedPopulation,
                    distance: distance,
                    lat: placeLat,
                    lon: placeLon
                });
            }
        });
        
        console.log('Lugares encontrados:', places);
        
        // Clasificar por zonas
        const citiesInDestructionZone = [];
        const citiesInDamageZone = [];
        const citiesInAirPressureZone = [];
        
        let totalPopInDestruction = 0;
        let totalPopInDamage = 0;
        let totalPopInAirPressure = 0;
        
        places.forEach(place => {
            const { name, type, population, distance } = place;
            
            if (distance <= destructionRadiusKm) {
                citiesInDestructionZone.push({
                    name: name,
                    population: population,
                    distance: distance,
                    type: type,
                    mortalityRate: 0.95 // 95% mortalidad en zona de destrucción total
                });
                totalPopInDestruction += population;
            } else if (distance <= damageRadiusKm) {
                citiesInDamageZone.push({
                    name: name,
                    population: population,
                    distance: distance,
                    type: type,
                    mortalityRate: 0.15 // 15% mortalidad en zona de daño severo
                });
                totalPopInDamage += population;
            } else if (distance <= airPressureRadiusKm) {
                citiesInAirPressureZone.push({
                    name: name,
                    population: population,
                    distance: distance,
                    type: type,
                    mortalityRate: 0.05 // 5% mortalidad en zona de presión de aire
                });
                totalPopInAirPressure += population;
            }
        });
        
        // Ordenar por población (mayor a menor)
        citiesInDestructionZone.sort((a, b) => b.population - a.population);
        citiesInDamageZone.sort((a, b) => b.population - a.population);
        citiesInAirPressureZone.sort((a, b) => b.population - a.population);
        
        const totalPopulation = totalPopInDestruction + totalPopInDamage + totalPopInAirPressure;
        
        const result = {
            totalPopulation: totalPopulation,
            total_population: totalPopulation,
            destruction_zone_population: totalPopInDestruction,
            damage_zone_population: totalPopInDamage,
            air_pressure_zone_population: totalPopInAirPressure,
            citiesInDestructionZone: citiesInDestructionZone,
            citiesInDamageZone: citiesInDamageZone,
            citiesInAirPressureZone: citiesInAirPressureZone,
            message: null
        };
        
        console.log('✅ Overpass: Datos de población encontrados:');
        console.log('Total población:', result.totalPopulation);
        console.log('Ciudades en zona destrucción:', citiesInDestructionZone.length);
        console.log('Ciudades en zona daño:', citiesInDamageZone.length);
        console.log('Ciudades en zona presión aire:', citiesInAirPressureZone.length);
        console.log('Resultado completo:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error fetching population from Overpass:', error);
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

// Variable global para almacenar la ubicación del usuario
let userLocationData = null;

// Función para centrar el mapa en la ubicación del usuario
function centerMapOnUserLocation() {
    if (!userLocationData) {
        // Si no tenemos ubicación guardada, intentar obtenerla
        getUserLocation().then(userLocation => {
            userLocationData = userLocation;
            centerMapOnUserLocation();
        }).catch(error => {
            console.log('No se pudo obtener la ubicación del usuario');
            alert('No se pudo obtener tu ubicación. Asegúrate de permitir el acceso a la ubicación.');
        });
        return;
    }
    
    if (impactMap) {
        // Determinar el nivel de zoom según el método de detección
        let zoomLevel;
        if (userLocationData.method === 'ip') {
            zoomLevel = 10;
        } else if (userLocationData.method === 'gps') {
            zoomLevel = 12;
        } else {
            zoomLevel = 8;
        }
        
        // Hacer zoom animado a la ubicación del usuario
        impactMap.flyTo([userLocationData.lat, userLocationData.lon], zoomLevel, {
            duration: 2,
            easeLinearity: 0.25
        });
        
        // Actualizar los campos de entrada
        document.getElementById('latitude').value = userLocationData.lat.toFixed(4);
        document.getElementById('longitude').value = userLocationData.lon.toFixed(4);
        
        console.log('Mapa centrado en tu ubicación actual');
    }
}

// Obtener ubicación aproximada del usuario usando su IP (sin permisos)
async function getUserLocationByIP() {
    try {
        console.log('Obteniendo ubicación por IP...');
        
        // Usar múltiples servicios como fallback
        const services = [
            'https://ipapi.co/json/',
            'https://ip-api.com/json/',
            'http://ip-api.com/json/'
        ];
        
        for (const service of services) {
            try {
                const response = await fetch(service);
                if (!response.ok) continue;
                
                const data = await response.json();
                
                // Diferentes servicios tienen diferentes formatos
                let lat, lon, city, country, countryCode;
                
                if (data.latitude && data.longitude) {
                    // ipapi.co format
                    lat = data.latitude;
                    lon = data.longitude;
                    city = data.city;
                    country = data.country_name || data.country;
                    countryCode = data.country_code;
                } else if (data.lat && data.lon) {
                    // ip-api.com format
                    lat = data.lat;
                    lon = data.lon;
                    city = data.city;
                    country = data.country;
                    countryCode = data.countryCode;
                }
                
                if (lat && lon) {
                    // Obtener código de país (formato ISO 2 letras)
                    if (countryCode) {
                        countryCode = countryCode.toUpperCase();
                    }
                    
                    console.log(`Ubicación detectada por IP: ${city}, ${country} (${countryCode}) (${lat}, ${lon})`);
                    return {
                        lat: lat,
                        lon: lon,
                        city: city,
                        country: country,
                        countryCode: countryCode,
                        method: 'ip'
                    };
                }
            } catch (err) {
                console.log(`Servicio ${service} falló, intentando siguiente...`);
                continue;
            }
        }
        
        throw new Error('Todos los servicios de geolocalización fallaron');
        
    } catch (error) {
        console.error('Error obteniendo ubicación por IP:', error);
        throw error;
    }
}

// Obtener ubicación del usuario (primero intenta IP, luego GPS)
function getUserLocation() {
    return new Promise(async (resolve, reject) => {
        // Primero intentar con IP (no requiere permisos)
        try {
            const ipLocation = await getUserLocationByIP();
            resolve(ipLocation);
            return;
        } catch (ipError) {
            console.log('Geolocalización por IP falló, intentando GPS...');
        }
        
        // Si IP falla, intentar con GPS (requiere permiso)
        if (!navigator.geolocation) {
            reject(new Error('Geolocation no está soportado por tu navegador'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    method: 'gps'
                });
            },
            (error) => {
                console.log('No se pudo obtener la ubicación del usuario:', error.message);
                reject(error);
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

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
        // Calcular el zoom mínimo basándose en el área visible (sin sidebar)
        const sidebar = document.getElementById('sidebar');
        
        let visibleWidth = window.innerWidth;
        if (sidebar && window.innerWidth > 768) {
            // Restar el ancho del sidebar para obtener el ancho visible real
            visibleWidth = window.innerWidth - sidebar.offsetWidth;
        }
        
        // Calcular zoom para que el mundo llene el ancho visible
        // A zoom Z, el mundo tiene 256 * 2^Z píxeles
        // Queremos: 256 * 2^Z >= visibleWidth
        // Entonces: Z >= log2(visibleWidth / 256)
        // Añadir +1 para compensar el centrado y asegurar que no haya espacios
        const calculatedMinZoom = Math.max(Math.ceil(Math.log2(visibleWidth / 256)) + 1, 3);
        
        impactMap = L.map('map-container', {
            center: [20, 0],
            zoom: Math.max(calculatedMinZoom + 1, 2),  // Iniciar con un zoom cómodo
            minZoom: calculatedMinZoom,  // Zoom mínimo calculado
            maxZoom: 19,
            zoomControl: true,
            attributionControl: true,
            preferCanvas: false,
            renderer: L.canvas(),
            worldCopyJump: true,  // Salta automáticamente a la copia principal del mundo
            maxBoundsViscosity: 0  // Permite movimiento libre
        });
        
        
        // Definir las capas base
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        
        // Capas de mapa normal (tema oscuro y claro)
        const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
            minZoom: 2,
            noWrap: true
            });
        
        const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap © CARTO',
                subdomains: 'abcd',
                maxZoom: 19,
                minZoom: 2,
            noWrap: true
        });
        
        // Capas de vista satélite
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri © DigitalGlobe © GeoEye',
            maxZoom: 19,
            minZoom: 2,
            noWrap: true,
            errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'  // Imagen transparente 1x1
        });
        
        const satelliteHybridLayer = L.layerGroup([
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri © DigitalGlobe © GeoEye',
                maxZoom: 19,
                minZoom: 2,
                noWrap: true,
                errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'  // Imagen transparente 1x1
            }),
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                minZoom: 2,
                noWrap: true,
                errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'  // Imagen transparente 1x1
            })
        ]);
        
        // Agregar la capa apropiada según el tema
        if (currentTheme === 'dark') {
            currentTileLayer = darkLayer;
        } else {
            currentTileLayer = lightLayer;
        }
        
        currentTileLayer.addTo(impactMap);
        
        // Crear control de capas
        const baseMaps = {
            "Vista Normal": currentTheme === 'dark' ? darkLayer : lightLayer,
            "Satélite": satelliteLayer,
            "Satélite + Etiquetas": satelliteHybridLayer
        };
        
        // Agregar control de capas al mapa
        const layerControl = L.control.layers(baseMaps, null, {
            position: 'bottomleft',
            collapsed: false
        }).addTo(impactMap);
        
        // Actualizar la capa actual cuando cambie
        impactMap.on('baselayerchange', function(e) {
            currentTileLayer = e.layer;
        });
        
        // Actualizar minZoom cuando cambie el tamaño de la ventana
        let resizeTimeout;
        window.addEventListener('resize', function() {
            if (!impactMap) return;
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                const sidebar = document.getElementById('sidebar');
                
                let visibleWidth = window.innerWidth;
                if (sidebar && window.innerWidth > 768) {
                    visibleWidth = window.innerWidth - sidebar.offsetWidth;
                }
                
                const newMinZoom = Math.max(Math.ceil(Math.log2(visibleWidth / 256)) + 1, 3);
                
                // Actualizar el minZoom del mapa
                impactMap.setMinZoom(newMinZoom);
                
                // Si el zoom actual es menor que el nuevo mínimo, ajustar
                if (impactMap.getZoom() < newMinZoom) {
                    impactMap.setZoom(newMinZoom);
                }
                
                // Invalidar el tamaño del mapa para que se redibuje correctamente
                impactMap.invalidateSize();
            }, 250);
        });
        
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
        
        // Intentar obtener la ubicación del usuario después de que el mapa esté cargado
        setTimeout(() => {
            getUserLocation().then(userLocation => {
                console.log('Ubicación del usuario detectada:', userLocation);
                
                // Detectar y cambiar idioma automáticamente según el país
                if (userLocation.countryCode && window.i18n) {
                    const detectedLang = window.i18n.autoDetectLanguage(userLocation.countryCode);
                    console.log(`Idioma detectado: ${detectedLang.toUpperCase()} para país: ${userLocation.country}`);
                }
                
                // NO hacer zoom automático - solo guardar la ubicación para uso posterior
                console.log(`Ubicación detectada: ${userLocation.city || 'desconocida'}, ${userLocation.country || 'desconocido'}`);
                console.log('Ubicación guardada para uso manual - usa el botón "Mi Ubicación" para centrar');
                
                // Guardar la ubicación del usuario para uso posterior
                userLocationData = userLocation;
                
                // Actualizar los campos de entrada con la ubicación del usuario
                document.getElementById('latitude').value = userLocation.lat.toFixed(4);
                document.getElementById('longitude').value = userLocation.lon.toFixed(4);
                
                // Actualizar el display de ubicación actual
                updateCurrentLocationDisplay(userLocation);
                
            }).catch(error => {
                console.log('Usando ubicación predeterminada - No se pudo obtener geolocalización');
                // Si falla, mantener el centro predeterminado
            });
        }, 1200);
        
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
    // Mostrar loading simple sin animación 3D
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';
    
    try {
        // Use mitigation-specific parameters
        const params = {
            asteroid_diameter: parseFloat(document.getElementById('mit-diameter').value),
            asteroid_velocity: parseFloat(document.getElementById('mit-velocity').value) * 1000,
            strategy: document.getElementById('strategy-select').value,
            time_before_impact: parseFloat(document.getElementById('time-before-impact').value),
            impactor_mass: parseFloat(document.getElementById('impactor-mass').value),
            impactor_velocity: parseFloat(document.getElementById('impactor-velocity').value) * 1000,
            composition: 'rocky',
            asteroid_id: 'custom'
        };
        
        const response = await fetch('/api/simulate/deflection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Datos de deflexión recibidos - procesando...');
            
            // Ocultar loading y mostrar modal directamente
            overlay.style.display = 'none';
            openDeflectionModal(data);
        } else {
            overlay.style.display = 'none';
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Deflection simulation error:', error);
        overlay.style.display = 'none';
        alert('Error al ejecutar la simulación de deflexión');
    }
}

function displayDeflectionResults(data) {
    const result = data.result;
    const rec = data.recommendation;
    const allStrategies = data.all_strategies || [];
    const techReq = data.tech_requirements || null;
    const asteroidAnalysis = data.asteroid_analysis || null;
    
    let html = `
        <!-- Resultado principal -->
        <div style="background: var(--input-bg); border: 1px solid var(--input-border); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="font-size: 18px; font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">${rec.verdict}</div>
            <div style="font-size: 14px; color: var(--text-medium);">${rec.message}</div>
        </div>
        
        <!-- Estrategia probada -->
        <div style="background: var(--input-bg); border: 1px solid var(--input-border); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="font-size: 16px; font-weight: bold; color: var(--text-light); margin-bottom: 1rem;">RESULTADO DE LA SIMULACIÓN</div>
            
            <div style="background: var(--sidebar-bg); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Estrategia Probada:</div>
                <div style="color: var(--text-medium);">${result.strategy === 'kinetic_impactor' ? 'Impactador Cinético' : 'Tractor de Gravedad'}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div style="background: var(--sidebar-bg); padding: 1rem; border-radius: 6px;">
                    <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Cambio de Velocidad (Δv):</div>
                    <div style="color: var(--text-medium);">${result.delta_v.toFixed(6)} m/s</div>
                </div>
                
                <div style="background: var(--sidebar-bg); padding: 1rem; border-radius: 6px;">
                    <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Distancia Deflectada:</div>
                    <div style="color: var(--text-medium);">${result.deflection_km.toLocaleString()} km</div>
                </div>
            </div>
        </div>
    `;
    
    // Análisis del asteroide
    if (asteroidAnalysis) {
        html += `
            <div style="background: var(--input-bg); border: 1px solid var(--input-border); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <div style="font-size: 16px; font-weight: bold; color: var(--text-light); margin-bottom: 1rem;">ANÁLISIS DEL ASTEROIDE</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; font-size: 13px;">
                    <div style="background: var(--sidebar-bg); padding: 0.75rem; border-radius: 4px;">
                        <div style="font-weight: bold; color: var(--text-light);">Masa:</div>
                        <div style="color: var(--text-medium);">${formatNumber(asteroidAnalysis.mass_kg)} kg</div>
                    </div>
                    <div style="background: var(--sidebar-bg); padding: 0.75rem; border-radius: 4px;">
                        <div style="font-weight: bold; color: var(--text-light);">Energía:</div>
                        <div style="color: var(--text-medium);">${asteroidAnalysis.energy_mt.toFixed(2)} MT TNT</div>
                    </div>
                    <div style="background: var(--sidebar-bg); padding: 0.75rem; border-radius: 4px;">
                        <div style="font-weight: bold; color: var(--text-light);">Composición:</div>
                        <div style="color: var(--text-medium);">${asteroidAnalysis.composition}</div>
                    </div>
                    <div style="background: var(--sidebar-bg); padding: 0.75rem; border-radius: 4px;">
                        <div style="font-weight: bold; color: var(--text-light);">Riesgo Fragmentación:</div>
                        <div style="color: var(--text-medium);">${(asteroidAnalysis.fragmentation_risk * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // TABLA COMPARATIVA
    if (allStrategies.length > 0) {
        html += `
            <div style="margin-top: 1.5rem;">
                <div style="font-size: 16px; font-weight: bold; color: var(--text-light); margin-bottom: 1rem;">COMPARACIÓN DE ESTRATEGIAS (${allStrategies.length})</div>
                
                ${allStrategies.map((strat, index) => `
                    <div style="margin: 1.5rem 0; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="font-size: 15px; font-weight: bold; color: var(--text-light);">${strat.name}</div>
                                ${index === 0 ? '<div style="background: var(--primary-blue); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 10px; margin-left: 0.5rem;">RECOMENDADO</div>' : ''}
                            </div>
                            <div style="font-size: 18px; color: var(--text-light); font-weight: bold;">${strat.effectiveness}%</div>
                        </div>
                        
                        <!-- Barra de efectividad -->
                        <div style="background: var(--sidebar-bg); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 1rem;">
                            <div style="width: ${strat.effectiveness}%; height: 100%; background: var(--primary-blue); transition: width 0.5s ease;"></div>
                        </div>
                        
                        <div style="font-size: 11px; color: var(--text-medium); margin-bottom: 1rem;">
                            ${strat.reference_mission ? `${strat.reference_mission} | ` : ''}
                            ${strat.technology_readiness}
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; font-size: 12px; margin-bottom: 1rem;">
                            <div style="background: var(--sidebar-bg); padding: 0.5rem; border-radius: 4px;">
                                <div style="font-weight: bold; color: var(--text-light);">Costo:</div>
                                <div style="color: var(--text-medium);">$${strat.cost_billions}B</div>
                            </div>
                            <div style="background: var(--sidebar-bg); padding: 0.5rem; border-radius: 4px;">
                                <div style="font-weight: bold; color: var(--text-light);">Tiempo:</div>
                                <div style="color: var(--text-medium);">${strat.time_required_years} años</div>
                            </div>
                            <div style="background: var(--sidebar-bg); padding: 0.5rem; border-radius: 4px;">
                                <div style="font-weight: bold; color: var(--text-light);">Éxito:</div>
                                <div style="color: var(--text-medium);">${strat.success_rate}%</div>
                            </div>
                            <div style="background: var(--sidebar-bg); padding: 0.5rem; border-radius: 4px;">
                                <div style="font-weight: bold; color: var(--text-light);">Δv:</div>
                                <div style="color: var(--text-medium);">${strat.delta_v_m_s} m/s</div>
                            </div>
                        </div>
                        
                        <div style="font-size: 12px; margin-bottom: 1rem;">
                            <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Ventajas:</div>
                            <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-medium);">
                                ${strat.pros.map(p => `<li style="margin-bottom: 0.25rem;">${p}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="font-size: 12px; margin-bottom: 1rem;">
                            <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Desventajas:</div>
                            <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-medium);">
                                ${strat.cons.map(c => `<li style="margin-bottom: 0.25rem;">${c}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background: var(--sidebar-bg); padding: 0.75rem; border-radius: 4px; font-size: 11px;">
                            <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.25rem;">Mejor para:</div>
                            <div style="color: var(--text-medium);">${strat.best_for}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Requisitos técnicos
    if (techReq) {
        html += `
            <div style="margin-top: 1.5rem; background: var(--input-bg); border: 1px solid var(--input-border); padding: 1.5rem; border-radius: 8px;">
                <div style="font-size: 16px; font-weight: bold; color: var(--text-light); margin-bottom: 1rem;">REQUISITOS TÉCNICOS DE LA MISIÓN</div>
                
                <div style="background: var(--sidebar-bg); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Vehículo de Lanzamiento:</div>
                    <div style="color: var(--text-medium); font-size: 12px;">
                        ${techReq.launch_vehicle.required} | 
                        ${techReq.launch_vehicle.launches_needed} lanzamiento(s) | 
                        $${techReq.launch_vehicle.cost_per_launch_millions}M c/u
                    </div>
                </div>
                
                <div style="background: var(--sidebar-bg); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Nave Espacial:</div>
                    <div style="color: var(--text-medium); font-size: 12px;">
                        Masa: ${techReq.spacecraft.total_mass_kg.toLocaleString()} kg | 
                        Potencia: ${techReq.spacecraft.power_requirement_kw} kW
                    </div>
                </div>
                
                <div style="background: var(--sidebar-bg); padding: 1rem; border-radius: 6px;">
                    <div style="font-weight: bold; color: var(--text-light); margin-bottom: 0.5rem;">Duración de la Misión:</div>
                    <div style="color: var(--text-medium); font-size: 12px;">
                        Crucero: ${techReq.mission_duration.cruise_phase_years} años | 
                        Observación: ${techReq.mission_duration.post_impact_observation_months} meses
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}

// Función helper para colorear efectividad
function getEffectivenessColor(effectiveness) {
    if (effectiveness >= 80) return '#00E676';
    if (effectiveness >= 60) return '#00A8E8';
    if (effectiveness >= 40) return '#FFB84D';
    return '#FF4444';
}

function openDeflectionModal(data) {
    const modal = document.getElementById('deflection-modal');
    const modalContent = document.getElementById('modal-deflection-content');
    
    // Generar contenido SIN inicializar 3D
    modalContent.innerHTML = displayDeflectionResults(data);
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDeflectionModal() {
    const modal = document.getElementById('deflection-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function getDeflectionRecommendations(result) {
    if (result.success) {
        return `
 La deflexión es exitosa con los parámetros actuales.<br>
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

function showLoading(show, asteroidData = null) {
    if (show) {
        // Ocultar la leyenda del mapa cuando inicie la simulación 3D
        const mapLegend = document.querySelector('.map-legend');
        if (mapLegend) {
            mapLegend.style.display = 'none';
        }
        
        // Mostrar con animación 3D en el mapa
        if (typeof show3DInMap === 'function') {
            show3DInMap(asteroidData);
        } else {
            // Fallback si la animación 3D no está cargada
            const overlay = document.getElementById('loading-overlay');
            overlay.style.display = 'flex';
        }
    } else {
        // Mostrar la leyenda del mapa cuando termine la simulación 3D
        const mapLegend = document.querySelector('.map-legend');
        if (mapLegend) {
            mapLegend.style.display = 'block';
        }
        
        // Ocultar
        if (typeof hide3DInMap === 'function') {
            hide3DInMap();
        } else if (typeof hide3DLoading === 'function') {
            hide3DLoading();
        } else {
            const overlay = document.getElementById('loading-overlay');
            overlay.style.display = 'none';
        }
    }
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
                    <strong style="font-size: 16px;"> EFECTOS SECUNDARIOS Y CATÁSTROFES</strong>
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
                    ${effect.global_impact ? `<div style="font-size: 11px; padding: 0.4rem; background: rgba(255,0,0,0.2); border-radius: 4px; margin-bottom: 0.5rem;"><strong> IMPACTO GLOBAL</strong></div>` : ''}
                    
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
        let terrainIcon = elev.is_oceanic ? '' : '';
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
    console.log(' DATOS USGS - CONTEXTO GEOGRÁFICO');
    console.log('═══════════════════════════════════════════');
    
    if (usgsContext.elevation) {
        console.log(`\n Terreno: ${usgsContext.elevation.description}`);
        console.log(`   Elevación: ${usgsContext.elevation.elevation_m.toFixed(1)}m`);
    }
    
    if (usgsContext.seismic_history && usgsContext.seismic_history.count > 0) {
        console.log(`\n Sismos: ${usgsContext.seismic_history.count}`);
        console.log(`   Magnitud máx: ${usgsContext.seismic_history.max_magnitude.toFixed(1)}`);
    }
    
    if (usgsContext.coastal_distance_km !== undefined) {
        console.log(`\n Distancia costa: ${usgsContext.coastal_distance_km === 0 ? 'OCEÁNICO' : usgsContext.coastal_distance_km.toFixed(1) + ' km'}`);
    }
    
    console.log('═══════════════════════════════════════════\n');
}

// ============================================
// SIDEBAR TOGGLE FUNCTIONALITY
// ============================================

function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    if (!sidebarToggle || !sidebar || !sidebarOverlay) return;
    
    // Toggle sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
        
        // Update button icon
        const icon = sidebarToggle.querySelector('span');
        if (sidebar.classList.contains('open')) {
            icon.textContent = '✕';
        } else {
            icon.textContent = '☰';
        }
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        
        const icon = sidebarToggle.querySelector('span');
        icon.textContent = '☰';
    });
    
    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            
            const icon = sidebarToggle.querySelector('span');
            icon.textContent = '☰';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Desktop: always show sidebar
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            
            const icon = sidebarToggle.querySelector('span');
            icon.textContent = '☰';
        }
    });
}

// Initialize sidebar toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupSidebarToggle();
    setupBentoDashboard();
    
    // Test function - remove in production
    window.testBentoDashboard = function() {
        console.log('🧪 Testing Bento Dashboard...');
        const testData = {
            impactEnergy: 395.96, // MT
            craterDiameter: 700, // meters
            affectedPopulation: 1700000, // 1.7M people
            impactProbability: 85,
            asteroidSpeed: 25,
            destructionRadius: 700, // meters
            tsunamiRisk: 'Bajo',
            seismicMagnitude: 9.3,
            simulationStatus: 'Completado'
        };
        console.log('🧪 Test data:', testData);
        showBentoDashboard(testData);
    };
    
    // Diagnostic function
    window.diagnoseBentoDashboard = function() {
        console.log(' DIAGNOSTIC: Checking Bento Dashboard elements...');
        
        const elements = [
            'impact-energy',
            'crater-diameter', 
            'affected-population',
            'asteroid-speed',
            'destruction-radius',
            'tsunami-risk',
            'seismic-magnitude',
            'most-affected-fauna',
            'most-affected-flora'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(` Found element: ${id}`, element);
            } else {
                console.error(`❌ Missing element: ${id}`);
            }
        });
        
        // Check if dashboard is visible
        const dashboard = document.querySelector('.bento-dashboard');
        if (dashboard) {
            console.log(' Dashboard found:', dashboard);
            console.log('Dashboard classes:', dashboard.className);
            console.log('Dashboard display:', getComputedStyle(dashboard).display);
        } else {
            console.error('❌ Dashboard not found');
        }
        
        // Check simulation controls
        const controls = document.getElementById('simulation-controls');
        if (controls) {
            console.log(' Simulation controls found:', controls);
            console.log('Controls display:', getComputedStyle(controls).display);
        } else {
            console.error('❌ Simulation controls not found');
        }
    };
});

// ============================================
// BENTO DASHBOARD FUNCTIONALITY
// ============================================

function setupBentoDashboard() {
    // Hide dashboard initially
    const bentoDashboard = document.querySelector('.bento-dashboard');
    if (bentoDashboard) {
        bentoDashboard.classList.remove('show');
    }
    
    // Show simulation controls initially
    const simulationControls = document.getElementById('simulation-controls');
    if (simulationControls) {
        simulationControls.style.display = 'flex';
    }
}

function updateBentoDashboard(data) {
    console.log(' Updating Bento Dashboard with data:', data);
    
    // Force update all elements with a more direct approach
    const updates = [
        { id: 'impact-energy', value: formatEnergy(data.impactEnergy), log: ' Energy' },
        { id: 'crater-diameter', value: formatDistance(data.craterDiameter), log: ' Crater' },
        { id: 'affected-population', value: formatNumber(data.affectedPopulation), log: ' Population' },
        { id: 'asteroid-speed', value: `${data.asteroidSpeed} km/s`, log: ' Speed' },
        { id: 'destruction-radius', value: formatDistance(data.destructionRadius), log: ' Radius' },
        { id: 'tsunami-risk', value: data.tsunamiRisk, log: ' Tsunami' },
        { id: 'seismic-magnitude', value: data.seismicMagnitude.toFixed(1), log: ' Seismic' },
        { id: 'most-affected-fauna', value: data.mostAffectedFauna || '-', log: ' Fauna' },
        { id: 'most-affected-flora', value: data.mostAffectedFlora || '-', log: ' Flora' }
    ];
    
    updates.forEach(update => {
        const element = document.getElementById(update.id);
        if (element) {
            element.textContent = update.value;
            console.log(`${update.log} updated:`, update.value);
        } else {
            console.error(`❌ Element not found: ${update.id}`);
        }
    });
    
}

function formatEnergy(energy) {
    if (energy >= 1000000) {
        return `${(energy / 1000000).toFixed(1)} MT`;
    } else if (energy >= 1000) {
        return `${(energy / 1000).toFixed(1)} KT`;
    } else {
        return `${energy.toFixed(1)} T`;
    }
}

function formatDistance(distance) {
    if (distance >= 1000) {
        return `${(distance / 1000).toFixed(1)} km`;
    } else {
        return `${distance.toFixed(1)} m`;
    }
}

function formatNumber(number) {
    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
    } else {
        return number.toString();
    }
}

function showBentoDashboard(simulationData) {
    console.log(' showBentoDashboard called with data:', simulationData);
    console.log(' Data type:', typeof simulationData);
    console.log(' Data keys:', Object.keys(simulationData));
    
    // Hide ALL controls sections completely
    const allControlsSections = document.querySelectorAll('.controls-section');
    allControlsSections.forEach(section => {
        if (section) {
            section.style.display = 'none';
            section.style.visibility = 'hidden';
            section.style.opacity = '0';
            section.style.pointerEvents = 'none';
            section.classList.remove('active');
        }
    });
    
    // Specifically hide simulation controls
    const simulationControls = document.getElementById('simulation-controls');
    if (simulationControls) {
        simulationControls.style.display = 'none';
        console.log(' Simulation controls hidden');
    } else {
        console.error('❌ Simulation controls not found');
    }
    
    // Hide mitigation controls too
    const mitigationControls = document.getElementById('mitigation-controls');
    if (mitigationControls) {
        mitigationControls.style.display = 'none';
    }
    
    // Show bento dashboard
    const bentoDashboard = document.querySelector('.bento-dashboard');
    if (bentoDashboard) {
        bentoDashboard.classList.add('show');
        console.log(' Bento dashboard shown');
    } else {
        console.error('❌ Bento dashboard not found');
    }
    
    // Update dashboard with simulation data
    console.log(' About to call updateBentoDashboard...');
    updateBentoDashboard(simulationData);
}

function hideBentoDashboard() {
    // Hide bento dashboard
    const bentoDashboard = document.querySelector('.bento-dashboard');
    if (bentoDashboard) {
        bentoDashboard.classList.remove('show');
    }
    
    // Restore simulation controls completely
    const simulationControls = document.getElementById('simulation-controls');
    if (simulationControls) {
        simulationControls.style.display = 'flex';
        simulationControls.style.visibility = 'visible';
        simulationControls.style.opacity = '1';
        simulationControls.style.pointerEvents = 'auto';
        simulationControls.classList.add('active');
    }
    
    // Make sure mitigation controls stay hidden
    const mitigationControls = document.getElementById('mitigation-controls');
    if (mitigationControls) {
        mitigationControls.style.display = 'none';
        mitigationControls.classList.remove('active');
    }
}

// ============================================
// MITIGATION STRATEGIES CALCULATION
// ============================================

function calculateMitigationStrategies(simulationData) {
    const result = simulationData;
    const calc = result.calculations;
    const input = result.input;
    
    // Extraer parámetros del asteroide
    const diameter = input.asteroid_diameter || 100;
    const velocity = input.asteroid_velocity || 20000;
    const energy = calc.energy_megatons_tnt || 1;
    const destructionRadius = calc.destruction_radius_km || 5;
    const damageRadius = calc.damage_radius_km || 15;
    const composition = input.composition || 'rocky';
    
    // Calcular masa del asteroide
    const density = composition === 'iron' ? 8000 : composition === 'stony' ? 3500 : 2500;
    const mass = (4/3) * Math.PI * Math.pow(diameter/2, 3) * density * 1000; // kg
    
    // Determinar estrategia principal basada en el tamaño y tiempo disponible
    let mainStrategy, alternatives, timeCritical, evacuation;
    
    if (energy < 0.1) {
        // Impacto menor - enfoque en evacuación
        mainStrategy = `IMPACTO MENOR (${energy.toFixed(3)} MT): Evacuación preventiva de población en radio de ${destructionRadius.toFixed(1)} km. El impacto será localizado con daños principalmente estructurales.`;
        
        alternatives = [
            {
                name: "Monitoreo Continuo",
                description: "Establecer red de sensores sísmicos para detectar aproximación y activar alertas tempranas."
            },
            {
                name: "Refugios de Emergencia",
                description: "Preparar refugios subterráneos para población más vulnerable en caso de evacuación tardía."
            }
        ];
        
        timeCritical = "TIEMPO ÓPTIMO: 24-48 horas antes del impacto. Evacuación preventiva recomendada.";
        
        evacuation = [
            `Evacuación inmediata en radio de ${destructionRadius.toFixed(1)} km (${(Math.PI * destructionRadius * destructionRadius).toFixed(0)} km²)`,
            "Población de alto riesgo: niños, ancianos y personas con movilidad reducida",
            "Rutas de evacuación hacia el norte y sur del punto de impacto",
            "Puntos de reunión cada 20 km de distancia"
        ];
        
    } else if (energy < 1) {
        // Impacto moderado - deflexión + evacuación
        mainStrategy = `IMPACTO MODERADO (${energy.toFixed(2)} MT): Combinación de deflexión con impacto cinético y evacuación de emergencia en radio de ${damageRadius.toFixed(1)} km.`;
        
        alternatives = [
            {
                name: "Impactador Cinético",
                description: `Envío de nave de ${Math.round(mass * 0.01)} kg a velocidad de 11 km/s para desviar órbita del asteroide. Efectividad: 70-80%.`
            },
            {
                name: "Tractor Gravitacional",
                description: "Colocación de nave masiva cerca del asteroide para desviación gradual. Requiere 2-5 años de anticipación."
            },
            {
                name: "Explosión Nuclear",
                description: `Detonación nuclear de ${(energy * 0.5).toFixed(2)} MT en superficie para fragmentación. Último recurso.`
            }
        ];
        
        timeCritical = "TIEMPO CRÍTICO: 6-12 meses antes del impacto. Deflexión requiere tiempo de desarrollo y viaje.";
        
        evacuation = [
            `Evacuación total en radio de ${damageRadius.toFixed(1)} km (${(Math.PI * damageRadius * damageRadius).toFixed(0)} km²)`,
            "Evacuación de emergencia en radio de 50 km como zona de seguridad ampliada",
            "Hospitales y servicios críticos deben ser reubicados fuera del área de riesgo",
            "Sistemas de alerta temprana con sirenas cada 5 km"
        ];
        
    } else if (energy < 10) {
        // Impacto severo - múltiples estrategias
        mainStrategy = `IMPACTO SEVERO (${energy.toFixed(1)} MT): Estrategia múltiple con deflexión nuclear, evacuación masiva y preparación para efectos secundarios en radio de ${(damageRadius * 2).toFixed(1)} km.`;
        
        alternatives = [
            {
                name: "Deflexión Nuclear",
                description: `Múltiples detonaciones nucleares de ${(energy * 0.3).toFixed(1)} MT cada una para fragmentación y deflexión. Máxima efectividad.`
            },
            {
                name: "Impactadores Múltiples",
                description: "Envío de 3-5 naves impactadoras en secuencia para desviación acumulativa del asteroide."
            },
            {
                name: "Laser Ablation",
                description: "Sistema de láseres espaciales para vaporización de material superficial y propulsión por retroceso."
            }
        ];
        
        timeCritical = "TIEMPO CRÍTICO: 2-3 años antes del impacto. Desarrollo de tecnología nuclear espacial requerido.";
        
        evacuation = [
            `Evacuación masiva en radio de ${(damageRadius * 2).toFixed(1)} km (${(Math.PI * damageRadius * damageRadius * 4).toFixed(0)} km²)`,
            "Evacuación de emergencia en radio de 100 km para efectos secundarios",
            "Relocalización de infraestructura crítica (hospitales, centrales eléctricas, aeropuertos)",
            "Preparación para invierno nuclear: refugios con suministros para 6 meses"
        ];
        
    } else {
        // Impacto catastrófico - estrategias extremas
        mainStrategy = `IMPACTO CATASTRÓFICO (${energy.toFixed(0)} MT): Deflexión nuclear masiva como única opción viable. Evacuación continental requerida. Efectos globales esperados.`;
        
        alternatives = [
            {
                name: "Deflexión Nuclear Masiva",
                description: `Múltiples detonaciones nucleares de ${(energy * 0.2).toFixed(0)} MT cada una. Requiere arsenal nuclear completo y coordinación internacional.`
            },
            {
                name: "Fragmentación Completa",
                description: "Destrucción total del asteroide en fragmentos menores que se quemen en la atmósfera. Riesgo de múltiples impactos."
            },
            {
                name: "Tractor Gravitacional Masivo",
                description: "Colocación de múltiples naves masivas para desviación orbital completa. Requiere 5-10 años de anticipación."
            }
        ];
        
        timeCritical = "TIEMPO CRÍTICO: 5-10 años antes del impacto. Cooperación internacional y desarrollo tecnológico masivo requerido.";
        
        evacuation = [
            "Evacuación continental: reubicación de población en hemisferio opuesto",
            "Evacuación de emergencia en radio de 500 km del punto de impacto",
            "Relocalización de capitales y centros de gobierno",
            "Preparación para invierno nuclear global: refugios con suministros para 2 años"
        ];
    }
    
    // Ajustar estrategias basadas en composición
    if (composition === 'iron') {
        mainStrategy += " ASTEROIDE METÁLICO: Mayor resistencia a deflexión. Se requieren estrategias más agresivas.";
        alternatives.push({
            name: "Penetradores Nucleares",
            description: "Penetradores con cabezas nucleares para detonación interna en asteroide metálico."
        });
    } else if (composition === 'cometary') {
        mainStrategy += " ASTEROIDE COMETARIO: Mayor volatilidad. Riesgo de fragmentación incontrolada.";
        alternatives.push({
            name: "Calentamiento Gradual",
            description: "Calentamiento controlado para sublimación de hielos y desviación por retroceso."
        });
    }
    
    return {
        mainStrategy,
        alternatives,
        timeCritical,
        evacuation
    };
}

// ============================================
// PDF GENERATION FUNCTIONALITY
// ============================================

function downloadSimulationPDF() {
    if (!currentFullResults) {
        showNotification('No hay datos de simulación para exportar', 'warning');
        return;
    }

    try {
        const { jsPDF} = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración de colores profesionales y científicos
        const primaryColor = [26, 54, 93]; // #1a365d - Azul oscuro profesional
        const secondaryColor = [44, 82, 130]; // #2c5282 - Azul medio
        const dangerColor = [153, 27, 27]; // #991b1b - Rojo oscuro
        const warningColor = [180, 83, 9]; // #b45309 - Naranja/Ámbar oscuro
        const successColor = [21, 128, 61]; // #15803d - Verde oscuro
        const textPrimary = [31, 41, 55]; // #1f2937 - Gris muy oscuro
        const textSecondary = [75, 85, 99]; // #4b5563 - Gris medio
        const accentColor = [30, 58, 138]; // #1e3a8a - Azul científico
        
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        
        // Extraer datos de las APIs
        const usgsContext = currentFullResults.usgs_context || {};
        const locationInfo = currentFullResults.locationInfo || {};
        const popData = locationInfo.populationData || {};
        const floraFaunaAnalysis = currentFullResults.flora_fauna_analysis || {};
        const tsunamiAnalysis = currentFullResults.tsunami_analysis || {};
        const secondaryEffects = currentFullResults.secondary_effects || [];
        
        // DEBUG: Imprimir datos de población
        console.log('🔍 DEBUG PDF - Datos de población:');
        console.log('currentFullResults:', currentFullResults);
        console.log('locationInfo:', locationInfo);
        console.log('popData:', popData);
        console.log('popData.total_population:', popData.total_population);
        console.log('popData.citiesInDestructionZone:', popData.citiesInDestructionZone);
        console.log('popData.citiesInDamageZone:', popData.citiesInDamageZone);
        
        // ==========================================
        // PÁGINA 1: PORTADA CIENTÍFICA
        // ==========================================
        
        // Fondo de encabezado profesional
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        // Título principal en blanco sobre fondo oscuro
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE CIENTÍFICO DE SIMULACIÓN', pageWidth / 2, 18, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Análisis de Impacto de Asteroide NEO', pageWidth / 2, 28, { align: 'center' });
        
        // Barra secundaria con información del documento
        doc.setFillColor(...secondaryColor);
        doc.rect(0, 45, pageWidth, 12, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        const currentDate = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text('Generado: ' + currentDate, margin, 52);
        doc.text('NASA Space Apps Challenge 2025', pageWidth - margin, 52, { align: 'right' });
        
        yPos = 65;
        
        // Línea decorativa
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(1);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 3;
        
        // ==========================================
        // SECCIÓN 1: PARÁMETROS DEL ASTEROIDE
        // ==========================================
        yPos += 10;
        
        // Caja de sección con fondo
        doc.setFillColor(245, 247, 250); // Gris muy claro
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin - 2, yPos - 5, contentWidth + 4, 50, 2, 2, 'FD');
        
        // Título de sección con fondo de color
        doc.setFillColor(...primaryColor);
        doc.rect(margin, yPos - 3, 80, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('1. PARÁMETROS DEL ASTEROIDE', margin + 2, yPos + 3);
        
        yPos += 12;
        doc.setFontSize(10);
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'normal');
        
        // Obtener datos del asteroide de los inputs actuales
        const asteroidName = document.getElementById('asteroid-name')?.value || 'Personalizado';
        const diameter = document.getElementById('diameter')?.value || 'N/A';
        const velocity = document.getElementById('velocity')?.value || 'N/A';
        const angle = document.getElementById('angle')?.value || 'N/A';
        const composition = document.getElementById('composition')?.value || 'rocky';
        
        const asteroidData = [
            ['Nombre/ID:', asteroidName],
            ['Diámetro:', `${diameter} metros`],
            ['Velocidad:', `${velocity} km/s`],
            ['Ángulo de entrada:', `${angle}°`],
            ['Composición:', composition === 'rocky' ? 'Rocoso (S-type)' : composition === 'iron' ? 'Metálico (M-type)' : 'Carbonáceo (C-type)']
        ];
        
        asteroidData.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textPrimary);
            doc.text(label, margin + 5, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textSecondary);
            doc.text(value, margin + 60, yPos);
            yPos += 6;
        });
        
        yPos += 5;
        
        // ==========================================
        // SECCIÓN 2: UBICACIÓN DEL IMPACTO
        // ==========================================
        
        // Caja de sección
        doc.setFillColor(245, 247, 250);
        doc.setDrawColor(...secondaryColor);
        doc.roundedRect(margin - 2, yPos - 5, contentWidth + 4, 35, 2, 2, 'FD');
        
        // Título de sección
        doc.setFillColor(...primaryColor);
        doc.rect(margin, yPos - 3, 75, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('2. UBICACIÓN DEL IMPACTO', margin + 2, yPos + 3);
        
        yPos += 12;
        doc.setFontSize(10);
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'normal');
        
        const latitude = document.getElementById('latitude')?.value || 'N/A';
        const longitude = document.getElementById('longitude')?.value || 'N/A';
        
        const locationData = [
            ['Latitud:', `${latitude}°`],
            ['Longitud:', `${longitude}°`],
            ['Ubicación:', currentFullResults.location || 'Coordenadas personalizadas']
        ];
        
        locationData.forEach(([label, value]) => {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textPrimary);
            doc.text(label, margin + 5, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textSecondary);
            doc.text(value, margin + 60, yPos);
            yPos += 6;
        });
        
        yPos += 5;
        
        // ==========================================
        // SECCIÓN 3: RESULTADOS DEL IMPACTO
        // ==========================================
        
        // Caja de alerta con borde rojo
        doc.setFillColor(254, 242, 242); // Rojo muy claro
        doc.setDrawColor(...dangerColor);
        doc.setLineWidth(1);
        doc.roundedRect(margin - 2, yPos - 5, contentWidth + 4, 58, 2, 2, 'FD');
        
        // Título de sección crítica
        doc.setFillColor(...dangerColor);
        doc.rect(margin, yPos - 3, 80, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('3. RESULTADOS DEL IMPACTO', margin + 2, yPos + 3);
        
        yPos += 12;
        doc.setFontSize(10);
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'normal');
        
        // Energía de impacto
        const impactEnergy = currentFullResults.impact_energy || 
                            document.getElementById('impact-energy')?.textContent || '0 MT';
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textPrimary);
        doc.text('Energía de Impacto:', margin + 5, yPos);
        doc.setTextColor(...dangerColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(impactEnergy, margin + 60, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        // Tamaño del cráter
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('Diámetro del Cráter:', margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textSecondary);
        const craterSize = document.getElementById('crater-diameter')?.textContent || '0 km';
        doc.text(craterSize, margin + 60, yPos);
        yPos += 6;
        
        // Población afectada
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('Población Afectada:', margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...dangerColor);
        const population = document.getElementById('affected-population')?.textContent || '0';
        doc.text(`${population} personas`, margin + 60, yPos);
        yPos += 6;
        
        // Radio de destrucción
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('Radio de Destrucción:', margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textSecondary);
        const destructionRadius = document.getElementById('destruction-radius')?.textContent || '0 km';
        doc.text(destructionRadius, margin + 60, yPos);
        yPos += 6;
        
        // Actividad sísmica
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('Magnitud Sísmica:', margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textSecondary);
        const seismic = document.getElementById('seismic-magnitude')?.textContent || '0.0';
        doc.text(`${seismic} Richter`, margin + 60, yPos);
        yPos += 6;
        
        // Riesgo de tsunami
        doc.setTextColor(...textPrimary);
        doc.setFont('helvetica', 'bold');
        doc.text('Riesgo de Tsunami:', margin + 5, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textSecondary);
        const tsunami = document.getElementById('tsunami-risk')?.textContent || 'Bajo';
        doc.text(tsunami, margin + 60, yPos);
        yPos += 6;
        
        yPos += 5;
        
        // ==========================================
        // NUEVA PÁGINA: IMPACTO AMBIENTAL
        // ==========================================
        doc.addPage();
        yPos = 20;
        
        doc.setFontSize(16);
        doc.setTextColor(...successColor);
        doc.setFont('helvetica', 'bold');
        doc.text('4. IMPACTO AMBIENTAL', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        // Análisis detallado de fauna
        doc.setFont('helvetica', 'bold');
        doc.text('FAUNA AFECTADA:', margin + 5, yPos);
        yPos += 7;
        
        if (floraFaunaAnalysis && floraFaunaAnalysis.fauna_species && floraFaunaAnalysis.fauna_species.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Total de especies de fauna identificadas: ${floraFaunaAnalysis.fauna_species.length}`, margin + 10, yPos);
            yPos += 5;
            
            // Mostrar las 5 especies más relevantes
            const topFauna = floraFaunaAnalysis.fauna_species.slice(0, 5);
            topFauna.forEach((species, index) => {
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`• ${species.scientific_name || species.name || 'Especie no identificada'}`, margin + 15, yPos);
                if (species.common_name) {
                    doc.text(`  (${species.common_name})`, margin + 20, yPos + 4);
                    yPos += 4;
                }
                yPos += 6;
            });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...textSecondary);
            doc.text('No se encontraron datos específicos de fauna en la zona', margin + 10, yPos);
            yPos += 5;
        }
        
        yPos += 5;
        
        // Análisis detallado de flora
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('FLORA AFECTADA:', margin + 5, yPos);
        yPos += 7;
        
        if (floraFaunaAnalysis && floraFaunaAnalysis.flora_species && floraFaunaAnalysis.flora_species.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Total de especies de flora identificadas: ${floraFaunaAnalysis.flora_species.length}`, margin + 10, yPos);
            yPos += 5;
            
            // Mostrar las 5 especies más relevantes
            const topFlora = floraFaunaAnalysis.flora_species.slice(0, 5);
            topFlora.forEach((species, index) => {
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`• ${species.scientific_name || species.name || 'Especie no identificada'}`, margin + 15, yPos);
                if (species.common_name) {
                    doc.text(`  (${species.common_name})`, margin + 20, yPos + 4);
                    yPos += 4;
                }
                yPos += 6;
            });
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...textSecondary);
            doc.text('No se encontraron datos específicos de flora en la zona', margin + 10, yPos);
            yPos += 5;
        }
        
        // ==========================================
        // NUEVA PÁGINA: POBLACIÓN AFECTADA POR ZONAS
        // ==========================================
        yPos += 10;
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(...dangerColor);
        doc.setFont('helvetica', 'bold');
        doc.text('5. POBLACIÓN AFECTADA', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        if (popData && popData.total_population > 0) {
            console.log('✅ PDF: Hay datos de población, mostrando información detallada');
            console.log('Población total:', popData.total_population);
            
            // Población total
            doc.setFont('helvetica', 'bold');
            doc.text('Población Total en Zona de Riesgo:', margin + 5, yPos);
            doc.setTextColor(...dangerColor);
            doc.setFontSize(12);
            doc.text(popData.total_population.toLocaleString() + ' personas', margin + 80, yPos);
            yPos += 10;
            
            // Resumen por zonas con tasas de mortalidad
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN POR ZONAS DE IMPACTO:', margin + 5, yPos);
            yPos += 7;
            
            // Zona de destrucción total (95% mortalidad)
            if (popData.destruction_zone_population > 0) {
                const victims = Math.round(popData.destruction_zone_population * 0.95);
                doc.setTextColor(...dangerColor);
                doc.setFont('helvetica', 'bold');
                doc.text('ZONA DE DESTRUCCIÓN TOTAL (95% mortalidad):', margin + 10, yPos);
                doc.text(`${popData.destruction_zone_population.toLocaleString()} hab. → ${victims.toLocaleString()} víctimas`, margin + 80, yPos);
                yPos += 6;
            }
            
            // Zona de daño severo (15% mortalidad)
            if (popData.damage_zone_population > 0) {
                const victims = Math.round(popData.damage_zone_population * 0.15);
                doc.setTextColor(255, 140, 0);
                doc.setFont('helvetica', 'bold');
                doc.text('ZONA DE DAÑO SEVERO (15% mortalidad):', margin + 10, yPos);
                doc.text(`${popData.damage_zone_population.toLocaleString()} hab. → ${victims.toLocaleString()} víctimas`, margin + 80, yPos);
                yPos += 6;
            }
            
            // Zona de presión de aire (5% mortalidad)
            if (popData.air_pressure_zone_population > 0) {
                const victims = Math.round(popData.air_pressure_zone_population * 0.05);
                doc.setTextColor(255, 193, 7);
                doc.setFont('helvetica', 'bold');
                doc.text('ZONA DE PRESIÓN DE AIRE (5% mortalidad):', margin + 10, yPos);
                doc.text(`${popData.air_pressure_zone_population.toLocaleString()} hab. → ${victims.toLocaleString()} víctimas`, margin + 80, yPos);
                yPos += 6;
            }
            
            // Total de víctimas estimadas
            const totalVictims = Math.round(
                (popData.destruction_zone_population || 0) * 0.95 + 
                (popData.damage_zone_population || 0) * 0.15 + 
                (popData.air_pressure_zone_population || 0) * 0.05
            );
            
            yPos += 5;
            doc.setFontSize(12);
            doc.setTextColor(...dangerColor);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL DE VÍCTIMAS ESTIMADAS:', margin + 5, yPos);
            doc.setFontSize(14);
            doc.text(`${totalVictims.toLocaleString()} personas`, margin + 80, yPos);
            yPos += 10;
            
            // Desglose por zonas con ciudades específicas
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('Poblaciones Afectadas por Zona:', margin + 5, yPos);
            yPos += 7;
            
            // Zona de destrucción total
            if (popData.destruction_zone_population && popData.citiesInDestructionZone) {
                doc.setTextColor(...dangerColor);
                doc.text('ZONA DE DESTRUCCIÓN TOTAL:', margin + 10, yPos);
                doc.text(popData.destruction_zone_population.toLocaleString() + ' personas', margin + 80, yPos);
                yPos += 6;
                
                // Mostrar ciudades específicas en zona de destrucción
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const topDestructionCities = popData.citiesInDestructionZone.slice(0, 5);
                topDestructionCities.forEach((city, index) => {
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const victims = Math.round(city.population * 0.95); // 95% mortalidad en zona de destrucción
                    doc.text(`• ${city.name}: ${city.population.toLocaleString()} hab. (${victims.toLocaleString()} víctimas estimadas)`, margin + 15, yPos);
                    yPos += 5;
                });
                yPos += 3;
            }
            
            // Zona de daño severo
            if (popData.damage_zone_population && popData.citiesInDamageZone) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 140, 0);
                doc.text('ZONA DE DAÑO SEVERO:', margin + 10, yPos);
                doc.text(popData.damage_zone_population.toLocaleString() + ' personas', margin + 80, yPos);
                yPos += 6;
                
                // Mostrar ciudades específicas en zona de daño
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const topDamageCities = popData.citiesInDamageZone.slice(0, 5);
                topDamageCities.forEach((city, index) => {
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const victims = Math.round(city.population * 0.15); // 15% mortalidad en zona de daño
                    doc.text(`• ${city.name}: ${city.population.toLocaleString()} hab. (${victims.toLocaleString()} víctimas estimadas)`, margin + 15, yPos);
                    yPos += 5;
                });
                yPos += 3;
            }
            
            // Todas las ciudades en zona de destrucción (si hay más de 5)
            if (popData.citiesInDestructionZone && popData.citiesInDestructionZone.length > 5) {
                yPos += 5;
                if (yPos > pageHeight - 60) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...dangerColor);
                doc.text(`TODAS LAS CIUDADES EN ZONA DE DESTRUCCIÓN (${popData.citiesInDestructionZone.length} ciudades):`, margin + 5, yPos);
                yPos += 7;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                
                popData.citiesInDestructionZone.forEach((city, index) => {
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    const victims = Math.round(city.population * 0.95);
                    const cityText = `${index + 1}. ${city.name}: ${city.population.toLocaleString()} hab. (${victims.toLocaleString()} víctimas estimadas)`;
                    const splitText = doc.splitTextToSize(cityText, contentWidth - 15);
                    doc.text(splitText, margin + 10, yPos);
                    yPos += splitText.length * 3 + 2;
                });
            }
            
            // Todas las ciudades en zona de daño (si hay más de 5)
            if (popData.citiesInDamageZone && popData.citiesInDamageZone.length > 5) {
                yPos += 5;
                if (yPos > pageHeight - 60) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(255, 140, 0);
                doc.text(`TODAS LAS CIUDADES EN ZONA DE DAÑO SEVERO (${popData.citiesInDamageZone.length} ciudades):`, margin + 5, yPos);
                yPos += 7;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                
                popData.citiesInDamageZone.forEach((city, index) => {
                    if (yPos > pageHeight - 40) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    const victims = Math.round(city.population * 0.15);
                    const cityText = `${index + 1}. ${city.name}: ${city.population.toLocaleString()} hab. (${victims.toLocaleString()} víctimas estimadas)`;
                    const splitText = doc.splitTextToSize(cityText, contentWidth - 15);
                    doc.text(splitText, margin + 10, yPos);
                    yPos += splitText.length * 3 + 2;
                });
            }
            
            // Ciudad más cercana al impacto
            if (popData.nearestCity) {
                yPos += 5;
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(...primaryColor);
                doc.text('CIUDAD MÁS CERCANA AL IMPACTO:', margin + 5, yPos);
                yPos += 7;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(0, 0, 0);
                const nearestText = `• ${popData.nearestCity.name}: ${popData.nearestCity.population.toLocaleString()} habitantes - Distancia: ${popData.nearestCity.distance.toFixed(1)} km`;
                const splitNearest = doc.splitTextToSize(nearestText, contentWidth - 10);
                doc.text(splitNearest, margin + 10, yPos);
                yPos += splitNearest.length * 4 + 3;
            }
            
            // Resumen estadístico
            yPos += 5;
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...textPrimary);
            doc.text('RESUMEN ESTADÍSTICO:', margin + 5, yPos);
            yPos += 7;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...textSecondary);
            
            const stats = [
                `Total de ciudades afectadas: ${(popData.citiesInDestructionZone?.length || 0) + (popData.citiesInDamageZone?.length || 0)}`,
                `Ciudades en zona de destrucción: ${popData.citiesInDestructionZone?.length || 0}`,
                `Ciudades en zona de daño: ${popData.citiesInDamageZone?.length || 0}`,
                `Población total afectada: ${popData.total_population.toLocaleString()} personas`,
                `Víctimas estimadas totales: ${Math.round((popData.destruction_zone_population || 0) * 0.95 + (popData.damage_zone_population || 0) * 0.15).toLocaleString()} personas`
            ];
            
            stats.forEach(stat => {
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`• ${stat}`, margin + 10, yPos);
                yPos += 5;
            });
        } else {
            console.log('❌ PDF: No hay datos de población significativa');
            console.log('popData existe:', !!popData);
            console.log('popData.total_population:', popData?.total_population);
            console.log('popData es:', popData);
            
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text('No hay población significativa en la zona de impacto', margin + 5, yPos);
            yPos += 7;
        }
        
        // ==========================================
        // SECCIÓN 6: ANÁLISIS SÍSMICO (USGS API)
        // ==========================================
        yPos += 10;
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(...warningColor);
        doc.setFont('helvetica', 'bold');
        doc.text('6. ANÁLISIS SÍSMICO (USGS API)', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        const seismicMag = document.getElementById('seismic-magnitude')?.textContent || '0.0';
        
        doc.setFont('helvetica', 'bold');
        doc.text('Magnitud del Impacto:', margin + 5, yPos);
        doc.setTextColor(...dangerColor);
        doc.setFontSize(12);
        doc.text(`${seismicMag} Richter`, margin + 60, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Historial sísmico de la zona
        if (usgsContext && usgsContext.seismic_history) {
            const seismic = usgsContext.seismic_history;
            doc.setFont('helvetica', 'bold');
            doc.text('Historial Sísmico de la Zona:', margin + 5, yPos);
            yPos += 7;
            
            doc.setFont('helvetica', 'normal');
            doc.text(`• Sismos registrados: ${seismic.count}`, margin + 10, yPos);
            yPos += 6;
            
            if (seismic.count > 0) {
                doc.text(`• Magnitud máxima histórica: ${seismic.max_magnitude.toFixed(1)} Richter`, margin + 10, yPos);
                yPos += 6;
                doc.text(`• Magnitud promedio: ${seismic.avg_magnitude.toFixed(1)} Richter`, margin + 10, yPos);
                yPos += 6;
                
                const comparison = parseFloat(seismicMag) > seismic.max_magnitude ? 
                    'Este impacto SUPERARÍA todos los sismos históricos de la zona' :
                    'Este impacto es comparable a sismos históricos locales';
                    
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...dangerColor);
                const splitComp = doc.splitTextToSize(comparison, contentWidth - 15);
                doc.text(splitComp, margin + 10, yPos);
                yPos += splitComp.length * 5 + 5;
            }
        }
        
        // Efectos sísmicos esperados
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Efectos Sísmicos Esperados:', margin + 5, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        const seismicEffects = [
            '• Daños estructurales en edificios hasta 50 km',
            '• Deslizamientos de tierra en zonas montañosas',
            '• Posible licuefacción del suelo en áreas saturadas',
            '• Réplicas sísmicas durante días o semanas'
        ];
        
        seismicEffects.forEach(effect => {
            const splitEffect = doc.splitTextToSize(effect, contentWidth - 15);
            doc.text(splitEffect, margin + 10, yPos);
            yPos += splitEffect.length * 5 + 3;
        });
        
        // ==========================================
        // SECCIÓN 7: EFECTOS SECUNDARIOS
        // ==========================================
        yPos += 10;
        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(...warningColor);
        doc.setFont('helvetica', 'bold');
        doc.text('7. EFECTOS SECUNDARIOS', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        // Tsunami (NOAA API)
        const tsunamiRisk = document.getElementById('tsunami-risk')?.textContent || 'Bajo';
        doc.setFont('helvetica', 'bold');
        doc.text('Riesgo de Tsunami (NOAA):', margin + 5, yPos);
        const tsunamiColor = tsunamiRisk.toLowerCase().includes('alto') ? dangerColor :
                            tsunamiRisk.toLowerCase().includes('medio') ? warningColor :
                            successColor;
        doc.setTextColor(...tsunamiColor);
        doc.text(tsunamiRisk, margin + 70, yPos);
        yPos += 10;
        
        doc.setTextColor(0, 0, 0);
        if (tsunamiAnalysis && tsunamiAnalysis.tsunami_analysis) {
            doc.setFont('helvetica', 'normal');
            const tsunamiText = tsunamiAnalysis.tsunami_analysis.interpretation || 'Análisis no disponible';
            const splitTsunami = doc.splitTextToSize(tsunamiText, contentWidth - 10);
            doc.text(splitTsunami, margin + 5, yPos);
            yPos += splitTsunami.length * 5 + 5;
        }
        
        // Radiación y partículas
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Efectos Atmosféricos y Radiación:', margin + 5, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        const atmosphericEffects = [
            '• Generación de polvo y cenizas en la atmósfera',
            '• Posible "invierno de impacto" con reducción de luz solar',
            '• Emisión de gases y vapor de agua',
            '• Alteración temporal de la temperatura global/local',
            '• Radiación térmica en el área cercana al impacto'
        ];
        
        atmosphericEffects.forEach(effect => {
            const splitEffect = doc.splitTextToSize(effect, contentWidth - 15);
            doc.text(splitEffect, margin + 10, yPos);
            yPos += splitEffect.length * 5 + 3;
        });
        
        // Efectos secundarios específicos del backend
        if (secondaryEffects && secondaryEffects.length > 0) {
            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.text('Efectos Adicionales Detectados:', margin + 5, yPos);
            yPos += 7;
            
            doc.setFont('helvetica', 'normal');
            secondaryEffects.slice(0, 5).forEach(effect => {
                const effectText = `• ${effect.type || effect.effect_type}: ${effect.description || effect.severity || 'Efecto significativo'}`;
                const splitEffect = doc.splitTextToSize(effectText, contentWidth - 15);
                doc.text(splitEffect, margin + 10, yPos);
                yPos += splitEffect.length * 5 + 3;
            });
        }
        
        // ==========================================
        // SECCIÓN 8: ANÁLISIS DETALLADO (renumerado)
        // ==========================================
        yPos += 10;
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('8. ANÁLISIS DETALLADO', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        // Descripción del impacto
        const impactDesc = `Este reporte documenta los resultados de una simulación de impacto de asteroide realizada ` +
                          `con el Asteroid Impact Simulator. Los datos presentados son estimaciones basadas en modelos ` +
                          `científicos y no representan predicciones reales de eventos futuros.`;
        
        const splitDesc = doc.splitTextToSize(impactDesc, contentWidth);
        doc.text(splitDesc, margin, yPos);
        yPos += splitDesc.length * 5 + 10;
        
        // Comparación de energía
        doc.setFont('helvetica', 'bold');
        doc.text('Comparación de Energía:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        
        const energyValue = parseFloat(impactEnergy);
        let comparison = '';
        if (energyValue < 0.001) {
            comparison = 'Equivalente a una pequeña explosión convencional';
        } else if (energyValue < 0.01) {
            comparison = 'Similar a 1 tonelada de TNT';
        } else if (energyValue < 0.1) {
            comparison = 'Comparable a 100 toneladas de TNT';
        } else if (energyValue < 1) {
            comparison = 'Equivalente a una bomba pequeña';
        } else if (energyValue < 15) {
            comparison = 'Similar a la bomba de Hiroshima (15 MT)';
        } else if (energyValue < 50) {
            comparison = 'Mayor que todas las armas nucleares actuales';
        } else {
            comparison = 'Evento catastrófico global - Nivel de extinción masiva';
        }
        
        const splitComparison = doc.splitTextToSize(comparison, contentWidth - 10);
        doc.text(splitComparison, margin + 5, yPos);
        yPos += splitComparison.length * 5 + 10;
        
        // Efectos secundarios
        doc.setFont('helvetica', 'bold');
        doc.text('Efectos Secundarios Esperados:', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        
        const effects = [
            '• Ondas sísmicas que se propagarán por cientos de kilómetros',
            '• Generación de polvo y escombros en la atmósfera',
            '• Posible alteración temporal del clima local',
            '• Daños estructurales en edificaciones cercanas',
            '• Riesgo de incendios en la zona de impacto'
        ];
        
        if (tsunami !== 'Bajo') {
            effects.push('• Generación de tsunamis en costas cercanas');
        }
        
        effects.forEach(effect => {
            const splitEffect = doc.splitTextToSize(effect, contentWidth - 10);
            doc.text(splitEffect, margin + 5, yPos);
            yPos += splitEffect.length * 5 + 3;
        });
        
        // ==========================================
        // SECCIÓN 9: RECOMENDACIONES
        // ==========================================
        yPos += 10;
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('9. RECOMENDACIONES', margin, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        // Calcular estrategias de mitigación específicas
        const mitigationStrategies = calculateMitigationStrategies(currentFullResults);
        
        // Título de subsección
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.text('ESTRATEGIAS DE MITIGACIÓN RECOMENDADAS:', margin + 5, yPos);
        yPos += 8;
        
        // Estrategia principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...successColor);
        doc.text('ESTRATEGIA PRINCIPAL:', margin + 5, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const mainStrategy = doc.splitTextToSize(mitigationStrategies.mainStrategy, contentWidth - 10);
        doc.text(mainStrategy, margin + 10, yPos);
        yPos += mainStrategy.length * 5 + 5;
        
        // Estrategias alternativas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...warningColor);
        doc.text('ESTRATEGIAS ALTERNATIVAS:', margin + 5, yPos);
        yPos += 6;
        
        mitigationStrategies.alternatives.forEach((strategy, index) => {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...textPrimary);
            doc.text(`${index + 1}. ${strategy.name}:`, margin + 10, yPos);
            yPos += 5;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...textSecondary);
            const strategyText = doc.splitTextToSize(strategy.description, contentWidth - 15);
            doc.text(strategyText, margin + 15, yPos);
            yPos += strategyText.length * 4 + 3;
        });
        
        // Tiempo de respuesta requerido
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...dangerColor);
        doc.text('TIEMPO DE RESPUESTA CRÍTICO:', margin + 5, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const timeText = doc.splitTextToSize(mitigationStrategies.timeCritical, contentWidth - 10);
        doc.text(timeText, margin + 10, yPos);
        yPos += timeText.length * 5 + 5;
        
        // Recomendaciones de evacuación específicas
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...dangerColor);
        doc.text('PLAN DE EVACUACIÓN:', margin + 5, yPos);
        yPos += 6;
        
        mitigationStrategies.evacuation.forEach((rec, index) => {
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }
            
            const text = `${index + 1}. ${rec}`;
            const splitRec = doc.splitTextToSize(text, contentWidth - 10);
            doc.text(splitRec, margin + 10, yPos);
            yPos += splitRec.length * 4 + 3;
        });
        
        // ==========================================
        // PIE DE PÁGINA CIENTÍFICO
        // ==========================================
        const footerY = pageHeight - 12;
        
        // Línea superior del pie de página
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(0.5);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
        
        // Pie de página con estilo profesional
        doc.setFontSize(7);
        doc.setTextColor(...textSecondary);
        doc.setFont('helvetica', 'normal');
        doc.text('Asteroid Impact Simulator - NASA Space Apps Challenge 2025', margin, footerY);
        doc.setFont('helvetica', 'italic');
        doc.text('DOCUMENTO DE SIMULACIÓN - No representa eventos reales', margin, footerY + 3.5);
        
        // Logo/Marca en el pie
        doc.setFont('helvetica', 'bold');
        doc.text('AIS', pageWidth - margin - 10, footerY + 1.5);
        
        // Agregar números de página con estilo científico
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Añadir header en todas las páginas excepto la primera
            if (i > 1) {
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, pageWidth, 8, 'F');
                doc.setFontSize(8);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'normal');
                doc.text('REPORTE CIENTÍFICO - Simulación de Impacto de Asteroide', margin, 5.5);
            }
            
            // Número de página con caja
            const pageNumY = pageHeight - 10;
            doc.setFillColor(...secondaryColor);
            doc.roundedRect(pageWidth - margin - 15, pageNumY - 4, 13, 6, 1, 1, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(`${i}/${pageCount}`, pageWidth - margin - 8.5, pageNumY, { align: 'center' });
        }
        
        // Guardar el PDF
        const fileName = `Reporte_Impacto_Asteroide_${new Date().getTime()}.pdf`;
        doc.save(fileName);
        
        showNotification('PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar el PDF: ' + error.message, 'error');
    }
}

// Cerrar modal de deflexión con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDeflectionModal();
    }
});

// ============================================
// FUNCIÓN DE AUTO-ZOOM A ZONA DE IMPACTO
// ============================================
function zoomToImpactZone() {
    // Verificar que tenemos datos procesados
    if (!processedSimulationData) {
        console.error('❌ No hay datos de simulación procesados para hacer zoom');
        return;
    }
    
    const { result } = processedSimulationData;
    
    if (!result || !result.input || !result.input.impact_location) {
        console.error('❌ No hay ubicación de impacto en los datos procesados');
        return;
    }
    
    const lat = result.input.impact_location.lat;
    const lon = result.input.impact_location.lon;
    
    if (!lat || !lon) {
        console.error('❌ Coordenadas de impacto inválidas');
        return;
    }
    
    // Verificar que el mapa esté inicializado con un retry
    let retryCount = 0;
    const maxRetries = 10;
    
    const attemptZoom = () => {
        if (!impactMap) {
            retryCount++;
            if (retryCount < maxRetries) {
                setTimeout(attemptZoom, 500);
                return;
            } else {
                console.error('❌ El mapa no se inicializó después de múltiples intentos');
                return;
            }
        }
        
        // Calcular el zoom apropiado basado en el radio de destrucción
        let zoomLevel = 10; // Zoom por defecto
        
        if (result.calculations && result.calculations.destruction_radius_km) {
            const destructionRadius = result.calculations.destruction_radius_km;
            
            // Ajustar zoom basado en el radio de destrucción
            if (destructionRadius < 5) {
                zoomLevel = 12; // Zoom más cercano para impactos pequeños
            } else if (destructionRadius < 20) {
                zoomLevel = 11;
            } else if (destructionRadius < 50) {
                zoomLevel = 10;
            } else {
                zoomLevel = 9; // Zoom más lejano para impactos grandes
            }
        }
        
        // Hacer zoom suave a la ubicación de impacto
        try {
            // Asegurar que las coordenadas sean números válidos
            const impactLat = parseFloat(lat);
            const impactLon = parseFloat(lon);
            
            if (isNaN(impactLat) || isNaN(impactLon)) {
                console.error('❌ Coordenadas no son números válidos:', lat, lon);
                return;
            }
            
            impactMap.flyTo([impactLat, impactLon], zoomLevel, {
                duration: 2.5, // Duración de 2.5 segundos
                easeLinearity: 0.25,
                animate: true
            });
            
        } catch (error) {
            console.error('❌ Error al hacer zoom:', error);
        }
    };
    
    attemptZoom();
}

// Exponer la función globalmente
window.zoomToImpactZone = zoomToImpactZone;


