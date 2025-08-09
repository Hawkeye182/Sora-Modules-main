/**
 * TEST DIRECTO CON DATOS F12 REALES
 * NO intentamos descifrar nada, usamos directamente lo que observaste
 */

const REAL_F12_DATA = {
    // URLs reales observadas en F12
    apis: {
        episodes: 'https://kaa.to/api/show/dandadan-da3b/episodes?ep=1&lang=ja-JP',
        language: 'https://kaa.to/api/show/dandadan-da3b/language',
        myList: 'https://kaa.to/api/my_list/dandadan-da3b'
    },
    
    // M3U8 reales funcionando observados
    streams: {
        master: 'https://hls.krussdomi.com/manifest/6713f500b97399e0e1ae2020/master.m3u8',
        quality1: 'https://hls.krussdomi.com/manifest/6713f500b97399e0e1ae2020/6713f503ef1765b8d04da883/playlist.m3u8',
        quality2: 'https://hls.krussdomi.com/manifest/6713f500b97399e0e1ae2020/6713f503ef1765b8d04da889/playlist.m3u8'
    },
    
    // Headers reales observados
    headers: {
        kaato: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'es-419,es;q=0.9',
            'x-origin': 'kaa.to',
            'referer': 'https://kaa.to/dandadan-da3b/ep-1-b324b5',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        hls: {
            'accept': '*/*',
            'accept-language': 'es-419,es;q=0.9',
            'referer': 'https://krussdomi.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    }
};

// ===== TEST 1: PROBAR LAS APIs QUE ENCONTRASTE =====
async function testRealApis() {
    console.log('\n🔍 TESTING REAL F12 APIs...\n');
    
    for (const [name, url] of Object.entries(REAL_F12_DATA.apis)) {
        try {
            console.log(`Testing ${name}: ${url}`);
            
            const response = await fetch(url, {
                headers: REAL_F12_DATA.headers.kaato
            });
            
            console.log(`✅ ${name} - Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`📦 ${name} response:`, JSON.stringify(data, null, 2));
            } else {
                console.log(`❌ ${name} failed:`, await response.text());
            }
            
        } catch (error) {
            console.log(`💥 ${name} error:`, error.message);
        }
        console.log('---');
    }
}

// ===== TEST 2: PROBAR LOS M3U8 QUE ENCONTRASTE =====
async function testRealStreams() {
    console.log('\n🎥 TESTING REAL F12 STREAMS...\n');
    
    for (const [name, url] of Object.entries(REAL_F12_DATA.streams)) {
        try {
            console.log(`Testing ${name}: ${url}`);
            
            const response = await fetch(url, {
                headers: REAL_F12_DATA.headers.hls
            });
            
            console.log(`✅ ${name} - Status: ${response.status}`);
            console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
                const content = await response.text();
                console.log(`📦 ${name} M3U8 content (first 200 chars):`);
                console.log(content.substring(0, 200) + '...');
                
                // Contar líneas de segmentos
                const segments = content.match(/\.ts/g);
                if (segments) {
                    console.log(`🎬 Found ${segments.length} video segments`);
                }
            }
            
        } catch (error) {
            console.log(`💥 ${name} error:`, error.message);
        }
        console.log('---');
    }
}

// ===== TEST 3: EXTRAER PATRÓN DE VIDEO ID =====
function extractVideoIdPattern() {
    console.log('\n🔍 ANALYZING VIDEO ID PATTERN...\n');
    
    const videoId = '6713f500b97399e0e1ae2020';
    const timestamp = '1754753043';
    const signature = 'b485eda66d7c473c3bbfbbc586e577580b8d521b';
    
    console.log('Video ID:', videoId);
    console.log('Timestamp:', timestamp, '(', new Date(parseInt(timestamp) * 1000), ')');
    console.log('Signature:', signature);
    console.log('Signature length:', signature.length);
    
    // Analizar patrón del video ID
    console.log('\nVideo ID Analysis:');
    console.log('- Length:', videoId.length);
    console.log('- Format: Hex string');
    console.log('- Pattern: Timestamp-based?');
    
    // Verificar si es ObjectId de MongoDB (24 hex chars)
    if (videoId.length === 24 && /^[a-f0-9]+$/.test(videoId)) {
        console.log('✅ Looks like MongoDB ObjectId');
        
        // Extraer timestamp del ObjectId
        const timestampHex = videoId.substring(0, 8);
        const extractedTimestamp = parseInt(timestampHex, 16);
        const extractedDate = new Date(extractedTimestamp * 1000);
        
        console.log('ObjectId timestamp:', extractedTimestamp, '(', extractedDate, ')');
    }
}

// ===== EJECUCIÓN =====
async function runAllTests() {
    console.log('🚀 STARTING REAL F12 DATA TESTS');
    console.log('=====================================');
    
    await testRealApis();
    await testRealStreams();
    extractVideoIdPattern();
    
    console.log('\n✅ ALL TESTS COMPLETED');
    console.log('=====================================');
}

// Ejecutar si es Node.js
if (typeof module !== 'undefined' && module.exports) {
    // Para Node.js, usar fetch polyfill
    const fetch = require('node-fetch');
    runAllTests().catch(console.error);
} else {
    // Para navegador
    runAllTests();
}

module.exports = { testRealApis, testRealStreams, extractVideoIdPattern, REAL_F12_DATA };
