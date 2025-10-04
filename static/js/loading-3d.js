// ============================================
// ANIMACIÓN 3D PARA PANTALLA DE CARGA
// Basada en Diseño3D original - Física y efectos reales
// ============================================
let scene3d, camera3d, renderer3d, controls3d;
let tierra3d, asteroide3d, sunLight3d;
let orbitAngle3d = 0;
let orbitRadius3d = 8;
let orbitSpeed3d = 0.005;
let simulationStartTime3d = null;
let approachStartTime3d = null;
let orbitPhase3d = 'orbiting'; // 'orbiting', 'approaching', 'falling', 'impact', 'completed'
let explosionParticles3d = [];
let impactOccurred3d = false;
let animationFrame3d = null;
let asteroidVelocity3d = new THREE.Vector3();
let impactStartTime3d = null;

const EARTH_RADIUS_3D = 2;
const ORBIT_STABLE_DURATION_3D = 1000; // 1 segundo de órbita estable
const APPROACH_DURATION_3D = 1000; // 1 segundo de aproximación
const EXPLOSION_DURATION_3D = 1000; // 1 segundo de explosión
const TEXTURE_BASE_URL_3D = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/';

// ============================================
// INICIALIZACIÓN
// ============================================
function init3DLoading() {
    const container = document.getElementById('loading-3d-container');
    if (!container) {
        console.error('Container no encontrado');
        return;
    }

    // Crear escena
    scene3d = new THREE.Scene();
    scene3d.background = new THREE.Color(0x000011);

    // Configurar cámara
    camera3d = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera3d.position.set(0, 5, 15);
    camera3d.lookAt(0, 0, 0);

    // Configurar renderizador
    renderer3d = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer3d.setSize(container.clientWidth, container.clientHeight);
    renderer3d.shadowMap.enabled = true;
    renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer3d.domElement);

    // Configurar controles
    controls3d = new THREE.OrbitControls(camera3d, renderer3d.domElement);
    controls3d.enableDamping = true;
    controls3d.dampingFactor = 0.05;
    controls3d.minDistance = 5;
    controls3d.maxDistance = 30;
    controls3d.enableZoom = true;

    // Luces mejoradas
    sunLight3d = new THREE.PointLight(0xffffff, 3.5, 300);
    sunLight3d.position.set(20, 15, 20);
    sunLight3d.castShadow = true;
    sunLight3d.shadow.mapSize.width = 2048;
    sunLight3d.shadow.mapSize.height = 2048;
    scene3d.add(sunLight3d);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene3d.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(-10, 10, 10);
    directionalLight.castShadow = true;
    scene3d.add(directionalLight);

    const fillLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene3d.add(fillLight);

    // Crear tierra con texturas reales
    loadEarth3D();

    // Crear estrellas (15000)
    createStars3D();

    // Manejar redimensionamiento
    window.addEventListener('resize', onWindowResize3D, false);

    // Iniciar animación
    animate3D();

    console.log('✅ Animación 3D de carga inicializada');
}

// ============================================
// TIERRA CON TEXTURAS REALES Y ATMÓSFERA
// ============================================
function loadEarth3D() {
    const textureLoader = new THREE.TextureLoader();
    
    const earthTexture = textureLoader.load(
        TEXTURE_BASE_URL_3D + 'earth_atmos_2048.jpg',
        () => console.log('✅ Textura de Tierra cargada')
    );
    
    const earthBumpMap = textureLoader.load(
        TEXTURE_BASE_URL_3D + 'earth_normal_2048.jpg'
    );

    const earthSpecularMap = textureLoader.load(
        TEXTURE_BASE_URL_3D + 'earth_specular_2048.jpg'
    );

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS_3D, 128, 128);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBumpMap,
        bumpScale: 0.05,
        specularMap: earthSpecularMap,
        specular: new THREE.Color(0x666666),
        shininess: 15,
        emissive: 0x112233,
        emissiveIntensity: 0.15
    });

    tierra3d = new THREE.Mesh(earthGeometry, earthMaterial);
    tierra3d.castShadow = true;
    tierra3d.receiveShadow = true;
    scene3d.add(tierra3d);

    // Añadir atmósfera visible
    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS_3D + 0.15, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x6699ff,
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide,
        emissive: 0x3366ff,
        emissiveIntensity: 0.2
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    tierra3d.add(atmosphere);
}

// ============================================
// ESTRELLAS DE FONDO (15000 estrellas)
// ============================================
function createStars3D() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene3d.add(stars);
}

