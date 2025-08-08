const { readFileSync } = require('fs');
const path = require('path');

// Simular fetchv2 para testing
global.fetchv2 = async function(url, headers = {}, method = 'GET', body = null) {
    console.log(`[FETCH] ${method} ${url}`);
    if (headers && Object.keys(headers).length > 0) {
        console.log('[HEADERS]', Object.keys(headers));
    }
    
    // Simulaciones específicas
    if (url.includes('/api/search')) {
        return {
            status: 200,
            _data: JSON.stringify([
                {
                    title: "Bleach: Thousand-Year Blood War",
                    slug: "bleach-thousand-year-blood-war",
                    poster: { hq: "bleach-poster" }
                }
            ])
        };
    }
    
    if (url.includes('/api/show/bleach-thousand-year-blood-war/language')) {
        return {
            status: 200,
            _data: JSON.stringify(["en-US", "ja-JP"])
        };
    }
    
    if (url.includes('/api/show/bleach-thousand-year-blood-war/episodes')) {
        return {
            status: 200,
            _data: JSON.stringify({
                result: [
                    { episode_number: 1, slug: "blood-warfare" },
                    { episode_number: 2, slug: "foundation-stones" },
                    { episode_number: 3, slug: "march-of-the-starcross" }
                ],
                pages: [
                    { eps: [1, 2, 3, 4, 5] }
                ]
            })
        };
    }
    
    if (url.includes('kaa.to/bleach-thousand-year-blood-war/ep-1')) {
        return {
            status: 200,
            _data: `
            <html>
                <iframe src="https://krussdomi.com/vidstreaming/player.php?id=MTc5NDk1&title=Bleach%3A+Thousand-Year+Blood+War+Episode+1"></iframe>
            </html>
            `
        };
    }
    
    if (url.includes('hls.krussdomi.com/manifest/MTc5NDk1/master.m3u8')) {
        return {
            status: 200,
            _data: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080,FRAME-RATE=23.976
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=1280x720,FRAME-RATE=23.976
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480,FRAME-RATE=23.976
480p.m3u8
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English",LANGUAGE="en",URI="audio_en.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Japanese",LANGUAGE="ja",URI="audio_ja.m3u8"`
        };
    }
    
    return { status: 404, _data: 'Not found in simulation' };
};

// Cargar el módulo
const modulePath = path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js');
const moduleCode = readFileSync(modulePath, 'utf8');

// Evaluar el código del módulo en el contexto global
const vm = require('vm');
const context = {
    fetchv2: global.fetchv2,
    console: console,
    JSON: JSON,
    Array: Array,
    parseInt: parseInt,
    parseFloat: parseFloat
};
vm.createContext(context);
vm.runInContext(moduleCode, context);

// Hacer las funciones disponibles globalmente
global.searchResults = context.searchResults;
global.extractDetails = context.extractDetails;
global.extractEpisodes = context.extractEpisodes;
global.extractStreamUrl = context.extractStreamUrl;

async function testCompleteModule() {
    console.log('🧪 TESTING KaaTo COMPLETE MODULE\n');
    
    // Test 1: Búsqueda
    console.log('1️⃣ Testing Search...');
    const searchResults = await searchResults('bleach');
    const search = JSON.parse(searchResults);
    console.log(`✅ Found ${search.length} results`);
    if (search.length > 0) {
        console.log(`   First result: ${search[0].title}`);
        console.log(`   URL: ${search[0].href}\n`);
    }
    
    // Test 2: Detalles
    console.log('2️⃣ Testing Details...');
    const detailsResult = await extractDetails('https://kaa.to/anime/bleach-thousand-year-blood-war');
    const details = JSON.parse(detailsResult);
    console.log('✅ Details extracted');
    console.log(`   Description: ${details[0].description}`);
    console.log(`   Airdate: ${details[0].airdate}\n`);
    
    // Test 3: Episodios
    console.log('3️⃣ Testing Episodes...');
    const episodesResult = await extractEpisodes('https://kaa.to/anime/bleach-thousand-year-blood-war');
    const episodes = JSON.parse(episodesResult);
    console.log(`✅ Found ${episodes.length} episodes`);
    if (episodes.length > 0) {
        console.log(`   Episode 1: ${episodes[0].href}`);
        console.log(`   Episode numbers: ${episodes.slice(0, 5).map(ep => ep.number).join(', ')}...\n`);
    }
    
    // Test 4: Stream URL
    console.log('4️⃣ Testing Stream Extraction...');
    if (episodes.length > 0) {
        const streamResult = await extractStreamUrl(episodes[0].href);
        const stream = JSON.parse(streamResult);
        console.log('✅ Stream URL extracted');
        console.log(`   URL: ${stream.streamUrl}`);
        console.log(`   Quality: ${stream.quality}`);
        console.log(`   Type: ${stream.type}`);
        console.log(`   Headers: ${Object.keys(stream.headers).join(', ')}`);
    }
    
    console.log('\n🎉 COMPLETE MODULE TEST FINISHED!');
}

testCompleteModule().catch(console.error);
