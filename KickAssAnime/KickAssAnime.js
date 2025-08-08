// Módulo para KickAssAnime (kaa.to) - Sora/Sulfur
const BASE_URL = "https://kaa.to/";

/**
 * Busca anime en el sitio web con la palabra clave dada y devuelve los resultados
 * Busca en las páginas alfabéticas de kaa.to para encontrar coincidencias
 * @param {string} keyword La palabra clave a buscar
 * @returns {Promise<string>} Una promesa que se resuelve con una cadena JSON conteniendo los resultados de búsqueda en el formato: `[{"title": "Título", "image": "URL de imagen", "href": "URL"}, ...]`
 */
async function searchResults(keyword) {
    try {
        const keywordLower = keyword.toLowerCase().trim();
        const allResults = [];
        
        // Buscar en múltiples páginas alfabéticas para mayor probabilidad de encontrar resultados
        const searchPages = [
            'https://kaa.to/anime', // Página principal de anime
            'https://kaa.to/anime?alphabet=A',
            'https://kaa.to/anime?alphabet=B',
            'https://kaa.to/anime?alphabet=D', // Dan Da Dan, Dragon Ball, etc.
            'https://kaa.to/anime?alphabet=N', // Naruto, etc.
            'https://kaa.to/anime?alphabet=O', // One Piece, etc.
            'https://kaa.to/anime?alphabet=S', // Solo Leveling, etc.
        ];

        for (const pageUrl of searchPages) {
            try {
                const response = await soraFetch(pageUrl);
                const html = typeof response === 'object' ? await response.text() : await response;

                // Patrón mejorado basado en la estructura real observada
                const animePattern = /href="([^"]*\/([^"\/]+))"[^>]*>[\s\S]*?## \[([^\]]+)\]/g;
                const alternativePattern = /href="(\/[^"\/]+)"[^>]*>[\s\S]*?##\s*([^<\n]+)/g;
                
                // Buscar con el patrón principal
                let matches = html.matchAll(animePattern);
                let matchesArray = Array.from(matches);

                // Si no encontramos con el patrón principal, usar el alternativo
                if (matchesArray.length === 0) {
                    matches = html.matchAll(alternativePattern);
                    matchesArray = Array.from(matches);
                }

                for (const match of matchesArray) {
                    let title, href, slug;
                    
                    if (match.length >= 4) {
                        // Patrón principal: href, slug, title
                        href = match[1];
                        slug = match[2];
                        title = match[3];
                    } else {
                        // Patrón alternativo: href, title
                        href = match[1];
                        title = match[2];
                        slug = href.split('/').pop();
                    }

                    title = title?.trim() || 'Título no disponible';
                    
                    // Filtrar por palabra clave
                    if (title.toLowerCase().includes(keywordLower)) {
                        const fullUrl = href.startsWith('http') 
                            ? href 
                            : BASE_URL + href.replace(/^\/+/, '');

                        // Verificar que no esté duplicado
                        if (!allResults.find(result => result.href === fullUrl)) {
                            allResults.push({
                                title: title,
                                image: BASE_URL + "favicon.ico",
                                href: fullUrl
                            });
                        }
                    }
                }

                // Si ya encontramos suficientes resultados, no seguir buscando
                if (allResults.length >= 10) {
                    break;
                }

            } catch (pageError) {
                console.log(`Error en página ${pageUrl}: ${pageError.message}`);
                continue;
            }
        }

        // Si no encontramos resultados específicos, buscar de forma más amplia
        if (allResults.length === 0) {
            try {
                const response = await soraFetch(BASE_URL);
                const html = typeof response === 'object' ? await response.text() : await response;
                
                // Buscar en la página principal con patrones más generales
                const generalPatterns = [
                    /href="(\/[^"\/]+)"[^>]*>[\s\S]*?([^<\n]{3,50})/g,
                    /<a[^>]*href="(\/[^"]*)"[^>]*>([^<]+)<\/a>/g
                ];

                for (const pattern of generalPatterns) {
                    const matches = html.matchAll(pattern);
                    const matchesArray = Array.from(matches);
                    
                    for (const match of matchesArray) {
                        const href = match[1];
                        const title = match[2]?.trim();
                        
                        if (title && title.toLowerCase().includes(keywordLower) && title.length > 2) {
                            const fullUrl = BASE_URL + href.replace(/^\/+/, '');
                            
                            if (!allResults.find(result => result.href === fullUrl)) {
                                allResults.push({
                                    title: title,
                                    image: BASE_URL + "favicon.ico",
                                    href: fullUrl
                                });
                            }
                        }
                    }
                    
                    if (allResults.length >= 5) break;
                }
            } catch (generalError) {
                console.log('Error en búsqueda general: ' + generalError.message);
            }
        }

        return JSON.stringify(allResults.slice(0, 10));

    } catch (error) {
        console.log('Error de búsqueda: ' + error.message);
        return JSON.stringify([]);
    }
}