// ============================================
// CREAR ASTEROIDE CON FORMA IRREGULAR
// ============================================
function createAsteroid3D(asteroidSize) {
    if (asteroide3d) {
        scene3d.remove(asteroide3d);
    }

    const asteroidRadius = asteroidSize || 0.3;
    
    // Usar DodecahedronGeometry para forma más irregular
    const asteroidGeometry = new THREE.DodecahedronGeometry(asteroidRadius, 1);
    
    // Material rocoso realista
    const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.9,
        metalness: 0.2,
        emissive: 0x221100,
        emissiveIntensity: 0.2
    });
    
    // Deformar la geometría para hacerla más irregular (CLAVE PARA REALISMO)
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
    
    asteroide3d = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroide3d.castShadow = true;
    asteroide3d.receiveShadow = true;
    asteroide3d.visible = true;
    
    scene3d.add(asteroide3d);
    
    console.log('✅ Asteroide irregular creado con forma realista');
}

// ============================================
// INICIAR SIMULACIÓN
// ============================================
function startAsteroidSimulation3D(asteroidData = null) {
    // Limpiar partículas
    explosionParticles3d.forEach(p => {
        if (p.geometry) scene3d.remove(p);
    });
    explosionParticles3d = [];
    
    // Resetear variables
    orbitPhase3d = 'orbiting';
    impactOccurred3d = false;
    simulationStartTime3d = null;
    approachStartTime3d = null;
    impactStartTime3d = null;
    orbitRadius3d = 8;
    asteroidVelocity3d.set(0, 0, 0);

    // Calcular tamaño del asteroide basado en datos reales
    let asteroidSize = 0.3;
    
    if (asteroidData) {
        let diameterM = asteroidData.diameter_max_m || asteroidData.diameter_max || 0;
        
        if (!diameterM && asteroidData.diameter_min_m) {
            diameterM = (asteroidData.diameter_min_m + asteroidData.diameter_max_m) / 2;
        }
        
        if (diameterM > 0) {
            asteroidSize = Math.max(0.15, Math.min(0.8, (diameterM / 1000) * 0.8));
            
            console.log(`🪨 Asteroide: ${asteroidData.name || 'Desconocido'}`);
            console.log(`   Diámetro real: ${diameterM.toFixed(0)} metros`);
            console.log(`   Tamaño en escena: ${asteroidSize.toFixed(2)} unidades`);
        }
    }
    
    createAsteroid3D(asteroidSize);

    // Posición inicial en órbita
    orbitAngle3d = Math.random() * Math.PI * 2;
    const x = Math.cos(orbitAngle3d) * orbitRadius3d;
    const z = Math.sin(orbitAngle3d) * orbitRadius3d;
    asteroide3d.position.set(x, 0, z);

    console.log('🚀 Asteroide en órbita - esperando datos...');
}

// ============================================
// TRIGGER DE IMPACTO - INICIA SECUENCIA COMPLETA
// ============================================
function triggerImpact3D() {
    if (orbitPhase3d === 'orbiting') {
        console.log('💥 Iniciando secuencia completa de impacto (Física realista)...');
        orbitPhase3d = 'stable';
        simulationStartTime3d = Date.now();
    }
}

