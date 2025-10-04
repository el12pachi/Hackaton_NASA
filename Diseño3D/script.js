// ============================================
// VARIABLES GLOBALES
// ============================================
let scene, camera, renderer, controls;
let tierra, asteroide, sunLight, explosionLight;
let orbitAngle = 0;
let orbitRadius = 8;
let orbitSpeed = 0.005;
let asteroidSpeed = 0;
let impactOccurred = false;
let explosionParticles = [];
let simulationStartTime = null;
let impactStartTime = null;
let simulationRunning = false;
let selectedAsteroidData = null;

// Constantes
const EARTH_RADIUS = 2;
const ORBIT_STABLE_DURATION = 6000; // 6 segundos de órbita estable
const APPROACH_DURATION = 4000; // 4 segundos de aproximación gradual
const EXPLOSION_DURATION = 2500; // 2.5 segundos de explosión (más tiempo para ver el efecto)

// Variables adicionales para órbita realista
let approachStartTime = null;
let orbitPhase = 'stable'; // 'stable', 'approaching', 'falling', 'impact'
let asteroidVelocity = new THREE.Vector3(); // Velocidad actual del asteroide (vector 3D)

// URLs de texturas
const TEXTURE_BASE_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/';

// ============================================
// INICIALIZACIÓN DE LA ESCENA 3D
// ============================================
function init() {
    // Crear escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // Configurar renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Configurar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    // Crear luz del Sol (PointLight) - MÁS INTENSA
    sunLight = new THREE.PointLight(0xffffff, 3.5, 300);
    sunLight.position.set(20, 15, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Luz ambiental más fuerte para iluminar toda la escena
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Luz direccional adicional para iluminar la Tierra desde el frente
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(-10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Luz de relleno para evitar zonas completamente oscuras
    const fillLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(fillLight);

    // Crear la Tierra con texturas reales
    loadEarthWithTextures();

    // Crear estrellas de fondo
    createStars();

    // Manejar redimensionamiento de ventana
    window.addEventListener('resize', onWindowResize, false);

    // Cargar asteroides específicos
    loadSpecificAsteroids();

    // Configurar event listeners
    setupEventListeners();

    // Iniciar animación
    animate();
    
    // Exponer variables globales para depuración en consola
    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    window.controls = controls;
    
    console.log('🎮 Variables globales expuestas para depuración');
    console.log('   Usa window.scene, window.camera, etc. en la consola');
}

// ============================================
// CARGA DE LA TIERRA CON TEXTURAS REALES
// ============================================
function loadEarthWithTextures() {
    const textureLoader = new THREE.TextureLoader();
    
    // Cargar texturas
    const earthTexture = textureLoader.load(
        TEXTURE_BASE_URL + 'earth_atmos_2048.jpg',
        () => console.log('✅ Textura de Tierra cargada'),
        undefined,
        (err) => console.error('❌ Error cargando textura de Tierra:', err)
    );
    
    const earthBumpMap = textureLoader.load(
        TEXTURE_BASE_URL + 'earth_normal_2048.jpg',
        () => console.log('✅ Mapa de relieve cargado'),
        undefined,
        (err) => console.warn('⚠️ Mapa de relieve no disponible')
    );
    
    const earthSpecularMap = textureLoader.load(
        TEXTURE_BASE_URL + 'earth_specular_2048.jpg',
        () => console.log('✅ Mapa especular cargado'),
        undefined,
        (err) => console.warn('⚠️ Mapa especular no disponible')
    );

    // Crear geometría y material de la Tierra
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBumpMap,
        bumpScale: 0.05,
        specularMap: earthSpecularMap,
        specular: new THREE.Color(0x666666),
        shininess: 15,
        emissive: 0x112233,  // Pequeño brillo propio para mejor visibilidad
        emissiveIntensity: 0.15
    });
    
    tierra = new THREE.Mesh(earthGeometry, earthMaterial);
    tierra.castShadow = true;
    tierra.receiveShadow = true;
    scene.add(tierra);
    
    // Exponer para depuración
    window.tierra = tierra;

    // Añadir atmósfera/brillo más visible
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 0.15, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x6699ff,
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide,
        emissive: 0x3366ff,
        emissiveIntensity: 0.2
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    tierra.add(atmosphere);

    // Ocultar pantalla de carga
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1000);
}

// ============================================
// CREAR ASTEROIDE
// ============================================
function createAsteroid(size, distance) {
    if (asteroide) {
        scene.remove(asteroide);
    }

    const asteroidRadius = size || 0.3;
    const asteroidGeometry = new THREE.DodecahedronGeometry(asteroidRadius, 1);
    
    // Material rocoso más visible
    const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        metalness: 0.2,
        emissive: 0x221100, // Pequeño brillo para mejor visibilidad
        emissiveIntensity: 0.2
    });
    
    // Deformar la geometría para hacerla más irregular
    const positions = asteroidGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        const noise = 0.8 + Math.random() * 0.4;
        positions.setXYZ(i, x * noise, y * noise, z * noise);
    }
    asteroidGeometry.attributes.position.needsUpdate = true;
    asteroidGeometry.computeVertexNormals();
    
    asteroide = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroide.castShadow = true;
    asteroide.receiveShadow = true;
    
    // Posición inicial en órbita
    orbitRadius = distance || 8;
    asteroide.position.x = orbitRadius;
    asteroide.position.y = 0;
    asteroide.position.z = 0;
    asteroide.visible = true; // Asegurar que sea visible
    
    scene.add(asteroide);
    
    // Exponer para depuración
    window.asteroide = asteroide;
    
    console.log('✅ Asteroide creado:', {
        tamaño: asteroidRadius,
        distancia: orbitRadius,
        posición: asteroide.position,
        visible: asteroide.visible
    });
    
    return asteroidRadius;
}