/**
 * Extrae los detalles (descripción, géneros, fecha de emisión) de la URL dada
 * @param {string} url La URL de la cual extraer los detalles
 * @returns {Promise<string>} Una promesa que se resuelve con una cadena JSON conteniendo los detalles en el formato: `[{"description": "Descripción", "aliases": "Géneros", "airdate": "Fecha de emisión"}]`
 */
async function extractDetails(url) {
    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Extraer descripción de la sinopsis
        let description = 'Sin descripción disponible';
        const synopsisPatterns = [
            /Synopsis\s*([\s\S]*?)(?=\s*A-Z LIST|$)/i,
            /<div[^>]*class="[^"]*synopsis[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
            /Synopsis\s+([\s\S]+?)(?=\.|!|\?|A-Z)/i
        ];

        for (const pattern of synopsisPatterns) {
            const match = html.match(pattern);
            if (match && match[1]) {
                description = match[1]
                    .replace(/<[^>]*>/g, '') // Remover tags HTML
                    .replace(/\s+/g, ' ')    // Normalizar espacios
                    .trim();
                break;
            }
        }

        // Extraer géneros
        let genres = 'Géneros: Desconocidos';
        const genrePatterns = [
            /Action|Adventure|Comedy|Drama|Fantasy|Horror|Mystery|Romance|Sci-Fi|Thriller|Slice of Life|Supernatural|Shounen|Seinen|Josei|Shoujo/g
        ];

        const foundGenres = [];
        for (const pattern of genrePatterns) {
            const matches = html.matchAll(pattern);
            for (const match of matches) {
                if (!foundGenres.includes(match[0])) {
                    foundGenres.push(match[0]);
                }
            }
        }

        if (foundGenres.length > 0) {
            genres = foundGenres.join(', ');
        }

        // Extraer año y información adicional
        let airdate = 'Fecha: Desconocida';
        const yearPattern = /(\d{4})/;
        const statusPattern = /(Finished|Airing|Completed)/i;
        
        const yearMatch = html.match(yearPattern);
        const statusMatch = html.match(statusPattern);
        
        if (yearMatch || statusMatch) {
            const parts = [];
            if (yearMatch) parts.push(`Año: ${yearMatch[1]}`);
            if (statusMatch) parts.push(`Estado: ${statusMatch[1]}`);
            airdate = parts.join(' • ');
        }

        const details = {
            description: description,
            aliases: genres,
            airdate: airdate,
        };

        return JSON.stringify([details]);

    } catch (error) {
        console.log('Error de detalles: ' + error.message);
        return JSON.stringify([{
            description: 'Error al cargar la descripción',
            aliases: 'Géneros: Desconocidos',
            airdate: 'Fecha: Desconocida'
        }]);
    }
}

/**
 * Extrae los episodios de la URL dada.
 * @param {string} url - La URL de la cual extraer los episodios.
 * @returns {Promise<string>} Una promesa que se resuelve con una cadena JSON conteniendo los episodios en el formato: `[{ "href": "URL del episodio", "number": Número del episodio }, ...]`.
 * Si ocurre un error durante la operación fetch, se devuelve un array vacío en formato JSON.
 */
