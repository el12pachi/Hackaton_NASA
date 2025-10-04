// ============================================
// SISTEMA DE INTERNACIONALIZACIÓN (i18n)
// ============================================

// Mapeo de códigos de países a idiomas
const countryToLanguage = {
    // Español
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es', 'PE': 'es', 
    'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es',
    'HN': 'es', 'PY': 'es', 'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es',
    'UY': 'es', 'GQ': 'es',
    
    // Inglés
    'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en',
    'ZA': 'en', 'IN': 'en', 'PK': 'en', 'NG': 'en', 'KE': 'en', 'GH': 'en',
    'PH': 'en', 'SG': 'en', 'MY': 'en', 'HK': 'en',
    
    // Francés
    'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr', 'CD': 'fr',
    'CI': 'fr', 'CM': 'fr', 'MG': 'fr', 'SN': 'fr', 'ML': 'fr', 'BJ': 'fr',
    'HT': 'fr', 'TD': 'fr', 'GN': 'fr', 'RW': 'fr',
    
    // Alemán
    'DE': 'de', 'AT': 'de', 'LI': 'de',
    
    // Portugués
    'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt', 'GW': 'pt', 'TL': 'pt',
    'CV': 'pt', 'ST': 'pt',
    
    // Italiano
    'IT': 'it', 'SM': 'it', 'VA': 'it',
    
    // Ruso
    'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru',
    
    // Chino
    'CN': 'zh', 'TW': 'zh',
    
    // Japonés
    'JP': 'ja',
    
    // Coreano
    'KR': 'ko',
    
    // Árabe
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'MA': 'ar', 'DZ': 'ar', 'TN': 'ar',
    'IQ': 'ar', 'SY': 'ar', 'JO': 'ar', 'LB': 'ar', 'LY': 'ar', 'SD': 'ar',
    'YE': 'ar', 'OM': 'ar', 'KW': 'ar', 'QA': 'ar', 'BH': 'ar',
    
    // Neerlandés
    'NL': 'nl',
    
    // Sueco
    'SE': 'sv',
    
    // Noruego
    'NO': 'no',
    
    // Danés
    'DK': 'dk',
    
    // Finlandés
    'FI': 'fi',
    
    // Polaco
    'PL': 'pl',
    
    // Turco
    'TR': 'tr',
    
    // Griego
    'GR': 'el',
    
    // Hebreo
    'IL': 'he',
    
    // Hindi
    'IN': 'hi',
    
    // Tailandés
    'TH': 'th',
    
    // Vietnamita
    'VN': 'vi',
    
    // Indonesio
    'ID': 'id'
};

