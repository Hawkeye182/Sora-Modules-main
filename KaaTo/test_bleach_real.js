const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');

// Implementación real de fetchv2
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Accept-Language': 'es-419,es;q=0.9',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    _data: data
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
global.fetchv2 = fetchv2;
eval(moduleCode);

async function testBleach() {
    console.log('⚔️ TESTING BLEACH WITH REAL API\n');
    
    try {
        // Buscar Bleach
        console.log('🔍 Searching for Bleach...');
        const searchResults_result = await searchResults('bleach');
        const results = JSON.parse(searchResults_result);
        
        console.log(`✅ Found ${results.length} Bleach results:`);
        results.forEach((result, i) => {
            console.log(`   ${i+1}. ${result.title}`);
        });
        
        if (results.length > 0) {
            // Tomar el primer resultado de Bleach
            const bleachUrl = results[0].href;
            console.log(`\n📺 Testing episodes for: ${bleachUrl}`);
            
            const episodesResult = await extractEpisodes(bleachUrl);
            const episodes = JSON.parse(episodesResult);
            
            console.log(`✅ Found ${episodes.length} episodes`);
            console.log(`   Episodes 1-5: ${episodes.slice(0, 5).map(ep => `#${ep.number}`).join(', ')}`);
            
            if (episodes.length >= 5) {
                console.log(`\n🎬 Testing stream for episode 1...`);
                const streamResult = await extractStreamUrl(episodes[0].href);
                const stream = JSON.parse(streamResult);
                
                console.log(`✅ Stream extracted:`);
                console.log(`   Type: ${stream.type}`);
                console.log(`   Quality: ${stream.quality}`);
                console.log(`   Has M3U8: ${stream.streamUrl.includes('m3u8') ? 'YES' : 'NO'}`);
                console.log(`   Has krussdomi: ${stream.streamUrl.includes('krussdomi') ? 'YES' : 'NO'}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Bleach test failed:', error.message);
    }
}

testBleach();
