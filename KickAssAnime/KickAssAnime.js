// Módulo para KickAssAnime (kaa.to) - Sora/Sulfur
const BASE_URL = "https://kaa.to/";
const SEARCH_URL = "https://kaa.to/search?q=";

/**
 * Busca anime en el sitio web con la palabra clave dada y devuelve los resultados
 * @param {string} keyword La palabra clave a buscar
 * @returns {Promise<string>} Una promesa que se resuelve con una cadena JSON conteniendo los resultados de búsqueda en el formato: `[{"title": "Título", "image": "URL de imagen", "href": "URL"}, ...]`
 */
async function searchResults(keyword) {
    // Patrón regex actualizado para kaa.to
    const ANIME_REGEX = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*anime-card[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[\s\S]*?<\/a>/g;
    
    try {
        const response = await soraFetch(`${SEARCH_URL}${encodeURIComponent(keyword)}`);
        const html = typeof response === 'object' ? await response.text() : await response;

        const matches = html.matchAll(ANIME_REGEX);
        const matchesArray = Array.from(matches);
        const results = matchesArray.map(match => {
            return {
                title: match[3].trim(),
                image: match[2].startsWith('http') ? match[2] : BASE_URL + match[2].replace(/^\/+/, ''),
                href: match[1].startsWith('http') ? match[1] : BASE_URL + match[1].replace(/^\/+/, '')
            };
        });

        // Si no encontramos resultados con el patrón principal, intentamos con un patrón alternativo
        if (results.length === 0) {
            const ALT_REGEX = /<h3[^>]*class="[^"]*title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>[\s\S]*?<\/h3>/g;
            const altMatches = html.matchAll(ALT_REGEX);
            const altMatchesArray = Array.from(altMatches);
            
            return JSON.stringify(altMatchesArray.map(match => {
                return {
                    title: match[2].trim(),
                    image: BASE_URL + "assets/default-poster.jpg", // Imagen por defecto
                    href: match[1].startsWith('http') ? match[1] : BASE_URL + match[1].replace(/^\/+/, '')
                };
            }));
        }

        return JSON.stringify(results);

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
    const DETAILS_REGEX = /<div[^>]*class="[^"]*synopsis[^"]*"[^>]*>([\s\S]*?)<\/div>/;
    const GENRES_REGEX = /<span[^>]*class="[^"]*genre[^"]*"[^>]*>(.*?)<\/span>/g;
    const YEAR_REGEX = /(\d{4})/;

    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Extraer descripción
        const descMatch = html.match(DETAILS_REGEX);
        const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : 'Sin descripción disponible';

        // Extraer géneros
        const genreMatches = html.matchAll(GENRES_REGEX);
        const genres = Array.from(genreMatches).map(match => match[1].trim()).join(', ');

        // Extraer año
        const yearMatch = html.match(YEAR_REGEX);
        const airdate = yearMatch ? `Año: ${yearMatch[1]}` : 'Fecha: Desconocida';

        const details = {
            description: description,
            aliases: genres || 'Géneros: Desconocidos',
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
    const EPISODE_REGEX = /<a[^>]*href="([^"]*\/ep-(\d+)-[^"]*)"[^>]*>[\s\S]*?EP\s*(\d+)/g;

    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        const matches = html.matchAll(EPISODE_REGEX);
        const matchesArray = Array.from(matches);
        const episodes = matchesArray.map(match => {
            return {
                number: parseInt(match[3] || match[2]),
                href: match[1].startsWith('http') ? match[1] : BASE_URL + match[1].replace(/^\/+/, '')
            };
        });

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
    const IFRAME_REGEX = /<iframe[^>]*src="([^"]*)"[^>]*>/g;
    const M3U8_REGEX = /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/g;

    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Buscar enlaces m3u8 directamente en la página
        const m3u8Matches = html.matchAll(M3U8_REGEX);
        const m3u8Array = Array.from(m3u8Matches);
        
        if (m3u8Array.length > 0) {
            return m3u8Array[0][1];
        }

        // Si no encontramos m3u8, buscar iframes
        const iframeMatches = html.matchAll(IFRAME_REGEX);
        const iframeArray = Array.from(iframeMatches);
        
        for (const iframeMatch of iframeArray) {
            const iframeUrl = iframeMatch[1];
            
            try {
                // Intentar extraer stream del iframe
                const iframeResponse = await soraFetch(iframeUrl);
                const iframeHtml = typeof iframeResponse === 'object' ? await iframeResponse.text() : await iframeResponse;
                
                const iframeM3u8Matches = iframeHtml.matchAll(M3U8_REGEX);
                const iframeM3u8Array = Array.from(iframeM3u8Matches);
                
                if (iframeM3u8Array.length > 0) {
                    return iframeM3u8Array[0][1];
                }
            } catch (iframeError) {
                console.log('Error en iframe: ' + iframeError.message);
                continue;
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