// ============================================
// ANIMACIÓN PRINCIPAL (Lógica del diseño original)
// ============================================
function animate3D() {
    animationFrame3d = requestAnimationFrame(animate3D);

    const now = Date.now();

    // Rotar tierra
    if (tierra3d) {
        tierra3d.rotation.y += 0.001;
    }

    // Animar asteroide
    if (asteroide3d && !impactOccurred3d) {
        if (orbitPhase3d === 'orbiting') {
            // FASE 0: Órbita indefinida (hasta que se active el impacto)
            orbitAngle3d += orbitSpeed3d;
            const x = Math.cos(orbitAngle3d) * orbitRadius3d;
            const z = Math.sin(orbitAngle3d) * orbitRadius3d;
            asteroide3d.position.set(x, 0, z);
            asteroide3d.rotation.x += 0.02;
            asteroide3d.rotation.y += 0.015;
        }
        else if (simulationStartTime3d) {
            const timeElapsed = now - simulationStartTime3d;
            
            // Verificar impacto constantemente
            const currentDistance = asteroide3d.position.length();
            const asteroidRadius = asteroide3d.geometry.parameters.radius || 0.3;
            
            if (currentDistance <= EARTH_RADIUS_3D + asteroidRadius + 0.4) {
                console.log('💥 IMPACTO DETECTADO!');
                impactOccurred3d = true;
                orbitPhase3d = 'impact';
                asteroide3d.visible = false;
                asteroidVelocity3d.set(0, 0, 0);
                createExplosion3D();
                return;
            }
            
            // FASE 1: Órbita estable (6 segundos)
            if (timeElapsed < ORBIT_STABLE_DURATION_3D) {
                orbitPhase3d = 'stable';
                
                const prevPosition = asteroide3d.position.clone();
                orbitAngle3d += orbitSpeed3d;
                
                const a = orbitRadius3d;
                const b = a * 0.9;
                
                asteroide3d.position.x = a * Math.cos(orbitAngle3d);
                asteroide3d.position.z = b * Math.sin(orbitAngle3d);
                asteroide3d.position.y = Math.sin(orbitAngle3d) * 0.3;
                
                asteroidVelocity3d.subVectors(asteroide3d.position, prevPosition);
                
                asteroide3d.rotation.x += 0.02;
                asteroide3d.rotation.y += 0.015;
            }
            // FASE 2: Aproximación con espiral decadente (4 segundos)
            else if (timeElapsed < ORBIT_STABLE_DURATION_3D + APPROACH_DURATION_3D) {
                if (orbitPhase3d === 'stable') {
                    orbitPhase3d = 'approaching';
                    approachStartTime3d = now;
                    
                    const tangent = new THREE.Vector3(-asteroide3d.position.z, 0, asteroide3d.position.x).normalize();
                    asteroidVelocity3d.copy(tangent).multiplyScalar(orbitSpeed3d * orbitRadius3d * 0.3);
                }
                
                const approachTime = now - approachStartTime3d;
                const approachProgress = approachTime / APPROACH_DURATION_3D;
                
                const distanceToCenter = asteroide3d.position.length();
                const toCenter = new THREE.Vector3(0, 0, 0).sub(asteroide3d.position).normalize();
                
                // Gravedad fuerte
                const gravityStrength = 0.0012 * (1 + approachProgress * 3);
                const gravityForce = toCenter.multiplyScalar(gravityStrength);
                
                asteroidVelocity3d.add(gravityForce);
                
                // Fricción
                const frictionFactor = 1 - (approachProgress * 0.005);
                asteroidVelocity3d.multiplyScalar(frictionFactor);
                
                asteroide3d.position.add(asteroidVelocity3d);
                
                asteroide3d.rotation.x += 0.03 * (1 + approachProgress);
                asteroide3d.rotation.y += 0.025 * (1 + approachProgress);
            }
            // FASE 3: Caída final con física realista
            else {
                if (orbitPhase3d === 'approaching') {
                    orbitPhase3d = 'falling';
                    console.log('💫 Caída final iniciada');
                }
                
                const distanceToEarth = asteroide3d.position.length();
                const gravityDirection = new THREE.Vector3(0, 0, 0).sub(asteroide3d.position).normalize();
                
                // Ley del cuadrado inverso
                const gravityMagnitude = 0.004 * (EARTH_RADIUS_3D * EARTH_RADIUS_3D) / (distanceToEarth * distanceToEarth);
                const gravityAcceleration = gravityDirection.multiplyScalar(gravityMagnitude);
                asteroidVelocity3d.add(gravityAcceleration);
                
                // Reducir velocidad tangencial
                const radialDirection = asteroide3d.position.clone().normalize();
                const radialSpeed = asteroidVelocity3d.dot(radialDirection);
                const tangentialVelocity = asteroidVelocity3d.clone().sub(radialDirection.multiplyScalar(radialSpeed));
                tangentialVelocity.multiplyScalar(0.98);
                asteroidVelocity3d.copy(radialDirection.multiplyScalar(radialSpeed).add(tangentialVelocity));
                
                // Drag atmosférico
                if (distanceToEarth < EARTH_RADIUS_3D + 0.5) {
                    asteroidVelocity3d.multiplyScalar(0.99);
                }
                
                asteroide3d.position.add(asteroidVelocity3d);
                
                // Rotación intensa
                const fallSpeed = asteroidVelocity3d.length();
                asteroide3d.rotation.x += fallSpeed * 15;
                asteroide3d.rotation.y += fallSpeed * 12;
            }
        }
    }

    // Actualizar explosión si está activa
    if (impactOccurred3d) {
        if (asteroide3d) {
            asteroide3d.visible = false;
        }
        
        if (explosionParticles3d.length > 0) {
            updateExplosion3D();
        }
    }

    // Actualizar controles
    if (controls3d) {
        controls3d.update();
    }

    // Renderizar
    if (renderer3d && scene3d && camera3d) {
        renderer3d.render(scene3d, camera3d);
    }
}

