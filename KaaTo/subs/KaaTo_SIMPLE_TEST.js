// Test: Módulo simple para debugging en Sora

async function searchResults(keyword) {
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (response && response._data) {
            let animeData = response._data;
            if (typeof animeData === 'string') {
                animeData = JSON.parse(animeData);
            }
            
            if (Array.isArray(animeData) && animeData.length > 0) {
                const results = animeData.map(anime => ({
                    title: anime.title || anime.title_en || "Sin título",
                    image: `https://kaa.to/image/poster/${anime.poster?.hq || anime.poster?.sm || 'default'}.webp`,
                    href: `https://kaa.to/anime/${anime.slug}`
                }));
                
                return JSON.stringify(results);
            }
        }
        return JSON.stringify([]);
    } catch (error) {
        return JSON.stringify([]);
    }
}

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
            
            return JSON.stringify([result]);
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

async function extractEpisodes(url) {
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        // Solo 3 episodios para testing rápido
        return JSON.stringify([
            { href: `https://kaa.to/${slug}/ep-1-test`, number: 1 },
            { href: `https://kaa.to/${slug}/ep-2-test`, number: 2 },
            { href: `https://kaa.to/${slug}/ep-3-test`, number: 3 }
        ]);
        
    } catch (error) {
        return JSON.stringify([{ href: url, number: 1 }]);
    }
}

async function extractStreamUrl(url) {
    try {
        // SIEMPRE retornar un stream que funcione para testing
        return JSON.stringify({
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "720p",
            type: "hls", // Cambiar a HLS porque JSON dice streamType: "HLS"
            headers: {}   // Headers vacíos para evitar problemas
        });
        
    } catch (error) {
        return JSON.stringify({
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "ERROR",
            type: "hls",
            headers: {}
        });
    }
}