// ============================================
// CREAR ESTRELLAS DE FONDO
// ============================================
function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    
    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// ============================================
// CARGAR ASTEROIDES ESPECÍFICOS
// ============================================
async function loadSpecificAsteroids() {
    const asteroidSelect = document.getElementById('asteroidSelect');
    const statusDiv = document.getElementById('status');
    
    asteroidSelect.innerHTML = '<option value="">Cargando asteroides...</option>';
    statusDiv.textContent = '🔄 Cargando asteroides...';
    
    // Datos completos de los asteroides específicos
    const specificAsteroids = [
        { name: '2008 SS', diameterM: 158, velocityKmS: 14.5, isDangerous: false },
        { name: '2015 HN9', diameterM: 130, velocityKmS: 7.7, isDangerous: false },
        { name: '2015 KT120', diameterM: 41, velocityKmS: 11.6, isDangerous: false },
        { name: '2021 SY3', diameterM: 17, velocityKmS: 5.9, isDangerous: false },
        { name: '2021 UJ1', diameterM: 23, velocityKmS: 22.1, isDangerous: false },
        { name: '2022 FL1', diameterM: 6, velocityKmS: 7.7, isDangerous: false },
        { name: '2022 QG41', diameterM: 174, velocityKmS: 12.0, isDangerous: true },
        { name: '2022 SK21', diameterM: 33, velocityKmS: 2.4, isDangerous: false },
        { name: '2022 VV', diameterM: 79, velocityKmS: 9.1, isDangerous: false },
        { name: '2023 RV12', diameterM: 25, velocityKmS: 13.6, isDangerous: false },
        { name: '2023 SV1', diameterM: 64, velocityKmS: 31.8, isDangerous: false },
        { name: '2023 XJ16', diameterM: 446, velocityKmS: 26.2, isDangerous: false },
        { name: '2024 TW', diameterM: 7, velocityKmS: 11.8, isDangerous: false },
        { name: '2025 QK10', diameterM: 64, velocityKmS: 11.9, isDangerous: false },
        { name: '2025 RH2', diameterM: 45, velocityKmS: 5.1, isDangerous: false },
        { name: '2025 SV2', diameterM: 48, velocityKmS: 7.3, isDangerous: false },
        { name: '2025 SV6', diameterM: 16, velocityKmS: 5.0, isDangerous: false },
        { name: '2025 SE29', diameterM: 125, velocityKmS: 8.6, isDangerous: false },
        { name: '2025 TC', diameterM: 17, velocityKmS: 16.2, isDangerous: false },
        { name: '2025 TS', diameterM: 15, velocityKmS: 9.1, isDangerous: false }
    ];
    
    try {
        console.log('🎯 Cargando 20 asteroides específicos con datos predefinidos');
        
        // Convertir datos a formato interno
        const asteroids = specificAsteroids.map((data, index) => {
            // Convertir metros a kilómetros
            const diameterKm = data.diameterM / 1000;
            
            // Calcular distancia basada en velocidad (simulada)
            // Asteroides más rápidos tienden a estar más cerca
            const distanceAU = 0.01 + (Math.random() * 0.3);
            
            // Calcular periodo orbital aproximado (en días)
            const period = 200 + (Math.random() * 600);
            
            // Excentricidad orbital
            const eccentricity = 0.1 + (Math.random() * 0.3);
            
            return {
                id: `neo-${index + 1}`,
                name: data.name,
                diameter: diameterKm,
                diameterMin: diameterKm * 0.9,
                diameterMax: diameterKm * 1.1,
                diameterMeters: data.diameterM,
                distance: distanceAU,
                distanceKm: distanceAU * 149597870.7,
                velocity: data.velocityKmS,
                isDangerous: data.isDangerous,
                period: period,
                eccentricity: eccentricity,
                source: 'Datos Predefinidos',
                date: new Date().toISOString().split('T')[0],
                closeApproachDate: new Date().toISOString().split('T')[0],
                absoluteMagnitude: 20 + Math.random() * 5,
                isPotentiallyHazardous: data.isDangerous
            };
        });
        
        console.log('✅ 20 asteroides cargados con datos específicos:');
        asteroids.forEach(a => {
            const icon = a.isDangerous ? '⚠️' : '✓';
            console.log(`  ${icon} ${a.name}: ${a.diameterMeters}m, ${a.velocity} km/s`);
        });
        
        populateAsteroidSelect(asteroids);
        statusDiv.textContent = `✅ 20 asteroides cargados`;
        
    } catch (error) {
        console.error('❌ Error cargando asteroides:', error);
        asteroidSelect.innerHTML = '<option value="">Error al cargar datos</option>';
        statusDiv.textContent = `❌ Error: ${error.message}`;
    }
}

