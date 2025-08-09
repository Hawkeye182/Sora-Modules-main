// KaaTo Complete - Corregido para extraer video ID desde window.KAA
// Search
async function searchResults(keyword) {
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            // La API retorna un array directamente, no un objeto con result
            if (Array.isArray(data)) {
                const results = data.map(item => ({
                    title: item.title || 'Unknown Title',
                    image: item.poster && item.poster.hq ? 
                           `https://kaa.to/image/poster/${item.poster.hq}.webp` : '',
                    href: `https://kaa.to/anime/${item.slug}`
                }));
                
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('Search error: ' + error.message);
        return JSON.stringify([]);
    }
}

// Details
async function extractDetails(url) {
    try {
        const slug = url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            if (data && data.result) {
                const result = {
                    description: data.result.synopsis || 'No description available',
                    aliases: data.result.title_en || data.result.title || '',
                    airdate: data.result.premiered || 'Unknown'
                };
                
                return JSON.stringify([result]);
            } else {
                return JSON.stringify([{
                    description: 'Error loading details',
                    aliases: '',
                    airdate: 'Unknown'
                }]);
            }
        }
    } catch (error) {
        console.log('Details error: ' + error.message);
        return JSON.stringify([{
            description: 'Error loading details',
            aliases: '',
            airdate: 'Unknown'
        }]);
    }
}

// Episodes with complete pagination
async function extractEpisodes(url) {
    try {
        const slug = url.split('/').pop();
        
        // Obtener información del idioma primero
        const languageResponse = await fetchv2(`https://kaa.to/api/show/${slug}/language`);
        
        if (!languageResponse || languageResponse.status !== 200) {
            console.log('Language API failed');
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
        let languageData;
        try {
            languageData = typeof languageResponse._data === 'string' ? 
                          JSON.parse(languageResponse._data) : languageResponse._data;
        } catch (e) {
            console.log('Failed to parse language response');
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
        // Usar japonés con subtítulos como preferencia
        let selectedLanguage = 'ja-JP';
        if (languageData && languageData.result && Array.isArray(languageData.result)) {
            const availableLanguages = languageData.result;
            
            // Buscar japonés primero, luego inglés como fallback
            const jaLang = availableLanguages.find(lang => lang.includes('ja-JP'));
            const enLang = availableLanguages.find(lang => lang.includes('en-US'));
            
            if (jaLang) {
                selectedLanguage = 'ja-JP';
            } else if (enLang) {
                selectedLanguage = 'en-US';
            } else if (availableLanguages.length > 0) {
                selectedLanguage = availableLanguages[0];
            }
        }
        
        console.log('Using language:', selectedLanguage);
        
        // Obtener episodios con el idioma seleccionado
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=${selectedLanguage}`);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData;
            try {
                episodesData = typeof episodesResponse._data === 'string' ? 
                              JSON.parse(episodesResponse._data) : episodesResponse._data;
            } catch (e) {
                console.log('Failed to parse episodes response');
                return JSON.stringify([{
                    href: url,
                    number: 1
                }]);
            }
            
            if (episodesData && episodesData.result && episodesData.result.length > 0) {
                console.log(`Found ${episodesData.result.length} episodes on first page`);
                
                // Si hay información de paginación, obtener todos los episodios
                const allEpisodes = [];
                
                // Estrategia 1: Usar la información de pages para obtener todos los números de episodio
                if (episodesData.pages && Array.isArray(episodesData.pages) && episodesData.pages.length > 1) {
                    console.log(`Found ${episodesData.pages.length} pages of episodes`);
                    
                    // Generar todos los números de episodio de todas las páginas
                    episodesData.pages.forEach(page => {
                        if (page.eps && Array.isArray(page.eps)) {
                            page.eps.forEach(epNum => {
                                // Buscar el slug correspondiente en los resultados actuales
                                const episodeData = episodesData.result.find(ep => ep.episode_number === epNum);
                                const episodeSlug = episodeData ? episodeData.slug : `ep-${epNum}`;
                                
                                allEpisodes.push({
                                    href: `https://kaa.to/${slug}/ep-${epNum}-${episodeSlug}`,
                                    number: epNum
                                });
                            });
                        }
                    });
                    
                    console.log(`Total episodes generated from pages: ${allEpisodes.length}`);
                } else {
                    // Estrategia 2: Usar solo los episodios de la primera página
                    episodesData.result.forEach(episode => {
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${episode.episode_number}-${episode.slug}`,
                            number: episode.episode_number
                        });
                    });
                }
                
                // Ordenar por número de episodio
                allEpisodes.sort((a, b) => a.number - b.number);
                
                console.log(`Returning ${allEpisodes.length} episodes for ${slug}`);
                return JSON.stringify(allEpisodes);
            }
        }
        
        // Fallback
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
        
    } catch (error) {
        console.log('Episodes error: ' + error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

// Función para extraer streams usando el ID desde window.KAA de la página
async function extractStreamUrl(url) {
    console.log('Extracting stream from URL: ' + url);
    
    try {
        // Obtener la página del episodio para extraer el servidor real
        const pageResponse = await fetchv2(url, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        });
        
        if (pageResponse && pageResponse.status === 200 && pageResponse._data) {
            const html = pageResponse._data;
            
            // Buscar el array de servidores en window.KAA
            console.log('Looking for servers in window.KAA...');
            const serversMatch = html.match(/servers:\[([^\]]+)\]/);
            
            if (serversMatch) {
                console.log('Found servers array');
                
                // Extraer la URL del primer servidor
                const serverUrlMatch = serversMatch[1].match(/src:"([^"]+)"/);
                
                if (serverUrlMatch) {
                    const serverUrl = serverUrlMatch[1].replace(/\\u002F/g, '/');
                    console.log('Found server URL:', serverUrl);
                    
                    // Extraer el ID del video de la URL del servidor
                    const urlParams = new URL(serverUrl);
                    const videoId = urlParams.searchParams.get('id');
                    
                    if (videoId) {
                        console.log('Extracted video ID:', videoId);
                        
                        // Intentar obtener el M3U8 con headers más específicos para Cloudflare
                        const m3u8Url = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                        console.log('Trying M3U8 URL:', m3u8Url);
                        
                        const m3u8Response = await fetchv2(m3u8Url, {
                            'Accept': '*/*',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Cache-Control': 'no-cache',
                            'Origin': 'https://krussdomi.com',
                            'Pragma': 'no-cache',
                            'Referer': serverUrl,
                            'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
                            'Sec-Ch-Ua-Mobile': '?0',
                            'Sec-Ch-Ua-Platform': '"Windows"',
                            'Sec-Fetch-Dest': 'empty',
                            'Sec-Fetch-Mode': 'cors',
                            'Sec-Fetch-Site': 'same-site',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
                        });
                        
                        if (m3u8Response && m3u8Response.status === 200) {
                            console.log('M3U8 successful! Returning master playlist URL');
                            return m3u8Url;
                        } else {
                            console.log('M3U8 failed with status:', m3u8Response ? m3u8Response.status : 'no response');
                            
                            // Si M3U8 falla, intentar acceder al player directamente
                            console.log('Trying direct player URL as fallback');
                            return serverUrl;
                        }
                    }
                }
            } else {
                console.log('No servers array found in window.KAA');
            }
        }
        
        // Si falló todo, usar el fallback
        console.log('All attempts failed, returning fallback');
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        
    } catch (error) {
        console.log('Stream error: ' + error.message);
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
}
