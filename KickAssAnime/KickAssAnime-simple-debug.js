// KickAssAnime - Módulo de debug simple para Sora
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda ultra-simple con debug específico
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

        // Probar solo una URL simple primero
        try {
            const testUrl = "https://kaa.to/anime?alphabet=N";
            
            const response = await soraFetch(testUrl);
            
            if (!response) {
                return JSON.stringify([{
                    title: "❌ DEBUG: soraFetch returned null",
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.nullresponse"
                }]);
            }
            
            const html = await response.text();
            
            if (!html) {
                return JSON.stringify([{
                    title: "❌ DEBUG: HTML is empty",
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.emptyhtml"
                }]);
            }
            
            return JSON.stringify([
                {
                    title: `✅ DEBUG: HTML received (${html.length} chars)`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.htmlreceived"
                },
                {
                    title: `First 50 chars: ${html.substring(0, 50).replace(/\n/g, ' ')}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.firstchars"
                },
                {
                    title: `Contains '[2002]': ${html.includes('[2002]')}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.contains2002"
                },
                {
                    title: `Contains 'Naruto': ${html.includes('Naruto')}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.containsnaruto"
                }
            ]);
            
        } catch (fetchError) {
            return JSON.stringify([{
                title: `❌ DEBUG: Fetch error: ${fetchError.message}`,
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
        description: "Simple debug description",
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