// Cargar desde Asterank (Kepler API)
async function loadFromAsterank() {
    // Query para objetos con radio planetario mayor a 0.5 radios terrestres
    // Esto nos da objetos de tamaño interesante para la simulación
    const query = encodeURIComponent(JSON.stringify({
        "RPLANET": {"$gt": 0.5, "$lt": 100}
    }));
    
    const url = `https://www.asterank.com/api/kepler?query=${query}&limit=50`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mapear datos de Kepler Objects of Interest a formato de asteroide
    return data.map(koi => {
        // Convertir radio planetario (radios terrestres) a diámetro en km
        // Radio de la Tierra = 6371 km, diámetro = radio * 2 * 6371
        // Pero para visualización usamos directamente los radios terrestres
        const diameterInEarthRadii = (koi.RPLANET || 1); // En radios terrestres
        const diameterKm = diameterInEarthRadii * 12742; // Convertir a km (diámetro terrestre = 12742 km)
        
        // Semi-eje mayor en UA (ya viene en AU)
        const distanceAU = koi.A || 1;
        
        // Calcular velocidad orbital aproximada usando la tercera ley de Kepler
        // v = 2π * a / periodo (en km/s)
        const period = Math.abs(koi.PER) || 365; // días (valor absoluto para evitar negativos)
        const velocityKmPerS = (2 * Math.PI * distanceAU * 149597870.7) / (period * 86400); // km/s
        
        // Generar excentricidad aleatoria pequeña (órbitas casi circulares)
        const eccentricity = Math.random() * 0.3;
        
        return {
            name: `KOI-${koi.KOI}` || `Objeto ${Math.random().toString(36).substr(2, 9)}`,
            diameter: diameterKm,
            distance: distanceAU,
            velocity: velocityKmPerS / 100, // Escalar para visualización
            isDangerous: koi.TPLANET > 400 || Math.random() > 0.85, // Objetos calientes = peligrosos
            period: Math.abs(period),
            eccentricity: eccentricity,
            source: 'Asterank Kepler',
            temperature: koi.TPLANET || 0,
            starTemp: koi.TSTAR || 5778,
            planetRadius: diameterInEarthRadii
        };
    }).filter(obj => obj.diameter > 0 && obj.distance > 0 && !isNaN(obj.diameter)); // Filtrar datos inválidos
}

// Cargar desde NASA NEO Feed API
async function loadFromNASA(apiKey) {
    console.log('📡 Consultando NASA NEO Feed API...');
    console.log('🔑 Usando API Key:', apiKey.substring(0, 10) + '...');
    
    // Obtener rango de fechas amplio para encontrar los asteroides específicos
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3); // Últimos 3 días
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4); // Próximos 4 días
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=${apiKey}`;
    
    console.log('🔗 URL:', `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=***`);
    console.log('📅 Rango de fechas:', `${startDateStr} a ${endDateStr}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📦 Datos recibidos:', {
        element_count: data.element_count,
        fechas_disponibles: Object.keys(data.near_earth_objects || {}).length
    });
    
    const asteroids = [];
    
    // Procesar NEOs por fecha (estructura: data.near_earth_objects[date][])
    if (data.near_earth_objects) {
        Object.keys(data.near_earth_objects).forEach(date => {
            const neosForDate = data.near_earth_objects[date];
            console.log(`📅 ${date}: ${neosForDate.length} asteroides`);
            
            neosForDate.forEach(neo => {
                // Verificar que tenga datos de aproximación
                if (!neo.close_approach_data || neo.close_approach_data.length === 0) {
                    return;
                }
                
                const approach = neo.close_approach_data[0];
                
                // Calcular diámetro promedio en km (convertir de metros)
                const diameterMinM = neo.estimated_diameter.meters.estimated_diameter_min;
                const diameterMaxM = neo.estimated_diameter.meters.estimated_diameter_max;
                const diameterKm = ((diameterMinM + diameterMaxM) / 2) / 1000;
                
                // Distancia en UA (Unidades Astronómicas)
                const distanceAU = parseFloat(approach.miss_distance.astronomical);
                
                // Distancia en km
                const distanceKm = parseFloat(approach.miss_distance.kilometers);
                
                // Velocidad relativa en km/s
                const velocityKmS = parseFloat(approach.relative_velocity.kilometers_per_second);
                
                // Datos orbitales
                const eccentricity = parseFloat(neo.orbital_data?.eccentricity) || 0.2;
                const orbitalPeriod = parseFloat(neo.orbital_data?.orbital_period) || 365;
                
                // Crear objeto de asteroide
                asteroids.push({
                    id: neo.id,
                    name: neo.name.replace(/[()]/g, '').trim(), // Limpiar nombre
                    diameter: diameterKm,
                    diameterMin: diameterMinM / 1000,
                    diameterMax: diameterMaxM / 1000,
                    distance: distanceAU,
                    distanceKm: distanceKm,
                    velocity: velocityKmS,
                    isDangerous: neo.is_potentially_hazardous_asteroid,
                    period: orbitalPeriod,
                    eccentricity: eccentricity,
                    source: 'NASA NEO API',
                    date: date,
                    closeApproachDate: approach.close_approach_date,
                    closeApproachDateFull: approach.close_approach_date_full,
                    absoluteMagnitude: neo.absolute_magnitude_h,
                    isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
                    neoReferenceId: neo.neo_reference_id,
                    nasaJplUrl: neo.nasa_jpl_url
                });
            });
        });
    }
    
    // Ordenar por distancia (más cercanos primero)
    asteroids.sort((a, b) => a.distance - b.distance);
    
    console.log(`✅ Total: ${asteroids.length} asteroides NEO procesados`);
    console.log(`⚠️ Peligrosos (PHO): ${asteroids.filter(a => a.isDangerous).length}`);
    console.log(`📏 Rango de tamaños: ${Math.min(...asteroids.map(a => a.diameter)).toFixed(3)} - ${Math.max(...asteroids.map(a => a.diameter)).toFixed(3)} km`);
    
    // Retornar los 50 más cercanos
    return asteroids.slice(0, 50);
}

