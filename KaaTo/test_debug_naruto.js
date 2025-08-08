const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Implementación mejorada de fetchv2
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
                
                const encoding = res.headers['content-encoding'];
                
                try {
                    if (encoding === 'gzip') {
                        data = zlib.gunzipSync(buffer).toString('utf8');
                    } else if (encoding === 'deflate') {
                        data = zlib.inflateSync(buffer).toString('utf8');
                    } else if (encoding === 'br') {
                        data = zlib.brotliDecompressSync(buffer).toString('utf8');
                    } else {
                        data = buffer.toString('utf8');
                    }
                } catch (e) {
                    data = buffer.toString('utf8');
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

async function debugNarutoLanguages() {
    console.log('🔍 DEBUGGING NARUTO LANGUAGES\n');
    
    try {
        console.log('📡 Fetching language data...');
        const response = await fetchv2('https://kaa.to/api/show/naruto-f3cf/language');
        
        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, Object.keys(response.headers));
        console.log(`Content-Encoding: ${response.headers['content-encoding']}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        console.log(`Data length: ${response._data.length}`);
        console.log(`Raw data: ${response._data.substring(0, 200)}...`);
        
        try {
            const parsed = JSON.parse(response._data);
            console.log(`\n✅ Parsed successfully:`);
            console.log(`Type: ${typeof parsed}`);
            console.log(`Is Array: ${Array.isArray(parsed)}`);
            console.log(`Value:`, parsed);
            
            if (Array.isArray(parsed)) {
                console.log(`Languages: ${parsed.join(', ')}`);
            } else {
                console.log(`Not an array - checking properties:`);
                console.log(Object.keys(parsed));
            }
            
        } catch (parseError) {
            console.log(`❌ Parse error: ${parseError.message}`);
            
            // Intentar limpiar la respuesta
            let cleanData = response._data.trim();
            if (cleanData.startsWith('\n')) {
                cleanData = cleanData.substring(1);
            }
            
            console.log(`\nTrying cleaned data: ${cleanData.substring(0, 100)}...`);
            
            try {
                const parsed2 = JSON.parse(cleanData);
                console.log(`✅ Cleaned parse successful:`, parsed2);
            } catch (parseError2) {
                console.log(`❌ Still can't parse: ${parseError2.message}`);
            }
        }
        
        // Ahora probar con episodios directamente
        console.log(`\n📺 Testing episodes directly with en-US...`);
        const episodeResponse = await fetchv2('https://kaa.to/api/show/naruto-f3cf/episodes?ep=1&lang=en-US');
        
        console.log(`Episode Status: ${episodeResponse.status}`);
        console.log(`Episode Data length: ${episodeResponse._data.length}`);
        
        if (episodeResponse._data.length < 500) {
            console.log(`Episode Data: ${episodeResponse._data}`);
        } else {
            console.log(`Episode Data preview: ${episodeResponse._data.substring(0, 300)}...`);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugNarutoLanguages();
