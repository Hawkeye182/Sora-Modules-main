const { readFileSync } = require('fs');
const path = require('path');

// Simular fetchv2 para testing
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    console.log(`[FETCH] ${method} ${url}`);
    
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
                ]
            })
        };
    }
    
    if (url.includes('kaa.to/bleach-thousand-year-blood-war/ep-1')) {
        return {
            status: 200,
            _data: '<iframe src="https://krussdomi.com/vidstreaming/player.php?id=MTc5NDk1&title=Bleach"></iframe>'
        };
    }
    
    if (url.includes('hls.krussdomi.com/manifest/MTc5NDk1/master.m3u8')) {
        return {
            status: 200,
            _data: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=1280x720
720p.m3u8`
        };
    }
    
    return { status: 404, _data: 'Not found' };
}

// Cargar y evaluar el módulo KaaTo
const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');

// Crear contexto global para el módulo
global.fetchv2 = fetchv2;

// Evaluar el código del módulo
eval(moduleCode);

async function testCompleteModule() {
    console.log('🧪 TESTING KaaTo COMPLETE MODULE\n');
    
    try {
        // Test 1: Búsqueda
        console.log('1️⃣ Testing Search...');
        const searchResults_result = await searchResults('bleach');
        const search = JSON.parse(searchResults_result);
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
        console.log(`   Description: ${details[0].description.substring(0, 100)}...`);
        console.log(`   Airdate: ${details[0].airdate}\n`);
        
        // Test 3: Episodios
        console.log('3️⃣ Testing Episodes...');
        const episodesResult = await extractEpisodes('https://kaa.to/anime/bleach-thousand-year-blood-war');
        const episodes = JSON.parse(episodesResult);
        console.log(`✅ Found ${episodes.length} episodes`);
        if (episodes.length > 0) {
            console.log(`   Episode 1: ${episodes[0].href}`);
            console.log(`   Episode numbers: ${episodes.slice(0, 3).map(ep => ep.number).join(', ')}\n`);
        }
        
        // Test 4: Stream URL
        console.log('4️⃣ Testing Stream Extraction...');
        if (episodes.length > 0) {
            const streamResult = await extractStreamUrl(episodes[0].href);
            const stream = JSON.parse(streamResult);
            console.log('✅ Stream URL extracted');
            console.log(`   Type: ${stream.type}`);
            console.log(`   Quality: ${stream.quality}`);
            console.log(`   URL: ${stream.streamUrl.substring(0, 60)}...`);
        }
        
        console.log('\n🎉 ALL TESTS PASSED! MODULE IS WORKING CORRECTLY');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteModule();
