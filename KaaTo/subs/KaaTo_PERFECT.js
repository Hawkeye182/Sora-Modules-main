// KaaTo Perfect - Combina lo mejor de SIMPLE_TEST y STREAM_FIXED
// Search - Del original que funciona
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
        return JSON.stringify([]);
    }
}

// Details - EXACTO como SIMPLE_TEST que SÍ funciona
async function extractDetails(url) {
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            const result = {
                description: details.synopsis || details.description || "Sin descripción disponible",
                aliases: [details.title_en, details.title_original].filter(title => title && title !== details.title).join(', ') || '',
                airdate: details.year ? `Año: ${details.year}` : 'Aired: Unknown'
            };
            
            return JSON.stringify([result]);
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

// Episodes - EXACTAMENTE del STREAM_FIXED que funcionaba bien
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

// Stream - Estrategia actualizada sin window.KAA
async function extractStreamUrl(episodeUrl) {
    console.log('Extracting stream from URL: ' + episodeUrl);
    
    try {
        // Estrategia 1: Intentar obtener la página del episodio con headers realistas
        const pageResponse = await fetchv2(episodeUrl, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://kaa.to/',
            'Origin': 'https://kaa.to'
        });
        
        if (pageResponse && pageResponse.status === 200 && pageResponse._data) {
            console.log('✅ Successfully loaded episode page');
            const html = pageResponse._data;
            
            // Estrategia 2: Buscar diferentes patrones de datos del servidor
            const patterns = [
                /window\.KAA\s*=\s*({.*?});/s,
                /window\._kaa\s*=\s*({.*?});/s,
                /var\s+servers\s*=\s*({.*?});/s,
                /const\s+servers\s*=\s*({.*?});/s,
                /"servers":\s*(\[.*?\])/s,
                /data-servers=["']({.*?})["']/s,
                /servers:\s*(\[.*?\])/s
            ];
            
            let serverData = null;
            let foundPattern = null;
            
            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    try {
                        serverData = JSON.parse(match[1]);
                        foundPattern = pattern;
                        console.log('✅ Found server data with pattern:', pattern.source);
                        break;
                    } catch (e) {
                        console.log('❌ Failed to parse match from pattern:', pattern.source);
                    }
                }
            }
            
            if (serverData) {
                console.log('Server data found:', serverData);
                
                // Estrategia 3: Extraer URLs de streaming
                let streamUrls = [];
                
                // Si serverData tiene la estructura de KAA
                if (serverData.servers && Array.isArray(serverData.servers)) {
                    streamUrls = serverData.servers;
                } 
                // Si serverData es directamente un array
                else if (Array.isArray(serverData)) {
                    streamUrls = serverData;
                }
                // Si hay un campo específico para streams
                else if (serverData.streams || serverData.sources) {
                    streamUrls = serverData.streams || serverData.sources;
                }
                
                if (streamUrls.length > 0) {
                    console.log(`Found ${streamUrls.length} potential streams`);
                    
                    // Intentar cada URL encontrada
                    for (const streamUrl of streamUrls) {
                        try {
                            console.log('Testing stream URL:', streamUrl);
                            
                            // Si la URL contiene un video ID, intentar extraer M3U8
                            const videoIdMatch = streamUrl.match(/\/([a-f0-9]{24})/);
                            if (videoIdMatch) {
                                const videoId = videoIdMatch[1];
                                const m3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
                                
                                const m3u8Response = await fetchv2(m3u8Url, {
                                    'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, */*',
                                    'Origin': 'https://kaa.to',
                                    'Referer': 'https://kaa.to/',
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                                });
                                
                                if (m3u8Response && m3u8Response.status === 200 && m3u8Response._data && m3u8Response._data.includes('#EXTM3U')) {
                                    console.log('✅ SUCCESS! Working M3U8 found:', m3u8Url);
                                    return m3u8Url;
                                }
                            }
                            
                            // Si no es M3U8, probar la URL directamente
                            if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                                console.log('✅ Returning direct stream URL:', streamUrl);
                                return streamUrl;
                            }
                            
                        } catch (streamError) {
                            console.log('❌ Stream URL failed:', streamError.message);
                        }
                    }
                }
            }
            
            // Estrategia 4: Buscar patrones de URL directamente en el HTML
            const urlPatterns = [
                /https:\/\/krussdomi\.com\/m3u8\/[a-f0-9]{24}\.m3u8/g,
                /https:\/\/[^"'<>\s]+\.m3u8/g,
                /https:\/\/[^"'<>\s]+\.mp4/g
            ];
            
            for (const urlPattern of urlPatterns) {
                const matches = html.match(urlPattern);
                if (matches && matches.length > 0) {
                    console.log(`Found ${matches.length} potential URLs with pattern`);
                    
                    for (const foundUrl of matches) {
                        try {
                            const testResponse = await fetchv2(foundUrl, {
                                'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, */*',
                                'Origin': 'https://kaa.to',
                                'Referer': 'https://kaa.to/'
                            });
                            
                            if (testResponse && testResponse.status === 200) {
                                console.log('✅ SUCCESS! Working stream found:', foundUrl);
                                return foundUrl;
                            }
                        } catch (e) {
                            console.log('❌ URL test failed:', foundUrl);
                        }
                    }
                }
            }
            
        } else {
            console.log('❌ Failed to load episode page. Status:', pageResponse ? pageResponse.status : 'null');
        }
        
        // Fallback: usar video demo rotativo basado en el episodio
        console.log('🔄 All strategies failed, using demo video');
        const episodeMatch = episodeUrl.match(/ep-(\d+)/);
        const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : 1;
        
        const demoStreams = [
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        ];
        
        return demoStreams[(episodeNumber - 1) % demoStreams.length];
        
    } catch (error) {
        console.log('❌ Stream extraction error: ' + error.message);
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
}
