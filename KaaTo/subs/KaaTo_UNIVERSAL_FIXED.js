// KaaTo Universal Extension v11.5.6 - FUNCTION NAMES FIXED
// Return master.m3u8 directly for iOS player auto-selection

// Search - Del original que funciona
async function searchResults(keyword) {
    console.log('🔍 [v11.5.6] searchResults CALLED with keyword:', keyword);
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

// Details - Del original que funciona
async function extractDetails(url) {
    console.log('🔍 [v11.5.6] extractDetails CALLED with URL:', url);
    try {
        const response = await fetchv2(url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'GET', null);
        
        const html = typeof response === 'object' ? await response.text() : response;
        console.log('✅ HTML received for details, length:', html.length);
        
        // Extract slug from URL
        const slugMatch = url.match(/anime\/([^\/]+)/);
        const slug = slugMatch ? slugMatch[1] : null;
        
        if (!slug) {
            console.log('❌ No slug found in URL');
            return JSON.stringify({});
        }
        
        console.log('🎯 Extracted slug:', slug);
        
        // Try to get languages
        const langResponse = await fetchv2(`https://kaa.to/api/show/${slug}/language`, {
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': url,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'GET', null);
        
        let languages = [];
        if (langResponse && langResponse.status === 200 && langResponse._data) {
            try {
                const langData = typeof langResponse._data === 'string' ? 
                                JSON.parse(langResponse._data) : langResponse._data;
                if (Array.isArray(langData)) {
                    languages = langData;
                }
            } catch (jsonError) {
                console.log('❌ JSON parse error in languages:', jsonError.message);
                languages = [];
            }
        }
        
        console.log('🌐 Found languages:', languages);
        
        // Extract basic info from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)</i);
        const title = titleMatch ? titleMatch[1].replace(' | Kaato', '').trim() : 'Unknown Title';
        
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        const image = imageMatch ? imageMatch[1] : '';
        
        return JSON.stringify({
            title: title,
            image: image,
            description: `Anime disponible en múltiples idiomas: ${languages.join(', ')}`
        });
        
    } catch (error) {
        console.log('❌ Error in extractDetails:', error.message);
        return JSON.stringify({});
    }
}

// Episodes - Del original que funciona
async function extractEpisodes(url) {
    console.log('🔍 [v11.5.6] extractEpisodes CALLED with URL:', url);
    try {
        // Extract slug from URL
        const slugMatch = url.match(/anime\/([^\/]+)/);
        const slug = slugMatch ? slugMatch[1] : null;
        
        if (!slug) {
            console.log('❌ No slug found in URL');
            return JSON.stringify([{ href: url, number: 1 }]);
        }
        
        console.log('🎯 Extracted slug for episodes:', slug);
        
        // Get episodes from API
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?limit=2000&page=1&language=ja-JP`, {
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': url,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'GET', null);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData = episodesResponse._data;
            if (typeof episodesData === 'string') {
                try {
                    episodesData = JSON.parse(episodesData);
                } catch (jsonError) {
                    console.log('❌ JSON parse error in episodes:', jsonError.message);
                    return JSON.stringify([{ href: url, number: 1 }]);
                }
            }
            
            console.log('📺 Episodes API response keys:', Object.keys(episodesData));
            
            let episodes = [];
            
            // Check different possible structures
            if (episodesData.result && Array.isArray(episodesData.result)) {
                episodes = episodesData.result;
            } else if (episodesData.pages && Array.isArray(episodesData.pages)) {
                // Flatten pages structure
                episodes = episodesData.pages.flatMap(page => {
                    if (page.eps && Array.isArray(page.eps)) {
                        return page.eps.map(epNum => ({ episode_number: epNum }));
                    }
                    return [];
                });
            } else if (Array.isArray(episodesData)) {
                episodes = episodesData;
            }
            
            console.log('📺 Found episodes:', episodes.length);
            
            if (episodes.length > 0) {
                const allEpisodes = episodes.map(ep => ({
                    href: `https://kaa.to/${slug}/ep-${ep.episode_number || ep.number || 1}`,
                    number: ep.episode_number || ep.number || 1
                }));
                
                console.log('✅ Generated episode URLs:', allEpisodes.slice(0, 3));
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
    console.log('🚨🚨🚨 [v11.5.6 MASTER PLAYLIST] 🚨🚨🚨');
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
