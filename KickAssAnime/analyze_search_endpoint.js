// Análisis específico del endpoint /search/naruto que funciona
const https = require('https');

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
                'Accept-Encoding': 'identity', // Sin compresión
                'Connection': 'keep-alive',
                'Referer': 'https://kaa.to/',
                ...options.headers
            }
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function analyzeSearchEndpoint() {
    console.log('🔍 ANÁLISIS DEL ENDPOINT /search/naruto\n');
    console.log('=' .repeat(50));
    
    try {
        console.log('📄 Probando: https://kaa.to/search/naruto');
        const result = await realFetch('https://kaa.to/search/naruto');
        
        console.log(`Status: ${result.status}`);
        console.log(`Content-Type: ${result.headers['content-type']}`);
        console.log(`Body length: ${result.body.length}`);
        
        // Buscar datos JSON específicamente
        console.log('\n🎯 Buscando datos de anime...');
        
        // Buscar window.__NUXT__ o datos similares
        const nuxtMatch = result.body.match(/window\.__NUXT__\s*=\s*(.+?);?\s*<\/script>/s);
        if (nuxtMatch) {
            console.log('✅ Encontrado window.__NUXT__');
            const nuxtData = nuxtMatch[1];
            console.log(`📊 Datos NUXT length: ${nuxtData.length}`);
            
            // Buscar naruto en los datos
            if (nuxtData.toLowerCase().includes('naruto')) {
                console.log('✅ Los datos NUXT contienen "naruto"');
                
                // Extraer resultados de búsqueda
                try {
                    // Limpiar el JSON (remover funciones, etc.)
                    let cleanJson = nuxtData.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']');
                    
                    // Buscar arrays que contengan anime data
                    const animeArrays = cleanJson.match(/\[[^\[\]]*naruto[^\[\]]*\]/gi);
                    if (animeArrays) {
                        console.log(`📋 Encontrados ${animeArrays.length} arrays con naruto:`);
                        animeArrays.slice(0, 3).forEach((arr, i) => {
                            console.log(`\n--- Array ${i+1} ---`);
                            console.log(arr.substring(0, 300) + '...');
                        });
                    }
                    
                } catch (parseError) {
                    console.log(`❌ Error parseando JSON: ${parseError.message}`);
                    
                    // Buscar patrones específicos de anime
                    const animePatterns = [
                        /"title"[^}]*naruto[^}]*}/gi,
                        /"slug"[^}]*naruto[^}]*}/gi,
                        /\{[^}]*"naruto[^}]*\}/gi,
                        /"[^"]*naruto[^"]*":\s*"[^"]*"/gi
                    ];
                    
                    animePatterns.forEach((pattern, i) => {
                        const matches = nuxtData.match(pattern);
                        if (matches) {
                            console.log(`\n🎯 Patrón ${i+1} (${matches.length} coincidencias):`);
                            matches.slice(0, 5).forEach((match, j) => {
                                console.log(`   ${j+1}. ${match}`);
                            });
                        }
                    });
                }
            } else {
                console.log('❌ Los datos NUXT no contienen "naruto"');
            }
        } else {
            console.log('❌ No se encontró window.__NUXT__');
            
            // Buscar otros patrones de datos
            console.log('\n🔍 Buscando otros patrones de datos...');
            
            const dataPatterns = [
                /data-[^=]*=\s*"[^"]*naruto[^"]*"/gi,
                /<script[^>]*>[\s\S]*?naruto[\s\S]*?<\/script>/gi,
                /var\s+\w+\s*=\s*[\[\{][\s\S]*?naruto[\s\S]*?[\]\}]/gi
            ];
            
            dataPatterns.forEach((pattern, i) => {
                const matches = result.body.match(pattern);
                if (matches) {
                    console.log(`\n📊 Patrón de datos ${i+1} (${matches.length} coincidencias):`);
                    matches.slice(0, 3).forEach((match, j) => {
                        console.log(`   ${j+1}. ${match.substring(0, 200)}...`);
                    });
                }
            });
        }
        
        // También buscar el texto "naruto" directamente en el HTML
        const narutoMentions = result.body.match(/naruto/gi);
        console.log(`\n📊 Total menciones de "naruto": ${narutoMentions ? narutoMentions.length : 0}`);
        
        if (narutoMentions && narutoMentions.length > 0) {
            console.log('\n📋 Contexto de algunas menciones:');
            const regex = /[^<>\n]{0,50}naruto[^<>\n]{0,50}/gi;
            const contextMatches = result.body.match(regex);
            if (contextMatches) {
                contextMatches.slice(0, 10).forEach((context, i) => {
                    console.log(`   ${i+1}. ${context}`);
                });
            }
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

analyzeSearchEndpoint();
