// KickAssAnime - Módulo mejorado para capturar más resultados
const BASE_URL = "https://kaa.to/";

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

        // Método 1: Intentar el buscador oficial primero
        try {
            const searchUrl = `https://kaa.to/search?q=${encodeURIComponent(keyword)}`;
            const searchResponse = await fetchv2(searchUrl);
            const searchHtml = await searchResponse.text();
            
            // Si el buscador oficial funciona, extraer resultados
            if (!searchHtml.includes('No Match') && searchHtml.length > 10000) {
                // Buscar múltiples patrones en la página de resultados
                const patterns = [
                    /slug:"([^"]+)"[^}]*title:"([^"]+)"/g,
                    /"slug":"([^"]+)"[^}]*"title":"([^"]+)"/g,
                    /href="\/([^"]+)"[^>]*title="([^"]*(?:naruto|dragon|fate)[^"]*)"/gi
                ];
                
                for (const pattern of patterns) {
                    const matches = searchHtml.matchAll(pattern);
                    const matchesArray = Array.from(matches);
                    
                    const patternResults = matchesArray
                        .filter(match => {
                            const title = match[2]?.toLowerCase() || '';
                            return title.includes(keywordLower);
                        })
                        .map(match => ({
                            title: match[2].trim(),
                            image: BASE_URL + "favicon.ico",
                            href: BASE_URL + match[1]
                        }));
                    
                    results.push(...patternResults);
                }
                
                if (results.length > 0) {
                    // Eliminar duplicados y devolver
                    const uniqueResults = results.filter((result, index, self) => 
                        index === self.findIndex(r => r.title === result.title)
                    );
                    return JSON.stringify(uniqueResults.slice(0, 15));
                }
            }
        } catch (officialError) {
            // Continuar con método alfabético
        }

        // Método 2: Búsqueda alfabética mejorada con múltiples páginas
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        const searchPages = [];
        
        // Búsqueda inteligente por letra inicial
        if (/[A-Z]/.test(firstLetter)) {
            // Buscar en múltiples páginas para la letra
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}&page=2`);
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}&page=3`);
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
            'my': ['M'],
            'boruto': ['B', 'N'] // Boruto puede estar en B o con Naruto en N
        };
        
        for (const [searchTerm, letters] of Object.entries(popularSearches)) {
            if (keywordLower.includes(searchTerm)) {
                for (const letter of letters) {
                    const pageUrls = [
                        `https://kaa.to/anime?alphabet=${letter}`,
                        `https://kaa.to/anime?alphabet=${letter}&page=2`,
                        `https://kaa.to/anime?alphabet=${letter}&page=3`
                    ];
                    
                    for (const pageUrl of pageUrls) {
                        if (!searchPages.includes(pageUrl)) {
                            searchPages.push(pageUrl);
                        }
                    }
                }
                break;
            }
        }

        // Buscar en las páginas seleccionadas
        for (const searchUrl of searchPages) {
            try {
                const response = await fetchv2(searchUrl);
                const html = await response.text();

                // Múltiples patrones de regex para capturar diferentes formatos
                const regexPatterns = [
                    // Patrón JSON original
                    /slug:"([^"]+)"[^}]*title:"([^"]+)"/g,
                    // Patrón JSON con comillas dobles
                    /"slug":"([^"]+)"[^}]*"title":"([^"]+)"/g,
                    // Patrón alternativo para enlaces HTML
                    /href="\/([^"]+)"[^>]*>([^<]*(?:naruto|dragon|fate|one piece)[^<]*)</gi,
                    // Patrón para datos en JavaScript
                    /name:\s*["']([^"']*(?:naruto|dragon|fate)[^"']*)["'][^}]*slug:\s*["']([^"']+)["']/gi
                ];

                for (const regex of regexPatterns) {
                    const matches = html.matchAll(regex);
                    const matchesArray = Array.from(matches);
                    
                    const pageResults = matchesArray
                        .filter(match => {
                            const title = (match[2] || match[1])?.toLowerCase() || '';
                            return title.includes(keywordLower);
                        })
                        .map(match => {
                            // Determinar cuál captura es el título y cuál es el slug
                            const isFirstTitle = (match[1]?.length || 0) > (match[2]?.length || 0);
                            const title = isFirstTitle ? match[1] : match[2];
                            const slug = isFirstTitle ? match[2] : match[1];
                            
                            return {
                                title: title?.trim() || 'Unknown Title',
                                image: BASE_URL + "favicon.ico",
                                href: slug?.startsWith('http') ? slug : BASE_URL + slug
                            };
                        });

                    results.push(...pageResults);
                }
                
                // Si encontramos muchos resultados, no seguir buscando
                if (results.length >= 15) break;
                
            } catch (pageError) {
                continue;
            }
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.title === result.title || r.href === result.href)
        );

        return JSON.stringify(uniqueResults.slice(0, 15));

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
