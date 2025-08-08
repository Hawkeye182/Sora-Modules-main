// Test del módulo KaaTo con M3U8
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

// Simular fetchv2 (como en Sora)
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

// Hacer fetchv2 global para el módulo
global.fetchv2 = fetchv2;

async function testM3U8Module() {
    try {
        console.log('🎯 TEST DEL MÓDULO KAATO CON M3U8');
        console.log('=================================\n');

        // Cargar el módulo con M3U8
        const moduleCode = fs.readFileSync('e:/Proyectos/XD/Sora-Modules-main/KaaTo/subs/KaaTo_M3U8.js', 'utf8');
        eval(moduleCode);

        // Test 1: Búsqueda
        console.log('🔎 Paso 1: Probando búsqueda...');
        const searchResult = await searchResults('dragon');
        const searchData = JSON.parse(searchResult);
        
        console.log(`✅ ${searchData.length} resultados encontrados`);
        
        if (searchData.length > 0) {
            const testAnime = searchData[0];
            console.log('Primer resultado:', testAnime.title);
            
            // Test 2: Detalles
            console.log('\n🔍 Paso 2: Probando extracción de detalles...');
            const detailsResult = await extractDetails(testAnime.href);
            const details = JSON.parse(detailsResult);
            
            console.log('📊 DETALLES:');
            console.log('Description:', details[0]?.description?.substring(0, 100) + '...');
            console.log('Aliases:', details[0]?.aliases);
            console.log('Airdate:', details[0]?.airdate);
            
            // Test 3: Episodios
            console.log('\n🎬 Paso 3: Probando extracción de episodios...');
            const episodesResult = await extractEpisodes(testAnime.href);
            const episodes = JSON.parse(episodesResult);
            
            console.log(`📺 ${episodes.length} episodios encontrados`);
            if (episodes.length > 0) {
                console.log('Primer episodio:', episodes[0]);
                
                // Test 4: Stream URL con M3U8
                console.log('\n🎯 Paso 4: Probando extracción de stream M3U8...');
                
                // Simular un episodio con iframe de krussdomi para probar
                const testEpisodeUrl = 'https://kaa.to/anime/test/episode/1';
                const mockHtml = `
                    <html>
                        <body>
                            <iframe src="https://krussdomi.com/vidstreaming/player.php?id=64cd832e44c6d04c12186497&ln=en-US"></iframe>
                        </body>
                    </html>
                `;
                
                // Mock de la respuesta HTML del episodio
                const originalFetchv2 = global.fetchv2;
                global.fetchv2 = async function(url, headers, method, body) {
                    if (url === testEpisodeUrl) {
                        return {
                            status: 200,
                            _data: mockHtml
                        };
                    } else if (url.includes('master.m3u8')) {
                        // Simular respuesta del master playlist
                        const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=1280x720,FRAME-RATE=24.000
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1920x1080,FRAME-RATE=24.000
1080p/playlist.m3u8`;
                        return {
                            status: 200,
                            _data: masterPlaylist
                        };
                    }
                    return originalFetchv2(url, headers, method, body);
                };
                
                const streamResult = await extractStreamUrl(testEpisodeUrl);
                const streamData = JSON.parse(streamResult);
                
                console.log('🎬 STREAM EXTRAÍDO:');
                console.log('Stream URL:', streamData.streamUrl);
                console.log('Quality:', streamData.quality);
                console.log('Type:', streamData.type);
                console.log('Headers:', Object.keys(streamData.headers));
                
                // Verificaciones
                console.log('\n✅ VERIFICACIONES:');
                console.log('==================');
                const hasM3U8 = streamData.streamUrl && streamData.streamUrl.includes('.m3u8');
                const hasHeaders = streamData.headers && Object.keys(streamData.headers).length > 0;
                const correctType = streamData.type === 'm3u8' || streamData.type === 'iframe';
                
                console.log('✓ URL M3U8:', hasM3U8 ? '✅ SÍ' : '❌ NO');
                console.log('✓ Headers presentes:', hasHeaders ? '✅ SÍ' : '❌ NO');
                console.log('✓ Tipo correcto:', correctType ? '✅ SÍ' : '❌ NO');
                
                if (hasM3U8 && hasHeaders && correctType) {
                    console.log('\n🟢 ¡MÓDULO M3U8 FUNCIONANDO!');
                    console.log('🎯 Streams directos listos para Sora');
                } else {
                    console.log('\n🟡 MÓDULO PARCIALMENTE FUNCIONAL');
                    console.log('⚠️  Puede necesitar ajustes en la extracción M3U8');
                }
                
                // Restaurar fetchv2 original
                global.fetchv2 = originalFetchv2;
            }
            
        } else {
            console.log('❌ No se encontraron resultados para probar');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testM3U8Module();
