// KaaTo Universal v11.5.8 RESTORED - EXACT COPY THAT WORKED
// Search, details and episodes exactly as in v11.5.8

console.log('🚨🚨🚨 [v11.5.8 RESTORED] MODULE STARTING TO LOAD 🚨🚨🚨');

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

// Stream URL - SIMPLE VERSION that works with F12 data
async function getStreamUrl(url) {
    console.log('🎬 [v11.5.8] getStreamUrl CALLED with URL:', url);
    try {
        const response = await fetchv2(url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://kaa.to/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        });
        
        if (response && response.status === 200 && response._data) {
            const html = response._data;
            
            // Extract video ID from HTML (24-character hex string)
            const videoIdMatch = html.match(/["'`]([a-f0-9]{24})["'`]/);
            
            if (videoIdMatch) {
                const videoId = videoIdMatch[1];
                console.log('✅ Extracted video ID:', videoId);
                
                const streamUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                console.log('✅ Stream URL:', streamUrl);
                
                return JSON.stringify({
                    url: streamUrl,
                    headers: {
                        'Referer': 'https://krussdomi.com/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
            }
        }
        
        console.log('❌ Could not extract video ID');
        return JSON.stringify({});
    } catch (error) {
        console.log('❌ Stream error:', error.message);
        return JSON.stringify({});
    }
}
