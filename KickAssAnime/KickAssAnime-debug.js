// KickAssAnime - Módulo de debug para Sora
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda con debug extensivo
 */
async function searchResults(keyword) {
    try {
        // Log inicial
        console.log(`🔍 DEBUG: Iniciando búsqueda para: "${keyword}"`);
        
        if (!keyword || !keyword.trim()) {
            console.log("❌ DEBUG: Keyword vacía");
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        console.log(`📝 DEBUG: Keyword procesada: "${keywordLower}"`);
        
        let results = [];

        // Método 1: Intentar el buscador oficial de kaa.to
        try {
            const searchUrl = `https://kaa.to/search?q=${encodeURIComponent(keyword)}`;
            console.log(`🌐 DEBUG: Intentando búsqueda oficial: ${searchUrl}`);
            
            const searchResponse = await soraFetch(searchUrl);
            console.log(`📡 DEBUG: Respuesta recibida, tipo: ${typeof searchResponse}`);
            
            const searchHtml = await searchResponse.text();
            console.log(`📄 DEBUG: HTML recibido, longitud: ${searchHtml.length}`);
            console.log(`📄 DEBUG: Primeros 200 chars: ${searchHtml.substring(0, 200)}`);
            
            // Si el buscador oficial funciona, extraer resultados
            if (!searchHtml.includes('No Match')) {
                console.log("✅ DEBUG: Buscador oficial parece funcionar");
                const officialRegex = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const officialMatches = searchHtml.matchAll(officialRegex);
                const officialMatchesArray = Array.from(officialMatches);
                
                console.log(`🎯 DEBUG: Encontradas ${officialMatchesArray.length} coincidencias oficiales`);
                
                results = officialMatchesArray.map(match => ({
                    title: match[4].trim(),
                    image: BASE_URL + "favicon.ico",
                    href: match[2]
                }));
                
                if (results.length > 0) {
                    console.log(`✅ DEBUG: Buscador oficial encontró ${results.length} resultados`);
                    console.log(`📋 DEBUG: Resultados: ${JSON.stringify(results, null, 2)}`);
                    return JSON.stringify(results.slice(0, 10));
                }
            } else {
                console.log("❌ DEBUG: Buscador oficial retornó 'No Match'");
            }
        } catch (officialError) {
            console.log(`❌ DEBUG: Error en buscador oficial: ${officialError.message}`);
        }

        // Método 2: Búsqueda alfabética (fallback)
        console.log("🔄 DEBUG: Iniciando búsqueda alfabética");
        
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        console.log(`🔤 DEBUG: Primera letra: ${firstLetter}`);
        
        const searchPages = [];
        
        // Búsqueda inteligente por letra inicial
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
            console.log(`📑 DEBUG: Agregada página alfabética: ${firstLetter}`);
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
                console.log(`🎯 DEBUG: Búsqueda popular detectada: ${searchTerm}`);
                for (const letter of letters) {
                    const pageUrl = `https://kaa.to/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                        console.log(`📑 DEBUG: Agregada página popular: ${letter}`);
                    }
                }
                break;
            }
        }
        
        // Si no hay páginas específicas, usar la página de la primera letra
        if (searchPages.length === 0 && /[A-Z]/.test(firstLetter)) {
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
            console.log(`📑 DEBUG: Agregada página fallback: ${firstLetter}`);
        }

        console.log(`📚 DEBUG: Páginas a buscar: ${searchPages.length}`);

        // Buscar en las páginas seleccionadas
        for (const searchUrl of searchPages) {
            try {
                console.log(`🌐 DEBUG: Buscando en página: ${searchUrl}`);
                
                const response = await soraFetch(searchUrl);
                const html = await response.text();
                
                console.log(`📄 DEBUG: HTML de página recibido, longitud: ${html.length}`);
                console.log(`📄 DEBUG: Primeros 300 chars: ${html.substring(0, 300)}`);

                const ANIME_REGEX = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const matches = html.matchAll(ANIME_REGEX);
                const matchesArray = Array.from(matches);
                
                console.log(`🎯 DEBUG: Encontradas ${matchesArray.length} coincidencias en página`);
                
                const pageResults = matchesArray
                    .filter(match => {
                        const title = match[4]?.toLowerCase() || '';
                        const matches = title.includes(keywordLower);
                        console.log(`🔍 DEBUG: "${match[4]}" contiene "${keywordLower}": ${matches}`);
                        return matches;
                    })
                    .map(match => ({
                        title: match[4].trim(),
                        image: BASE_URL + "favicon.ico",
                        href: match[2]
                    }));

                console.log(`✅ DEBUG: ${pageResults.length} resultados filtrados en esta página`);
                results.push(...pageResults);
                
                // Si encontramos suficientes resultados, no seguir buscando
                if (results.length >= 10) {
                    console.log("🎯 DEBUG: Suficientes resultados encontrados, deteniendo búsqueda");
                    break;
                }
                
            } catch (pageError) {
                console.log(`❌ DEBUG: Error en página ${searchUrl}: ${pageError.message}`);
                continue;
            }
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        console.log(`🎉 DEBUG: Resultados finales únicos: ${uniqueResults.length}`);
        console.log(`📋 DEBUG: Resultados finales: ${JSON.stringify(uniqueResults, null, 2)}`);

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        console.log(`💥 DEBUG: Error general: ${error.message}`);
        console.log(`💥 DEBUG: Stack: ${error.stack}`);
        return JSON.stringify([]);
    }
}

/**
 * Extraer detalles básicos
 */
async function extractDetails(url) {
    console.log(`🔍 DEBUG: extractDetails llamado con URL: ${url}`);
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
    console.log(`🔍 DEBUG: extractEpisodes llamado con URL: ${url}`);
    return JSON.stringify([{
        title: "Episode 1",
        href: url + "/episode-1"
    }]);
}

/**
 * Extraer URL de stream básica
 */
async function extractStreamUrl(url) {
    console.log(`🔍 DEBUG: extractStreamUrl llamado con URL: ${url}`);
    return JSON.stringify([{
        streamUrl: "https://example.com/stream.m3u8",
        quality: "1080p"
    }]);
}
