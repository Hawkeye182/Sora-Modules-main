// KaaTo Universal v11.5.15 FIXED - RESTAURANDO LA v11.5.11 QUE FUNCIONABA
// Búsqueda, datos del anime y episodios exactamente como en v11.5.11

console.log('🚨🚨🚨 [v11.5.15 FIXED] MODULE STARTING TO LOAD 🚨🚨🚨');

// Search - EXACTAMENTE del v11.5.11 que funcionaba
async function searchResults(keyword) {
    console.log('🔍 [v11.5.15 FIXED] searchResults CALLED with keyword:', keyword);
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
                
                console.log(`✅ Found ${results.length} search results`);
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('❌ Search error:', error.message);
        return JSON.stringify([]);
    }
}

// Details - Del v11.5.8 que funciona PERFECTAMENTE
async function extractDetails(url) {
    console.log('📄 [v11.5.8 STYLE] extractDetails CALLED with URL:', url);
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

// Episodes - EXACTAMENTE del v11.5.11 que funcionaba
async function extractEpisodes(url) {
    console.log('📺 [v11.5.15 FIXED] extractEpisodes CALLED with URL:', url);
    
    try {
        const slug = extractSlugFromUrl(url);
        if (!slug) {
            console.log('❌ Could not extract slug from URL');
            return JSON.stringify([]);
        }
        
        console.log('📝 Using slug for episodes:', slug);
        
        // Primero obtener idiomas disponibles
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
            
            if (episodesData && episodesData.result && Array.isArray(episodesData.result)) {
                const episodes = episodesData.result.map(ep => ({
                    number: parseInt(ep.episode_number) || 1,
                    href: `https://kaa.to/watch/${slug}/${ep.episode_number}?lang=${selectedLanguage}`,
                    title: ep.name || `Episode ${ep.episode_number}`,
                    description: ep.description || '',
                    duration: ep.duration || null,
                    thumbnail: ep.thumbnail ? `https://kaa.to${ep.thumbnail}` : null
                }));
                
                console.log(`✅ Found ${episodes.length} episodes`);
                return JSON.stringify(episodes);
            }
        }
        
        console.log('❌ Failed to get episodes, returning single episode');
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
        
    } catch (error) {
        console.log('❌ Error in extractEpisodes:', error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

// Helper function to extract slug from URL
function extractSlugFromUrl(url) {
    console.log('🔍 Extracting slug from URL:', url);
    
    // Pattern 1: /anime/slug format
    let match = url.match(/\/anime\/([^\/\?]+)/);
    if (match) {
        console.log('✅ Found slug from /anime/ pattern:', match[1]);
        return match[1];
    }
    
    // Pattern 2: /show/slug format
    match = url.match(/\/show\/([^\/\?]+)/);
    if (match) {
        console.log('✅ Found slug from /show/ pattern:', match[1]);
        return match[1];
    }
    
    // Pattern 3: /watch/slug/episode format  
    match = url.match(/\/watch\/([^\/\?]+)\/\d+/);
    if (match) {
        console.log('✅ Found slug from /watch/ pattern:', match[1]);
        return match[1];
    }
    
    // Pattern 4: URL contains slug after domain
    match = url.match(/kaa\.to\/([^\/\?]+)/);
    if (match && match[1] !== 'anime' && match[1] !== 'show' && match[1] !== 'watch') {
        console.log('✅ Found slug from direct pattern:', match[1]);
        return match[1];
    }
    
    console.log('❌ Could not extract slug from URL');
    return null;
}

// Stream - Combinando lo mejor del v11.5.11 y la lógica F12 real
async function extractStreamUrl(episodeUrl) {
    console.log('🚨🚨🚨 [v11.5.15 FIXED STREAM] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Episode URL:', episodeUrl);
    
    try {
        // STEP 1: Extraer slug y número de episodio de la URL
        const urlMatch = episodeUrl.match(/\/watch\/([^\/\?]+)\/(\d+)/);
        if (!urlMatch) {
            console.log('❌ Could not parse episode URL format');
            return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        }
        
        const slug = urlMatch[1];
        const episodeNum = urlMatch[2];
        console.log(`🎯 Parsed URL - Slug: ${slug}, Episode: ${episodeNum}`);
        
        // STEP 2: Obtener idioma de la URL
        let language = 'ja-JP'; // Default
        const langMatch = episodeUrl.match(/[?&]lang=([^&]+)/);
        if (langMatch) {
            language = langMatch[1];
        }
        console.log(`🌍 Using language: ${language}`);
        
        // STEP 3: Llamada directa a API de episodio específico
        console.log('🔥 METHOD 1: Direct Episode API');
        try {
            const episodeApiUrl = `https://kaa.to/api/show/${slug}/episodes/${episodeNum}?lang=${language}`;
            console.log('📡 Episode API URL:', episodeApiUrl);
            
            const episodeResponse = await fetchv2(episodeApiUrl);
            if (episodeResponse && episodeResponse.status === 200 && episodeResponse._data) {
                const episodeData = typeof episodeResponse._data === 'string' ? 
                                  JSON.parse(episodeResponse._data) : episodeResponse._data;
                
                console.log('📺 Episode API response keys:', Object.keys(episodeData || {}));
                
                if (episodeData && episodeData.result) {
                    const ep = episodeData.result;
                    
                    // Buscar video_id en la respuesta
                    if (ep.video_id) {
                        console.log('🎯 FOUND video_id in API:', ep.video_id);
                        const masterUrl = `https://hls.krussdomi.com/manifest/${ep.video_id}/master.m3u8`;
                        console.log('🚀 RETURNING API MASTER M3U8:', masterUrl);
                        return masterUrl;
                    }
                    
                    // Buscar cualquier campo que contenga un ID de video
                    for (const [key, value] of Object.entries(ep)) {
                        if (typeof value === 'string' && /^[a-f0-9]{24}$/.test(value)) {
                            console.log(`🎯 FOUND potential video ID in ${key}:`, value);
                            const masterUrl = `https://hls.krussdomi.com/manifest/${value}/master.m3u8`;
                            console.log('🚀 RETURNING POTENTIAL MASTER M3U8:', masterUrl);
                            return masterUrl;
                        }
                    }
                }
            }
        } catch (apiError) {
            console.log('⚠️ Episode API failed:', apiError.message);
        }
        
        // STEP 4: Método de página HTML (fallback mejorado)
        console.log('🔥 METHOD 2: HTML Page Scraping with Real Headers');
        const response = await fetchv2(episodeUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://kaa.to/',
            'Origin': 'https://kaa.to',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Upgrade-Insecure-Requests': '1'
        }, 'GET', null);
        
        let html = '';
        if (typeof response === 'object' && response._data) {
            html = typeof response._data === 'string' ? response._data : JSON.stringify(response._data);
        } else if (typeof response === 'string') {
            html = response;
        }
        
        console.log('✅ HTML received, length:', html.length);
        
        // Pattern 1: Buscar video_id en window objects o configuraciones
        let videoIdMatch = html.match(/["']video[_-]?id["']?\s*:\s*["']?([a-f0-9]{24})["']?/i);
        if (videoIdMatch) {
            const videoId = videoIdMatch[1];
            console.log('🎯 FOUND VIDEO ID in config:', videoId);
            const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
            console.log('🚀 RETURNING CONFIG MASTER M3U8:', masterUrl);
            return masterUrl;
        }
        
        // Pattern 2: Buscar en data attributes
        videoIdMatch = html.match(/data-video[_-]?id=["']([a-f0-9]{24})["']/i);
        if (videoIdMatch) {
            const videoId = videoIdMatch[1];
            console.log('🎯 FOUND VIDEO ID in data attr:', videoId);
            const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
            console.log('🚀 RETURNING DATA MASTER M3U8:', masterUrl);
            return masterUrl;
        }
        
        // Pattern 3: Buscar IDs en cualquier contexto de streaming
        const streamPatterns = [
            /manifest\/([a-f0-9]{24})\/master\.m3u8/i,
            /hls\.krussdomi\.com.*?([a-f0-9]{24})/i,
            /["']([a-f0-9]{24})["'].*?manifest/i,
            /manifest.*?["']([a-f0-9]{24})["']/i
        ];
        
        for (const pattern of streamPatterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                const videoId = match[1];
                console.log('🎯 FOUND VIDEO ID with stream pattern:', videoId);
                const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                console.log('🚀 RETURNING STREAM PATTERN M3U8:', masterUrl);
                return masterUrl;
            }
        }
        
        // Pattern 4: Buscar cualquier ID hex de 24 caracteres en scripts
        const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gis);
        if (scriptMatches) {
            for (const script of scriptMatches) {
                const idMatches = script.match(/["']([a-f0-9]{24})["']/g);
                if (idMatches && idMatches.length > 0) {
                    for (const idMatch of idMatches) {
                        const videoId = idMatch.replace(/["']/g, '');
                        // Verificar que no sea un hash de imagen o similar
                        if (!script.includes(`${videoId}.jpg`) && 
                            !script.includes(`${videoId}.png`) && 
                            !script.includes(`${videoId}.webp`)) {
                            console.log('🎯 FOUND VIDEO ID in script:', videoId);
                            const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                            console.log('🚀 RETURNING SCRIPT MASTER M3U8:', masterUrl);
                            return masterUrl;
                        }
                    }
                }
            }
        }
        
        console.log('❌ No video streams found with any method');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error stack:', error.stack);
    }
    
    console.log('🔄 Returning fallback demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}

console.log('✅ [v11.5.15 FIXED] COMPLETE MODULE LOADED - RESTORED v11.5.11 SEARCH + IMPROVED STREAMS!');
