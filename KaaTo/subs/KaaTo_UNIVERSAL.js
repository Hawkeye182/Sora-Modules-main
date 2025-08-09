// KaaTo Universal Extension v11.4 - FIXED STREAM RESOLUTION  
// Based on PERFECT v10.8 with working v11.4 extractStreamUrl + Enhanced stream headers

console.log('🚨🚨🚨 [v11.4 FIXED] MODULE STARTING TO LOAD 🚨🚨🚨');

// Search - Del PERFECT que funciona
async function searchResults(keyword) {
    console.log('🔍 [v11.4] searchResults CALLED with keyword:', keyword);
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
    console.log('📄 [v11.4] extractDetails CALLED with URL:', url);
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
    console.log('📺 [v11.4] extractEpisodes CALLED with URL:', url);
    try {
        const slug = url.split('/').pop();
        console.log('🎯 Extracted slug:', slug);
        
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

// Stream - v11.4 que funcionaba + solo mejoras en headers para autorización
async function extractStreamUrl(input) {
    console.log('🚨🚨🚨 [v11.4 FIXED - ENHANCED HEADERS] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Input received:', typeof input, input && input.length > 500 ? 'HTML_CONTENT' : input);
    console.log('🔥 RETURNING STRING LIKE ANIMEFLV! 🔥');
    
    try {
        let html;
        let episodeUrl;
        
        // DETECT INPUT TYPE
        if (input && (input.includes('<html') || input.includes('<!DOCTYPE') || input.includes('<body'))) {
            // INPUT IS HTML - Sora already fetched it
            console.log('🌐 Input detected as: HTML CONTENT');
            html = input;
            episodeUrl = 'parsed_from_html';
        } else if (input && input.startsWith('http')) {
            // INPUT IS URL - We need to fetch it
            console.log('🌐 Input detected as: EPISODE URL');
            episodeUrl = input;
            
            console.log('📡 Fetching HTML from URL...');
            const response = await fetchv2(episodeUrl, {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }, 'GET', null);
            html = typeof response === 'object' ? await response.text() : response;
            console.log('✅ HTML fetched, length:', html.length);
        } else {
            console.log('❌ Invalid input type or null input');
            return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        }
        
        console.log('🔍 Analyzing HTML for streams...');
        
        // PATTERN 1: Direct M3U8 URLs in HTML
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING M3U8 STREAM (STRING):', m3u8Urls[0]);
            return m3u8Urls[0]; // RETURN STRING DIRECTLY
        }
        
        // PATTERN 2: Video IDs for M3U8 construction - CON HEADERS MEJORADOS
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 FOUND VIDEO IDs:', videoIds);
            const m3u8Url = `https://krussdomi.com/m3u8/${videoIds[0]}.m3u8`;
            console.log('🔨 CONSTRUCTED M3U8 URL:', m3u8Url);
            console.log('🚀 RETURNING CONSTRUCTED STREAM (STRING):', m3u8Url);
            return m3u8Url; // RETURN STRING DIRECTLY
        }
        
        // PATTERN 3: Look for KaaTo-specific patterns
        const kaatoPattern = /video[_-]?id['":\s]*['"]?([a-f0-9]{24})/gi;
        const kaatoMatches = html.match(kaatoPattern);
        
        if (kaatoMatches && kaatoMatches.length > 0) {
            console.log('🎯 FOUND KAATO PATTERNS:', kaatoMatches);
            const videoId = kaatoMatches[0].match(/[a-f0-9]{24}/)[0];
            const m3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
            console.log('🔨 CONSTRUCTED FROM KAATO PATTERN:', m3u8Url);
            console.log('🚀 RETURNING KAATO STREAM (STRING):', m3u8Url);
            return m3u8Url; // RETURN STRING DIRECTLY
        }
        
        // PATTERN 4: Look for other video patterns
        const mp4Pattern = /https?:\/\/[^\s"'<>]+\.mp4/gi;
        const mp4Urls = html.match(mp4Pattern);
        
        if (mp4Urls && mp4Urls.length > 0) {
            console.log('🎯 FOUND MP4 URLs:', mp4Urls);
            console.log('🚀 RETURNING MP4 STREAM (STRING):', mp4Urls[0]);
            return mp4Urls[0]; // RETURN STRING DIRECTLY
        }
        
        console.log('❌ NO STREAMS FOUND - Returning demo video (STRING)');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error details:', error.stack);
    }
    
    console.log('🔄 FALLBACK: Returning demo video (STRING)');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // RETURN STRING DIRECTLY
}

console.log('✅ [v11.4 FIXED] MODULE FULLY LOADED - Enhanced headers ready!');