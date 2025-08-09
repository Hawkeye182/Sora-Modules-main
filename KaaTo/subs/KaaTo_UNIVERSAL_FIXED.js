// KaaTo Universal Extension v11.5.7 - PERFECT ST    console.log('📄 [v11.5.    console.log('📺 [v11.5.7] extractEpisodes CALLED with URL:', url);] extractDetails CALLED with URL:', url);UCTURE FIXED
// Using working extractDetails and extractEpisodes from UNIVERSAL v11.4

// Search - Del original que funciona
async function searchResults(keyword) {
    console.log('🔍 [v11.5.7] searchResults CALLED with keyword:', keyword);
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
                try {
                    data = JSON.parse(data);
                } catch (jsonError) {
                    console.log('❌ JSON parse error in searchResults:', jsonError.message);
                    return JSON.stringify([]);
                }
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
        console.log('Error:', error.message);
        return JSON.stringify([]);
    }
}

// Details - Del PERFECT que funciona
async function extractDetails(url) {
    console.log('� [v11.5.6] extractDetails CALLED with URL:', url);
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

// Episodes - Del PERFECT que funciona
async function extractEpisodes(url) {
    console.log('� [v11.5.6] extractEpisodes CALLED with URL:', url);
    try {
        const slug = url.split('/').pop();
        console.log('🎯 Extracted slug for episodes:', slug);
        
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
        
        // Obtener episodios con límite alto para asegurar que obtenemos todos
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?limit=2000&page=1&language=${selectedLanguage}`);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData;
            try {
                episodesData = typeof episodesResponse._data === 'string' ? 
                              JSON.parse(episodesResponse._data) : episodesResponse._data;
                console.log('📺 Episodes API response keys:', Object.keys(episodesData || {}));
            } catch (e) {
                console.log('Failed to parse episodes response');
                return JSON.stringify([{
                    href: url,
                    number: 1
                }]);
            }
            
            if (episodesData && episodesData.result && episodesData.result.length > 0) {
                console.log(`📺 Found episodes:`, episodesData.result.length);
                
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
                                const episodeSlug = episodeData ? episodeData.slug : `missing-${epNum}`;
                                
                                // FORMATO CORRECTO: https://kaa.to/{show_slug}/ep-{episode_number}-{episode_slug}
                                allEpisodes.push({
                                    href: `https://kaa.to/${slug}/ep-${epNum}-${episodeSlug}`,
                                    number: epNum
                                });
                            });
                        }
                    });
                    
                    console.log(`Generated ${allEpisodes.length} episode links`);
                } else {
                    // Estrategia 2: Usar solo los episodios de la primera página
                    episodesData.result.forEach(episode => {
                        // FORMATO CORRECTO: https://kaa.to/{show_slug}/ep-{episode_number}-{episode_slug}
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${episode.episode_number}-${episode.slug}`,
                            number: episode.episode_number
                        });
                    });
                }
                
                // Ordenar por número de episodio
                allEpisodes.sort((a, b) => a.number - b.number);
                
                console.log(`Generated ${allEpisodes.length} episode links`);
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

// Stream - v11.5.6 con master.m3u8 directo para player iOS
async function extractStreamUrl(episodeUrl) {
    console.log('🚨🚨🚨 [v11.5.7 MASTER PLAYLIST] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Episode URL:', episodeUrl);
    console.log('🔥 IF YOU SEE THIS LOG, extractStreamUrl IS WORKING! 🔥');
    
    try {
        console.log('🌐 Fetching episode page with enhanced headers...');
        
        // Enhanced headers from F12 discoveries
        const response = await fetchv2(episodeUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-gpc': '1',
            'Referer': 'https://kaa.to/',
            'Origin': 'https://kaa.to'
        }, 'GET', null);
        
        const html = typeof response === 'object' ? await response.text() : response;
        console.log('✅ HTML received, length:', html.length);
        console.log('🔍 HTML preview:', html.substring(0, 300));
        
        // PATTERN 1: Buscar M3U8 directo
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING M3U8 STREAM (STRING):', m3u8Urls[0]);
            return m3u8Urls[0];
        }
        
        // PATTERN 2: Buscar source.php patterns (de los descubrimientos F12)
        const sourcePattern = /source\.php\?id=([a-f0-9]{24})/gi;
        const sourceMatches = html.match(sourcePattern);
        
        if (sourceMatches) {
            console.log('🎯 FOUND SOURCE API PATTERNS:', sourceMatches);
            const videoId = sourceMatches[0].match(/[a-f0-9]{24}/)[0];
            console.log('🎮 EXTRACTED VIDEO ID FROM SOURCE API:', videoId);
            
            // Construir URL con nueva arquitectura
            const newM3u8Url = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
            console.log('🔨 CONSTRUCTED FROM SOURCE API:', newM3u8Url);
            console.log('🚀 RETURNING SOURCE API STREAM (STRING):', newM3u8Url);
            return newM3u8Url;
        }
        
        // PATTERN 3: Video IDs - NUEVA ESTRATEGIA: DEVOLVER MASTER DIRECTO
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 FOUND VIDEO IDs:', videoIds);
            
            // MEJORAR SELECCIÓN: Buscar el Video ID más probable para el stream
            let selectedVideoId = null;
            
            // 1. Buscar en contexto de video/player
            const playerPattern = /(?:player|video|stream|source)[^{]*['":]([a-f0-9]{24})/gi;
            const playerMatches = html.match(playerPattern);
            if (playerMatches) {
                const playerId = playerMatches[0].match(/[a-f0-9]{24}/)[0];
                console.log('🎮 FOUND PLAYER VIDEO ID:', playerId);
                selectedVideoId = playerId;
            }
            
            // 2. Si no encuentra en player, buscar patrón de ID diferente a thumbnails
            if (!selectedVideoId) {
                // Los thumbnails suelen aparecer múltiples veces, el video ID real aparece menos
                const idCounts = {};
                videoIds.forEach(id => {
                    idCounts[id] = (idCounts[id] || 0) + 1;
                });
                
                // Tomar el ID que aparece menos veces (probablemente el video real)
                const sortedIds = Object.keys(idCounts).sort((a, b) => idCounts[a] - idCounts[b]);
                console.log('📊 VIDEO ID FREQUENCY:', idCounts);
                
                // Preferir IDs que aparecen 1-2 veces sobre los que aparecen muchas veces
                for (const id of sortedIds) {
                    if (idCounts[id] <= 2) {
                        selectedVideoId = id;
                        console.log('🎯 SELECTED VIDEO ID BY FREQUENCY:', selectedVideoId, 'count:', idCounts[id]);
                        break;
                    }
                }
            }
            
            // 3. Fallback: usar el último ID encontrado (suele ser el más relevante)
            if (!selectedVideoId) {
                selectedVideoId = videoIds[videoIds.length - 1];
                console.log('🔄 FALLBACK TO LAST VIDEO ID:', selectedVideoId);
            }
            
            // NUEVA ESTRATEGIA v11.5.6: DEVOLVER MASTER.M3U8 DIRECTO
            // Permitir que el player iOS maneje la selección automática
            const masterM3u8Url = `https://hls.krussdomi.com/manifest/${selectedVideoId}/master.m3u8`;
            console.log('🎯 CONSTRUCTED MASTER M3U8 URL:', masterM3u8Url);
            console.log('📱 LETTING iOS PLAYER HANDLE SELECTION...');
            console.log('🚀 RETURNING MASTER M3U8 (STRING):', masterM3u8Url);
            return masterM3u8Url;
        }
        
        console.log('❌ No streams found - returning demo video');
        
    } catch (error) {
        console.log('❌ Error in extractStreamUrl:', error.message);
    }
    
    console.log('🔄 Returning fallback demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
