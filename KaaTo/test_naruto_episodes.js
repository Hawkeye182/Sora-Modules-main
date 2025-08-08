const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Implementación real de fetchv2 con soporte para compresión
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        console.log(`[REAL FETCH] ${method} ${url}`);
        
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
            let data = Buffer.alloc(0);
            
            res.on('data', (chunk) => {
                data = Buffer.concat([data, chunk]);
            });
            
            res.on('end', () => {
                let responseData = data;
                
                // Manejar compresión
                const encoding = res.headers['content-encoding'];
                if (encoding === 'gzip') {
                    try {
                        responseData = zlib.gunzipSync(data);
                    } catch (e) {
                        console.error('Error descomprimiendo gzip:', e.message);
                    }
                } else if (encoding === 'deflate') {
                    try {
                        responseData = zlib.inflateSync(data);
                    } catch (e) {
                        console.error('Error descomprimiendo deflate:', e.message);
                    }
                } else if (encoding === 'br') {
                    try {
                        responseData = zlib.brotliDecompressSync(data);
                    } catch (e) {
                        console.error('Error descomprimiendo brotli:', e.message);
                    }
                }
                
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    _data: responseData.toString('utf8')
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

// Cargar el módulo completo
const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
global.fetchv2 = fetchv2;
eval(moduleCode);

async function testNarutoEpisodes() {
    console.log('🍜 TESTING NARUTO EPISODES COUNT\n');
    
    try {
        // Buscar Naruto
        console.log('🔍 Searching for Naruto...');
        const searchResults_result = await searchResults('naruto');
        const results = JSON.parse(searchResults_result);
        
        // Buscar específicamente la serie principal de Naruto (220 episodios)
        const narutoSeries = results.find(anime => 
            anime.title.toLowerCase().includes('naruto') && 
            !anime.title.toLowerCase().includes('shippuden') &&
            !anime.title.toLowerCase().includes('boruto') &&
            !anime.title.toLowerCase().includes('movie')
        ) || results[0];
        
        console.log(`✅ Found Naruto series: ${narutoSeries.title}`);
        console.log(`   URL: ${narutoSeries.href}`);
        
        // Obtener todos los episodios
        console.log('\n📺 Getting all Naruto episodes...');
        const episodesResult = await extractEpisodes(narutoSeries.href);
        const episodes = JSON.parse(episodesResult);
        
        console.log(`✅ Total episodes found: ${episodes.length}`);
        
        if (episodes.length > 0) {
            console.log(`   First episode: #${episodes[0].number}`);
            console.log(`   Last episode: #${episodes[episodes.length - 1].number}`);
            
            // Mostrar distribución por rangos
            const ranges = {};
            episodes.forEach(ep => {
                const range = Math.floor((ep.number - 1) / 50) * 50;
                const rangeKey = `${range + 1}-${range + 50}`;
                ranges[rangeKey] = (ranges[rangeKey] || 0) + 1;
            });
            
            console.log('\n📊 Episodes distribution:');
            Object.entries(ranges).forEach(([range, count]) => {
                console.log(`   Episodes ${range}: ${count} episodes`);
            });
            
            // Verificar si tenemos aproximadamente 220 episodios
            if (episodes.length >= 200 && episodes.length <= 250) {
                console.log(`\n🎉 SUCCESS! Got ${episodes.length} episodes (expected ~220)`);
            } else {
                console.log(`\n⚠️  WARNING: Got ${episodes.length} episodes, expected ~220`);
            }
        }
        
    } catch (error) {
        console.error('❌ Naruto test failed:', error.message);
    }
}

testNarutoEpisodes();
