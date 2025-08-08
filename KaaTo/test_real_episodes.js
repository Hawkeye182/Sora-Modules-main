// Test para obtener episodios reales de kaa.to y verificar su estructura
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

// Simular fetchv2
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

global.fetchv2 = fetchv2;

async function testRealEpisodes() {
    try {
        console.log('🔍 INVESTIGANDO ESTRUCTURA REAL DE EPISODIOS');
        console.log('============================================\n');

        // 1. Hacer búsqueda para obtener un anime real
        console.log('🔎 Paso 1: Búsqueda de anime...');
        const searchResponse = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: 'dragon ball' }));
        
        if (searchResponse && searchResponse._data) {
            const searchData = JSON.parse(searchResponse._data);
            
            if (searchData.length > 0) {
                const anime = searchData[0];
                console.log(`✅ Encontrado: ${anime.title}`);
                console.log(`📝 Slug: ${anime.slug}`);
                
                // 2. Obtener episodios del anime
                console.log('\n🎬 Paso 2: Obteniendo episodios...');
                const episodesResponse = await fetchv2(`https://kaa.to/api/show/${anime.slug}/episodes`);
                
                if (episodesResponse && episodesResponse._data) {
                    const episodesData = JSON.parse(episodesResponse._data);
                    
                    console.log('📊 Estructura de episodios:');
                    console.log('Current page:', episodesData.current_page);
                    console.log('Pages count:', episodesData.pages?.length || 0);
                    
                    if (episodesData.pages && episodesData.pages.length > 0) {
                        const firstPage = episodesData.pages[0];
                        console.log('First page episodes:', firstPage.episodes?.length || 0);
                        
                        if (firstPage.episodes && firstPage.episodes.length > 0) {
                            const firstEpisode = firstPage.episodes[0];
                            console.log('\n📺 Primer episodio:');
                            console.log('Episode number:', firstEpisode.episode);
                            console.log('Title:', firstEpisode.title);
                            console.log('Watch URI:', firstEpisode.watch_uri);
                            
                            // 3. Probar el watch_uri
                            if (firstEpisode.watch_uri) {
                                const episodeUrl = `https://kaa.to${firstEpisode.watch_uri}`;
                                console.log('\n🌐 Paso 3: Obteniendo página del episodio...');
                                console.log('URL:', episodeUrl);
                                
                                const episodePageResponse = await fetchv2(episodeUrl);
                                
                                if (episodePageResponse && episodePageResponse._data) {
                                    const html = episodePageResponse._data;
                                    
                                    // Buscar iframes
                                    const iframeMatches = html.match(/src="([^"]*iframe[^"]*)"/gi) || [];
                                    const krussdomiMatches = html.match(/src="([^"]*krussdomi[^"]*)"/gi) || [];
                                    
                                    console.log('📺 ANÁLISIS DE LA PÁGINA:');
                                    console.log('Total iframes encontrados:', iframeMatches.length);
                                    console.log('Iframes de krussdomi:', krussdomiMatches.length);
                                    
                                    if (krussdomiMatches.length > 0) {
                                        krussdomiMatches.forEach((match, index) => {
                                            const url = match.match(/src="([^"]*)"/)[1];
                                            console.log(`   ${index + 1}. ${url}`);
                                            
                                            // Extraer video ID
                                            const idMatch = url.match(/id=([^&]+)/);
                                            if (idMatch) {
                                                console.log(`      Video ID: ${idMatch[1]}`);
                                            }
                                        });
                                        
                                        // Probar extracción M3U8 con el primer ID encontrado
                                        const firstIframe = krussdomiMatches[0].match(/src="([^"]*)"/)[1];
                                        const videoIdMatch = firstIframe.match(/id=([^&]+)/);
                                        
                                        if (videoIdMatch) {
                                            const videoId = videoIdMatch[1];
                                            console.log('\n🎯 Paso 4: Probando extracción M3U8...');
                                            console.log('Video ID:', videoId);
                                            
                                            const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                                            console.log('Master URL:', masterUrl);
                                            
                                            const m3u8Headers = {
                                                'Accept': '*/*',
                                                'Origin': 'https://krussdomi.com',
                                                'Referer': 'https://krussdomi.com/',
                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                                            };
                                            
                                            const m3u8Response = await fetchv2(masterUrl, m3u8Headers);
                                            
                                            if (m3u8Response && m3u8Response.status === 200) {
                                                console.log('✅ M3U8 obtenido exitosamente!');
                                                console.log('Tamaño:', m3u8Response._data.length, 'caracteres');
                                                console.log('Primeras 200 caracteres:');
                                                console.log(m3u8Response._data.substring(0, 200));
                                                
                                                // Parsear streams
                                                const lines = m3u8Response._data.split('\n');
                                                const streamLines = lines.filter(line => 
                                                    line.includes('RESOLUTION=') || 
                                                    (!line.startsWith('#') && line.trim().length > 0)
                                                );
                                                
                                                console.log('\n📺 Streams encontrados:');
                                                streamLines.forEach((line, index) => {
                                                    if (line.includes('RESOLUTION=')) {
                                                        const resMatch = line.match(/RESOLUTION=(\d+x\d+)/);
                                                        const bandMatch = line.match(/BANDWIDTH=(\d+)/);
                                                        console.log(`   Quality: ${resMatch ? resMatch[1] : 'unknown'} (${bandMatch ? bandMatch[1] : 'unknown'} bps)`);
                                                    } else if (!line.startsWith('#') && line.trim()) {
                                                        console.log(`   URL: https://hls.krussdomi.com/manifest/${videoId}/${line.trim()}`);
                                                    }
                                                });
                                                
                                            } else {
                                                console.log('❌ Error obteniendo M3U8:', m3u8Response ? m3u8Response.status : 'No response');
                                            }
                                        }
                                        
                                    } else {
                                        console.log('❌ No se encontraron iframes de krussdomi');
                                        
                                        // Mostrar otros iframes encontrados
                                        if (iframeMatches.length > 0) {
                                            console.log('Otros iframes encontrados:');
                                            iframeMatches.slice(0, 3).forEach((match, index) => {
                                                const url = match.match(/src="([^"]*)"/)[1];
                                                console.log(`   ${index + 1}. ${url}`);
                                            });
                                        }
                                    }
                                } else {
                                    console.log('❌ Error obteniendo página del episodio');
                                }
                            } else {
                                console.log('❌ No hay watch_uri en el primer episodio');
                            }
                        } else {
                            console.log('❌ No hay episodios en la primera página');
                        }
                    } else {
                        console.log('❌ No hay páginas de episodios');
                        console.log('Estructura completa:', JSON.stringify(episodesData, null, 2));
                    }
                } else {
                    console.log('❌ Error obteniendo episodios');
                }
            } else {
                console.log('❌ No se encontraron animes');
            }
        } else {
            console.log('❌ Error en búsqueda');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testRealEpisodes();
