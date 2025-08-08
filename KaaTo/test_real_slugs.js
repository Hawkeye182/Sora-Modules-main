// Test para obtener slugs reales desde la búsqueda y probar los detalles
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

// Simular el entorno de Sora con fetchv2
const https = require('https');
const http = require('http');

async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...headers
            }
        };

        const request = (urlObj.protocol === 'https:' ? https : http).request(options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    headers: response.headers,
                    _data: data
                });
            });
        });

        request.on('error', reject);
        if (body) request.write(body);
        request.end();
    });
}

async function testWithRealSlugs() {
    try {
        console.log('🔍 BUSCANDO SLUGS REALES Y PROBANDO DETALLES');
        console.log('============================================\n');

        // Hacer búsqueda para obtener slugs reales
        console.log('🔎 Haciendo búsqueda para obtener slugs reales...');
        const searchResponse = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: 'dragon' }));
        
        if (searchResponse && searchResponse._data) {
            const searchData = JSON.parse(searchResponse._data);
            console.log(`✅ Encontrados ${searchData.length} resultados\n`);
            
            // Probar con el primer resultado real
            for (let i = 0; i < Math.min(2, searchData.length); i++) {
                const anime = searchData[i];
                console.log(`📍 Probando anime ${i + 1}: "${anime.title}"`);
                console.log('   Slug:', anime.slug);
                console.log('   URL completa:', `https://kaa.to/anime/${anime.slug}`);
                
                // Probar API de detalles
                const detailsUrl = `https://kaa.to/api/show/${anime.slug}`;
                console.log('   API URL:', detailsUrl);
                
                const detailsResponse = await fetchv2(detailsUrl);
                console.log('   Status:', detailsResponse.status);
                
                if (detailsResponse.status === 200 && detailsResponse._data) {
                    try {
                        const details = JSON.parse(detailsResponse._data);
                        console.log('   ✅ DETALLES OBTENIDOS:');
                        console.log('      Título:', details.title);
                        console.log('      Synopsis:', details.synopsis ? 'SÍ (' + details.synopsis.length + ' chars)' : 'NO');
                        console.log('      Año:', details.year);
                        console.log('      Estado:', details.status);
                        console.log('      Géneros:', details.genres?.length || 0, 'géneros');
                        console.log('      Poster:', details.poster ? 'SÍ' : 'NO');
                        
                        // Probar también episodios
                        console.log('\n   🎬 Probando episodios...');
                        const episodesUrl = `https://kaa.to/api/show/${anime.slug}/episodes`;
                        const episodesResponse = await fetchv2(episodesUrl);
                        console.log('   Episodes Status:', episodesResponse.status);
                        
                        if (episodesResponse.status === 200 && episodesResponse._data) {
                            const episodesData = JSON.parse(episodesResponse._data);
                            console.log('   Episodes Structure:', {
                                current_page: episodesData.current_page,
                                pages_count: episodesData.pages?.length || 0,
                                total_episodes: episodesData.pages?.reduce((acc, page) => acc + (page.episodes?.length || 0), 0) || 0
                            });
                        }
                        
                        break; // Solo necesitamos uno que funcione
                        
                    } catch (parseError) {
                        console.log('   ❌ Error parseando detalles:', parseError.message);
                    }
                } else {
                    console.log('   ❌ Error obteniendo detalles (Status:', detailsResponse.status, ')');
                }
                
                console.log(''); // Línea en blanco
            }
        } else {
            console.log('❌ Error en búsqueda');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testWithRealSlugs();
