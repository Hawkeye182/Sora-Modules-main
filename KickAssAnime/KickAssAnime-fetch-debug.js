// KickAssAnime - Módulo de debug con fetch correcto para Sora
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda con fetch nativo
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([{
                title: "❌ DEBUG: No keyword provided",
                image: BASE_URL + "favicon.ico",
                href: "https://debug.nokeyword"
            }]);
        }

        // Probar diferentes métodos de fetch disponibles en Sora
        let fetchFunction = null;
        let fetchMethod = "unknown";
        
        // Intentar detectar qué función de fetch está disponible
        if (typeof fetchv2 !== 'undefined') {
            fetchFunction = fetchv2;
            fetchMethod = "fetchv2";
        } else if (typeof fetch !== 'undefined') {
            fetchFunction = fetch;
            fetchMethod = "fetch";
        } else if (typeof soraFetch !== 'undefined') {
            fetchFunction = soraFetch;
            fetchMethod = "soraFetch";
        }
        
        if (!fetchFunction) {
            return JSON.stringify([{
                title: "❌ DEBUG: No fetch function available",
                image: BASE_URL + "favicon.ico",
                href: "https://debug.nofetch"
            }]);
        }

        // Probar una URL simple
        try {
            const testUrl = "https://kaa.to/anime?alphabet=N";
            
            return JSON.stringify([{
                title: `🔍 DEBUG: Using ${fetchMethod}, testing ${testUrl}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.testing"
            }]);
            
            const response = await fetchFunction(testUrl);
            
            if (!response) {
                return JSON.stringify([{
                    title: `❌ DEBUG: ${fetchMethod} returned null`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.nullresponse"
                }]);
            }
            
            // Intentar obtener el texto de diferentes maneras
            let html = "";
            let textMethod = "unknown";
            
            if (typeof response.text === 'function') {
                html = await response.text();
                textMethod = "response.text()";
            } else if (typeof response === 'string') {
                html = response;
                textMethod = "direct string";
            } else if (response.body) {
                html = response.body;
                textMethod = "response.body";
            }
            
            if (!html) {
                return JSON.stringify([{
                    title: `❌ DEBUG: No HTML from ${textMethod}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.nohtml"
                }]);
            }
            
            return JSON.stringify([
                {
                    title: `✅ DEBUG: ${fetchMethod} + ${textMethod} success`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.success"
                },
                {
                    title: `HTML length: ${html.length} chars`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.length"
                },
                {
                    title: `First 50: ${html.substring(0, 50).replace(/\n/g, ' ')}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.first50"
                },
                {
                    title: `Contains [2002]: ${html.includes('[2002]')} | Naruto: ${html.includes('Naruto')}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.contains"
                }
            ]);
            
        } catch (fetchError) {
            return JSON.stringify([{
                title: `❌ DEBUG: ${fetchMethod} error: ${fetchError.message}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.fetcherror"
            }]);
        }

    } catch (error) {
        return JSON.stringify([{
            title: `💥 DEBUG: General error: ${error.message}`,
            image: BASE_URL + "favicon.ico",
            href: "https://debug.generalerror"
        }]);
    }
}

/**
 * Extraer detalles básicos
 */
async function extractDetails(url) {
    return JSON.stringify([{
        description: "Fetch debug description",
        aliases: "Debug",
        airdate: "2024"
    }]);
}

/**
 * Extraer episodios básicos
 */
async function extractEpisodes(url) {
    return JSON.stringify([{
        title: "Debug Episode 1",
        href: url + "/episode-1"
    }]);
}

/**
 * Extraer URL de stream básica
 */
async function extractStreamUrl(url) {
    return JSON.stringify([{
        streamUrl: "https://example.com/debug.m3u8",
        quality: "1080p"
    }]);
}
