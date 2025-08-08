// Función simple de fetch para pruebas
async function soraFetch(url, options = {}) {
    const fetch = await import('node-fetch').then(module => module.default);
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.text();
    }
}

// Función para realizar múltiples búsquedas de prueba
async function testMultipleSearches() {
    const searchTerms = ['dandadan', 'dragon ball', 'naruto', 'sword art online', 'bleach', 'one piece'];
    
    console.log('=== TESTING MULTIPLE ANIME SEARCHES ===\n');
    
    for (const term of searchTerms) {
        console.log(`🔍 Buscando: "${term}"`);
        console.log('─'.repeat(50));
        
        try {
            const searchResponse = await soraFetch('https://kaa.to/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://kaa.to/',
                    'Origin': 'https://kaa.to'
                },
                body: JSON.stringify({ query: term })
            });

            if (searchResponse && searchResponse.data && searchResponse.data.length > 0) {
                console.log(`✅ Encontrados ${searchResponse.data.length} resultados`);
                
                // Mostrar los primeros 3 resultados
                for (let i = 0; i < Math.min(3, searchResponse.data.length); i++) {
                    const anime = searchResponse.data[i];
                    console.log(`   ${i + 1}. ${anime.attributes.title_en || anime.attributes.title_jp || 'Sin título'}`);
                    console.log(`      Slug: ${anime.attributes.slug}`);
                    console.log(`      Año: ${anime.attributes.year || 'N/A'}`);
                    console.log(`      Episodios: ${anime.attributes.episodes_count || 'N/A'}`);
                }
                
                // Probar detalles del primer resultado
                if (searchResponse.data[0]) {
                    const firstAnime = searchResponse.data[0];
                    console.log(`\n🔍 Obteniendo detalles de: ${firstAnime.attributes.title_en || firstAnime.attributes.title_jp}`);
                    
                    try {
                        const detailsResponse = await soraFetch(`https://kaa.to/api/show/${firstAnime.attributes.slug}`, {
                            headers: {
                                'Accept': 'application/json',
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                'Referer': 'https://kaa.to/',
                            }
                        });
                        
                        if (detailsResponse && detailsResponse.data) {
                            console.log(`   ✅ Detalles obtenidos correctamente`);
                            console.log(`   Sinopsis: ${detailsResponse.data.attributes.synopsis ? detailsResponse.data.attributes.synopsis.substring(0, 100) + '...' : 'N/A'}`);
                        }
                    } catch (error) {
                        console.log(`   ❌ Error obteniendo detalles: ${error.message}`);
                    }
                }
            } else {
                console.log(`❌ No se encontraron resultados para "${term}"`);
            }
            
        } catch (error) {
            console.log(`❌ Error en búsqueda de "${term}": ${error.message}`);
        }
        
        console.log('\n');
    }
}

// Función para probar extracción de stream mejorada
async function testImprovedStreamExtraction() {
    console.log('=== TESTING IMPROVED STREAM EXTRACTION ===\n');
    
    try {
        // Buscar Bleach (que sabemos que funciona)
        const searchResponse = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/',
                'Origin': 'https://kaa.to'
            },
            body: JSON.stringify({ query: 'bleach' })
        });

        if (searchResponse && searchResponse.data && searchResponse.data.length > 0) {
            const anime = searchResponse.data[0];
            console.log(`🔍 Probando extracción mejorada con: ${anime.attributes.title_en}`);
            
            // Obtener episodios
            const episodesResponse = await soraFetch(`https://kaa.to/api/show/${anime.attributes.slug}/episodes`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://kaa.to/',
                }
            });
            
            if (episodesResponse && episodesResponse.data && episodesResponse.data.length > 0) {
                const firstEpisode = episodesResponse.data[0];
                console.log(`📺 Probando episodio: ${firstEpisode.attributes.title || 'Episodio 1'}`);
                
                // Obtener datos del episodio
                const episodeResponse = await soraFetch(`https://kaa.to/api/show/${anime.attributes.slug}/episode/${firstEpisode.attributes.slug}`, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://kaa.to/',
                    }
                });
                
                if (episodeResponse && episodeResponse.data) {
                    console.log('✅ Datos del episodio obtenidos');
                    
                    // Buscar servidores disponibles
                    const servers = episodeResponse.data.attributes.videos || [];
                    console.log(`🖥️  Servidores encontrados: ${servers.length}`);
                    
                    for (const server of servers) {
                        console.log(`   Server: ${server.name || 'Unknown'}`);
                        console.log(`   URL: ${server.url}`);
                        
                        // Si es VidStreaming, intentar extraer el ID para construir la URL del master.m3u8
                        if (server.name === 'VidStreaming' && server.url) {
                            try {
                                const urlParts = server.url.split('id=');
                                if (urlParts.length > 1) {
                                    const videoId = urlParts[1].split('&')[0];
                                    const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                                    console.log(`   🎬 Master M3U8: ${masterUrl}`);
                                    
                                    // Intentar obtener el master playlist
                                    try {
                                        const masterResponse = await soraFetch(masterUrl, {
                                            headers: {
                                                'Accept': '*/*',
                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                                'Referer': 'https://krussdomi.com/',
                                                'Origin': 'https://krussdomi.com'
                                            }
                                        });
                                        
                                        if (masterResponse && typeof masterResponse === 'string' && masterResponse.includes('#EXTM3U')) {
                                            console.log(`   ✅ Master playlist obtenido (${masterResponse.length} caracteres)`);
                                            
                                            // Extraer las diferentes calidades disponibles
                                            const qualityLines = masterResponse.split('\n').filter(line => 
                                                line.includes('EXT-X-STREAM-INF') || 
                                                (line.endsWith('.m3u8') && !line.startsWith('#'))
                                            );
                                            
                                            console.log(`   📊 Calidades disponibles: ${qualityLines.length / 2}`);
                                            
                                            // Mostrar información de calidades
                                            for (let i = 0; i < qualityLines.length; i += 2) {
                                                if (qualityLines[i] && qualityLines[i + 1]) {
                                                    const infoLine = qualityLines[i];
                                                    const urlLine = qualityLines[i + 1];
                                                    
                                                    const resolution = infoLine.match(/RESOLUTION=(\d+x\d+)/);
                                                    const bandwidth = infoLine.match(/BANDWIDTH=(\d+)/);
                                                    
                                                    console.log(`      📺 ${resolution ? resolution[1] : 'Unknown'} - ${bandwidth ? Math.round(bandwidth[1] / 1000) + 'kbps' : 'Unknown'}`);
                                                    console.log(`         URL: https://hls.krussdomi.com/manifest/${videoId}/${urlLine}`);
                                                }
                                            }
                                        } else {
                                            console.log(`   ❌ Master playlist no válido`);
                                        }
                                    } catch (error) {
                                        console.log(`   ❌ Error obteniendo master playlist: ${error.message}`);
                                    }
                                }
                            } catch (error) {
                                console.log(`   ❌ Error procesando URL de VidStreaming: ${error.message}`);
                            }
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.log(`❌ Error en prueba de extracción: ${error.message}`);
    }
}

// Ejecutar las pruebas
async function runAllTests() {
    await testMultipleSearches();
    console.log('\n' + '='.repeat(60) + '\n');
    await testImprovedStreamExtraction();
}

runAllTests().catch(console.error);
