/**
 * TEST KaaTo v11.5.6 - FUNCTION NAMES FIXED
 * Verifica que las funciones están correctamente nombradas y manejan errores JSON
 */

const fetch = require('node-fetch');

// Simular fetchv2 para test
global.fetchv2 = async function(url, headers = {}, method = 'GET', body = null) {
    console.log(`[MOCK FETCH] ${method} ${url}`);
    
    // Simulaciones para diferentes endpoints
    if (url.includes('/api/search')) {
        return {
            status: 200,
            _data: JSON.stringify([
                {
                    title: "Dandadan",
                    slug: "dandadan-da3b",
                    poster: { hq: "dandadan-b585-hq" }
                }
            ])
        };
    }
    
    if (url.includes('/api/show/dandadan-da3b/language')) {
        return {
            status: 200,
            _data: JSON.stringify(["ja-JP", "en-US"])
        };
    }
    
    if (url.includes('/api/show/dandadan-da3b/episodes')) {
        return {
            status: 200,
            _data: JSON.stringify({
                result: [
                    { episode_number: 1, slug: "ep-1-b324b5" },
                    { episode_number: 2, slug: "ep-2-d4ae7b" }
                ]
            })
        };
    }
    
    if (url.includes('dandadan-da3b/ep-1')) {
        return {
            status: 200,
            _data: `<html>
                <head><title>Dandadan Episode 1 | Kaato</title></head>
                <body>
                    <script>
                        var videoData = {
                            id: "6713f500b97399e0e1ae2020",
                            source: "source.php?id=6713f500b97399e0e1ae2020"
                        };
                    </script>
                </body>
            </html>`
        };
    }
    
    return { status: 404, _data: 'Not found' };
};

// Cargar el módulo
const moduleCode = require('fs').readFileSync('./subs/KaaTo_UNIVERSAL_FIXED.js', 'utf8');
eval(moduleCode);

async function testFunctionNames() {
    console.log('🔬 TESTING KaaTo v11.5.6 - FUNCTION NAMES...\n');
    
    // Test 1: searchResults
    console.log('📋 TEST 1: searchResults');
    try {
        const searchResult = await searchResults("Dandadan");
        const parsed = JSON.parse(searchResult);
        console.log('✅ searchResults works:', parsed.length, 'results');
        console.log('   First result:', parsed[0]?.title);
    } catch (error) {
        console.log('❌ searchResults failed:', error.message);
    }
    
    // Test 2: extractDetails  
    console.log('\n📄 TEST 2: extractDetails');
    try {
        const detailsResult = await extractDetails("https://kaa.to/anime/dandadan-da3b");
        const parsed = JSON.parse(detailsResult);
        console.log('✅ extractDetails works:', parsed.title);
    } catch (error) {
        console.log('❌ extractDetails failed:', error.message);
    }
    
    // Test 3: extractEpisodes
    console.log('\n📺 TEST 3: extractEpisodes');
    try {
        const episodesResult = await extractEpisodes("https://kaa.to/anime/dandadan-da3b");
        const parsed = JSON.parse(episodesResult);
        console.log('✅ extractEpisodes works:', parsed.length, 'episodes');
        console.log('   First episode:', parsed[0]?.href);
    } catch (error) {
        console.log('❌ extractEpisodes failed:', error.message);
    }
    
    // Test 4: extractStreamUrl
    console.log('\n🎥 TEST 4: extractStreamUrl');
    try {
        const streamResult = await extractStreamUrl("https://kaa.to/dandadan-da3b/ep-1-b324b5");
        console.log('✅ extractStreamUrl works:', streamResult);
        
        if (streamResult.includes('hls.krussdomi.com')) {
            console.log('   ✅ Returns HLS URL as expected');
        }
        
    } catch (error) {
        console.log('❌ extractStreamUrl failed:', error.message);
    }
    
    console.log('\n🎯 FUNCTION NAME VERIFICATION:');
    console.log('   searchResults:', typeof searchResults === 'function' ? '✅' : '❌');
    console.log('   extractDetails:', typeof extractDetails === 'function' ? '✅' : '❌');
    console.log('   extractEpisodes:', typeof extractEpisodes === 'function' ? '✅' : '❌');
    console.log('   extractStreamUrl:', typeof extractStreamUrl === 'function' ? '✅' : '❌');
}

testFunctionNames();
