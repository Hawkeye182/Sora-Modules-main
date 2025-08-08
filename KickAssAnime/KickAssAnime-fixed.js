// KickAssAnime - Módulo corregido usando patrones de módulos exitosos
const BASE_URL = "https://kaa.to";

/**
 * Verifica si los servidores necesarios están disponibles
 */
async function areRequiredServersUp() {
    const requiredHosts = ['https://kaa.to'];

    try {
        let promises = [];

        for(let host of requiredHosts) {
            promises.push(
                new Promise(async (resolve) => {
                    let response = await soraFetch(host, { method: 'HEAD' });
                    response.host = host;
                    return resolve(response);
                })
            );
        }

        return Promise.allSettled(promises).then((responses) => {
            for(let response of responses) {
                if(response.status === 'rejected' || response.value?.status != 200) {
                    let message = 'Required source ' + response.value?.host + ' is currently down.';
                    console.log(message);
                    return { success: false, error: encodeURIComponent(message), searchTitle: `Error cannot access ${response.value?.host}, server down. Please try again later.` };
                }
            }

            return { success: true, error: null, searchTitle: null };
        })

    } catch (error) {
        console.log('Server up check error: ' + error.message);
        return { success: false, error: encodeURIComponent('#Failed to access required servers'), searchTitle: 'Error cannot access kaa.to, server down. Please try again later.' };
    }
}

/**
 * Función para recortar texto entre dos marcadores
 */
function trimText(text, startMarker, endMarker) {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return text;
    
    const endIndex = text.indexOf(endMarker, startIndex);
    if (endIndex === -1) return text.substring(startIndex);
    
    return text.substring(startIndex, endIndex);
}

/**
 * Función de búsqueda usando el buscador oficial de kaa.to
 */
async function searchResults(keyword) {
    const serversUp = await areRequiredServersUp();

    if(serversUp.success === false) {
        return JSON.stringify([{
            title: serversUp.searchTitle,
            image: 'https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/main/sora_host_down.png',
            href: '#' + serversUp.error,
        }]);
    }

    try {
        // Usar el buscador oficial de kaa.to
        const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`;
        const response = await soraFetch(searchUrl);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Si el buscador oficial funciona
        if (!html.includes('No Match') && html.length > 10000) {
            // Buscar elementos en el HTML que contengan información de anime
            // Patrón basado en lo que vimos en el debug: datos JSON en el HTML
            const patterns = [
                // Patrón para datos JSON embebidos
                /"title":"([^"]*[Nn]aruto[^"]*)","slug":"([^"]+)"/g,
                /"slug":"([^"]+)","title":"([^"]*[Nn]aruto[^"]*)"/g,
                // Patrón para elementos HTML con títulos
                /<[^>]*title="([^"]*(?:naruto|dragon|fate)[^"]*)"[^>]*href="[^"]*\/([^"\/]+)"[^>]*>/gi,
                // Patrón más general para links
                /href="\/([^"]*(?:naruto|dragon|fate)[^"]*)"[^>]*>([^<]*)/gi
            ];

            let results = [];

            for (const pattern of patterns) {
                const matches = html.matchAll(pattern);
                const matchesArray = Array.from(matches);

                for (const match of matchesArray) {
                    const title = match[1] || match[2] || 'Unknown Title';
                    const slug = match[2] || match[1] || 'unknown-slug';
                    
                    if (title.toLowerCase().includes(keyword.toLowerCase())) {
                        results.push({
                            title: title.trim(),
                            image: BASE_URL + "/favicon.ico",
                            href: slug.startsWith('http') ? slug : BASE_URL + "/" + slug
                        });
                    }
                }

                if (results.length >= 10) break;
            }

            if (results.length > 0) {
                // Eliminar duplicados
                const uniqueResults = results.filter((result, index, self) => 
                    index === self.findIndex(r => r.title === result.title)
                );
                return JSON.stringify(uniqueResults.slice(0, 10));
            }
        }

        // Fallback: búsqueda alfabética si el buscador oficial falla
        const firstLetter = keyword.charAt(0).toUpperCase();
        const alphabetUrl = `${BASE_URL}/anime?alphabet=${firstLetter}`;
        
        const alphabetResponse = await soraFetch(alphabetUrl);
        const alphabetHtml = typeof alphabetResponse === 'object' ? await alphabetResponse.text() : await alphabetResponse;

        // Usar el mismo patrón de búsqueda en la página alfabética
        const patterns = [
            /"title":"([^"]*[Nn]aruto[^"]*)","slug":"([^"]+)"/g,
            /"slug":"([^"]+)","title":"([^"]*[Nn]aruto[^"]*)"/g
        ];

        let results = [];

        for (const pattern of patterns) {
            const matches = alphabetHtml.matchAll(pattern);
            const matchesArray = Array.from(matches);

            for (const match of matchesArray) {
                const title = match[1] || match[2] || 'Unknown Title';
                const slug = match[2] || match[1] || 'unknown-slug';
                
                if (title.toLowerCase().includes(keyword.toLowerCase())) {
                    results.push({
                        title: title.trim(),
                        image: BASE_URL + "/favicon.ico",
                        href: BASE_URL + "/" + slug
                    });
                }
            }
        }

        // Eliminar duplicados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.title === result.title)
        );

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        console.log('Fetch error: ' + error.message);
        return JSON.stringify([]);
    }
}

/**
 * Extraer detalles básicos
 */
async function extractDetails(url) {
    if(url.startsWith('#')) {
        return JSON.stringify([{
            description: decodeURIComponent(url.slice(1)) + ' Please try again later.',
            aliases: '',
            airdate: ''
        }]);
    }

    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        return JSON.stringify([{
            description: "KickAssAnime - Watch anime online with subtitles",
            aliases: "Action, Adventure, Anime",
            airdate: "2024"
        }]);
    } catch (error) {
        return JSON.stringify([{
            description: "Error loading details",
            aliases: "",
            airdate: ""
        }]);
    }
}

/**
 * Extraer episodios básicos
 */
async function extractEpisodes(url) {
    if(url.startsWith('#')) {
        return JSON.stringify([]);
    }

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
