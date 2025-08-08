// KaaTo Module - MEJORADO con búsquedas más específicas para más resultados
async function searchResults(keyword) {
    try {
        const allResults = [];
        
        // Búsqueda principal
        const mainResponse = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (mainResponse && mainResponse._data) {
            let mainData = mainResponse._data;
            if (typeof mainData === 'string') {
                mainData = JSON.parse(mainData);
            }
            
            if (Array.isArray(mainData)) {
                allResults.push(...mainData);
            }
        }
        
        // Si tenemos 5 resultados (límite API), intentar búsquedas adicionales más específicas
        if (allResults.length === 5 && keyword.length >= 3) {
            const additionalSearches = [
                keyword + ' anime',
                keyword + ' series',
                keyword.substring(0, Math.max(3, keyword.length - 1)) // palabra más corta
            ];
            
            for (const searchTerm of additionalSearches) {
                try {
                    const additionalResponse = await fetchv2('https://kaa.to/api/search', {
                        'Content-Type': 'application/json'
                    }, 'POST', JSON.stringify({ query: searchTerm }));
                    
                    if (additionalResponse && additionalResponse._data) {
                        let additionalData = additionalResponse._data;
                        if (typeof additionalData === 'string') {
                            additionalData = JSON.parse(additionalData);
                        }
                        
                        if (Array.isArray(additionalData)) {
                            // Añadir solo resultados que no tengamos ya (evitar duplicados)
                            const existingSlugs = new Set(allResults.map(anime => anime.slug));
                            const newResults = additionalData.filter(anime => 
                                !existingSlugs.has(anime.slug) && 
                                anime.title.toLowerCase().includes(keyword.toLowerCase())
                            );
                            allResults.push(...newResults);
                        }
                    }
                } catch (error) {
                    // Continuar si alguna búsqueda adicional falla
                    console.log(`Búsqueda adicional falló: ${searchTerm}`);
                }
                
                // Limitar a máximo 15 resultados para no sobrecargar
                if (allResults.length >= 15) break;
            }
        }
        
        if (allResults.length > 0) {
            const results = allResults.map(anime => ({
                title: anime.title || anime.title_en || "Sin título",
                image: `https://kaa.to/image/poster/${anime.poster?.hq || anime.poster?.sm || 'default'}.webp`,
                href: `https://kaa.to/anime/${anime.slug}`
            }));
            
            // Añadir indicador de cuántos resultados encontramos
            if (allResults.length > 5) {
                results.unshift({
                    title: `🔍 ${allResults.length} resultados para "${keyword}"`,
                    image: "https://via.placeholder.com/300x400/green/white?text=RESULTADOS",
                    href: "info://results-count"
                });
            }
            
            return JSON.stringify(results);
        } else {
            return JSON.stringify([{
                title: "Sin resultados para: " + keyword,
                image: "https://via.placeholder.com/300x400/orange/white?text=NO+RESULTS",
                href: "debug://no-results"
            }]);
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
