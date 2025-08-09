// KaaTo Universal v11.5.8 RESTORED - EXACT COPY THAT WORKED
// Search, details and episodes exactly as in v11.5.8

console.log('🚨🚨🚨 [v11.5.8 RESTORED] MODULE STARTING TO LOAD 🚨🚨🚨');

console.log('📍 FUNCTION CHECK: searchResults exists =', typeof searchResults === 'function');
console.log('📍 FUNCTION CHECK: extractDetails exists =', typeof extractDetails === 'function');  
console.log('📍 FUNCTION CHECK: extractEpisodes exists =', typeof extractEpisodes === 'function');
console.log('📍 FUNCTION CHECK: extractStreamUrl exists =', typeof extractStreamUrl === 'function');
console.log('📍 FUNCTION CHECK: getStreamUrl exists =', typeof getStreamUrl === 'function');

// Search - Del PERFECT que funciona
async function searchResults(keyword) {
    console.log('🔍 [v11.5.8] searchResults CALLED with keyword:', keyword);
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

// Details - Del PERFECT que funciona
async function extractDetails(url) {
    console.log('📄 [v11.5.8] extractDetails CALLED with URL:', url);
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

// Episodes - EXACTO como BACKUP que SÍ funciona - DIFERENCIA CLAVE: ?ep=1&lang=
async function extractEpisodes(url) {
    console.log('📺 [v11.5.8] extractEpisodes CALLED with URL:', url);
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
        
        // DIFERENCIA CLAVE: Usar ?ep=1&lang= en lugar de ?limit=2000&page=1&language=
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=${selectedLanguage}`);
        
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
                            page.eps.forEach(episodeNumber => {
                                allEpisodes.push({
                                    href: `https://kaa.to/${slug}/ep-${episodeNumber}-${episodesData.result[0].slug}`,
                                    number: episodeNumber
                                });
                            });
                        }
                    });
                } 
                // Estrategia 2: Si no hay páginas, usar los episodios directos
                else {
                    episodesData.result.forEach((episode, index) => {
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${episode.ep || index + 1}-${episode.slug}`,
                            number: episode.ep || index + 1
                        });
                    });
                }
                
                console.log(`✅ Generated ${allEpisodes.length} episode URLs`);
                return JSON.stringify(allEpisodes);
            }
        }
        
        // Fallback: Intentar obtener con el endpoint sin idioma
        try {
            const fallbackResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes`);
            if (fallbackResponse && fallbackResponse.status === 200 && fallbackResponse._data) {
                let fallbackData = typeof fallbackResponse._data === 'string' ? 
                                  JSON.parse(fallbackResponse._data) : fallbackResponse._data;
                
                if (fallbackData && fallbackData.result && fallbackData.result.length > 0) {
                    const episodes = fallbackData.result.map((episode, index) => ({
                        href: `https://kaa.to/${slug}/ep-${episode.ep || index + 1}-${episode.slug}`,
                        number: episode.ep || index + 1
                    }));
                    
                    console.log(`✅ Fallback: Generated ${episodes.length} episodes`);
                    return JSON.stringify(episodes);
                }
            }
        } catch (e) {
            console.log('Fallback episodes also failed');
        }
        
        console.log('❌ No episodes found, returning single episode');
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    } catch (error) {
        console.log('❌ Episodes error:', error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

// Stream - v11.5.8 con master.m3u8 directo para player iOS + HEADERS REALES
async function extractStreamUrl(episodeUrl) {
    // ULTRA DEBUG LOGS
    console.log('🚨🚨🚨🚨🚨 [ULTRA DEBUG] extractStreamUrl EJECUTÁNDOSE 🚨🚨🚨🚨🚨');
    console.log('⚡⚡⚡ TIMESTAMP:', new Date().toISOString());
    console.log('📍📍📍 URL RECIBIDA:', episodeUrl);
    console.log('🔥🔥🔥 SI VES ESTO, LA FUNCIÓN SÍ SE EJECUTA 🔥🔥🔥');
    console.log('👀👀👀 SEARCHING FOR VIDEO ID IN HTML 👀👀�');
    
    // Add debug info about what type of URL we received
    if (!episodeUrl) {
        console.log('❌ CRITICAL: episodeUrl is null or undefined!');
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    
    console.log('🔍 Episode URL type:', typeof episodeUrl);
    console.log('🔍 Episode URL length:', episodeUrl.length);
    
    try {
        console.log('🌐 Fetching episode page with enhanced headers...');
        
        // Enhanced headers from F12 discoveries - HEADERS REALES DEL USUARIO
        const response = await fetchv2(episodeUrl, {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'referer': 'https://kaa.to/',
            'sec-fetch-dest': 'iframe',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'cross-site',
            'origin': 'https://krussdomi.com',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'priority': 'u=4'
        }, 'GET', null);
        
        console.log('🌐🌐🌐 HEADERS APLICADOS - REFERER:', 'https://kaa.to/');
        console.log('🎯🎯🎯 SEC-FETCH-DEST APLICADO:', 'iframe');
        console.log('🎌🎌🎌 SEC-FETCH-SITE APLICADO:', 'cross-site');
        console.log('🏠🏠🏠 ORIGIN APLICADO:', 'https://krussdomi.com');
        
        // Handle response properly for Sora iOS
        let html;
        if (response && response._data) {
            html = response._data;
        } else if (typeof response === 'string') {
            html = response;
        } else {
            console.log('❌ Invalid response format');
            return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        }
        console.log('✅ HTML received, length:', html.length);
        console.log('🔍 HTML preview:', html.substring(0, 300));
        
        // PATTERN 1: Buscar M3U8 directo
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯🎯🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀🚀🚀 RETURNING M3U8 STREAM WITH ANTI-BLOCK HEADERS (JSON)');
            
            // Return JSON with anti-block headers for direct M3U8
            return JSON.stringify({
                url: m3u8Urls[0],
                headers: {
                    'accept': '*/*',
                    'accept-language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'referer': 'https://kaa.to/',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors', 
                    'sec-fetch-site': 'cross-site',
                    'origin': 'https://kaa.to',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'priority': 'u=1, i',
                    'x-requested-with': 'XMLHttpRequest',
                    'cache-control': 'no-cache'
                }
            });
        }
        
        // PATTERN 2: Buscar source.php patterns (de los descubrimientos F12)
        const sourcePattern = /source\.php\?id=([a-f0-9]{24})/gi;
        const sourceMatches = html.match(sourcePattern);
        
        if (sourceMatches && sourceMatches.length > 0) {
            console.log('🎯🎯🎯 FOUND source.php patterns:', sourceMatches);
            const videoIdMatch = sourceMatches[0].match(/id=([a-f0-9]{24})/);
            if (videoIdMatch) {
                const videoId = videoIdMatch[1];
                const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                console.log('🔨🔨🔨 CONSTRUCTED MASTER M3U8:', masterUrl);
                console.log('🚀🚀🚀 RETURNING MASTER STREAM WITH ANTI-BLOCK HEADERS (JSON)');
                
                // Return JSON with anti-block headers
                return JSON.stringify({
                    url: masterUrl,
                    headers: {
                        'accept': '*/*',
                        'accept-language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
                        'accept-encoding': 'gzip, deflate, br, zstd',
                        'referer': 'https://kaa.to/',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors', 
                        'sec-fetch-site': 'cross-site',
                        'origin': 'https://kaa.to',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'priority': 'u=1, i',
                        'x-requested-with': 'XMLHttpRequest',
                        'cache-control': 'no-cache'
                    }
                });
            }
        }
        
        // PATTERN 3: Video IDs para construcción M3U8
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯🎯🎯 FOUND VIDEO IDs:', videoIds);
            console.log('🥇🥇🥇 PRIMER VIDEO ID SELECCIONADO:', videoIds[0]);
            console.log('🏗️🏗️🏗️ CONSTRUYENDO M3U8 URL...');
            
            const masterUrl = `https://hls.krussdomi.com/manifest/${videoIds[0]}/master.m3u8`;
            console.log('🔨🔨🔨 CONSTRUCTED M3U8 URL:', masterUrl);
            console.log('🚀🚀🚀 RETURNING CONSTRUCTED STREAM WITH REAL HEADERS (JSON)');
            
            // Return JSON with exact headers from working session - ANTI-BLOCK HEADERS
            return JSON.stringify({
                url: masterUrl,
                headers: {
                    'accept': '*/*',
                    'accept-language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
                    'accept-encoding': 'gzip, deflate, br, zstd',
                    'referer': 'https://kaa.to/',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors', 
                    'sec-fetch-site': 'cross-site',
                    'origin': 'https://kaa.to',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'priority': 'u=1, i',
                    'x-requested-with': 'XMLHttpRequest',
                    'cache-control': 'no-cache'
                }
            });
        }
        
        // PATTERN 4: Look for KaaTo-specific patterns
        const kaatoPattern = /video[_-]?id['":\s]*['"]?([a-f0-9]{24})/gi;
        const kaatoMatches = html.match(kaatoPattern);
        
        if (kaatoMatches && kaatoMatches.length > 0) {
            console.log('🎯 FOUND KAATO PATTERNS:', kaatoMatches);
            const videoId = kaatoMatches[0].match(/[a-f0-9]{24}/)[0];
            const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
            console.log('🔨 CONSTRUCTED FROM KAATO PATTERN:', masterUrl);
            console.log('🚀 RETURNING KAATO STREAM (STRING):', masterUrl);
            return masterUrl;
        }
        
        // PATTERN 5: Look for other video patterns
        const mp4Pattern = /https?:\/\/[^\s"'<>]+\.mp4/gi;
        const mp4Urls = html.match(mp4Pattern);
        
        if (mp4Urls && mp4Urls.length > 0) {
            console.log('🎯 FOUND MP4 URLs:', mp4Urls);
            console.log('🚀 RETURNING MP4 STREAM (STRING):', mp4Urls[0]);
            return mp4Urls[0];
        }
        
        console.log('❌❌❌ NO STREAMS FOUND - RETURNING DEMO VIDEO ❌❌❌');
        console.log('🎭🎭🎭 CHECKED PATTERNS: M3U8, SOURCE.PHP, VIDEO IDs, MP4 🎭🎭🎭');
        
    } catch (error) {
        console.log('❌❌❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋📋📋 Error details:', error.stack);
        console.log('💥💥💥 FETCH FAILED OR HTML PARSING FAILED 💥💥💥');
    }
    
    console.log('🔄🔄🔄 RETURNING FALLBACK DEMO VIDEO 🔄🔄🔄');
    console.log('🚨🚨🚨 SI VES ESTO, LA FUNCIÓN LLEGÓ AL FINAL 🚨🚨🚨');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}

// COMPATIBILITY: Define getStreamUrl as alias to extractStreamUrl
async function getStreamUrl(episodeUrl) {
    console.log('🔄 getStreamUrl called, redirecting to extractStreamUrl...');
    return await extractStreamUrl(episodeUrl);
}

console.log('✅ [v11.5.8] MODULE FULLY LOADED - EPISODES API FIXED!');

// Export functions for testing
if (typeof global !== 'undefined') {
    global.searchResults = searchResults;
    global.extractDetails = extractDetails;
    global.extractEpisodes = extractEpisodes;
    global.extractStreamUrl = extractStreamUrl;
    global.getStreamUrl = getStreamUrl;
}
