// KickAssAnime - Módulo v8.0.0 con patrones reales detectados
const BASE_URL = "https://kaa.to";

/**
 * Función de búsqueda usando patrones reales de kaa.to
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        
        // Buscar en página alfabética de la primera letra
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        const searchUrl = `${BASE_URL}/anime?alphabet=${firstLetter}`;
        
        const response = await fetchv2(searchUrl);
        const html = typeof response === 'object' ? await response.text() : await response;

        let results = [];
        
        // Patrón 1: Buscar slugs de anime que contengan la palabra clave
        // Ejemplo: "naruto-f3cf", "naruto-shippuden-43fe"
        const slugPattern = new RegExp(`"([^"]*${keywordLower}[^"]*-[a-f0-9]{4})"`, 'gi');
        const slugMatches = html.matchAll(slugPattern);
        
        for (const match of slugMatches) {
            const slug = match[1];
            // Extraer título del slug (quitar el hash final)
            const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            results.push({
                title: title,
                image: BASE_URL + "/favicon.ico",
                href: BASE_URL + "/" + slug
            });
        }
        
        // Patrón 2: Buscar títulos en JSON
        // Ejemplo: "title_en":"Naruto Shippuden"
        const titlePattern = new RegExp(`"title[^"]*":"([^"]*${keywordLower}[^"]*)"`, 'gi');
        const titleMatches = html.matchAll(titlePattern);
        
        for (const match of titleMatches) {
            const title = match[1];
            
            // Buscar el slug correspondiente cerca de este título
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
        
        // Patrón 3: Buscar en synopsis (descripciones)
        const synopsisPattern = new RegExp(`synopsis:"[^"]*${keywordLower}[^"]*"[^}]*?"([a-z0-9\-]+-[a-f0-9]{4})"`, 'gi');
        const synopsisMatches = html.matchAll(synopsisPattern);
        
        for (const match of synopsisMatches) {
            const slug = match[1];
            const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
                
            results.push({
                title: title,
                image: BASE_URL + "/favicon.ico",
                href: BASE_URL + "/" + slug
            });
        }

        // Eliminar duplicados por href
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        // Si no encontramos nada, intentar búsqueda más amplia
        if (uniqueResults.length === 0) {
            // Buscar cualquier slug que contenga alguna letra de la palabra clave
            const broadPattern = new RegExp(`"([a-z0-9\\-]*${keywordLower.charAt(0)}[a-z0-9\\-]*-[a-f0-9]{4})"`, 'gi');
            const broadMatches = html.matchAll(broadPattern);
            
            for (const match of broadMatches) {
                const slug = match[1];
                const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                
                if (title.toLowerCase().includes(keywordLower)) {
                    uniqueResults.push({
                        title: title,
                        image: BASE_URL + "/favicon.ico",
                        href: BASE_URL + "/" + slug
                    });
                }
            }
        }

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