async function extractEpisodes(url) {
    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        const episodes = [];
        
        // Buscar el primer episodio para acceder a la página del reproductor
        const firstEpisodePattern = /href="([^"]*\/ep-1-[^"]*)"/;
        const firstEpisodeMatch = html.match(firstEpisodePattern);
        
        if (firstEpisodeMatch) {
            const firstEpisodeUrl = firstEpisodeMatch[1].startsWith('http') 
                ? firstEpisodeMatch[1] 
                : BASE_URL + firstEpisodeMatch[1].replace(/^\/+/, '');
            
            try {
                // Obtener la página del primer episodio donde están todos los episodios listados
                const episodePageResponse = await soraFetch(firstEpisodeUrl);
                const episodePageHtml = typeof episodePageResponse === 'object' 
                    ? await episodePageResponse.text() 
                    : await episodePageResponse;

                // Buscar todos los episodios en la página del reproductor
                const episodeListPatterns = [
                    // Patrón principal para episodios
                    /EP\s*(\d+)[\s\S]*?href="([^"]*\/ep-\d+-[^"]*)"/g,
                    // Patrón alternativo
                    /href="([^"]*\/ep-(\d+)-[^"]*)"[^>]*>[\s\S]*?EP\s*\d+/g,
                    // Patrón más simple
                    /ep-(\d+)-[^"]*"[^>]*>[\s\S]*?(\d+)/g
                ];

                for (const pattern of episodeListPatterns) {
                    const matches = episodePageHtml.matchAll(pattern);
                    const matchesArray = Array.from(matches);
                    
                    for (const match of matchesArray) {
                        let episodeNum, episodeUrl;
                        
                        if (pattern === episodeListPatterns[0]) {
                            // EP NUMBER ... href="URL"
                            episodeNum = parseInt(match[1]);
                            episodeUrl = match[2];
                        } else if (pattern === episodeListPatterns[1]) {
                            // href="URL" ... EP
                            episodeNum = parseInt(match[2]);
                            episodeUrl = match[1];
                        } else {
                            // Patrón simple
                            episodeNum = parseInt(match[1]);
                            episodeUrl = match[0]; // Buscar la URL completa en el contexto
                        }

                        if (episodeNum && episodeUrl) {
                            const fullUrl = episodeUrl.startsWith('http') 
                                ? episodeUrl 
                                : BASE_URL + episodeUrl.replace(/^\/+/, '');
                            
                            // Verificar que no esté duplicado
                            if (!episodes.find(ep => ep.number === episodeNum)) {
                                episodes.push({
                                    number: episodeNum,
                                    href: fullUrl
                                });
                            }
                        }
                    }
                    
                    if (episodes.length > 0) break;
                }

                // Si no encontramos episodios en la página del reproductor, buscar de forma más directa
                if (episodes.length === 0) {
                    // Buscar patrones de episodios en la página original
                    const directPatterns = [
                        /href="([^"]*\/ep-(\d+)-[^"]*)"/g,
                        /ep-(\d+)-[^"]*"[^>]*>/g
                    ];

                    for (const pattern of directPatterns) {
                        const matches = html.matchAll(pattern);
                        const matchesArray = Array.from(matches);
                        
                        for (const match of matchesArray) {
                            let episodeNum, episodeUrl;
                            
                            if (match.length >= 3) {
                                episodeUrl = match[1];
                                episodeNum = parseInt(match[2]);
                            } else {
                                episodeNum = parseInt(match[1]);
                                // Construir URL basada en el patrón observado
                                const baseSlug = url.split('/').pop();
                                episodeUrl = `/${baseSlug}/ep-${episodeNum}-${generateRandomHash()}`;
                            }

                            if (episodeNum && episodeUrl) {
                                const fullUrl = episodeUrl.startsWith('http') 
                                    ? episodeUrl 
                                    : BASE_URL + episodeUrl.replace(/^\/+/, '');
                                
                                if (!episodes.find(ep => ep.number === episodeNum)) {
                                    episodes.push({
                                        number: episodeNum,
                                        href: fullUrl
                                    });
                                }
                            }
                        }
                        
                        if (episodes.length > 0) break;
                    }
                }

            } catch (episodePageError) {
                console.log('Error al obtener página de episodios: ' + episodePageError.message);
            }
        }

        // Si aún no tenemos episodios, intentar buscar directamente en la página principal
        if (episodes.length === 0) {
            const fallbackPattern = /ep-(\d+)/g;
            const matches = html.matchAll(fallbackPattern);
            const matchesArray = Array.from(matches);
            
            // Crear episodios basados en los números encontrados
            const uniqueNumbers = [...new Set(matchesArray.map(match => parseInt(match[1])))];
            
            for (const epNum of uniqueNumbers.sort((a, b) => a - b)) {
                const baseSlug = url.split('/').pop();
                const episodeUrl = `${url}/ep-${epNum}-${generateRandomHash()}`;
                
                episodes.push({
                    number: epNum,
                    href: episodeUrl
                });
            }
        }

        // Ordenar episodios por número
        episodes.sort((a, b) => a.number - b.number);

        return JSON.stringify(episodes);

    } catch (error) {
        console.log('Error de episodios: ' + error.message);
        return JSON.stringify([]);
    }
}

// Función auxiliar para generar hash aleatorio como en las URLs reales
function generateRandomHash() {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/**
 * Extrae la URL del stream de la URL dada.
 * @param {string} url - La URL de la cual extraer la URL del stream.
 * @returns {Promise<string|null>} Una promesa que se resuelve con la URL del stream si es exitosa, o null si ocurre un error durante la operación fetch.
 */
async function extractStreamUrl(url) {
    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Buscar múltiples patrones de streaming
        const streamPatterns = [
            // Patrones para M3U8
            /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi,
            /(\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/gi,
            // Patrones para MP4
            /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/gi,
            // Patrones en configuraciones de video
            /file\s*:\s*["']([^"']+)["']/gi,
            /src\s*:\s*["']([^"']+)["']/gi,
            /source\s*:\s*["']([^"']+)["']/gi,
            /url\s*:\s*["']([^"']+)["']/gi
        ];

        for (const pattern of streamPatterns) {
            const matches = html.matchAll(pattern);
            const matchesArray = Array.from(matches);
            
            for (const match of matchesArray) {
                let streamUrl = match[1];
                
                // Normalizar URL
                if (streamUrl.startsWith('//')) {
                    streamUrl = 'https:' + streamUrl;
                }
                
                // Verificar que sea una URL válida de streaming
                if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                    return streamUrl;
                }
            }
        }

        // Si no encontramos streams directos, buscar iframes
        const iframePatterns = [
            /<iframe[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi,
            /iframe[^>]*src\s*=\s*["']([^"']+)["']/gi
        ];

        for (const pattern of iframePatterns) {
            const matches = html.matchAll(pattern);
            const matchesArray = Array.from(matches);
            
            for (const match of matchesArray) {
                let iframeUrl = match[1];
                
                // Normalizar URL del iframe
                if (iframeUrl.startsWith('//')) {
                    iframeUrl = 'https:' + iframeUrl;
                } else if (iframeUrl.startsWith('/')) {
                    iframeUrl = BASE_URL + iframeUrl.substring(1);
                }

                try {
                    // Intentar extraer stream del iframe
                    const iframeResponse = await soraFetch(iframeUrl, {
                        headers: { 'Referer': url }
                    });
                    const iframeHtml = typeof iframeResponse === 'object' 
                        ? await iframeResponse.text() 
                        : await iframeResponse;
                    
                    // Buscar streams en el iframe
                    for (const streamPattern of streamPatterns) {
                        const iframeMatches = iframeHtml.matchAll(streamPattern);
                        const iframeMatchesArray = Array.from(iframeMatches);
                        
                        for (const iframeMatch of iframeMatchesArray) {
                            let streamUrl = iframeMatch[1];
                            
                            if (streamUrl.startsWith('//')) {
                                streamUrl = 'https:' + streamUrl;
                            }
                            
                            if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                                return streamUrl;
                            }
                        }
                    }
                } catch (iframeError) {
                    console.log('Error en iframe: ' + iframeError.message);
                    continue;
                }
            }
        }

        // Último intento: buscar configuraciones JavaScript
        const jsConfigPatterns = [
            /var\s+\w+\s*=\s*["']([^"']*\.m3u8[^"']*)["']/gi,
            /const\s+\w+\s*=\s*["']([^"']*\.m3u8[^"']*)["']/gi,
            /let\s+\w+\s*=\s*["']([^"']*\.m3u8[^"']*)["']/gi
        ];

        for (const pattern of jsConfigPatterns) {
            const matches = html.matchAll(pattern);
            const matchesArray = Array.from(matches);
            
            if (matchesArray.length > 0) {
                let streamUrl = matchesArray[0][1];
                if (streamUrl.startsWith('//')) {
                    streamUrl = 'https:' + streamUrl;
                }
                return streamUrl;
            }
        }

        return null;

    } catch (error) {
        console.log('Error de stream: ' + error.message);
        return null;
    }
}

async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    const defaultHeaders = {
        'User-Agent': 'SoraApp',
        'Referer': 'https://kaa.to/'
    };
    
    const headers = { ...defaultHeaders, ...(options.headers || {}) };
    
    try {
        return await fetchv2(url, headers, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, { ...options, headers });
        } catch(error) {
            return null;
        }
    }
}
