// KaaTo Simple - Copia exacta del módulo que funciona, pero con streams demo
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
        return JSON.stringify({});
    }
}

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
        
        return JSON.stringify(allEpisodes);
    } catch (error) {
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(episodeUrl) {
    // SIMPLE: Solo retornar un M3U8 demo que sabemos que funciona
    return "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
}
