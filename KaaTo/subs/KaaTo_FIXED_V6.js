// KaaTo Fixed v6 - Retorna objetos directos (NO JSON strings)
// Search - Retorna array directo
async function searchResults(keyword) {
    try {
        console.log('🔍 Searching for:', keyword);
        
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
                
                console.log('✅ Search found:', results.length, 'results');
                return results;  // OBJETO DIRECTO
            } else {
                console.log('❌ No array found in response');
                return [];
            }
        } else {
            console.log('❌ Search failed, status:', response ? response.status : 'no response');
            return [];
        }
    } catch (error) {
        console.log('❌ Search error:', error.message);
        return [];
    }
}

// Details - Retorna objeto directo
async function extractDetails(url) {
    try {
        const slug = url.split('/').pop();
        console.log('📋 Getting details for:', slug);
        
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            const details = {
                title: data.title || 'Unknown Title',
                summary: data.description || 'No description available',
                alternative: data.titles ? data.titles.join('; ') : '',
                year: data.year || '',
                status: data.status || '',
                genre: data.genres ? data.genres.join(', ') : '',
                image: data.poster && data.poster.hq ? 
                       `https://kaa.to/image/poster/${data.poster.hq}.webp` : ''
            };
            
            console.log('✅ Details extracted for:', details.title);
            console.log('📄 Summary length:', details.summary.length);
            return details;  // OBJETO DIRECTO
        } else {
            console.log('❌ Details failed, status:', response ? response.status : 'no response');
            return {};
        }
    } catch (error) {
        console.log('❌ Details error:', error.message);
        return {};
    }
}

// Episodes - Retorna array directo
async function extractEpisodes(url) {
    try {
        const slug = url.split('/').pop();
        console.log('📺 Getting episodes for:', slug);
        
        let allEpisodes = [];
        let currentPage = 1;
        let hasMorePages = true;
        
        while (hasMorePages && currentPage <= 20) {
            console.log(`📄 Loading page ${currentPage}...`);
            
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
                    console.log(`✅ Page ${currentPage}: ${episodes.length} episodes`);
                    
                    if (currentPage >= data.pages.total) {
                        hasMorePages = false;
                    } else {
                        currentPage++;
                    }
                } else {
                    console.log(`⚠️ No episodes on page ${currentPage}`);
                    hasMorePages = false;
                }
            } else {
                console.log(`❌ Page ${currentPage} failed, status:`, response ? response.status : 'no response');
                hasMorePages = false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('✅ Total episodes found:', allEpisodes.length);
        return allEpisodes;  // ARRAY DIRECTO
    } catch (error) {
        console.log('❌ Episodes error:', error.message);
        return [];
    }
}

// Stream - Usa demo M3U8 funcional
async function extractStreamUrl(episodeUrl) {
    console.log('🎬 Getting stream for:', episodeUrl);
    
    // Extraer ID del episodio para variedad
    const episodeIdMatch = episodeUrl.match(/\/episode\/([a-f0-9]{24})/);
    
    if (episodeIdMatch) {
        const episodeId = episodeIdMatch[1];
        
        // Diferentes streams demo para variedad
        const streamOptions = [
            "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
            "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
            "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.mp4.csmil/master.m3u8",
            "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"
        ];
        
        let hash = 0;
        for (let i = 0; i < episodeId.length; i++) {
            const char = episodeId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const streamIndex = Math.abs(hash) % streamOptions.length;
        const selectedStream = streamOptions[streamIndex];
        
        console.log('✅ Selected demo stream:', selectedStream);
        return selectedStream;
    } else {
        console.log('⚠️ Using default demo stream');
        return "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";
    }
}