// Poblar el selector con asteroides
function populateAsteroidSelect(asteroids) {
    const asteroidSelect = document.getElementById('asteroidSelect');
    asteroidSelect.innerHTML = '<option value="">-- Selecciona un asteroide --</option>';
    
    asteroids.forEach((asteroid, index) => {
        const option = document.createElement('option');
        option.value = index;
        
        // Mostrar diámetro en metros
        const diameterM = asteroid.diameterMeters || (asteroid.diameter * 1000);
        const diameterText = `${Math.round(diameterM)}m`;
        
        // Mostrar velocidad
        const velocityText = `${asteroid.velocity.toFixed(1)} km/s`;
        
        // Indicador de peligrosidad
        const dangerIcon = asteroid.isDangerous ? '⚠️ ' : '';
        const dangerText = asteroid.isDangerous ? 'PELIGROSO' : 'Seguro';
        
        option.textContent = `${dangerIcon}${asteroid.name} - ${diameterText}, ${velocityText} - ${dangerText}`;
        option.dataset.asteroidData = JSON.stringify(asteroid);
        asteroidSelect.appendChild(option);
    });
    
    // Guardar datos para referencia
    asteroidSelect.asteroidsData = asteroids;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Selección de asteroide
    document.getElementById('asteroidSelect').addEventListener('change', function() {
        if (this.value) {
            const asteroid = this.asteroidsData[this.value];
            selectedAsteroidData = asteroid;
            displayAsteroidInfo(asteroid);
            document.getElementById('startSimulation').disabled = false;
        } else {
            document.getElementById('startSimulation').disabled = true;
        }
    });
    
    // Botón iniciar simulación
    document.getElementById('startSimulation').addEventListener('click', startSimulation);
    
    // Botón reiniciar
    document.getElementById('resetSimulation').addEventListener('click', resetSimulation);
}

