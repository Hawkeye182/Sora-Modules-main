// Módulo para KickAssAnime (kaa.to) - Sora/Sulfur
const BASE_URL = "https://kaa.to/";

/**
 * Busca anime en el sitio web con la palabra clave dada y devuelve los resultados
 * La búsqueda en kaa.to parece usar JavaScript/API, por lo que implementamos búsqueda desde la página principal
 * @param {string} keyword La palabra clave a buscar
 * @returns {Promise<string>} Una promesa que se resuelve con una cadena JSON conteniendo los resultados de búsqueda en el formato: `[{"title": "Título", "image": "URL de imagen", "href": "URL"}, ...]`
 */
async function searchResults(keyword) {
    try {
        // Como la búsqueda directa no funciona, buscamos en la página principal
        const response = await soraFetch(BASE_URL);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Buscar anime en la página principal usando múltiples patrones
        const patterns = [
            // Patrón para enlaces de anime con títulos
            /<a[^>]*href="\/([^"\/]+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/g,
            /<a[^>]*href="\/([^"\/]+)"[^>]*>[\s\S]*?## \[([^\]]+)\]/g,
            /<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?([^<\n]+)<\/a>[\s\S]*?<h/g
        ];

        let allResults = [];
        const keywordLower = keyword.toLowerCase();

        for (const pattern of patterns) {
            const matches = html.matchAll(pattern);
            const matchesArray = Array.from(matches);
            
            const results = matchesArray
                .filter(match => {
                    const title = match[2]?.toLowerCase() || '';
                    return title.includes(keywordLower);
                })
                .map(match => {
                    const href = match[1].startsWith('http') ? match[1] : BASE_URL + match[1].replace(/^\/+/, '');
                    return {
                        title: match[2]?.trim() || 'Título no disponible',
                        image: BASE_URL + "favicon.ico", // Usar favicon como imagen por defecto
                        href: href
                    };
                });

            allResults = allResults.concat(results);
        }

        // Eliminar duplicados basados en href
        const uniqueResults = allResults.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        return JSON.stringify(uniqueResults.slice(0, 10)); // Limitar a 10 resultados

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
        
        // Múltiples patrones para extraer episodios basados en la estructura observada
        const episodePatterns = [
            // Patrón principal para enlaces de episodios
            /EP\s*(\d+)[\s\S]*?href="([^"]*\/ep-\d+-[^"]*)"/g,
            // Patrón alternativo
            /<a[^>]*href="([^"]*\/ep-(\d+)-[^"]*)"[^>]*>[\s\S]*?EP\s*\d+/g,
            // Patrón para episodios en formato diferente
            /href="([^"]*\/ep-(\d+)-[^"]*)"[^>]*>[\s\S]*?(\d+)/g
        ];

        for (const pattern of episodePatterns) {
            const matches = html.matchAll(pattern);
            const matchesArray = Array.from(matches);
            
            for (const match of matchesArray) {
                let episodeNum, episodeUrl;
                
                if (pattern === episodePatterns[0]) {
                    episodeNum = parseInt(match[1]);
                    episodeUrl = match[2];
                } else {
                    episodeNum = parseInt(match[2]);
                    episodeUrl = match[1];
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
        }

        // Si no encontramos episodios con los patrones principales, intentar extraer de la estructura de la página
        if (episodes.length === 0) {
            // Buscar patrones más generales
            const generalPattern = /EP\s*(\d+)/g;
            const linkPattern = /href="([^"]*ep-\d+-[^"]*)"/g;
            
            const epMatches = Array.from(html.matchAll(generalPattern));
            const linkMatches = Array.from(html.matchAll(linkPattern));
            
            // Emparejar números de episodio con enlaces
            const minLength = Math.min(epMatches.length, linkMatches.length);
            for (let i = 0; i < minLength; i++) {
                const episodeNum = parseInt(epMatches[i][1]);
                const episodeUrl = linkMatches[i][1];
                
                if (episodeNum && episodeUrl) {
                    const fullUrl = episodeUrl.startsWith('http') 
                        ? episodeUrl 
                        : BASE_URL + episodeUrl.replace(/^\/+/, '');
                    
                    episodes.push({
                        number: episodeNum,
                        href: fullUrl
                    });
                }
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
