// KaaTo Module - Compatible con Sora
async function searchResults(keyword) {
    try {
        const response = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: keyword })
        });
        
        const data = typeof response === 'object' ? await response.json() : JSON.parse(response);
        
        if (Array.isArray(data) && data.length > 0) {
            const results = data.map(anime => ({
                title: anime.title || anime.title_en || "Sin título",
                image: `https://kaa.to/image/poster/${anime.poster?.hq || anime.poster?.sm || 'default'}.webp`,
                href: `https://kaa.to/anime/${anime.slug}`
            }));
            
            return JSON.stringify(results);
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('Search error: ' + error.message);
        return JSON.stringify([]);
    }
}

async function extractDetails(url) {
    try {
        // Extraer slug de la URL
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        // Llamar a la API de detalles
        const response = await soraFetch(`https://kaa.to/api/show/${slug}`);
        const data = typeof response === 'object' ? await response.json() : JSON.parse(response);
        
        // Formatear según lo que espera Sora
        const details = {
            description: data.synopsis || data.description || "Sin descripción disponible",
            aliases: [
                data.title_en,
                data.title_original
            ].filter(title => title && title !== data.title).join(', ') || '',
            airdate: data.year ? `Año: ${data.year}` : (data.start_date ? `Aired: ${data.start_date}` : 'Aired: Unknown')
        };
        
        return JSON.stringify([details]);
        
    } catch (error) {
        console.log('Details error: ' + error.message);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: '',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        // Extraer slug de la URL
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        // Llamar a la API de episodios
        const response = await soraFetch(`https://kaa.to/api/show/${slug}/episodes`);
        const data = typeof response === 'object' ? await response.json() : JSON.parse(response);
        
        let episodes = [];
        
        // Manejar la estructura: { current_page: 1, pages: [...] }
        if (data.pages && Array.isArray(data.pages)) {
            data.pages.forEach(page => {
                if (page.episodes && Array.isArray(page.episodes)) {
                    episodes.push(...page.episodes);
                }
            });
        }
        
        if (episodes.length > 0) {
            const episodeList = episodes.map((ep, index) => ({
                href: ep.watch_uri ? `https://kaa.to${ep.watch_uri}` : `https://kaa.to/anime/${slug}/episode/${ep.episode || index + 1}`,
                number: ep.episode || ep.number || index + 1
            }));
            
            return JSON.stringify(episodeList);
        } else {
            // Si no hay episodios, retornar un episodio genérico
            return JSON.stringify([{
                href: `https://kaa.to/anime/${slug}`,
                number: 1
            }]);
        }
        
    } catch (error) {
        console.log('Episodes error: ' + error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

async function extractStreamUrl(url) {
    try {
        // TODO: Implementar extracción real de streams desde kaa.to
        // Por ahora retornamos un stream de prueba
        return JSON.stringify({
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "1080p",
            type: "mp4",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
    } catch (error) {
        console.log('Stream error: ' + error.message);
        return JSON.stringify({
            streamUrl: "",
            quality: "Error",
            type: "error",
            headers: {}
        });
    }
}
