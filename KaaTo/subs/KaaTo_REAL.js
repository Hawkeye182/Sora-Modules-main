// KaaTo Module - Usando formato que SÍ funciona en Sora
async function searchResults(keyword) {
    try {
        // Intentar usando fetchv2 (sabemos que está disponible)
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (response && Array.isArray(response)) {
            const results = response.map(anime => ({
                title: anime.title || anime.title_en || "Sin título",
                image: `https://kaa.to/image/poster/${anime.poster?.hq || anime.poster?.sm || 'default'}.webp`,
                href: `https://kaa.to/anime/${anime.slug}`
            }));
            
            return JSON.stringify(results);
        } else {
            // Si fetchv2 falla, mostrar mensaje debug
            return JSON.stringify([{
                title: "❌ API Response: " + (typeof response),
                image: "https://via.placeholder.com/300x400/red/white?text=API+ERROR",
                href: "debug://api-error"
            }]);
        }
    } catch (error) {
        // En caso de error, mostrar información útil
        return JSON.stringify([
            {
                title: "🔧 fetchv2 disponible: SI",
                image: "https://via.placeholder.com/300x400/green/white?text=fetchv2+OK",
                href: "debug://fetchv2-ok"
            },
            {
                title: "❌ Error: " + error.message.substring(0, 50),
                image: "https://via.placeholder.com/300x400/red/white?text=ERROR",
                href: "debug://error"
            },
            {
                title: "🔍 Keyword: " + (keyword || 'vacio'),
                image: "https://via.placeholder.com/300x400/blue/white?text=KEYWORD",
                href: "debug://keyword"
            }
        ]);
    }
}

async function extractDetails(url) {
    try {
        // Extraer slug de la URL
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.title) {
            return JSON.stringify({
                title: response.title,
                description: response.description || "Sin descripción disponible",
                releaseDate: response.year || "Desconocido",
                status: response.status || "Desconocido",
                genres: response.genres || [],
                otherTitles: response.alt_titles || [],
                image: `https://kaa.to/image/poster/${response.poster?.hq || response.poster?.sm || 'default'}.webp`
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
        // Extraer slug de la URL
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        const response = await fetchv2(`https://kaa.to/api/show/${slug}/episodes`);
        
        if (response && Array.isArray(response)) {
            const episodes = response.map((ep, index) => ({
                title: ep.title || `Episodio ${ep.episode || index + 1}`,
                href: `https://kaa.to/anime/${slug}/episode/${ep.episode || index + 1}`,
                episode: ep.episode || index + 1
            }));
            
            return JSON.stringify(episodes);
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
        // TODO: Implementar extracción real de streams
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
