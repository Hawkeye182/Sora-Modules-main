/**
 * TEST REAL BROWSER DATA - KaaTo v11.5.14
 * Validación de los requests encontrados en F12
 */

// Datos reales extraídos del análisis F12
const REAL_DATA = {
    episodeUrl: 'https://kaa.to/dandadan-da3b/ep-1-b324b5',
    showSlug: 'dandadan-da3b',
    episodeNumber: '1',
    episodeId: 'b324b5',
    
    // IDs reales detectados en F12
    vidstreamId: '6713f500b97399e0e1ae2020',
    timestamp: '1754753043',
    signature: 'b485eda66d7c473c3bbfbbc586e577580b8d521b',
    
    // URLs reales detectadas
    apis: {
        language: 'https://kaa.to/api/show/dandadan-da3b/language',
        episodes: 'https://kaa.to/api/show/dandadan-da3b/episodes?ep=1&lang=ja-JP',
        source: 'https://krussdomi.com/vidstreaming/source.php?id=6713f500b97399e0e1ae2020&e=1754753043&s=b485eda66d7c473c3bbfbbc586e577580b8d521b'
    },
    
    // M3U8s reales detectados
    streams: {
        master: 'https://hls.krussdomi.com/manifest/6713f500b97399e0e1ae2020/master.m3u8',
        quality1: 'https://hls.krussdomi.com/manifest/6713f500b97399e0e1ae2020/6713f503ef1765b8d04da883/playlist.m3u8',
        quality2: 'https://hls.krussdomi.com/manifest/6713f500b97399e0e1ae2020/6713f503ef1765b8d04da889/playlist.m3u8'
    }
};

// Headers reales detectados
const REAL_HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-419,es;q=0.9',
    'X-Origin': 'kaa.to',
    'Referer': 'https://kaa.to/dandadan-da3b/ep-1-b324b5',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
};

/**
 * Probar la API de episodios detectada
 */
async function testEpisodesAPI() {
    console.log('🧪 PROBANDO API DE EPISODIOS...');
    console.log('URL:', REAL_DATA.apis.episodes);
    
    try {
        const response = await fetch(REAL_DATA.apis.episodes, {
            headers: REAL_HEADERS
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ RESPUESTA API EPISODIOS:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error en API episodios:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error probando API episodios:', error);
    }
}

/**
 * Probar la API de idiomas detectada
 */
async function testLanguageAPI() {
    console.log('\n🧪 PROBANDO API DE IDIOMAS...');
    console.log('URL:', REAL_DATA.apis.language);
    
    try {
        const response = await fetch(REAL_DATA.apis.language, {
            headers: REAL_HEADERS
        });
        
        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ RESPUESTA API IDIOMAS:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error en API idiomas:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error probando API idiomas:', error);
    }
}

/**
 * Probar el source.php detectado
 */
async function testSourceAPI() {
    console.log('\n🧪 PROBANDO SOURCE API...');
    console.log('URL:', REAL_DATA.apis.source);
    
    try {
        const response = await fetch(REAL_DATA.apis.source, {
            headers: {
                ...REAL_HEADERS,
                'Referer': `https://krussdomi.com/vidstreaming/player.php?id=${REAL_DATA.vidstreamId}&ln=ja-JP`
            }
        });
        
        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ RESPUESTA SOURCE API:');
            console.log(JSON.stringify(data, null, 2));
            
            // Buscar M3U8 en la respuesta
            if (data.sources && data.sources.length > 0) {
                console.log('🎯 M3U8 ENCONTRADO EN SOURCE:');
                data.sources.forEach((source, i) => {
                    console.log(`Source ${i + 1}:`, source.file);
                    console.log(`Calidad:`, source.label || 'No especificada');
                    console.log(`Tipo:`, source.type || 'No especificado');
                });
            }
            
        } else {
            console.log('❌ Error en Source API:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error probando Source API:', error);
    }
}

/**
 * Probar los M3U8s detectados
 */
async function testM3U8Streams() {
    console.log('\n🧪 PROBANDO M3U8 STREAMS...');
    
    for (const [name, url] of Object.entries(REAL_DATA.streams)) {
        try {
            console.log(`\n📺 Probando ${name.toUpperCase()}:`, url);
            
            const response = await fetch(url, {
                headers: {
                    'Referer': 'https://krussdomi.com/',
                    'Accept': '*/*'
                }
            });
            
            console.log('Status:', response.status);
            
            if (response.ok) {
                const text = await response.text();
                console.log('✅ M3U8 VÁLIDO');
                console.log('Tamaño:', text.length, 'caracteres');
                
                // Mostrar las primeras líneas del M3U8
                const lines = text.split('\n').slice(0, 10);
                console.log('Primeras líneas:');
                lines.forEach(line => console.log('  ', line));
                
                if (text.length > 200) {
                    console.log('  ... (contenido truncado)');
                }
                
            } else {
                console.log('❌ M3U8 no disponible:', response.status);
            }
            
        } catch (error) {
            console.error('❌ Error probando M3U8:', error);
        }
    }
}

/**
 * Análisis de patrones en los IDs
 */
function analyzePatterns() {
    console.log('\n🔍 ANÁLISIS DE PATRONES:');
    console.log('Episode URL:', REAL_DATA.episodeUrl);
    console.log('Show Slug:', REAL_DATA.showSlug);
    console.log('Episode ID (KaaTo):', REAL_DATA.episodeId);
    console.log('Vidstream ID:', REAL_DATA.vidstreamId);
    console.log('Timestamp:', REAL_DATA.timestamp);
    console.log('Signature:', REAL_DATA.signature);
    
    console.log('\n📊 LONGITUDES:');
    console.log('Episode ID:', REAL_DATA.episodeId.length, 'caracteres');
    console.log('Vidstream ID:', REAL_DATA.vidstreamId.length, 'caracteres');
    console.log('Signature:', REAL_DATA.signature.length, 'caracteres');
    
    console.log('\n🔗 POSIBLES RELACIONES:');
    console.log('¿Episode ID == Vidstream ID?', REAL_DATA.episodeId === REAL_DATA.vidstreamId);
    console.log('¿Episode ID en Vidstream ID?', REAL_DATA.vidstreamId.includes(REAL_DATA.episodeId));
    console.log('¿Vidstream ID en signature?', REAL_DATA.signature.includes(REAL_DATA.vidstreamId));
}

/**
 * Ejecutar todas las pruebas
 */
async function runAllTests() {
    console.log('🚀 INICIANDO PRUEBAS REALES - KaaTo v11.5.14');
    console.log('=' * 60);
    
    // Análisis de patrones
    analyzePatterns();
    
    // Probar APIs
    await testLanguageAPI();
    await testEpisodesAPI();
    await testSourceAPI();
    
    // Probar streams
    await testM3U8Streams();
    
    console.log('\n✅ PRUEBAS COMPLETADAS');
}

// Ejecutar si es llamado directamente
if (typeof window !== 'undefined') {
    // En el navegador
    runAllTests();
} else {
    // En Node.js - ejecutar automáticamente
    runAllTests();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        REAL_DATA,
        REAL_HEADERS,
        testEpisodesAPI,
        testLanguageAPI,
        testSourceAPI,
        testM3U8Streams,
        analyzePatterns,
        runAllTests
    };
}
