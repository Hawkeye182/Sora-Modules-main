// KickAssAnime - Módulo de debug visible para Sora
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda que incluye debug en los resultados
 */
async function searchResults(keyword) {
    try {
        // Resultado de debug que se mostrará como primer anime
        let debugInfo = {
            title: "🔍 DEBUG INFO",
            image: BASE_URL + "favicon.ico",
            href: "https://debug.info"
        };
        
        if (!keyword || !keyword.trim()) {
            debugInfo.title = "❌ DEBUG: Keyword vacía";
            return JSON.stringify([debugInfo]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        debugInfo.title = `🔍 DEBUG: Buscando "${keywordLower}"`;
        
        let results = [debugInfo];
        let debugMessages = [`Keyword: ${keywordLower}`];

        // Método 1: Intentar el buscador oficial de kaa.to
        try {
            const searchUrl = `https://kaa.to/search?q=${encodeURIComponent(keyword)}`;
            debugMessages.push(`Intentando: ${searchUrl}`);
            
            const searchResponse = await soraFetch(searchUrl);
            debugMessages.push(`Respuesta recibida: ${typeof searchResponse}`);
            
            const searchHtml = await searchResponse.text();
            debugMessages.push(`HTML longitud: ${searchHtml.length}`);
            debugMessages.push(`Primeros 100 chars: ${searchHtml.substring(0, 100)}`);
            
            // Si el buscador oficial funciona, extraer resultados
            if (!searchHtml.includes('No Match')) {
                debugMessages.push("✅ Buscador oficial funcionó");
                const officialRegex = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const officialMatches = searchHtml.matchAll(officialRegex);
                const officialMatchesArray = Array.from(officialMatches);
                
                debugMessages.push(`Coincidencias oficiales: ${officialMatchesArray.length}`);
                
                const officialResults = officialMatchesArray.map(match => ({
                    title: match[4].trim(),
                    image: BASE_URL + "favicon.ico",
                    href: match[2]
                }));
                
                if (officialResults.length > 0) {
                    debugMessages.push(`✅ Resultados oficiales: ${officialResults.length}`);
                    results.push(...officialResults);
                    
                    // Actualizar debug info
                    debugInfo.title = `✅ DEBUG: Oficial encontró ${officialResults.length}`;
                    return JSON.stringify(results.slice(0, 10));
                }
            } else {
                debugMessages.push("❌ Buscador oficial: No Match");
            }
        } catch (officialError) {
            debugMessages.push(`❌ Error oficial: ${officialError.message}`);
        }

        // Método 2: Búsqueda alfabética (fallback)
        debugMessages.push("🔄 Iniciando búsqueda alfabética");
        
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        debugMessages.push(`Primera letra: ${firstLetter}`);
        
        const searchPages = [];
        
        // Búsqueda inteligente por letra inicial
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
            debugMessages.push(`Página alfabética: ${firstLetter}`);
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
                debugMessages.push(`Búsqueda popular: ${searchTerm}`);
                for (const letter of letters) {
                    const pageUrl = `https://kaa.to/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                        debugMessages.push(`Página popular: ${letter}`);
                    }
                }
                break;
            }
        }
        
        debugMessages.push(`Páginas a buscar: ${searchPages.length}`);

        // Buscar en las páginas seleccionadas
        for (let i = 0; i < searchPages.length; i++) {
            const searchUrl = searchPages[i];
            try {
                debugMessages.push(`Página ${i+1}: ${searchUrl}`);
                
                const response = await soraFetch(searchUrl);
                const html = await response.text();
                
                debugMessages.push(`HTML página ${i+1}: ${html.length} chars`);

                const ANIME_REGEX = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const matches = html.matchAll(ANIME_REGEX);
                const matchesArray = Array.from(matches);
                
                debugMessages.push(`Coincidencias página ${i+1}: ${matchesArray.length}`);
                
                const pageResults = matchesArray
                    .filter(match => {
                        const title = match[4]?.toLowerCase() || '';
                        const matches = title.includes(keywordLower);
                        if (matches) {
                            debugMessages.push(`✅ Match: ${match[4]}`);
                        }
                        return matches;
                    })
                    .map(match => ({
                        title: match[4].trim(),
                        image: BASE_URL + "favicon.ico",
                        href: match[2]
                    }));

                debugMessages.push(`Resultados filtrados página ${i+1}: ${pageResults.length}`);
                results.push(...pageResults);
                
                // Si encontramos suficientes resultados, no seguir buscando
                if (results.length >= 8) { // Dejamos espacio para el debug
                    debugMessages.push("🎯 Suficientes resultados");
                    break;
                }
                
            } catch (pageError) {
                debugMessages.push(`❌ Error página ${i+1}: ${pageError.message}`);
                continue;
            }
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        debugMessages.push(`Resultados únicos: ${uniqueResults.length}`);

        // Actualizar el debug info con todos los mensajes
        debugInfo.title = `🔍 DEBUG: ${debugMessages.length} pasos - ${uniqueResults.length-1} resultados`;
        
        // Agregar un segundo item con los mensajes de debug
        if (debugMessages.length > 0) {
            results.splice(1, 0, {
                title: debugMessages.slice(0, 3).join(" | "),
                image: BASE_URL + "favicon.ico", 
                href: "https://debug.step1"
            });
            
            if (debugMessages.length > 3) {
                results.splice(2, 0, {
                    title: debugMessages.slice(3, 6).join(" | "),
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.step2"
                });
            }
        }

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        return JSON.stringify([{
            title: `💥 ERROR: ${error.message}`,
            image: BASE_URL + "favicon.ico",
            href: "https://error.debug"
        }]);
    }
}

/**
 * Extraer detalles básicos
 */
async function extractDetails(url) {
    return JSON.stringify([{
        description: "Debug description for KickAssAnime module",
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
