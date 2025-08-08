const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');

// Implementación real de fetchv2 con headers específicos
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-419,es;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Gpc': '1',
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

async function testAllBleachEpisodes() {
    console.log('🔥 TESTING ALL BLEACH EPISODES (366 total)\n');
    
    try {
        console.log('📺 Extracting episodes for Bleach...');
        const episodesResult = await extractEpisodes('https://kaa.to/anime/bleach-f24c');
        const episodes = JSON.parse(episodesResult);
        
        console.log(`✅ TOTAL EPISODES FOUND: ${episodes.length}`);
        
        if (episodes.length >= 366) {
            console.log('🎉 SUCCESS! Found all 366 episodes of Bleach');
            console.log(`   Episodes 1-10: ${episodes.slice(0, 10).map(ep => `#${ep.number}`).join(', ')}`);
            console.log(`   Episodes 91-100: ${episodes.slice(90, 100).map(ep => `#${ep.number}`).join(', ')}`);
            console.log(`   Episodes 191-200: ${episodes.slice(190, 200).map(ep => `#${ep.number}`).join(', ')}`);
            console.log(`   Episodes 291-300: ${episodes.slice(290, 300).map(ep => `#${ep.number}`).join(', ')}`);
            console.log(`   Last 10 episodes: ${episodes.slice(-10).map(ep => `#${ep.number}`).join(', ')}`);
            
            // Verificar algunas URLs específicas
            console.log('\n🔗 Sample Episode URLs:');
            console.log(`   Episode 1: ${episodes[0].href}`);
            console.log(`   Episode 100: ${episodes[99] ? episodes[99].href : 'Not found'}`);
            console.log(`   Episode 200: ${episodes[199] ? episodes[199].href : 'Not found'}`);
            console.log(`   Episode 366: ${episodes[365] ? episodes[365].href : 'Not found'}`);
            
        } else if (episodes.length >= 100) {
            console.log(`⚠️  Found ${episodes.length} episodes, but expected 366`);
            console.log('   This might be due to pagination limits or API restrictions');
            console.log(`   Last episode found: #${episodes[episodes.length - 1].number}`);
        } else {
            console.log(`❌ Only found ${episodes.length} episodes, something is wrong`);
        }
        
        // Test de stream del primer episodio
        console.log('\n🎬 Testing stream for Episode 1...');
        if (episodes.length > 0) {
            const streamResult = await extractStreamUrl(episodes[0].href);
            const stream = JSON.parse(streamResult);
            console.log(`✅ Stream type: ${stream.type}, Quality: ${stream.quality}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAllBleachEpisodes();