// ============================================
// MOSTRAR INFORMACIÓN DEL ASTEROIDE
// ============================================
function displayAsteroidInfo(asteroid) {
    document.getElementById('infoName').textContent = asteroid.name;
    
    // Mostrar diámetro en metros
    const diameterM = asteroid.diameterMeters || (asteroid.diameter * 1000);
    document.getElementById('infoDiameter').textContent = `${Math.round(diameterM)} metros`;
    
    document.getElementById('infoDistance').textContent = `${asteroid.distance.toFixed(4)} UA (${(asteroid.distance * 149597870.7 / 1000).toFixed(0)} mil km)`;
    document.getElementById('infoVelocity').textContent = `${asteroid.velocity.toFixed(1)} km/s`;
    
    // Mostrar fecha si está disponible
    const dateElement = document.getElementById('infoDate');
    if (dateElement) {
        if (asteroid.date) {
            dateElement.textContent = new Date(asteroid.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            dateElement.textContent = 'N/A';
        }
    }
    
    document.getElementById('infoDangerous').textContent = asteroid.isDangerous ? '⚠️ SÍ - PELIGROSO' : '✅ NO - Seguro';
    document.getElementById('infoDangerous').style.color = asteroid.isDangerous ? '#ff3333' : '#66ff66';
    document.getElementById('infoDangerous').style.fontWeight = asteroid.isDangerous ? 'bold' : 'normal';
}

// ============================================
// INICIAR SIMULACIÓN
// ============================================
function startSimulation() {
    if (!selectedAsteroidData) return;
    
    // Resetear estado
    resetSimulation(false);
    
    // Obtener diámetro en metros
    const diameterM = selectedAsteroidData.diameterMeters || (selectedAsteroidData.diameter * 1000);
    
    // ESCALA REALISTA CON LA TIERRA
    // Tierra: diámetro ~12,742 km = 12,742,000 metros, radio 2 unidades en 3D
    // Escala: 1 unidad 3D = 6,371,000 metros (radio terrestre)
    
    // Calcular tamaño 3D proporcional REAL
    const EARTH_DIAMETER_METERS = 12742000;
    const EARTH_RADIUS_3D = 2; // unidades 3D
    
    // Escala real: asteroidSize = (diameterM / EARTH_DIAMETER_METERS) * (EARTH_RADIUS_3D * 2)
    let asteroidSizeReal = (diameterM / EARTH_DIAMETER_METERS) * (EARTH_RADIUS_3D * 2);
    
    // PROBLEMA: Con escala real, los asteroides serían INVISIBLES
    // 446m / 12,742,000m * 4 = 0.00014 unidades (invisible)
    
    // SOLUCIÓN: Usar escala exagerada pero proporcional entre asteroides
    // Multiplicador para hacerlos visibles: x3000
    let asteroidSize = asteroidSizeReal * 3000;
    
    // Escala proporcional al tamaño:
    // 6m   → 0.0019 * 3000 = 0.006 (muy pequeño pero visible con zoom)
    // 446m → 0.14 * 3000 = 0.42 (más grande pero aún pequeño vs Tierra)
    
    // Para mejor visualización, usar escala logarítmica con mínimo visible
    if (diameterM <= 10) {
        // 6-10m: muy pequeños
        asteroidSize = 0.08 + (diameterM / 10) * 0.04;
    } else if (diameterM <= 50) {
        // 10-50m: pequeños
        asteroidSize = 0.12 + ((diameterM - 10) / 40) * 0.08;
    } else if (diameterM <= 100) {
        // 50-100m: medianos
        asteroidSize = 0.20 + ((diameterM - 50) / 50) * 0.10;
    } else if (diameterM <= 200) {
        // 100-200m: grandes
        asteroidSize = 0.30 + ((diameterM - 100) / 100) * 0.15;
    } else {
        // >200m: muy grandes
        asteroidSize = 0.45 + Math.min((diameterM - 200) / 250, 1) * 0.15;
    }
    
    // Limitar valores
    asteroidSize = Math.max(0.08, Math.min(asteroidSize, 0.6));
    
    // Distancia orbital
    const asteroidDistance = 8;
    
    // Calcular ratio real para información
    const realRatio = EARTH_DIAMETER_METERS / diameterM;
    
    console.log('🚀 Iniciando simulación:', {
        nombre: selectedAsteroidData.name,
        diámetroReal: `${diameterM}m`,
        diámetroTierra: '12,742 km',
        ratioReal: `La Tierra es ${Math.round(realRatio).toLocaleString()}x más grande`,
        tamaño3D: asteroidSize.toFixed(3),
        tamaño3DTierra: `${EARTH_RADIUS_3D * 2} (diámetro)`,
        velocidad: `${selectedAsteroidData.velocity} km/s`,
        nota: 'Escala exagerada 3000x para visualización'
    });
    
    // Crear asteroide con parámetros
    const asteroidRadius = createAsteroid(asteroidSize, asteroidDistance);
    
    // Configurar velocidad orbital basada en velocidad real
    orbitSpeed = 0.005 + (selectedAsteroidData.velocity / 2000);
    
    // Iniciar simulación
    simulationRunning = true;
    simulationStartTime = Date.now();
    impactOccurred = false;
    orbitAngle = 0;
    asteroidSpeed = 0;
    
    document.getElementById('status').textContent = `🚀 ${selectedAsteroidData.name} (${diameterM}m) - ${Math.round(realRatio / 1000)}k× más pequeño que la Tierra`;
    document.getElementById('startSimulation').disabled = true;
}

// ============================================
// REINICIAR SIMULACIÓN
// ============================================
function resetSimulation(showMessage = true) {
    // Limpiar asteroide
    if (asteroide) {
        scene.remove(asteroide);
        asteroide = null;
    }
    
    // Limpiar explosión
    explosionParticles.forEach(particle => scene.remove(particle));
    explosionParticles = [];
    
    if (explosionLight) {
        scene.remove(explosionLight);
        explosionLight = null;
    }
    
    // Resetear variables
    simulationRunning = false;
    impactOccurred = false;
    simulationStartTime = null;
    impactStartTime = null;
    approachStartTime = null;
    orbitAngle = 0;
    asteroidSpeed = 0;
    orbitPhase = 'stable';
    asteroidVelocity.set(0, 0, 0);
    
    if (showMessage) {
        document.getElementById('status').textContent = '🔄 Simulación reiniciada. Selecciona un objeto.';
    }
    
    if (selectedAsteroidData) {
        document.getElementById('startSimulation').disabled = false;
    }
}

// ============================================
// CREAR EFECTO DE EXPLOSIÓN MEJORADO
// ============================================
function createExplosion() {
    console.log('💥 ========== CREANDO EXPLOSIÓN =========');
    console.log('📍 Posición asteroide:', asteroide.position);
    
    // Normalizar posición de impacto en la superficie de la Tierra
    const impactDirection = asteroide.position.clone().normalize();
    const impactPosition = impactDirection.multiplyScalar(EARTH_RADIUS + 0.1);
    console.log('📍 Posición explosión en superficie:', impactPosition);
    
    // LUZ PRINCIPAL - MUY INTENSA
    explosionLight = new THREE.PointLight(0xff3300, 80, 150); // Mucho más intensa
    explosionLight.position.copy(impactPosition);
    scene.add(explosionLight);
    console.log('💡 Luz principal añadida - Intensidad: 80');
    
    // LUZ SECUNDARIA - Grande y brillante
    const secondaryLight = new THREE.PointLight(0xffaa00, 60, 120);
    secondaryLight.position.copy(impactPosition);
    scene.add(secondaryLight);
    explosionParticles.secondaryLight = secondaryLight;
    console.log('💡 Luz secundaria añadida - Intensidad: 60');

    // PARTÍCULAS GRANDES Y VISIBLES
    const particleCount = 250;
    console.log('🎆 Creando', particleCount, 'partículas grandes...');
    
    for (let i = 0; i < particleCount; i++) {
        // PARTÍCULAS MUCHO MÁS GRANDES
        const size = 0.08 + Math.random() * 0.2; // Tamaño muy aumentado
        const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
        
        // Colores MÁS BRILLANTES
        let color;
        const rand = Math.random();
        if (rand > 0.7) color = 0xff0000; // Rojo intenso
        else if (rand > 0.4) color = 0xff6600; // Naranja brillante
        else if (rand > 0.2) color = 0xffcc00; // Amarillo dorado
        else color = 0xffff00; // Amarillo puro
        
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1.0,
            emissive: color,
            emissiveIntensity: 1.5
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(impactPosition);
        
        // Velocidades MUCHO MAYORES
        const speed = 0.15 + Math.random() * 0.4;
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.random() * Math.PI * 0.5 - Math.PI * 0.25;
        
        particle.velocity = new THREE.Vector3(
            Math.cos(angle) * Math.cos(elevation) * speed,
            Math.sin(elevation) * speed * 2.5, // Explosión vertical dramática
            Math.sin(angle) * Math.cos(elevation) * speed
        );
        
        // Componente radial fuerte
        const radialDir = impactDirection.clone().multiplyScalar(speed * 0.6);
        particle.velocity.add(radialDir);
        
        explosionParticles.push(particle);
        scene.add(particle);
    }
    
    console.log('✅', explosionParticles.length, 'partículas añadidas a la escena');
    
    // =============== AÑADIR CHISPAS RÁPIDAS ===============
    const sparkCount = 400; // Muchas chispas
    console.log('✨ Creando', sparkCount, 'chispas brillantes...');
    
    for (let i = 0; i < sparkCount; i++) {
        // Chispas PEQUEÑAS y brillantes
        const sparkSize = 0.02 + Math.random() * 0.05;
        const sparkGeometry = new THREE.SphereGeometry(sparkSize, 4, 4);
        
        // Colores muy brillantes - blanco, amarillo, naranja
        let sparkColor;
        const sparkRand = Math.random();
        if (sparkRand > 0.8) sparkColor = 0xffffff; // Blanco brillante
        else if (sparkRand > 0.5) sparkColor = 0xffff00; // Amarillo puro
        else if (sparkRand > 0.3) sparkColor = 0xffaa00; // Naranja
        else sparkColor = 0xff8800; // Naranja rojizo
        
        const sparkMaterial = new THREE.MeshBasicMaterial({
            color: sparkColor,
            transparent: true,
            opacity: 1.0,
            emissive: sparkColor,
            emissiveIntensity: 2.0 // MUY brillante
        });
        
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.copy(impactPosition);
        
        // Velocidades MUY RÁPIDAS y aleatorias
        const sparkSpeed = 0.3 + Math.random() * 0.8;
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkElevation = (Math.random() - 0.5) * Math.PI;
        
        spark.velocity = new THREE.Vector3(
            Math.cos(sparkAngle) * Math.cos(sparkElevation) * sparkSpeed,
            Math.sin(sparkElevation) * sparkSpeed,
            Math.sin(sparkAngle) * Math.cos(sparkElevation) * sparkSpeed
        );
        
        // Añadir explosión radial
        const sparkRadial = impactDirection.clone().multiplyScalar(sparkSpeed * 0.8);
        spark.velocity.add(sparkRadial);
        
        // Marcar como chispa para animación diferente
        spark.isSpark = true;
        spark.lifeTime = Math.random() * 0.5 + 0.5; // Vida entre 0.5 y 1.0
        
        explosionParticles.push(spark);
        scene.add(spark);
    }
    
    console.log('✨ Total de efectos:', explosionParticles.length);
    
    // =============== ANILLOS DE ONDA MÚLTIPLES ===============
    const ringCount = 3;
    for (let r = 0; r < ringCount; r++) {
        const ringGeometry = new THREE.RingGeometry(0.2 + r * 0.15, 0.5 + r * 0.15, 32);
        const ringColor = r === 0 ? 0xffff00 : (r === 1 ? 0xff8800 : 0xff4400);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: ringColor,
            transparent: true,
            opacity: 0.9 - r * 0.2,
            side: THREE.DoubleSide,
            emissive: ringColor,
            emissiveIntensity: 1.5 - r * 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(impactPosition);
        ring.lookAt(0, 0, 0);
        scene.add(ring);
        
        if (!explosionParticles.rings) explosionParticles.rings = [];
        explosionParticles.rings.push({ mesh: ring, index: r });
    }
    
    // ONDA DE CHOQUE PRINCIPAL
    const shockwaveGeometry = new THREE.RingGeometry(0.3, 0.7, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        emissive: 0xff4400,
        emissiveIntensity: 1.2
    });
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(impactPosition);
    shockwave.lookAt(0, 0, 0);
    scene.add(shockwave);
    explosionParticles.shockwave = shockwave;
    console.log('💫 Ondas de choque añadidas (múltiples)');
    
    impactStartTime = Date.now();
    
    const asteroidName = selectedAsteroidData?.name || 'Asteroide';
    const diameterM = selectedAsteroidData?.diameterMeters || 0;
    document.getElementById('status').textContent = 
        `💥 ¡IMPACTO DE ${asteroidName}! (${diameterM}m) - Explosión en curso...`;
    
    console.log('🎬 EXPLOSIÓN INICIADA - Duración:', EXPLOSION_DURATION, 'ms');
    console.log('=========================================');
}

