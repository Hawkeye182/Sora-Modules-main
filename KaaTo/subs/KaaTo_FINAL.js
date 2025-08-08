// KaaTo Module - CORREGIDO con la estructura real de fetchv2
async function searchResults(keyword) {
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        // Los datos están en response._data, no en response.data
        if (response && response._data) {
            let animeData = response._data;
            
            // Si _data es string, parsearlo
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
            } else {
                return JSON.stringify([{
                    title: "Sin resultados para: " + keyword,
                    image: "https://via.placeholder.com/300x400/orange/white?text=NO+RESULTS",
                    href: "debug://no-results"
                }]);
            }
        } else {
            // Debug si no hay _data
            return JSON.stringify([
                {
                    title: "Status: " + (response?.status || 'unknown'),
                    image: "https://via.placeholder.com/300x400/blue/white?text=STATUS",
                    href: "debug://status"
                },
                {
                    title: "Has _data: " + (response?._data ? 'YES' : 'NO'),
                    image: "https://via.placeholder.com/300x400/red/white?text=DATA",
                    href: "debug://data"
                },
                {
                    title: "_data type: " + typeof response?._data,
                    image: "https://via.placeholder.com/300x400/green/white?text=TYPE",
                    href: "debug://type"
                }
            ]);
        }
    } catch (error) {
        return JSON.stringify([{
            title: "Error: " + error.message,
            image: "https://via.placeholder.com/300x400/red/white?text=ERROR",
            href: "debug://error"
        }]);
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
            
            return JSON.stringify({
                title: details.title || "Sin título",
                description: details.description || "Sin descripción disponible",
                releaseDate: details.year || "Desconocido",
                status: details.status || "Desconocido",
                genres: details.genres || [],
                otherTitles: details.alt_titles || [],
                image: `https://kaa.to/image/poster/${details.poster?.hq || details.poster?.sm || 'default'}.webp`
            });
        } else {
            return JSON.stringify({
                title: "Error obteniendo detalles",
                description: "No se pudieron obtener los detalles del anime",
                releaseDate: "2024",
                status: "Error",
                genres: ["Error"],
                image: "https://via.placeholder.com/300x400/red/white?text=ERROR"
            });
        }
    } catch (error) {
        return JSON.stringify({
            title: "Error en extractDetails",
            description: "Error: " + error.message,
            releaseDate: "2024",
            status: "Error",
            genres: ["Error"],
            image: "https://via.placeholder.com/300x400/red/white?text=ERROR"
        });
    }
}

async function extractEpisodes(url) {
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}/episodes`);
        
        if (response && response._data) {
            let episodes = response._data;
            if (typeof episodes === 'string') {
                episodes = JSON.parse(episodes);
            }
            
            if (Array.isArray(episodes)) {
                const episodeList = episodes.map((ep, index) => ({
                    title: ep.title || `Episodio ${ep.episode || index + 1}`,
                    href: `https://kaa.to/anime/${slug}/episode/${ep.episode || index + 1}`,
                    episode: ep.episode || index + 1
                }));
                
                return JSON.stringify(episodeList);
            }
        }
        
        return JSON.stringify([{
            title: "Error obteniendo episodios",
            href: url + "/error",
            episode: 1
        }]);
        
    } catch (error) {
        return JSON.stringify([{
            title: "Error: " + error.message,
            href: url + "/error",
            episode: 1
        }]);
    }
}

async function extractStreamUrl(url) {
    try {
        // Por ahora retornamos un stream de prueba
        // TODO: Implementar extracción real de streams desde kaa.to
        return JSON.stringify({
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "1080p",
            type: "mp4",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
    } catch (error) {
        return JSON.stringify({
            streamUrl: "",
            quality: "Error",
            type: "error",
            headers: {}
        });
    }
}
