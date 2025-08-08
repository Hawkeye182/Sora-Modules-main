// Test para encontrar animes con episodios disponibles
const https = require('https');

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

async function findAnimesWithEpisodes() {
    try {
        console.log('🔍 BUSCANDO ANIMES CON EPISODIOS DISPONIBLES');
        console.log('============================================\n');

        const searchQueries = ['naruto', 'one piece', 'attack on titan', 'demon slayer', 'my hero academia'];
        
        for (const query of searchQueries) {
            console.log(`🔎 Buscando: ${query}`);
            
            const searchResponse = await fetchv2('https://kaa.to/api/search', {
                'Content-Type': 'application/json'
            }, 'POST', JSON.stringify({ query: query }));
            
            if (searchResponse && searchResponse._data) {
                const searchData = JSON.parse(searchResponse._data);
                
                for (let i = 0; i < Math.min(3, searchData.length); i++) {
                    const anime = searchData[i];
                    console.log(`   📺 ${anime.title} (${anime.slug})`);
                    
                    // Verificar episodios
                    const episodesResponse = await fetchv2(`https://kaa.to/api/show/${anime.slug}/episodes`);
                    
                    if (episodesResponse && episodesResponse._data) {
                        const episodesData = JSON.parse(episodesResponse._data);
                        const totalEpisodes = episodesData.pages?.reduce((acc, page) => acc + (page.episodes?.length || 0), 0) || 0;
                        
                        console.log(`      📊 Páginas: ${episodesData.pages?.length || 0}, Episodios: ${totalEpisodes}`);
                        
                        if (totalEpisodes > 0) {
                            console.log(`      ✅ ¡ENCONTRADO ANIME CON EPISODIOS!`);
                            
                            // Mostrar detalles del primer episodio
                            const firstPage = episodesData.pages[0];
                            const firstEpisode = firstPage.episodes[0];
                            
                            console.log(`      📺 Primer episodio:`);
                            console.log(`         Número: ${firstEpisode.episode}`);
                            console.log(`         Título: ${firstEpisode.title || 'Sin título'}`);
                            console.log(`         Watch URI: ${firstEpisode.watch_uri || 'No disponible'}`);
                            
                            if (firstEpisode.watch_uri) {
                                return {
                                    anime: anime,
                                    episodeUri: firstEpisode.watch_uri,
                                    episodeNumber: firstEpisode.episode
                                };
                            }
                        }
                    }
                }
            }
            
            console.log(''); // Línea en blanco
        }
        
        console.log('❌ No se encontraron animes con episodios disponibles');
        return null;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testEpisodeExtraction() {
    const result = await findAnimesWithEpisodes();
    
    if (result) {
        console.log('\n🎯 PROBANDO EXTRACCIÓN CON ANIME ENCONTRADO');
        console.log('==========================================');
        
        const episodeUrl = `https://kaa.to${result.episodeUri}`;
        console.log(`📺 URL del episodio: ${episodeUrl}`);
        
        try {
            const episodePageResponse = await fetchv2(episodeUrl);
            
            if (episodePageResponse && episodePageResponse._data) {
                const html = episodePageResponse._data;
                
                // Buscar todos los tipos de iframes
                const allIframes = html.match(/src="([^"]*)"/gi) || [];
                const krussdomiIframes = allIframes.filter(iframe => iframe.includes('krussdomi'));
                const playerIframes = allIframes.filter(iframe => iframe.includes('player'));
                
                console.log('\n📊 ANÁLISIS DE IFRAMES:');
                console.log(`Total iframes: ${allIframes.length}`);
                console.log(`Krussdomi iframes: ${krussdomiIframes.length}`);
                console.log(`Player iframes: ${playerIframes.length}`);
                
                if (krussdomiIframes.length > 0) {
                    console.log('\n🎯 IFRAMES DE KRUSSDOMI ENCONTRADOS:');
                    krussdomiIframes.forEach((iframe, index) => {
                        const url = iframe.match(/src="([^"]*)"/)[1];
                        console.log(`${index + 1}. ${url}`);
                        
                        const idMatch = url.match(/id=([^&]+)/);
                        if (idMatch) {
                            console.log(`   Video ID: ${idMatch[1]}`);
                        }
                    });
                } else if (playerIframes.length > 0) {
                    console.log('\n🎬 OTROS PLAYER IFRAMES:');
                    playerIframes.slice(0, 3).forEach((iframe, index) => {
                        const url = iframe.match(/src="([^"]*)"/)[1];
                        console.log(`${index + 1}. ${url}`);
                    });
                } else {
                    console.log('\n⚠️ NO SE ENCONTRARON IFRAMES DE REPRODUCTOR');
                    console.log('Primeros 500 caracteres del HTML:');
                    console.log(html.substring(0, 500));
                }
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo página del episodio:', error.message);
        }
    }
}

findAnimesWithEpisodes().then(result => {
    if (result) {
        return testEpisodeExtraction();
    }
}).catch(console.error);