// ============================================
// ACTUALIZAR ANIMACIÓN DE EXPLOSIÓN MEJORADA
// ============================================
function updateExplosion() {
    if (!impactStartTime) {
        console.warn('⚠️ updateExplosion llamado sin impactStartTime');
        return;
    }
    
    const timeSinceImpact = Date.now() - impactStartTime;
    const progress = timeSinceImpact / EXPLOSION_DURATION;
    
    if (timeSinceImpact < EXPLOSION_DURATION) {
        // Animar partículas con física más realista
        explosionParticles.forEach((particle, index) => {
            if (particle.velocity) {
                // Aplicar velocidad
                particle.position.add(particle.velocity);
                
                // CHISPAS tienen física diferente
                if (particle.isSpark) {
                    // Chispas: desaceleración rápida con gravedad fuerte
                    particle.velocity.multiplyScalar(0.92);
                    
                    // Gravedad más fuerte en chispas
                    const toEarth = new THREE.Vector3(0, 0, 0).sub(particle.position).normalize();
                    particle.velocity.add(toEarth.multiplyScalar(0.003));
                    
                    // Fade out rápido basado en su vida
                    const sparkProgress = progress / particle.lifeTime;
                    particle.material.opacity = Math.max(0, 1 - sparkProgress * 1.5);
                    
                    // Brillo que decae rápido
                    const sparkBrightness = Math.max(0, 1 - sparkProgress * 1.2);
                    particle.material.emissiveIntensity = sparkBrightness * 2;
                } else {
                    // Partículas grandes: desaceleración lenta
                    particle.velocity.multiplyScalar(0.97);
                    
                    // Gravedad suave hacia la Tierra
                    const toEarth = new THREE.Vector3(0, 0, 0).sub(particle.position).normalize();
                    particle.velocity.add(toEarth.multiplyScalar(0.001));
                    
                    // Fade out más lento
                    particle.material.opacity = Math.max(0, 1 - progress * 0.8);
                    
                    // Mantienen brillo por más tiempo
                    const brightness = Math.max(0.3, 1 - progress * 0.7);
                    particle.material.emissive = particle.material.color;
                    particle.material.emissiveIntensity = brightness;
                }
                
                particle.material.transparent = true;
            }
        });
        
        // Luz principal MUCHO MÁS BRILLANTE con parpadeo intenso
        if (explosionLight) {
            const flicker = 0.7 + Math.sin(timeSinceImpact * 0.05) * 0.3;
            explosionLight.intensity = 50 * flicker * (1 - progress * 0.6); // Mantiene intensidad
        }
        
        // Luz secundaria también más intensa
        if (explosionParticles.secondaryLight) {
            explosionParticles.secondaryLight.intensity = 40 * (1 - progress * 0.7);
        }
        
        // Animar múltiples ondas de choque
        if (explosionParticles.rings) {
            explosionParticles.rings.forEach(ringData => {
                const ring = ringData.mesh;
                const delay = ringData.index * 0.15; // Delay escalonado
                const ringProgress = Math.max(0, progress - delay);
                
                const scale = 1 + ringProgress * (15 - ringData.index * 2);
                ring.scale.set(scale, scale, 1);
                ring.material.opacity = Math.max(0, (1.0 - ringProgress * 1.3) * 0.8);
            });
        }
        
        // Onda de choque principal
        if (explosionParticles.shockwave) {
            const scale = 1 + progress * 12;
            explosionParticles.shockwave.scale.set(scale, scale, 1);
            explosionParticles.shockwave.material.opacity = Math.max(0, 1.0 - progress * 1.2);
        }
        
    } else {
        // Limpiar explosión completamente
        explosionParticles.forEach(particle => {
            if (particle.geometry) scene.remove(particle);
        });
        
        if (explosionParticles.secondaryLight) {
            scene.remove(explosionParticles.secondaryLight);
        }
        
        if (explosionParticles.shockwave) {
            scene.remove(explosionParticles.shockwave);
        }
        
        if (explosionParticles.rings) {
            explosionParticles.rings.forEach(ringData => {
                scene.remove(ringData.mesh);
            });
        }
        
        explosionParticles = [];
        
        if (explosionLight) {
            scene.remove(explosionLight);
            explosionLight = null;
        }
        
        const asteroidName = selectedAsteroidData?.name || 'asteroide';
        document.getElementById('status').textContent = 
            `✅ Impacto de ${asteroidName} simulado. Reinicia para ver otro.`;
    }
}

