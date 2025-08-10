// KaaTo WORKING FUNCTIONS - v11.5.8 search+details+episodes + STREAM TEST
console.log('🔵🔵🔵 KAATO WORKING FUNCTIONS LOADING... 🔵🔵🔵');
console.log('🔵🔵🔵 TIMESTAMP:', new Date().toISOString());

// Search - Del v11.5.8 RESTORED que funciona
async function searchResults(keyword) {
    console.log('🔍🔍🔍 [v11.5.8] searchResults CALLED with keyword:', keyword);
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
                
                console.log('🔍🔍🔍 SEARCH RESULTS COUNT:', results.length);
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('🔍🔍🔍 SEARCH ERROR:', error.message);
        return JSON.stringify([]);
    }
}

// Details - Del v11.5.8 RESTORED que funciona
async function extractDetails(url) {
    console.log('📄📄📄 [v11.5.8] extractDetails CALLED with URL:', url);
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
            
            console.log('📄📄📄 DETAILS SUCCESS');
            return JSON.stringify([result]);
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        console.log('📄📄📄 DETAILS ERROR:', error.message);
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

// Episodes - Del v11.5.8 RESTORED que funciona
async function extractEpisodes(url) {
    console.log('📺📺📺 [v11.5.8] extractEpisodes CALLED with URL:', url);
    try {
        const slug = url.split('/').pop();
        console.log('🎯🎯🎯 Extracted slug:', slug);
        
        // Obtener episodios usando la lógica del v11.5.8 RESTORED
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes`);
        
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
                console.log(`📺📺📺 Found ${episodesData.result.length} episodes`);
                
                const allEpisodes = [];
                episodesData.result.forEach((episode, index) => {
                    allEpisodes.push({
                        href: `https://kaa.to/${slug}/ep-${episode.ep || index + 1}-${episode.slug}`,
                        number: episode.ep || index + 1
                    });
                });
                
                console.log(`📺📺📺 Generated ${allEpisodes.length} episode URLs`);
                return JSON.stringify(allEpisodes);
            }
        }
        
        console.log('📺📺📺 No episodes found, returning single episode');
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    } catch (error) {
        console.log('📺📺📺 Episodes error:', error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

// Stream - ULTRA SIMPLE PARA PROBAR
async function extractStreamUrl(input) {
    console.log('🎬🎬🎬🎬🎬 [STREAM TEST] EXECUTING! 🎬🎬🎬🎬🎬');
    console.log('🎬🎬🎬 TIMESTAMP:', new Date().toISOString());
    console.log('🎬🎬🎬 INPUT TYPE:', typeof input);
    console.log('🎬🎬🎬 INPUT CONTENT:', input && input.length > 100 ? `LONG_CONTENT (${input.length} chars)` : input);
    console.log('🎬🎬🎬 SI VES ESTO, extractStreamUrl SÍ SE EJECUTA! 🎬🎬🎬');
    
    // Devolver video de prueba que sabemos que funciona
    const demoVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    console.log('🎬🎬🎬 RETURNING DEMO VIDEO:', demoVideo);
    
    return demoVideo;
}

console.log('🔵🔵🔵 KAATO WORKING FUNCTIONS LOADED! 🔵🔵🔵');
console.log('🔵🔵🔵 READY FOR FULL TESTING 🔵🔵🔵');
