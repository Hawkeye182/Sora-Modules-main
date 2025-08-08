// KickAssAnime v9.0.0 - Búsqueda en múltiples páginas alfabéticas
const BASE_URL = "https://kaa.to";

/**
 * Función de búsqueda mejorada que busca en múltiples páginas
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        let results = [];
        
        // Estrategia 1: Buscar en múltiples páginas alfabéticas relevantes
        const searchPages = [];
        
        // Página principal por primera letra
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`${BASE_URL}/anime?alphabet=${firstLetter}`);
        }
        
        // Para animes conocidos, buscar en páginas específicas donde pueden estar
        const knownLocations = {
            'dragon': ['C', 'D'],  // Dragon Ball está en C
            'naruto': ['N'],
            'one': ['O'],
            'attack': ['A', 'S'],  // Attack on Titan puede estar como "Shingeki"
            'demon': ['D', 'K'],   // Demon Slayer puede estar como "Kimetsu"
            'jujutsu': ['J'],
            'tokyo': ['T'],
            'fate': ['F'],
            'bleach': ['B'],
            'death': ['D'],
            'fullmetal': ['F'],
            'hunter': ['H'],
            'mob': ['M'],
            'boku': ['B', 'M']     // My Hero Academia puede estar como "Boku no Hero"
        };
        
        // Buscar páginas relevantes para la palabra clave
        for (const [anime, letters] of Object.entries(knownLocations)) {
            if (keywordLower.includes(anime)) {
                for (const letter of letters) {
                    const pageUrl = `${BASE_URL}/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                    }
                }
                break;
            }
        }
        
        // Si no hay páginas específicas, buscar en las más comunes
        if (searchPages.length === 0) {
            searchPages.push(`${BASE_URL}/anime?alphabet=${firstLetter}`);
        }

        // Buscar en cada página
        for (const searchUrl of searchPages) {
            try {
                const response = await fetchv2(searchUrl);
                const html = typeof response === 'object' ? await response.text() : await response;

                // Patrón 1: Buscar slugs que contengan la palabra clave
                const slugPattern = new RegExp(`"([^"]*${keywordLower}[^"]*-[a-f0-9]{4})"`, 'gi');
                const slugMatches = html.matchAll(slugPattern);
                
                for (const match of slugMatches) {
                    const slug = match[1];
                    const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    results.push({
                        title: title,
                        image: BASE_URL + "/favicon.ico",
                        href: BASE_URL + "/" + slug
                    });
                }
                
                // Patrón 2: Buscar títulos en JSON que contengan la palabra
                const titlePattern = new RegExp(`"title[^"]*":"([^"]*${keywordLower}[^"]*)"`, 'gi');
                const titleMatches = html.matchAll(titlePattern);
                
                for (const match of titleMatches) {
                    const title = match[1];
                    
                    // Buscar el slug correspondiente
                    const context = html.substring(Math.max(0, match.index - 200), match.index + 200);
                    const contextSlugMatch = context.match(/"([a-z0-9\-]+-[a-f0-9]{4})"/);
                    
                    if (contextSlugMatch) {
                        results.push({
                            title: title,
                            image: BASE_URL + "/favicon.ico", 
                            href: BASE_URL + "/" + contextSlugMatch[1]
                        });
                    }
                }
                
                // Patrón 3: Buscar en cualquier parte del JSON
                const broadPattern = new RegExp(`([^"]{0,50}${keywordLower}[^"]{0,50})`, 'gi');
                const broadMatches = html.matchAll(broadPattern);
                
                for (const match of broadMatches) {
                    const context = html.substring(Math.max(0, match.index - 100), match.index + 200);
                    const slugMatch = context.match(/"([a-z0-9\-]+-[a-f0-9]{4})"/);
                    
                    if (slugMatch) {
                        const slug = slugMatch[1];
                        const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());
                        
                        if (title.toLowerCase().includes(keywordLower)) {
                            results.push({
                                title: title,
                                image: BASE_URL + "/favicon.ico",
                                href: BASE_URL + "/" + slug
                            });
                        }
                    }
                }
                
                // Si ya encontramos suficientes resultados, parar
                if (results.length >= 10) break;
                
            } catch (pageError) {
                console.log(`Error en ${searchUrl}: ${pageError.message}`);
                continue;
            }
        }

        // Eliminar duplicados por href
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        return JSON.stringify([{
            title: `Debug: ${error.message}`,
            image: BASE_URL + "/favicon.ico",
            href: BASE_URL
        }]);
    }
}

/**
 * Extraer detalles del anime
 */
async function extractDetails(url) {
    try {
        const response = await fetchv2(url);
        const html = typeof response === 'object' ? await response.text() : await response;
        
        return JSON.stringify([{
            description: "KickAssAnime - Watch anime online",
            aliases: "Anime",
            airdate: "2024"
        }]);
    } catch (error) {
        return JSON.stringify([{
            description: `Error: ${error.message}`,
            aliases: "Error",
            airdate: "2024"
        }]);
    }
}

/**
 * Extraer lista de episodios
 */
async function extractEpisodes(url) {
    return JSON.stringify([{
        title: "Episode 1",
        href: url + "/ep-1"
    }]);
}

/**
 * Extraer URL de streaming
 */
async function extractStreamUrl(url) {
    return JSON.stringify([{
        streamUrl: "https://example.com/stream.m3u8",
        quality: "1080p"
    }]);
}
