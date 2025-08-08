// Analizar la búsqueda con descompresión y headers correctos
const https = require('https');
const zlib = require('zlib');

async function realFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Referer': 'https://kaa.to/',
                ...options.headers
            }
        };

        const req = https.request(requestOptions, (res) => {
            let chunks = [];
            
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                
                // Descomprimir si es necesario
                if (res.headers['content-encoding'] === 'gzip') {
                    zlib.gunzip(buffer, (err, decompressed) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                status: res.statusCode,
                                headers: res.headers,
                                body: decompressed.toString()
                            });
                        }
                    });
                } else if (res.headers['content-encoding'] === 'deflate') {
                    zlib.inflate(buffer, (err, decompressed) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                status: res.statusCode,
                                headers: res.headers,
                                body: decompressed.toString()
                            });
                        }
                    });
                } else {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: buffer.toString()
                    });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function analyzeRealSearch() {
    console.log('🔍 ANÁLISIS PROFUNDO DE BÚSQUEDA KAA.TO\n');
    console.log('=' .repeat(50));
    
    try {
        // 1. Búsqueda real con naruto
        console.log('📄 1. Búsqueda real: /search?q=naruto');
        const searchResult = await realFetch('https://kaa.to/search?q=naruto');
        console.log(`Status: ${searchResult.status}`);
        console.log(`Content-Type: ${searchResult.headers['content-type']}`);
        console.log(`Content-Encoding: ${searchResult.headers['content-encoding']}`);
        console.log(`Body length: ${searchResult.body.length}`);
        
        console.log('\n📋 Primeros 1000 caracteres:');
        console.log(searchResult.body.substring(0, 1000));
        
        // Buscar indicadores de aplicación SPA/React/Vue
        const spaIndicators = [
            /window\.__NUXT__/g,
            /window\.__INITIAL_STATE__/g,
            /_payload/g,
            /nuxt/gi,
            /react/gi,
            /vue/gi,
            /angular/gi,
            /__webpack/g
        ];
        
        console.log('\n🎯 Buscando indicadores de SPA:');
        spaIndicators.forEach((pattern, i) => {
            const matches = searchResult.body.match(pattern);
            if (matches) {
                console.log(`✅ ${pattern.source}: ${matches.length} coincidencias`);
            }
        });
        
        // Buscar datos JSON embebidos
        console.log('\n📊 Buscando datos JSON embebidos:');
        const jsonPatterns = [
            /window\.__NUXT__\s*=\s*(\{.*?\});/s,
            /window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s,
            /"searchResults":\s*(\[.*?\])/s,
            /"animes":\s*(\[.*?\])/s
        ];
        
        jsonPatterns.forEach((pattern, i) => {
            const match = searchResult.body.match(pattern);
            if (match) {
                console.log(`✅ JSON Patrón ${i+1} encontrado:`);
                console.log(match[1].substring(0, 200) + '...');
            }
        });
        
        // 2. Intentar otras URLs de búsqueda
        console.log('\n📄 2. Probando otros endpoints de búsqueda...');
        
        const searchEndpoints = [
            '/api/search?q=naruto',
            '/search/naruto',
            '/api/anime/search?query=naruto',
            '/v1/search?q=naruto'
        ];
        
        for (const endpoint of searchEndpoints) {
            try {
                const result = await realFetch(`https://kaa.to${endpoint}`);
                console.log(`✅ ${endpoint}: Status ${result.status}, Length: ${result.body.length}`);
                if (result.body.includes('naruto') || result.body.includes('Naruto')) {
                    console.log(`   📋 Contiene resultados de naruto!`);
                    console.log(`   📄 Primeros 300 chars: ${result.body.substring(0, 300)}`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint}: Error - ${error.message}`);
            }
        }
        
        // 3. Analizar Network Tab simulation
        console.log('\n📄 3. Análisis de red simulada...');
        console.log('💡 PISTAS PARA DEPURACIÓN MANUAL:');
        console.log('1. Abre https://kaa.to en tu navegador');
        console.log('2. Abre DevTools (F12) → Network tab');
        console.log('3. Busca "naruto" en la página');
        console.log('4. Observa qué requests se hacen');
        console.log('5. Busca requests a APIs o archivos JSON');
        console.log('6. Copia las URLs y headers de esos requests');
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

analyzeRealSearch();