// ============================================
// CREAR EXPLOSIÓN (Del diseño original)
// ============================================
function createExplosion3D() {
    const impactDirection = asteroide3d.position.clone().normalize();
    const impactPosition = impactDirection.multiplyScalar(EARTH_RADIUS_3D + 0.1);
    
    // Luz principal intensa
    const explosionLight = new THREE.PointLight(0xff3300, 80, 150);
    explosionLight.position.copy(impactPosition);
    scene3d.add(explosionLight);
    explosionParticles3d.explosionLight = explosionLight;
    
    // Luz secundaria
    const secondaryLight = new THREE.PointLight(0xffaa00, 60, 120);
    secondaryLight.position.copy(impactPosition);
    scene3d.add(secondaryLight);
    explosionParticles3d.secondaryLight = secondaryLight;
    
    // Partículas grandes (60)
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 0.15 + 0.05;
        const geometry = new THREE.SphereGeometry(size, 6, 6);
        
        let color;
        const rand = Math.random();
        if (rand < 0.3) color = new THREE.Color(0xff0000);
        else if (rand < 0.6) color = new THREE.Color(0xff6600);
        else if (rand < 0.8) color = new THREE.Color(0xffcc00);
        else color = new THREE.Color(0x333333);
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(impactPosition);
        
        const speed = 0.15 + Math.random() * 0.15;
        const direction = new THREE.Vector3(
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            (Math.random() - 0.5)
        ).normalize();
        
        particle.velocity = direction.multiplyScalar(speed);
        particle.isRock = rand > 0.8;
        
        scene3d.add(particle);
        explosionParticles3d.push(particle);
    }
    
    impactStartTime3d = Date.now();
    console.log('💥 Explosión creada con', explosionParticles3d.length, 'partículas');
}

function updateExplosion3D() {
    if (!impactStartTime3d) return;
    
    const timeSinceImpact = Date.now() - impactStartTime3d;
    const progress = timeSinceImpact / EXPLOSION_DURATION_3D;
    
    if (timeSinceImpact < EXPLOSION_DURATION_3D) {
        explosionParticles3d.forEach((particle) => {
            if (particle.velocity) {
                particle.velocity.multiplyScalar(0.98);
                particle.velocity.y -= 0.005;
                particle.position.add(particle.velocity);
                
                const lifeDecrement = particle.isRock ? 0.015 : 0.025;
                particle.life = (particle.life || 1.0) - lifeDecrement;
                particle.material.opacity = Math.max(0, particle.life);
            }
        });
        
        if (explosionParticles3d.explosionLight) {
            explosionParticles3d.explosionLight.intensity = 50 * (1 - progress * 0.6);
        }
        
        if (explosionParticles3d.secondaryLight) {
            explosionParticles3d.secondaryLight.intensity = 40 * (1 - progress * 0.7);
        }
    } else {
        // Limpiar explosión
        explosionParticles3d.forEach(particle => {
            if (particle.geometry) scene3d.remove(particle);
        });
        
        if (explosionParticles3d.explosionLight) scene3d.remove(explosionParticles3d.explosionLight);
        if (explosionParticles3d.secondaryLight) scene3d.remove(explosionParticles3d.secondaryLight);
        
        explosionParticles3d = [];
        
        console.log('✅ Impacto completado - cerrando pantalla de carga');
        orbitPhase3d = 'completed';
        
        if (window.onImpactComplete3D) {
            window.onImpactComplete3D();
        }
        
        setTimeout(() => {
            hide3DLoading();
        }, 300);
    }
}

function easeInQuad(t) {
    return t * t;
}

function onWindowResize3D() {
    const container = document.getElementById('loading-3d-container');
    if (!container || !camera3d || !renderer3d) return;

    camera3d.aspect = container.clientWidth / container.clientHeight;
    camera3d.updateProjectionMatrix();
    renderer3d.setSize(container.clientWidth, container.clientHeight);
}

// ============================================
// CONTROL DE VISIBILIDAD
// ============================================
function show3DLoading(asteroidData = null) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        
        requestAnimationFrame(() => {
            if (!renderer3d) {
                init3DLoading();
            }
            startAsteroidSimulation3D(asteroidData);
        });
    }
}

function hide3DLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    if (animationFrame3d) {
        cancelAnimationFrame(animationFrame3d);
        animationFrame3d = null;
    }
    
    orbitPhase3d = 'orbiting';
}

// Exponer funciones globales
window.show3DLoading = show3DLoading;
window.hide3DLoading = hide3DLoading;
window.triggerImpact3D = triggerImpact3D;
