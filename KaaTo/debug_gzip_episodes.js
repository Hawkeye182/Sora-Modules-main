const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');

// Implementación de fetchv2 con debugging
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        console.log(`[FETCH DEBUG] ${method} ${url}`);
        
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
            console.log(`[RESPONSE] Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}, Content-Encoding: ${res.headers['content-encoding']}`);
            
            let data = '';
            
            // Manejar compresión gzip
            let stream = res;
            if (res.headers['content-encoding'] === 'gzip') {
                const zlib = require('zlib');
                stream = res.pipe(zlib.createGunzip());
            }
            
            stream.on('data', (chunk) => {
                data += chunk;
            });
            
            stream.on('end', () => {
                console.log(`[RESPONSE] Length: ${data.length} chars`);
                console.log(`[RESPONSE] First 100 chars: ${data.substring(0, 100)}...`);
                
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    _data: data
                });
            });
            
            stream.on('error', (error) => {
                console.error('[STREAM ERROR]', error.message);
                reject(error);
            });
        });

        req.on('error', (error) => {
            console.error('[REQUEST ERROR]', error.message);
            reject(error);
        });

        if (body) req.write(body);
        req.end();
    });
}

const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
global.fetchv2 = fetchv2;
eval(moduleCode);

async function debugBleachEpisodes() {
    console.log('🔍 DEBUGGING BLEACH EPISODES WITH GZIP SUPPORT\n');
    
    try {
        const episodesResult = await extractEpisodes('https://kaa.to/anime/bleach-f24c');
        const episodes = JSON.parse(episodesResult);
        
        console.log(`\n✅ FINAL RESULT: ${episodes.length} episodes found`);
        if (episodes.length > 1) {
            console.log(`   First 5: ${episodes.slice(0, 5).map(ep => `#${ep.number}`).join(', ')}`);
            console.log(`   Last 5: ${episodes.slice(-5).map(ep => `#${ep.number}`).join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugBleachEpisodes();
