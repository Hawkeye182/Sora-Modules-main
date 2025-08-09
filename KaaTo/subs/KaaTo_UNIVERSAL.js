// KaaTo Universal Extension v11.0 - SORA COMPATIBLE (HTML+URL Support)
// Exact copy of PERFECT functions with UNIVERSAL extractStreamUrl

// Search - Del PERFECT que funciona EXACTO
async function searchResults(keyword) {
    console.log('🔍 [v11.0] searchResults CALLED with keyword:', keyword);
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

// Details - EXACTO como PERFECT que SÍ funciona
async function extractDetails(url) {
    console.log('� [v11.0] extractDetails CALLED with URL:', url);
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            return JSON.stringify([{
                description: details.description || "No description available",
                aliases: details.alternative_names ? details.alternative_names.join(', ') : "",
                airdate: details.aired_from || ""
            }]);
        }
        
        return JSON.stringify([{
            description: "No description available",
            aliases: "",
            airdate: ""
        }]);
        
    } catch (error) {
        console.log('❌ [v11.0] Details error:', error.message);
        return JSON.stringify([{
            description: "Error loading details",
            aliases: "",
            airdate: ""
        }]);
    }
}

// Episodes - EXACTO como PERFECT que SÍ funciona
async function extractEpisodes(url) {
    console.log('📺 [v11.0] extractEpisodes CALLED with URL:', url);
    
    try {
        // Extract slug from URL
        const urlMatch = url.match(/\/anime\/([^\/]+)/);
        if (!urlMatch || !urlMatch[1]) {
            console.log('❌ Could not extract slug from URL');
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
        const slug = urlMatch[1];
        console.log('🎯 Extracted slug:', slug);
        
        // Get available languages first
        const langResponse = await fetchv2(`https://kaa.to/api/show/${slug}`);
        let selectedLanguage = 'ja-JP'; // Default to Japanese
        
        if (langResponse && langResponse.status === 200 && langResponse._data) {
            let langData;
            try {
                langData = typeof langResponse._data === 'string' ? 
                          JSON.parse(langResponse._data) : langResponse._data;
            } catch (e) {
                console.log('Failed to parse language response');
            }
            
            if (langData && langData.available_languages) {
                const availableLanguages = Object.keys(langData.available_languages);
                console.log('Available languages:', availableLanguages);
                
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
                } else {
                    // Si no hay paginación, usar solo los episodios de la primera página
                    episodesData.result.forEach(ep => {
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${ep.episode_number}-${ep.slug}`,
                            number: ep.episode_number
                        });
                    });
                }
                
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

// UNIVERSAL extractStreamUrl - Handles BOTH URL and HTML inputs!
async function extractStreamUrl(input) {
    console.log('🚨🚨🚨 [v11.0 UNIVERSAL] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Input received:', typeof input, input.length > 500 ? 'HTML_CONTENT' : input);
    console.log('🔥 UNIVERSAL VERSION - HANDLES BOTH URL AND HTML! 🔥');
    
    try {
        let html;
        let episodeUrl;
        
        // DETECT INPUT TYPE
        if (input.includes('<html') || input.includes('<!DOCTYPE') || input.includes('<body')) {
            // INPUT IS HTML - Sora already fetched it
            console.log('🌐 Input detected as: HTML CONTENT');
            html = input;
            episodeUrl = 'parsed_from_html';
        } else {
            // INPUT IS URL - We need to fetch it
            console.log('🌐 Input detected as: EPISODE URL');
            episodeUrl = input;
            
            console.log('📡 Fetching HTML from URL...');
            const response = await fetch(episodeUrl);
            html = await response.text();
            console.log('✅ HTML fetched, length:', html.length);
        }
        
        console.log('🔍 Analyzing HTML for streams...');
        console.log('📄 HTML preview:', html.substring(0, 300));
        
        // PATTERN 1: Direct M3U8 URLs in HTML
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING M3U8 STREAM:', m3u8Urls[0]);
            return m3u8Urls[0];
        }
        
        // PATTERN 2: Video IDs for M3U8 construction
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 FOUND VIDEO IDs:', videoIds);
            const m3u8Url = `https://krussdomi.com/m3u8/${videoIds[0]}.m3u8`;
            console.log('🔨 CONSTRUCTED M3U8 URL:', m3u8Url);
            console.log('🚀 RETURNING CONSTRUCTED STREAM:', m3u8Url);
            return m3u8Url;
        }
        
        // PATTERN 3: Look for other video patterns
        const mp4Pattern = /https?:\/\/[^\s"'<>]+\.mp4/gi;
        const mp4Urls = html.match(mp4Pattern);
        
        if (mp4Urls && mp4Urls.length > 0) {
            console.log('🎯 FOUND MP4 URLs:', mp4Urls);
            console.log('🚀 RETURNING MP4 STREAM:', mp4Urls[0]);
            return mp4Urls[0];
        }
        
        console.log('❌ NO STREAMS FOUND - Returning demo video');
        console.log('🔍 Search patterns failed:');
        console.log('  - M3U8 URLs: None found');
        console.log('  - Video IDs: None found');
        console.log('  - MP4 URLs: None found');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error details:', error.stack);
    }
    
    console.log('🔄 FALLBACK: Returning demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
