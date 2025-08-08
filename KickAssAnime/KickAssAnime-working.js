// KickAssAnime - Módulo funcional con fetchv2
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda real usando fetchv2
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        let results = [];

        // Método 1: Intentar el buscador oficial de kaa.to
        try {
            const searchUrl = `https://kaa.to/search?q=${encodeURIComponent(keyword)}`;
            const searchResponse = await fetchv2(searchUrl);
            const searchHtml = await searchResponse.text();
            
            // Si el buscador oficial funciona, extraer resultados
            if (!searchHtml.includes('No Match')) {
                const officialRegex = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const officialMatches = searchHtml.matchAll(officialRegex);
                const officialMatchesArray = Array.from(officialMatches);
                
                results = officialMatchesArray.map(match => ({
                    title: match[4].trim(),
                    image: BASE_URL + "favicon.ico",
                    href: match[2]
                }));
                
                if (results.length > 0) {
                    return JSON.stringify(results.slice(0, 10));
                }
            }
        } catch (officialError) {
            // El buscador oficial falló, continuar con método alfabético
        }

        // Método 2: Búsqueda alfabética (fallback)
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

                const ANIME_REGEX = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const matches = html.matchAll(ANIME_REGEX);
                const matchesArray = Array.from(matches);
                
                const pageResults = matchesArray
                    .filter(match => {
                        const title = match[4]?.toLowerCase() || '';
                        return title.includes(keywordLower);
                    })
                    .map(match => ({
                        title: match[4].trim(),
                        image: BASE_URL + "favicon.ico",
                        href: match[2]
                    }));

                results.push(...pageResults);
                
                // Si encontramos suficientes resultados, no seguir buscando
                if (results.length >= 10) break;
                
            } catch (pageError) {
                continue;
            }
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
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