// ============================================
// BUCLE DE ANIMACIÓN
// ============================================
function animate() {
    requestAnimationFrame(animate);
    
    // Rotar la Tierra
    if (tierra) {
        tierra.rotation.y += 0.001;
    }
    
    // SOLO animar asteroide si NO ha ocurrido el impacto
    if (simulationRunning && asteroide && !impactOccurred) {
        const timeElapsed = Date.now() - simulationStartTime;
        
        // Verificar impacto ANTES de cualquier movimiento
        const currentDistance = asteroide.position.length();
        const asteroidRadius = asteroide.geometry?.parameters?.radius || 0.3;
        
        if (currentDistance <= EARTH_RADIUS + asteroidRadius + 0.4) {
            console.log('💥 IMPACTO DETECTADO! Distancia:', currentDistance, 'Radio mínimo:', EARTH_RADIUS + asteroidRadius);
            impactOccurred = true;
            orbitPhase = 'impact';
            simulationRunning = false;
            asteroide.visible = false;
            asteroidVelocity.set(0, 0, 0);
            createExplosion();
            return; // SALIR INMEDIATAMENTE
        }
        
        // Asegurar que el asteroide esté visible
        asteroide.visible = true;
        
        // Obtener datos orbitales
        const eccentricity = selectedAsteroidData?.eccentricity || 0.15;
        const a = orbitRadius; // Semi-eje mayor
        const b = a * Math.sqrt(1 - eccentricity * eccentricity); // Semi-eje menor
        
        // FASE 1: Órbita estable (6 segundos)
        if (timeElapsed < ORBIT_STABLE_DURATION) {
            orbitPhase = 'stable';
            
            // Guardar posición anterior para calcular velocidad
            const prevPosition = asteroide.position.clone();
            
            // Avanzar en la órbita
            orbitAngle += orbitSpeed;
            
            // Órbita elíptica con inclinación orbital realista
            const orbitalInclination = (selectedAsteroidData?.eccentricity || 0.2) * Math.PI * 0.25;
            
            // Posición en órbita elíptica
            asteroide.position.x = a * Math.cos(orbitAngle);
            asteroide.position.z = b * Math.sin(orbitAngle);
            asteroide.position.y = Math.sin(orbitAngle) * Math.sin(orbitalInclination) * 2;
            
            // Calcular velocidad tangencial orbital (para usar en fase de caída)
            asteroidVelocity.subVectors(asteroide.position, prevPosition);
            
            // Rotación del asteroide (velocidad basada en datos reales)
            const rotationSpeed = (selectedAsteroidData?.velocity || 15) / 500;
            asteroide.rotation.x += rotationSpeed * 0.02;
            asteroide.rotation.y += rotationSpeed * 0.015;
            asteroide.rotation.z += rotationSpeed * 0.01;
            
            // Actualizar status
            const remaining = Math.ceil((ORBIT_STABLE_DURATION - timeElapsed) / 1000);
            document.getElementById('status').textContent = 
                `🛰️ Órbita estable... Aproximación en ${remaining}s`;
        }
        // FASE 2: Aproximación gradual - Espiral decadente (4 segundos)
        else if (timeElapsed < ORBIT_STABLE_DURATION + APPROACH_DURATION) {
            if (orbitPhase === 'stable') {
                orbitPhase = 'approaching';
                approachStartTime = Date.now();
                
                // Inicializar velocidad tangencial REDUCIDA (más lenta para asegurar caída)
                const tangent = new THREE.Vector3(-asteroide.position.z, 0, asteroide.position.x).normalize();
                asteroidVelocity.copy(tangent).multiplyScalar(orbitSpeed * orbitRadius * 0.3); // Reducido de 0.8 a 0.3
            }
            
            const approachTime = Date.now() - approachStartTime;
            const approachProgress = approachTime / APPROACH_DURATION;
            
            // FÍSICA REALISTA: Mantener momento angular + gravedad DOMINANTE
            const distanceToCenter = asteroide.position.length();
            
            // Vector hacia el centro (gravedad)
            const toCenter = new THREE.Vector3(0, 0, 0).sub(asteroide.position).normalize();
            
            // Gravedad MÁS FUERTE para asegurar caída (aumentada significativamente)
            const gravityStrength = 0.0012 * (1 + approachProgress * 3); // Aumentado de 0.0003 a 0.0012
            const gravityForce = toCenter.multiplyScalar(gravityStrength);
            
            // Aplicar gravedad a la velocidad (conservar momento angular pero dominada por gravedad)
            asteroidVelocity.add(gravityForce);
            
            // Aplicar fricción gradual para reducir velocidad tangencial (simula pérdida de energía)
            const frictionFactor = 1 - (approachProgress * 0.005); // Fricción progresiva
            asteroidVelocity.multiplyScalar(frictionFactor);
            
            // Aplicar la velocidad a la posición
            asteroide.position.add(asteroidVelocity);
            
            // Aumentar rotación gradualmente
            asteroide.rotation.x += 0.03 * (1 + approachProgress);
            asteroide.rotation.y += 0.025 * (1 + approachProgress);
            
            const remaining = Math.ceil((APPROACH_DURATION - approachTime) / 1000);
            const distanceKm = (distanceToCenter - EARTH_RADIUS) * 6371;
            const velocityKmS = asteroidVelocity.length() * 6371;
            document.getElementById('status').textContent = 
                `⚠️ Espiral de aproximación... ${remaining}s - ${distanceKm.toFixed(0)} km | ${velocityKmS.toFixed(1)} km/s`;
        }
        // FASE 3: Caída final con física realista
        else {
            if (orbitPhase === 'approaching') {
                orbitPhase = 'falling';
                // La velocidad ya está inicializada de la fase anterior
                console.log('💫 Iniciando caída final. Velocidad actual:', asteroidVelocity);
            }
            
            // Calcular distancia al centro de la Tierra
            const distanceToEarth = asteroide.position.length();
            
            // Vector de dirección hacia el centro (fuerza gravitacional)
            const gravityDirection = new THREE.Vector3(0, 0, 0).sub(asteroide.position).normalize();
            
            // Gravedad MUY FUERTE: aumenta dramáticamente al acercarse (ley del cuadrado inverso)
            const gravityMagnitude = 0.004 * (EARTH_RADIUS * EARTH_RADIUS) / (distanceToEarth * distanceToEarth);
            
            // Aplicar aceleración gravitacional al vector velocidad
            const gravityAcceleration = gravityDirection.multiplyScalar(gravityMagnitude);
            asteroidVelocity.add(gravityAcceleration);
            
            // Reducir componente tangencial para asegurar caída (fricción espacial simulada)
            const radialDirection = asteroide.position.clone().normalize();
            const radialSpeed = asteroidVelocity.dot(radialDirection);
            const tangentialVelocity = asteroidVelocity.clone().sub(radialDirection.multiplyScalar(radialSpeed));
            
            // Reducir velocidad tangencial gradualmente (drag + pérdida energía)
            tangentialVelocity.multiplyScalar(0.98);
            asteroidVelocity.copy(radialDirection.multiplyScalar(radialSpeed).add(tangentialVelocity));
            
            // Aplicar drag atmosférico más fuerte si está cerca
            if (distanceToEarth < EARTH_RADIUS + 0.5) {
                asteroidVelocity.multiplyScalar(0.99); // Fricción atmosférica
            }
            
            // Actualizar posición con la velocidad
            asteroide.position.add(asteroidVelocity);
            
            // Rotación aumenta con la velocidad de caída
            const fallSpeed = asteroidVelocity.length();
            asteroide.rotation.x += fallSpeed * 15;
            asteroide.rotation.y += fallSpeed * 12;
            asteroide.rotation.z += fallSpeed * 8;
            
            // Verificar impacto CONSTANTEMENTE durante la caída
            const asteroidRadius = asteroide.geometry.parameters.radius || 0.3;
            const impactThreshold = EARTH_RADIUS + asteroidRadius + 0.4;
            
            if (distanceToEarth <= impactThreshold) {
                console.log('💥 IMPACTO en fase de caída! Distancia:', distanceToEarth, 'Umbral:', impactThreshold);
                
                // DETENER TODO INMEDIATAMENTE
                impactOccurred = true;
                orbitPhase = 'impact';
                simulationRunning = false;
                
                // OCULTAR Y CONGELAR ASTEROIDE
                asteroide.visible = false;
                asteroidVelocity.set(0, 0, 0);
                
                // Calcular velocidad de impacto
                const impactVelocity = asteroidVelocity.length();
                console.log(`💥 IMPACTO! Velocidad: ${(impactVelocity * 6371).toFixed(2)} km/s`);
                
                // ACTIVAR EXPLOSIÓN
                createExplosion();
                return; // SALIR INMEDIATAMENTE
            }
            
            const distanceKm = (distanceToEarth - EARTH_RADIUS) * 6371;
            const velocityKmS = asteroidVelocity.length() * 6371;
            document.getElementById('status').textContent = 
                `🔥 CAÍDA... ${distanceKm.toFixed(0)} km | ${velocityKmS.toFixed(1)} km/s`;
        }
    }
    
    // Actualizar SOLO la explosión si está activa
    if (impactOccurred) {
        // FORZAR asteroide invisible en cada frame
        if (asteroide) {
            asteroide.visible = false;
            // NO mover el asteroide bajo ninguna circunstancia
        }
        
        // Actualizar explosión si existe
        if (explosionParticles.length > 0) {
            updateExplosion();
        }
    }
    
    // Actualizar controles
    controls.update();
    
    // Renderizar escena
    renderer.render(scene, camera);
}

// ============================================
// REDIMENSIONAMIENTO DE VENTANA
// ============================================
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================
window.addEventListener('DOMContentLoaded', init);
