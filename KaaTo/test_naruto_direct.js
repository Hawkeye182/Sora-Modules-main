const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Implementación mejorada de fetchv2 con mejor manejo de gzip
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
                
                // Manejar diferentes tipos de compresión
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
                    console.log(`Decompression error for ${url}: ${e.message}`);
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

const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
global.fetchv2 = fetchv2;
eval(moduleCode);

async function testNarutoDirectly() {
    console.log('🍜 TESTING NARUTO DIRECTLY\n');
    
    try {
        // Probar directamente con el slug conocido de Naruto
        console.log('📺 Testing Naruto main series directly...');
        const narutoUrl = 'https://kaa.to/anime/naruto-f3cf';
        
        // Primero verificar idiomas disponibles
        console.log('🌐 Checking available languages...');
        const languageResponse = await fetchv2('https://kaa.to/api/show/naruto-f3cf/language');
        
        if (languageResponse.status === 200) {
            console.log('✅ Language API response received');
            try {
                const languages = JSON.parse(languageResponse._data);
                console.log(`   Available languages: ${languages.join(', ')}`);
                
                // Probar con diferentes idiomas
                for (const lang of languages) {
                    console.log(`\n📝 Testing episodes with language: ${lang}`);
                    
                    const episodeUrl = `https://kaa.to/api/show/naruto-f3cf/episodes?ep=1&lang=${lang}`;
                    console.log(`   URL: ${episodeUrl}`);
                    
                    const episodeResponse = await fetchv2(episodeUrl);
                    
                    if (episodeResponse.status === 200) {
                        try {
                            const episodeData = JSON.parse(episodeResponse._data);
                            
                            let totalEpisodes = 0;
                            if (episodeData.pages && Array.isArray(episodeData.pages)) {
                                episodeData.pages.forEach(page => {
                                    if (page.eps && Array.isArray(page.eps)) {
                                        totalEpisodes += page.eps.length;
                                    }
                                });
                            }
                            
                            console.log(`   ✅ ${lang}: Found ${totalEpisodes} total episodes`);
                            
                            if (totalEpisodes > 200) {
                                console.log(`   🎯 FOUND THE COMPLETE SERIES IN ${lang.toUpperCase()}!`);
                                
                                // Mostrar estructura de páginas
                                if (episodeData.pages) {
                                    episodeData.pages.forEach((page, i) => {
                                        console.log(`      Page ${page.number}: Episodes ${page.from}-${page.to} (${page.eps.length} episodes)`);
                                    });
                                }
                                break;
                            }
                            
                        } catch (parseError) {
                            console.log(`   ❌ ${lang}: JSON parse error - ${parseError.message.substring(0, 50)}...`);
                        }
                    } else {
                        console.log(`   ❌ ${lang}: HTTP ${episodeResponse.status}`);
                    }
                }
                
            } catch (langParseError) {
                console.log(`❌ Language parse error: ${langParseError.message}`);
            }
        } else {
            console.log(`❌ Language API failed: HTTP ${languageResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ Direct Naruto test failed:', error.message);
    }
}

testNarutoDirectly();