// Traducciones
const translations = {
    es: {
        // Header
        'header.title': 'Simulador de Impacto de Asteroides',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': 'Simulación de Impacto',
        'header.mode.mitigation': 'Estrategias de Mitigación',
        'header.theme': 'Cambiar tema',
        
        // Simulation Controls
        'sim.title': 'Parámetros del Asteroide',
        'sim.asteroid': 'Asteroide',
        'sim.asteroid.custom': 'Personalizado',
        'sim.asteroid.loading': 'Cargando asteroides de la NASA...',
        'sim.diameter': 'Diámetro (metros)',
        'sim.velocity': 'Velocidad (km/s)',
        'sim.angle': 'Ángulo de Entrada (°)',
        'sim.composition': 'Composición del Asteroide',
        'sim.composition.rocky': 'Rocoso (S-type) - Común',
        'sim.composition.metallic': 'Metálico (M-type) - Denso',
        'sim.composition.carbonaceous': 'Carbonáceo (C-type) - Frágil',
        'sim.composition.icy': 'Helado (Cometa) - Volátil',
        'sim.impact': 'Punto de Impacto',
        'sim.latitude': 'Latitud',
        'sim.longitude': 'Longitud',
        'sim.button': 'Simular Impacto',
        'sim.results.placeholder': 'Ejecute una simulación para ver los resultados',
        'sim.results.view': 'Ver Resultados Completos',
        
        // Mitigation Controls
        'mit.title': 'Estrategia de Deflexión',
        'mit.method': 'Método',
        'mit.method.kinetic': 'Impactador Cinético',
        'mit.method.gravity': 'Tractor de Gravedad',
        'mit.diameter': 'Diámetro (m)',
        'mit.velocity': 'Velocidad (km/s)',
        'mit.time': 'Tiempo (días)',
        'mit.mass': 'Masa Impactador (kg)',
        'mit.impactor.velocity': 'Velocidad Impactador (km/s)',
        'mit.button': 'Calcular Deflexión',
        'mit.results.placeholder': 'Ejecute una simulación de deflexión para ver los resultados',
        
        // Map Legend
        'legend.destruction': 'Destrucción Total',
        'legend.damage': 'Daño Severo',
        'legend.affected': 'Área Afectada',
        
        // Loading
        'loading': 'Calculando...',
        
        // Modal
        'modal.title': 'Resultados Completos del Impacto',
        'modal.close': 'Cerrar',
        
        // Asteroid Modal
        'asteroid.modal.title': 'Información del Asteroide',
        'asteroid.modal.use': 'Usar en Simulación',
        'asteroid.modal.close': 'Cerrar',
        'asteroid.general': 'Información General',
        'asteroid.id': 'ID NASA',
        'asteroid.name': 'Nombre',
        'asteroid.danger': 'Nivel de peligro',
        'asteroid.dangerous': 'POTENCIALMENTE PELIGROSO',
        'asteroid.safe': 'No peligroso',
        'asteroid.dimensions': 'Dimensiones',
        'asteroid.diameter': 'Diámetro Estimado',
        'asteroid.range': 'Rango',
        'asteroid.comparison': 'Comparación',
        'asteroid.orbital': 'Características Orbitales',
        'asteroid.velocity': 'Velocidad relativa',
        'asteroid.approach': 'Fecha de aproximación',
        'asteroid.distance': 'Distancia mínima',
        'asteroid.close': 'Aproximación cercana',
        'asteroid.pha.title': 'Asteroide Potencialmente Peligroso (PHA)',
        'asteroid.pha.desc': 'Este asteroide está clasificado como PHA debido a su tamaño y proximidad orbital a la Tierra. La NASA monitorea constantemente su trayectoria.',
        'asteroid.note': 'Los datos provienen de la API NeoWs de la NASA y representan asteroides cercanos a la Tierra (NEOs) reales que han sido observados y catalogados.',
        
        // Size comparisons
        'asteroid.size.house': 'Similar a una casa pequeña',
        'asteroid.size.building': 'Similar a un edificio de 10 pisos',
        'asteroid.size.stadium': 'Similar a un estadio de fútbol',
        'asteroid.size.blocks': 'Similar a varios edificios juntos',
        'asteroid.size.city': 'Similar a una ciudad pequeña',
        
        // Units
        'unit.meters': 'm',
        'unit.days': 'días',
        'unit.kg': 'kg'
    },
    
    en: {
        // Header
        'header.title': 'Asteroid Impact Simulator',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': 'Impact Simulation',
        'header.mode.mitigation': 'Mitigation Strategies',
        'header.theme': 'Change theme',
        
        // Simulation Controls
        'sim.title': 'Asteroid Parameters',
        'sim.asteroid': 'Asteroid',
        'sim.asteroid.custom': 'Custom',
        'sim.asteroid.loading': 'Loading NASA asteroids...',
        'sim.diameter': 'Diameter (meters)',
        'sim.velocity': 'Velocity (km/s)',
        'sim.angle': 'Entry Angle (°)',
        'sim.composition': 'Asteroid Composition',
        'sim.composition.rocky': 'Rocky (S-type) - Common',
        'sim.composition.metallic': 'Metallic (M-type) - Dense',
        'sim.composition.carbonaceous': 'Carbonaceous (C-type) - Fragile',
        'sim.composition.icy': 'Icy (Comet) - Volatile',
        'sim.impact': 'Impact Point',
        'sim.latitude': 'Latitude',
        'sim.longitude': 'Longitude',
        'sim.button': 'Simulate Impact',
        'sim.results.placeholder': 'Run a simulation to see results',
        'sim.results.view': 'View Full Results',
        
        // Mitigation Controls
        'mit.title': 'Deflection Strategy',
        'mit.method': 'Method',
        'mit.method.kinetic': 'Kinetic Impactor',
        'mit.method.gravity': 'Gravity Tractor',
        'mit.diameter': 'Diameter (m)',
        'mit.velocity': 'Velocity (km/s)',
        'mit.time': 'Time (days)',
        'mit.mass': 'Impactor Mass (kg)',
        'mit.impactor.velocity': 'Impactor Velocity (km/s)',
        'mit.button': 'Calculate Deflection',
        'mit.results.placeholder': 'Run a deflection simulation to see results',
        
        // Map Legend
        'legend.destruction': 'Total Destruction',
        'legend.damage': 'Severe Damage',
        'legend.affected': 'Affected Area',
        
        // Loading
        'loading': 'Calculating...',
        
        // Modal
        'modal.title': 'Full Impact Results',
        'modal.close': 'Close',
        
        // Asteroid Modal
        'asteroid.modal.title': 'Asteroid Information',
        'asteroid.modal.use': 'Use in Simulation',
        'asteroid.modal.close': 'Close',
        'asteroid.general': 'General Information',
        'asteroid.id': 'NASA ID',
        'asteroid.name': 'Name',
        'asteroid.danger': 'Danger Level',
        'asteroid.dangerous': 'POTENTIALLY HAZARDOUS',
        'asteroid.safe': 'Not hazardous',
        'asteroid.dimensions': 'Dimensions',
        'asteroid.diameter': 'Estimated Diameter',
        'asteroid.range': 'Range',
        'asteroid.comparison': 'Comparison',
        'asteroid.orbital': 'Orbital Characteristics',
        'asteroid.velocity': 'Relative velocity',
        'asteroid.approach': 'Approach date',
        'asteroid.distance': 'Minimum distance',
        'asteroid.close': 'Close approach',
        'asteroid.pha.title': 'Potentially Hazardous Asteroid (PHA)',
        'asteroid.pha.desc': 'This asteroid is classified as PHA due to its size and orbital proximity to Earth. NASA constantly monitors its trajectory.',
        'asteroid.note': 'Data comes from NASA\'s NeoWs API and represents real Near-Earth Objects (NEOs) that have been observed and catalogued.',
        
        // Size comparisons
        'asteroid.size.house': 'Similar to a small house',
        'asteroid.size.building': 'Similar to a 10-story building',
        'asteroid.size.stadium': 'Similar to a football stadium',
        'asteroid.size.blocks': 'Similar to several buildings',
        'asteroid.size.city': 'Similar to a small city',
        
        // Units
        'unit.meters': 'm',
        'unit.days': 'days',
        'unit.kg': 'kg'
    },
    
    fr: {
        // Header
        'header.title': "Simulateur d'Impact d'Astéroïde",
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': "Simulation d'Impact",
        'header.mode.mitigation': 'Stratégies de Mitigation',
        'header.theme': 'Changer le thème',
        
        // Simulation Controls
        'sim.title': "Paramètres de l'Astéroïde",
        'sim.asteroid': 'Astéroïde',
        'sim.asteroid.custom': 'Personnalisé',
        'sim.asteroid.loading': 'Chargement des astéroïdes NASA...',
        'sim.diameter': 'Diamètre (mètres)',
        'sim.velocity': 'Vitesse (km/s)',
        'sim.angle': "Angle d'Entrée (°)",
        'sim.composition': "Composition de l'Astéroïde",
        'sim.composition.rocky': 'Rocheux (Type-S) - Commun',
        'sim.composition.metallic': 'Métallique (Type-M) - Dense',
        'sim.composition.carbonaceous': 'Carboné (Type-C) - Fragile',
        'sim.composition.icy': 'Glacé (Comète) - Volatile',
        'sim.impact': "Point d'Impact",
        'sim.latitude': 'Latitude',
        'sim.longitude': 'Longitude',
        'sim.button': "Simuler l'Impact",
        'sim.results.placeholder': 'Exécutez une simulation pour voir les résultats',
        'sim.results.view': 'Voir Résultats Complets',
        
        // Mitigation Controls
        'mit.title': 'Stratégie de Déviation',
        'mit.method': 'Méthode',
        'mit.method.kinetic': 'Impacteur Cinétique',
        'mit.method.gravity': 'Tracteur Gravitationnel',
        'mit.diameter': 'Diamètre (m)',
        'mit.velocity': 'Vitesse (km/s)',
        'mit.time': 'Temps (jours)',
        'mit.mass': "Masse de l'Impacteur (kg)",
        'mit.impactor.velocity': "Vitesse de l'Impacteur (km/s)",
        'mit.button': 'Calculer la Déviation',
        'mit.results.placeholder': 'Exécutez une simulation de déviation pour voir les résultats',
        
        // Map Legend
        'legend.destruction': 'Destruction Totale',
        'legend.damage': 'Dommages Sévères',
        'legend.affected': 'Zone Affectée',
        
        // Loading
        'loading': 'Calcul en cours...',
        
        // Modal
        'modal.title': "Résultats Complets de l'Impact",
        'modal.close': 'Fermer',
        
        // Units
        'unit.meters': 'm',
        'unit.days': 'jours',
        'unit.kg': 'kg'
    },
    
    de: {
        // Header
        'header.title': 'Asteroiden-Einschlag-Simulator',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': 'Einschlag-Simulation',
        'header.mode.mitigation': 'Eindämmungsstrategien',
        'header.theme': 'Design wechseln',
        
        // Simulation Controls
        'sim.title': 'Asteroiden-Parameter',
        'sim.asteroid': 'Asteroid',
        'sim.asteroid.custom': 'Benutzerdefiniert',
        'sim.asteroid.loading': 'NASA-Asteroiden werden geladen...',
        'sim.diameter': 'Durchmesser (Meter)',
        'sim.velocity': 'Geschwindigkeit (km/s)',
        'sim.angle': 'Eintrittswinkel (°)',
        'sim.composition': 'Asteroiden-Zusammensetzung',
        'sim.composition.rocky': 'Felsig (S-Typ) - Üblich',
        'sim.composition.metallic': 'Metallisch (M-Typ) - Dicht',
        'sim.composition.carbonaceous': 'Kohlenstoffhaltig (C-Typ) - Zerbrechlich',
        'sim.composition.icy': 'Eisig (Komet) - Volatil',
        'sim.impact': 'Einschlagspunkt',
        'sim.latitude': 'Breitengrad',
        'sim.longitude': 'Längengrad',
        'sim.button': 'Einschlag Simulieren',
        'sim.results.placeholder': 'Führen Sie eine Simulation durch, um Ergebnisse zu sehen',
        'sim.results.view': 'Vollständige Ergebnisse Anzeigen',
        
        // Mitigation Controls
        'mit.title': 'Ablenkungsstrategie',
        'mit.method': 'Methode',
        'mit.method.kinetic': 'Kinetischer Impaktor',
        'mit.method.gravity': 'Schwerkraft-Traktor',
        'mit.diameter': 'Durchmesser (m)',
        'mit.velocity': 'Geschwindigkeit (km/s)',
        'mit.time': 'Zeit (Tage)',
        'mit.mass': 'Impaktor-Masse (kg)',
        'mit.impactor.velocity': 'Impaktor-Geschwindigkeit (km/s)',
        'mit.button': 'Ablenkung Berechnen',
        'mit.results.placeholder': 'Führen Sie eine Ablenkungssimulation durch, um Ergebnisse zu sehen',
        
        // Map Legend
        'legend.destruction': 'Totale Zerstörung',
        'legend.damage': 'Schwerer Schaden',
        'legend.affected': 'Betroffenes Gebiet',
        
        // Loading
        'loading': 'Berechnung läuft...',
        
        // Modal
        'modal.title': 'Vollständige Einschlagsergebnisse',
        'modal.close': 'Schließen',
        
        // Units
        'unit.meters': 'm',
        'unit.days': 'Tage',
        'unit.kg': 'kg'
    },
    
    pt: {
        // Header
        'header.title': 'Simulador de Impacto de Asteroides',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': 'Simulação de Impacto',
        'header.mode.mitigation': 'Estratégias de Mitigação',
        'header.theme': 'Mudar tema',
        
        // Simulation Controls
        'sim.title': 'Parâmetros do Asteroide',
        'sim.asteroid': 'Asteroide',
        'sim.asteroid.custom': 'Personalizado',
        'sim.asteroid.loading': 'Carregando asteroides da NASA...',
        'sim.diameter': 'Diâmetro (metros)',
        'sim.velocity': 'Velocidade (km/s)',
        'sim.angle': 'Ângulo de Entrada (°)',
        'sim.composition': 'Composição do Asteroide',
        'sim.composition.rocky': 'Rochoso (Tipo-S) - Comum',
        'sim.composition.metallic': 'Metálico (Tipo-M) - Denso',
        'sim.composition.carbonaceous': 'Carbonáceo (Tipo-C) - Frágil',
        'sim.composition.icy': 'Gelado (Cometa) - Volátil',
        'sim.impact': 'Ponto de Impacto',
        'sim.latitude': 'Latitude',
        'sim.longitude': 'Longitude',
        'sim.button': 'Simular Impacto',
        'sim.results.placeholder': 'Execute uma simulação para ver os resultados',
        'sim.results.view': 'Ver Resultados Completos',
        
        // Mitigation Controls
        'mit.title': 'Estratégia de Deflexão',
        'mit.method': 'Método',
        'mit.method.kinetic': 'Impactador Cinético',
        'mit.method.gravity': 'Trator Gravitacional',
        'mit.diameter': 'Diâmetro (m)',
        'mit.velocity': 'Velocidade (km/s)',
        'mit.time': 'Tempo (dias)',
        'mit.mass': 'Massa do Impactador (kg)',
        'mit.impactor.velocity': 'Velocidade do Impactador (km/s)',
        'mit.button': 'Calcular Deflexão',
        'mit.results.placeholder': 'Execute uma simulação de deflexão para ver os resultados',
        
        // Map Legend
        'legend.destruction': 'Destruição Total',
        'legend.damage': 'Dano Severo',
        'legend.affected': 'Área Afetada',
        
        // Loading
        'loading': 'Calculando...',
        
        // Modal
        'modal.title': 'Resultados Completos do Impacto',
        'modal.close': 'Fechar',
        
        // Units
        'unit.meters': 'm',
        'unit.days': 'dias',
        'unit.kg': 'kg'
    },
    
    it: {
        // Header
        'header.title': 'Simulatore di Impatto di Asteroidi',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': 'Simulazione di Impatto',
        'header.mode.mitigation': 'Strategie di Mitigazione',
        'header.theme': 'Cambia tema',
        
        // Simulation Controls
        'sim.title': "Parametri dell'Asteroide",
        'sim.asteroid': 'Asteroide',
        'sim.asteroid.custom': 'Personalizzato',
        'sim.asteroid.loading': 'Caricamento asteroidi NASA...',
        'sim.diameter': 'Diametro (metri)',
        'sim.velocity': 'Velocità (km/s)',
        'sim.angle': "Angolo d'Ingresso (°)",
        'sim.composition': "Composizione dell'Asteroide",
        'sim.composition.rocky': 'Roccioso (Tipo-S) - Comune',
        'sim.composition.metallic': 'Metallico (Tipo-M) - Denso',
        'sim.composition.carbonaceous': 'Carbonaceo (Tipo-C) - Fragile',
        'sim.composition.icy': 'Ghiacciato (Cometa) - Volatile',
        'sim.impact': 'Punto di Impatto',
        'sim.latitude': 'Latitudine',
        'sim.longitude': 'Longitudine',
        'sim.button': 'Simula Impatto',
        'sim.results.placeholder': 'Esegui una simulazione per vedere i risultati',
        'sim.results.view': 'Visualizza Risultati Completi',
        
        // Mitigation Controls
        'mit.title': 'Strategia di Deviazione',
        'mit.method': 'Metodo',
        'mit.method.kinetic': 'Impattatore Cinetico',
        'mit.method.gravity': 'Trattore Gravitazionale',
        'mit.diameter': 'Diametro (m)',
        'mit.velocity': 'Velocità (km/s)',
        'mit.time': 'Tempo (giorni)',
        'mit.mass': "Massa dell'Impattatore (kg)",
        'mit.impactor.velocity': "Velocità dell'Impattatore (km/s)",
        'mit.button': 'Calcola Deviazione',
        'mit.results.placeholder': 'Esegui una simulazione di deviazione per vedere i risultati',
        
        // Map Legend
        'legend.destruction': 'Distruzione Totale',
        'legend.damage': 'Danno Grave',
        'legend.affected': 'Area Colpita',
        
        // Loading
        'loading': 'Calcolo in corso...',
        
        // Modal
        'modal.title': "Risultati Completi dell'Impatto",
        'modal.close': 'Chiudi',
        
        // Units
        'unit.meters': 'm',
        'unit.days': 'giorni',
        'unit.kg': 'kg'
    },
    
    zh: {
        // Header
        'header.title': '小行星撞击模拟器',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': '撞击模拟',
        'header.mode.mitigation': '缓解策略',
        'header.theme': '更改主题',
        
        // Simulation Controls
        'sim.title': '小行星参数',
        'sim.asteroid': '小行星',
        'sim.asteroid.custom': '自定义',
        'sim.asteroid.loading': '正在加载NASA小行星...',
        'sim.diameter': '直径（米）',
        'sim.velocity': '速度（公里/秒）',
        'sim.angle': '进入角度（°）',
        'sim.composition': '小行星成分',
        'sim.composition.rocky': '岩石型（S型）- 常见',
        'sim.composition.metallic': '金属型（M型）- 致密',
        'sim.composition.carbonaceous': '碳质型（C型）- 脆弱',
        'sim.composition.icy': '冰质型（彗星）- 易挥发',
        'sim.impact': '撞击点',
        'sim.latitude': '纬度',
        'sim.longitude': '经度',
        'sim.button': '模拟撞击',
        'sim.results.placeholder': '运行模拟以查看结果',
        'sim.results.view': '查看完整结果',
        
        // Mitigation Controls
        'mit.title': '偏转策略',
        'mit.method': '方法',
        'mit.method.kinetic': '动能撞击器',
        'mit.method.gravity': '引力拖船',
        'mit.diameter': '直径（米）',
        'mit.velocity': '速度（公里/秒）',
        'mit.time': '时间（天）',
        'mit.mass': '撞击器质量（千克）',
        'mit.impactor.velocity': '撞击器速度（公里/秒）',
        'mit.button': '计算偏转',
        'mit.results.placeholder': '运行偏转模拟以查看结果',
        
        // Map Legend
        'legend.destruction': '完全摧毁',
        'legend.damage': '严重损坏',
        'legend.affected': '受影响区域',
        
        // Loading
        'loading': '计算中...',
        
        // Modal
        'modal.title': '完整撞击结果',
        'modal.close': '关闭',
        
        // Units
        'unit.meters': '米',
        'unit.days': '天',
        'unit.kg': '千克'
    },
    
    ja: {
        // Header
        'header.title': '小惑星衝突シミュレーター',
        'header.subtitle': 'NASA Space Apps 2025',
        'header.mode.simulation': '衝突シミュレーション',
        'header.mode.mitigation': '緩和戦略',
        'header.theme': 'テーマを変更',
        
        // Simulation Controls
        'sim.title': '小惑星パラメータ',
        'sim.asteroid': '小惑星',
        'sim.asteroid.custom': 'カスタム',
        'sim.asteroid.loading': 'NASA小惑星を読み込み中...',
        'sim.diameter': '直径（メートル）',
        'sim.velocity': '速度（km/s）',
        'sim.angle': '進入角度（°）',
        'sim.composition': '小惑星の組成',
        'sim.composition.rocky': '岩石型（Sタイプ）- 一般的',
        'sim.composition.metallic': '金属型（Mタイプ）- 高密度',
        'sim.composition.carbonaceous': '炭素質型（Cタイプ）- 脆弱',
        'sim.composition.icy': '氷質型（彗星）- 揮発性',
        'sim.impact': '衝突点',
        'sim.latitude': '緯度',
        'sim.longitude': '経度',
        'sim.button': '衝突をシミュレート',
        'sim.results.placeholder': 'シミュレーションを実行して結果を表示',
        'sim.results.view': '完全な結果を表示',
        
        // Mitigation Controls
        'mit.title': '偏向戦略',
        'mit.method': '方法',
        'mit.method.kinetic': '運動エネルギー衝突体',
        'mit.method.gravity': '重力トラクター',
        'mit.diameter': '直径（m）',
        'mit.velocity': '速度（km/s）',
        'mit.time': '時間（日）',
        'mit.mass': '衝突体質量（kg）',
        'mit.impactor.velocity': '衝突体速度（km/s）',
        'mit.button': '偏向を計算',
        'mit.results.placeholder': '偏向シミュレーションを実行して結果を表示',
        
        // Map Legend
        'legend.destruction': '完全破壊',
        'legend.damage': '深刻な損傷',
        'legend.affected': '影響を受けた地域',
        
        // Loading
        'loading': '計算中...',
        
        // Modal
        'modal.title': '完全な衝突結果',
        'modal.close': '閉じる',
        
        // Units
        'unit.meters': 'm',
        'unit.days': '日',
        'unit.kg': 'kg'
    }
};

