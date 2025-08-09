// KaaTo Universal v11.5.12 - FORMATO DATOS CORREGIDO + F12 DEBUGGING
// Copiando el formato EXACTO del v11.4 que funcionaba

console.log('🚨🚨🚨 [v11.5.12 FIXED FORMAT] MODULE STARTING TO LOAD 🚨🚨🚨');

// Search - Del v11.4 que funciona perfecto
async function searchResults(keyword) {
    console.log('🔍 [v11.5.12] searchResults CALLED with keyword:', keyword);
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

// Details - FORMATO EXACTO del v11.4 que funcionaba
async function extractDetails(url) {
    console.log('📄 [v11.5.12] extractDetails CALLED with URL:', url);
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        console.log('📝 Using slug for details:', slug);
        
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            // FORMATO EXACTO del v11.4 - devolver ARRAY con objeto específico
            const result = {
                description: details.result?.description || details.synopsis || details.description || "Sin descripción disponible",
                aliases: details.result?.categories ? details.result.categories.map(cat => cat.name).join(', ') : '',
                airdate: details.result?.first_air_date ? `Año: ${new Date(details.result.first_air_date).getFullYear()}` : 'Aired: Unknown'
            };
            
            console.log('✅ Details formatted:', result.description.substring(0, 100) + '...', result.airdate);
            return JSON.stringify([result]);
        }
        
        console.log('❌ No details found');
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        console.log('❌ Details error:', error.message);
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

// Episodes - EXACTAMENTE del v11.4 que funcionaba  
async function extractEpisodes(url) {
    console.log('📺 [v11.5.12] extractEpisodes CALLED with URL:', url);
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
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

// Stream - DEBUGGING COMPLETO para F12 analysis
async function extractStreamUrl(episodeUrl) {
    console.log('🚨🚨🚨 [v11.5.12 F12 DEBUGGING MODE] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Episode URL:', episodeUrl);
    console.log('🔧 F12 DEBUGGING MODE ACTIVATED - CHECK CONSOLE FOR FULL DATA 🔧');
    
    try {
        // Obtener el HTML de la página del episodio
        console.log('🌐 Fetching episode page for F12 analysis...');
        const response = await fetchv2(episodeUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9',
            'Referer': 'https://kaa.to/',
            'Connection': 'keep-alive'
        }, 'GET', null);
        
        let html = '';
        if (typeof response === 'object' && response._data) {
            html = typeof response._data === 'string' ? response._data : JSON.stringify(response._data);
        } else if (typeof response === 'string') {
            html = response;
        }
        
        console.log('✅ HTML received, length:', html.length);
        console.log('🔧 F12 MODE: Full HTML preview (first 2000 chars):');
        console.log(html.substring(0, 2000));
        console.log('🔧 F12 MODE: HTML contains video? ', html.includes('video'));
        console.log('🔧 F12 MODE: HTML contains player? ', html.includes('player'));
        console.log('🔧 F12 MODE: HTML contains source? ', html.includes('source'));
        console.log('🔧 F12 MODE: HTML contains manifest? ', html.includes('manifest'));
        console.log('🔧 F12 MODE: HTML contains m3u8? ', html.includes('m3u8'));
        
        // F12 DEBUGGING: Buscar todos los scripts
        const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gis);
        if (scriptMatches) {
            console.log('🔧 F12 MODE: Found', scriptMatches.length, 'script tags');
            scriptMatches.forEach((script, index) => {
                console.log(`🔧 F12 SCRIPT ${index + 1}:`, script.substring(0, 500) + '...');
                
                // Buscar patrones específicos en cada script
                if (script.includes('video')) {
                    console.log(`🎯 F12 SCRIPT ${index + 1} contains VIDEO!`);
                }
                if (script.includes('manifest')) {
                    console.log(`🎯 F12 SCRIPT ${index + 1} contains MANIFEST!`);
                }
                if (script.includes('m3u8')) {
                    console.log(`🎯 F12 SCRIPT ${index + 1} contains M3U8!`);
                }
                
                // Buscar IDs hexadecimales
                const hexMatches = script.match(/[a-f0-9]{24}/gi);
                if (hexMatches) {
                    console.log(`🎯 F12 SCRIPT ${index + 1} HEX IDs:`, hexMatches);
                }
            });
        }
        
        // F12 DEBUGGING: Buscar URLs completas
        const urlMatches = html.match(/https?:\/\/[^\s"'<>()]+/gi);
        if (urlMatches) {
            console.log('🔧 F12 MODE: All URLs found:');
            urlMatches.forEach(url => {
                if (url.includes('m3u8') || url.includes('manifest') || url.includes('stream')) {
                    console.log('🎯 F12 POTENTIAL STREAM URL:', url);
                }
            });
        }
        
        // F12 DEBUGGING: Buscar variables de JavaScript
        const jsVarMatches = html.match(/var\s+\w+\s*=\s*[^;]+;/gi);
        if (jsVarMatches) {
            console.log('🔧 F12 MODE: JavaScript variables:');
            jsVarMatches.forEach(jsVar => {
                console.log('🔧 F12 JS VAR:', jsVar);
            });
        }
        
        // INTENTAR EXTRACTION BÁSICA (mientras analizamos F12)
        console.log('🔄 Attempting basic extraction while F12 analysis runs...');
        
        // Buscar IDs de video de 24 caracteres
        const hexPattern = /[a-f0-9]{24}/gi;
        const hexMatches = html.match(hexPattern);
        if (hexMatches && hexMatches.length > 0) {
            console.log('🎯 Found potential video IDs:', hexMatches);
            for (const hexId of hexMatches) {
                const masterUrl = `https://hls.krussdomi.com/manifest/${hexId}/master.m3u8`;
                console.log('🚀 TESTING M3U8 URL:', masterUrl);
                
                // Por ahora, devolver el primero que encontremos
                return masterUrl;
            }
        }
        
        console.log('❌ No video streams found - check F12 logs above for debugging!');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error stack:', error.stack);
    }
    
    console.log('🔄 Returning fallback demo video - analyze F12 logs to find real pattern!');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}

console.log('✅ [v11.5.12] F12 DEBUG MODULE LOADED - CHECK CONSOLE FOR STREAM DEBUGGING!');
