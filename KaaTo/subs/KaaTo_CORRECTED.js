// KaaTo Module - CORREGIDO con estructura real de API
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
            } else {
                return JSON.stringify([{
                    title: "❌ Sin resultados para: " + keyword,
                    image: "https://via.placeholder.com/300x400/FF9800/white?text=NO+RESULTS",
                    href: "debug://no-results"
                }]);
            }
        } else {
            return JSON.stringify([{
                title: "🔧 Error de conexión con kaa.to",
                image: "https://via.placeholder.com/300x400/F44336/white?text=CONNECTION+ERROR",
                href: "debug://connection"
            }]);
        }
    } catch (error) {
        return JSON.stringify([{
            title: "❌ Error: " + error.message,
            image: "https://via.placeholder.com/300x400/F44336/white?text=ERROR",
            href: "debug://error"
        }]);
    }
}

async function extractDetails(url) {
    try {
        // Extraer slug de la URL
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        // Llamar a la API de detalles
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.status === 200 && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            // Crear objeto con los detalles usando la estructura real de la API
            const result = {
                title: details.title || details.title_en || "Título no disponible",
                description: details.synopsis || details.description || "Sinopsis no disponible",
                releaseDate: details.year ? details.year.toString() : "Año desconocido",
                status: details.status || "Estado desconocido",
                genres: Array.isArray(details.genres) ? details.genres : [],
                image: details.poster ? 
                    `https://kaa.to/image/poster/${details.poster.hq || details.poster.sm || 'default'}.webp` : 
                    "https://via.placeholder.com/300x400/cccccc/ffffff?text=Sin+Imagen"
            };
            
            // Agregar títulos alternativos si existen
            if (details.title_en || details.title_original) {
                result.otherTitles = [details.title_en, details.title_original].filter(t => t && t !== details.title);
            }
            
            return JSON.stringify(result);
        } else {
            throw new Error(`API respondió con status: ${response ? response.status : 'sin respuesta'}`);
        }
    } catch (error) {
        console.error('Error en extractDetails:', error);
        return JSON.stringify({
            title: "Error obteniendo detalles",
            description: `No se pudieron obtener los detalles: ${error.message}`,
            releaseDate: "2024",
            status: "Error",
            genres: ["Error"],
            image: "https://via.placeholder.com/300x400/F44336/white?text=ERROR"
        });
    }
}

async function extractEpisodes(url) {
    try {
        // Manejar URLs de información
        if (url.startsWith('info://') || url.startsWith('debug://')) {
            return JSON.stringify([{
                title: "Información del módulo KaaTo",
                href: url,
                episode: 1
            }]);
        }
        
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}/episodes`);
        
        if (response && response._data) {
            let episodesData = response._data;
            if (typeof episodesData === 'string') {
                episodesData = JSON.parse(episodesData);
            }
            
            // Manejar la estructura real: { current_page: 1, pages: [...] }
            let episodes = [];
            
            if (episodesData.pages && Array.isArray(episodesData.pages)) {
                // Extraer episodios de todas las páginas
                episodesData.pages.forEach(page => {
                    if (page.episodes && Array.isArray(page.episodes)) {
                        episodes.push(...page.episodes);
                    }
                });
            }
            
            if (episodes.length > 0) {
                const episodeList = episodes.map((ep, index) => ({
                    title: ep.title || `Episodio ${ep.episode || ep.number || index + 1}`,
                    href: ep.watch_uri ? `https://kaa.to${ep.watch_uri}` : `https://kaa.to/anime/${slug}/episode/${ep.episode || index + 1}`,
                    episode: ep.episode || ep.number || index + 1
                }));
                
                return JSON.stringify(episodeList);
            } else {
                // Si no hay episodios en pages, intentar estructura alternativa
                return JSON.stringify([{
                    title: "Episodios disponibles en kaa.to",
                    href: `https://kaa.to/anime/${slug}`,
                    episode: 1
                }]);
            }
        } else {
            return JSON.stringify([{
                title: "Error obteniendo episodios",
                href: url + "/error",
                episode: 1
            }]);
        }
        
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
