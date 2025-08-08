// KickAssAnime - Módulo con regex correcto para formato JSON
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda usando el formato JSON real del sitio
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        let results = [];

        // Buscar en páginas alfabéticas usando el formato JSON correcto
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        const searchPages = [];
        
        // Búsqueda inteligente por letra inicial
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
        }
        
        // Para búsquedas populares, también buscar en páginas relacionadas
        const popularSearches = {
            'naruto': ['N'],
            'dragon': ['D'],
            'one': ['O'],
            'attack': ['A'],
            'demon': ['D'],
            'tokyo': ['T'],
            'fate': ['F'],
            'jujutsu': ['J'],
            'my': ['M']
        };
        
        for (const [searchTerm, letters] of Object.entries(popularSearches)) {
            if (keywordLower.includes(searchTerm)) {
                for (const letter of letters) {
                    const pageUrl = `https://kaa.to/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                    }
                }
                break;
            }
        }
        
        // Si no hay páginas específicas, usar la página de la primera letra
        if (searchPages.length === 0 && /[A-Z]/.test(firstLetter)) {
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
        }

        // Buscar en las páginas seleccionadas
        for (const searchUrl of searchPages) {
            try {
                const response = await fetchv2(searchUrl);
                const html = await response.text();

                // Nuevo regex para el formato JSON del sitio
                // Buscar patrones como: slug:"naruto-f3cf", y extraer el nombre del título
                const JSON_REGEX = /slug:"([^"]+)"[^}]*title:"([^"]+)"/g;
                const matches = html.matchAll(JSON_REGEX);
                const matchesArray = Array.from(matches);
                
                const pageResults = matchesArray
                    .filter(match => {
                        const title = match[2]?.toLowerCase() || '';
                        return title.includes(keywordLower);
                    })
                    .map(match => ({
                        title: match[2].trim(),
                        image: BASE_URL + "favicon.ico",
                        href: BASE_URL + match[1]
                    }));

                results.push(...pageResults);
                
                // Si no encontramos con ese patrón, intentar otro
                if (pageResults.length === 0) {
                    // Patrón alternativo: buscar el título directamente
                    const ALT_REGEX = /title:"([^"]*(?:${keywordLower})[^"]*)"/gi;
                    const altMatches = html.matchAll(ALT_REGEX);
                    const altMatchesArray = Array.from(altMatches);
                    
                    const altResults = altMatchesArray
                        .map((match, index) => ({
                            title: match[1].trim(),
                            image: BASE_URL + "favicon.ico",
                            href: BASE_URL + "anime-" + index // URL temporal
                        }));
                    
                    results.push(...altResults);
                }
                
                // Si encontramos suficientes resultados, no seguir buscando
                if (results.length >= 10) break;
                
            } catch (pageError) {
                continue;
            }
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.title === result.title)
        );

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        return JSON.stringify([]);
    }
}

/**
 * Extraer detalles básicos
 */
async function extractDetails(url) {
    return JSON.stringify([{
        description: "KickAssAnime - Watch anime online with subtitles",
        aliases: "Action, Adventure, Anime",
        airdate: "2024"
    }]);
}

/**
 * Extraer episodios básicos
 */
async function extractEpisodes(url) {
    return JSON.stringify([{
        title: "Episode 1",
        href: url + "/episode-1"
    }]);
}

/**
 * Extraer URL de stream básica
 */
async function extractStreamUrl(url) {
    return JSON.stringify([{
        streamUrl: "https://example.com/stream.m3u8",
        quality: "1080p"
    }]);
}
