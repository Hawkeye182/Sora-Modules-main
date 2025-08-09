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

// Details - Del SIMPLE_TEST que SÍ muestra descripción/año
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
            
            return JSON.stringify([result]);  // ✅ Array como SIMPLE_TEST
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

// Episodes - Del STREAM_FIXED que SÍ obtiene todos los episodios
async function extractEpisodes(url) {
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        let allEpisodes = [];
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages && currentPage <= 20) {
            const response = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?page=${currentPage}`);
            
            if (response && response.status === 200 && response._data) {
                let data = response._data;
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                
                if (data.pages && data.pages.episodes && data.pages.episodes.length > 0) {
                    const episodes = data.pages.episodes.map(ep => ({
                        title: `Episode ${ep.episode}`,
                        href: `https://kaa.to/episode/${ep.id}`
                    }));
                    
                    allEpisodes = allEpisodes.concat(episodes);
                    
                    if (currentPage >= data.pages.total) {
                        hasMorePages = false;
                    } else {
                        currentPage++;
                    }
                } else {
                    hasMorePages = false;
                }
            } else {
                hasMorePages = false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return JSON.stringify(allEpisodes);  // ✅ Todos los episodios
    } catch (error) {
        return JSON.stringify([]);
    }
}

// Stream - Demo sin Cloudflare
async function extractStreamUrl(episodeUrl) {
    try {
        const episodeIdMatch = episodeUrl.match(/\/episode\/([a-f0-9]{24})/);
        
        if (episodeIdMatch) {
            const episodeId = episodeIdMatch[1];
            
            const streamOptions = [
                "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
                "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.mp4.csmil/master.m3u8"
            ];
            
            let hash = 0;
            for (let i = 0; i < episodeId.length; i++) {
                const char = episodeId.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            
            const streamIndex = Math.abs(hash) % streamOptions.length;
            return streamOptions[streamIndex];
        } else {
            return "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
        }
        
    } catch (error) {
        return "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
    }
}
