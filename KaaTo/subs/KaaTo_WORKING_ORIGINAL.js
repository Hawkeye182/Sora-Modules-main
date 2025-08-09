// KaaTo Original Working - COPIA EXACTA que funcionaba + streams demo
// Search - IGUAL AL ORIGINAL
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
            
            // La API retorna un array directamente, no un objeto con result
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
        console.log('Search error: ' + error.message);
        return JSON.stringify([]);
    }
}

// Details - IGUAL AL ORIGINAL
async function extractDetails(url) {
    try {
        const slug = url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            return JSON.stringify({
                title: data.title || 'Unknown Title',
                summary: data.description || 'No description available',
                alternative: data.titles ? data.titles.join('; ') : '',
                year: data.year || '',
                status: data.status || '',
                genre: data.genres ? data.genres.join(', ') : '',
                image: data.poster && data.poster.hq ? 
                       `https://kaa.to/image/poster/${data.poster.hq}.webp` : ''
            });
        } else {
            return JSON.stringify({});
        }
    } catch (error) {
        console.log('Details error: ' + error.message);
        return JSON.stringify({});
    }
}

// Episodes - IGUAL AL ORIGINAL
async function extractEpisodes(url) {
    try {
        const slug = url.split('/').pop();
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
                    
                    // Verificar si hay más páginas
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
            
            // Pequeña pausa para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return JSON.stringify(allEpisodes);
    } catch (error) {
        console.log('Episodes error: ' + error.message);
        return JSON.stringify([]);
    }
}

// Stream extraction - SOLO ESTA FUNCIÓN CAMBIADA (streams demo)
async function extractStreamUrl(episodeUrl) {
    console.log('🎬 Demo stream extraction (no Cloudflare)');
    
    try {
        // Extraer ID del episodio para variedad
        const episodeIdMatch = episodeUrl.match(/\/episode\/([a-f0-9]{24})/);
        
        if (episodeIdMatch) {
            const episodeId = episodeIdMatch[1];
            
            // Streams demo funcionales
            const streamOptions = [
                "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
                "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.mp4.csmil/master.m3u8"
            ];
            
            // Hash simple para seleccionar stream
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
        console.log('Stream error:', error.message);
        return "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
    }
}
