const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Implementación real de fetchv2 usando Node.js
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        console.log(`[REAL FETCH] ${method} ${url}`);
        
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-419,es;q=0.9',
                ...headers
            }
        };

        const req = client.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    _data: data
                });
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error.message);
            reject(error);
        });

        if (body) {
            req.write(body);
        }
        
        req.end();
    });
}

// Cargar el módulo KaaTo
const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
global.fetchv2 = fetchv2;

// Evaluar el módulo
eval(moduleCode);

async function testRealAPI() {
    console.log('🌐 TESTING KaaTo WITH REAL API\n');
    
    try {
        // Test con búsqueda real
        console.log('🔍 Testing Real Search API...');
        const searchResults_result = await searchResults('naruto');
        const results = JSON.parse(searchResults_result);
        
        if (results.length > 0) {
            console.log(`✅ Found ${results.length} results`);
            console.log(`   First: ${results[0].title}`);
            console.log(`   URL: ${results[0].href}`);
            
            // Test detalles del primer resultado
            console.log('\n📖 Testing Real Details API...');
            const detailsResult = await extractDetails(results[0].href);
            const details = JSON.parse(detailsResult);
            console.log(`✅ Details: ${details[0].description.substring(0, 100)}...`);
            
            // Test episodios del primer resultado
            console.log('\n📺 Testing Real Episodes API...');
            const episodesResult = await extractEpisodes(results[0].href);
            const episodes = JSON.parse(episodesResult);
            console.log(`✅ Found ${episodes.length} episodes`);
            
            if (episodes.length > 0) {
                console.log(`   Episode 1: ${episodes[0].href}`);
                
                // Test stream del primer episodio (solo estructura, sin descargar video)
                console.log('\n🎬 Testing Stream Structure...');
                const streamResult = await extractStreamUrl(episodes[0].href);
                const stream = JSON.parse(streamResult);
                console.log(`✅ Stream type: ${stream.type}`);
                console.log(`   Quality: ${stream.quality}`);
                console.log(`   URL pattern: ${stream.streamUrl.includes('krussdomi') ? 'krussdomi.com' : 'other'}`);
            }
            
        } else {
            console.log('❌ No search results found');
        }
        
        console.log('\n🎉 REAL API TEST COMPLETED!');
        
    } catch (error) {
        console.error('❌ Real API test failed:', error.message);
    }
}

testRealAPI();