// Idioma actual
let currentLanguage = 'es'; // Por defecto español

// Función para obtener el idioma según el país
function getLanguageFromCountry(countryCode) {
    if (!countryCode) return 'en'; // Por defecto inglés
    
    const code = countryCode.toUpperCase();
    return countryToLanguage[code] || 'en';
}

// Función para obtener una traducción
function t(key) {
    const lang = translations[currentLanguage];
    if (!lang) return key;
    return lang[key] || key;
}

// Función para cambiar el idioma
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Idioma ${lang} no disponible, usando inglés`);
        lang = 'en';
    }
    
    currentLanguage = lang;
    applyTranslations();
    console.log(`Idioma cambiado a: ${lang.toUpperCase()}`);
}

// Función para aplicar todas las traducciones al DOM
function applyTranslations() {
    // Header
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.textContent = t('header.title');
    
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t('header.subtitle');
    
    document.querySelectorAll('[data-mode="simulation"]').forEach(el => {
        el.textContent = t('header.mode.simulation');
    });
    document.querySelectorAll('[data-mode="mitigation"]').forEach(el => {
        el.textContent = t('header.mode.mitigation');
    });
    
    const themeToggle = document.getElementById('theme-toggle-btn');
    if (themeToggle) themeToggle.setAttribute('title', t('header.theme'));
    
    // Simulation Controls
    const simTitle = document.querySelector('#simulation-controls .section-title');
    if (simTitle) simTitle.textContent = t('sim.title');
    
    const asteroidLabel = document.querySelector('label[for="asteroid-select"]');
    if (asteroidLabel) asteroidLabel.textContent = t('sim.asteroid');
    
    const customOption = document.querySelector('#asteroid-select option[value="custom"]');
    if (customOption) customOption.textContent = t('sim.asteroid.custom');
    
    const loadingOption = document.querySelector('#asteroid-select option[value="loading"]');
    if (loadingOption) {
        loadingOption.textContent = t('sim.asteroid.loading');
    }
    
    const diameterLabel = document.querySelector('label[for="diameter"]');
    if (diameterLabel) diameterLabel.textContent = t('sim.diameter');
    
    const velocityLabel = document.querySelector('label[for="velocity"]');
    if (velocityLabel) velocityLabel.textContent = t('sim.velocity');
    
    const angleLabel = document.querySelector('label[for="angle"]');
    if (angleLabel) angleLabel.textContent = t('sim.angle');
    
    const compositionLabel = document.querySelector('label[for="composition"]');
    if (compositionLabel) compositionLabel.textContent = t('sim.composition');
    
    // Composition options
    const rockyOption = document.querySelector('#composition option[value="rocky"]');
    if (rockyOption) rockyOption.textContent = t('sim.composition.rocky');
    
    const metallicOption = document.querySelector('#composition option[value="metallic"]');
    if (metallicOption) metallicOption.textContent = t('sim.composition.metallic');
    
    const carbonaceousOption = document.querySelector('#composition option[value="carbonaceous"]');
    if (carbonaceousOption) carbonaceousOption.textContent = t('sim.composition.carbonaceous');
    
    const icyOption = document.querySelector('#composition option[value="icy"]');
    if (icyOption) icyOption.textContent = t('sim.composition.icy');
    
    // Impact location
    document.querySelectorAll('label').forEach(label => {
        if (label.textContent.includes('Punto de Impacto') || label.textContent.includes('Impact Point')) {
            label.textContent = t('sim.impact');
        }
    });
    
    const latitudeInput = document.getElementById('latitude');
    if (latitudeInput) latitudeInput.setAttribute('placeholder', t('sim.latitude'));
    
    const longitudeInput = document.getElementById('longitude');
    if (longitudeInput) longitudeInput.setAttribute('placeholder', t('sim.longitude'));
    
    const simulateBtn = document.getElementById('simulate-btn');
    if (simulateBtn) simulateBtn.textContent = t('sim.button');
    
    const placeholder = document.querySelector('#results-content .placeholder');
    if (placeholder) {
        placeholder.textContent = t('sim.results.placeholder');
    }
    
    const viewResultsBtn = document.getElementById('view-full-results-btn');
    if (viewResultsBtn) viewResultsBtn.textContent = t('sim.results.view');
    
    // Mitigation Controls
    const mitTitle = document.querySelector('#mitigation-controls .section-title');
    if (mitTitle) mitTitle.textContent = t('mit.title');
    
    const methodLabel = document.querySelector('label[for="strategy-select"]');
    if (methodLabel) methodLabel.textContent = t('mit.method');
    
    const kineticOption = document.querySelector('#strategy-select option[value="kinetic_impactor"]');
    if (kineticOption) kineticOption.textContent = t('mit.method.kinetic');
    
    const gravityOption = document.querySelector('#strategy-select option[value="gravity_tractor"]');
    if (gravityOption) gravityOption.textContent = t('mit.method.gravity');
    
    const mitDiameterLabel = document.querySelector('label[for="mit-diameter"]');
    if (mitDiameterLabel) mitDiameterLabel.textContent = t('mit.diameter');
    
    const mitVelocityLabel = document.querySelector('label[for="mit-velocity"]');
    if (mitVelocityLabel) mitVelocityLabel.textContent = t('mit.velocity');
    
    const timeLabel = document.querySelector('label[for="time-before-impact"]');
    if (timeLabel) timeLabel.textContent = t('mit.time');
    
    const massLabel = document.querySelector('label[for="impactor-mass"]');
    if (massLabel) massLabel.textContent = t('mit.mass');
    
    const impactorVelocityLabel = document.querySelector('label[for="impactor-velocity"]');
    if (impactorVelocityLabel) impactorVelocityLabel.textContent = t('mit.impactor.velocity');
    
    const deflectionBtn = document.getElementById('deflection-btn');
    if (deflectionBtn) deflectionBtn.textContent = t('mit.button');
    
    const mitPlaceholder = document.querySelector('#deflection-results .placeholder');
    if (mitPlaceholder) {
        mitPlaceholder.textContent = t('mit.results.placeholder');
    }
    
    // Map Legend
    const legendItems = document.querySelectorAll('.map-legend .legend-item span:not(.legend-dot)');
    if (legendItems[0]) legendItems[0].textContent = t('legend.destruction');
    if (legendItems[1]) legendItems[1].textContent = t('legend.damage');
    if (legendItems[2]) legendItems[2].textContent = t('legend.affected');
    
    // Loading overlay
    const loadingText = document.querySelector('#loading-overlay p');
    if (loadingText) loadingText.textContent = t('loading');
    
    // Modal
    const modalTitle = document.querySelector('#results-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = t('modal.title');
    
    const modalCloseBtn = document.querySelector('#results-modal .btn-secondary');
    if (modalCloseBtn) modalCloseBtn.textContent = t('modal.close');
}

// Detectar idioma automáticamente basado en la ubicación del usuario
function autoDetectLanguage(countryCode) {
    const detectedLang = getLanguageFromCountry(countryCode);
    setLanguage(detectedLang);
    return detectedLang;
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.i18n = {
        t,
        setLanguage,
        autoDetectLanguage,
        currentLanguage: () => currentLanguage
    };
}
