const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Implementación real de fetchv2 con soporte para gzip
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
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let chunks = [];
            
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
            res.on('end', () => {
                let buffer = Buffer.concat(chunks);
                let data = '';
                
                // Manejar compresión gzip
                if (res.headers['content-encoding'] === 'gzip') {
                    try {
                        data = zlib.gunzipSync(buffer).toString();
                    } catch (e) {
                        data = buffer.toString();
                    }
                } else {
                    data = buffer.toString();
                }
                
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

async function testNarutoSubtitles() {
    console.log('🍜 TESTING NARUTO WITH SUBTITLES\n');
    
    try {
        // Buscar todas las versiones de Naruto
        console.log('🔍 Searching for all Naruto versions...');
        const searchResults_result = await searchResults('naruto');
        const results = JSON.parse(searchResults_result);
        
        console.log(`✅ Found ${results.length} Naruto results:`);
        results.forEach((result, i) => {
            console.log(`   ${i+1}. ${result.title}`);
            console.log(`      URL: ${result.href}`);
        });
        
        // Probar cada resultado para encontrar el que tiene más episodios
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            console.log(`\n📺 Testing episodes for: ${result.title}`);
            
            try {
                const episodesResult = await extractEpisodes(result.href);
                const episodes = JSON.parse(episodesResult);
                
                console.log(`   Episodes found: ${episodes.length}`);
                
                if (episodes.length > 10) {
                    console.log(`   ✅ This looks like a complete series!`);
                    console.log(`   Episodes 1-10: ${episodes.slice(0, 10).map(ep => `#${ep.number}`).join(', ')}`);
                    
                    if (episodes.length > 200) {
                        console.log(`   🎯 FOUND THE COMPLETE NARUTO SERIES WITH ${episodes.length} EPISODES!`);
                        break;
                    }
                } else if (episodes.length <= 2) {
                    console.log(`   ❌ This appears to be a dub version with limited episodes`);
                } else {
                    console.log(`   📝 Medium series with ${episodes.length} episodes`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error getting episodes: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Naruto test failed:', error.message);
    }
}

testNarutoSubtitles();
