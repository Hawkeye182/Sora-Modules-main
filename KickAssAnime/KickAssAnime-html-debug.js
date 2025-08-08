// KickAssAnime - Módulo de debug que muestra HTML real
const BASE_URL = "https://kaa.to/";

/**
 * Función de búsqueda que muestra el HTML real recibido
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([{
                title: "❌ No keyword provided",
                image: BASE_URL + "favicon.ico",
                href: "https://debug.nokeyword"
            }]);
        }

        // Probar con una página simple para ver el HTML real
        try {
            const testUrl = "https://kaa.to/anime?alphabet=N";
            const response = await fetchv2(testUrl);
            const html = await response.text();
            
            // Mostrar información sobre el HTML recibido
            const results = [];
            
            // Primer resultado: información básica
            results.push({
                title: `📄 HTML Length: ${html.length} chars`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.length"
            });
            
            // Segundo resultado: primeros caracteres
            const first100 = html.substring(0, 100).replace(/[\r\n\t]/g, ' ').trim();
            results.push({
                title: `🔤 First 100: ${first100}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.first100"
            });
            
            // Tercer resultado: buscar patrones conocidos
            const hasNaruto = html.includes('Naruto');
            const hasYear = html.includes('[2002]');
            const hasLinks = html.includes('kaa.to/');
            results.push({
                title: `🔍 Contains: Naruto=${hasNaruto} | [2002]=${hasYear} | Links=${hasLinks}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.contains"
            });
            
            // Cuarto resultado: buscar diferentes patrones de links
            const linkPatterns = [
                html.match(/\[(\d{4})\]\((https:\/\/kaa\.to\/[^)]+)\)/g)?.length || 0,
                html.match(/href="([^"]*kaa\.to[^"]*)"/g)?.length || 0,
                html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*Naruto[^<]*)<\/a>/gi)?.length || 0
            ];
            results.push({
                title: `🔗 Link patterns: ${linkPatterns[0]} | ${linkPatterns[1]} | ${linkPatterns[2]}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.patterns"
            });
            
            // Quinto resultado: mostrar una muestra del HTML donde debería estar Naruto
            const narutoIndex = html.toLowerCase().indexOf('naruto');
            if (narutoIndex >= 0) {
                const start = Math.max(0, narutoIndex - 50);
                const end = Math.min(html.length, narutoIndex + 100);
                const sample = html.substring(start, end).replace(/[\r\n\t]/g, ' ').trim();
                results.push({
                    title: `📝 Naruto context: ${sample}`,
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.narutocontext"
                });
            } else {
                results.push({
                    title: "❌ No 'Naruto' found in HTML",
                    image: BASE_URL + "favicon.ico",
                    href: "https://debug.nonaruto"
                });
            }
            
            // Intentar diferentes regex para ver si alguno funciona
            const regexTests = [
                // Original
                html.match(/\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g)?.length || 0,
                // Sin ## requirement
                html.match(/\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)/g)?.length || 0,
                // HTML links
                html.match(/<a[^>]*href="(https:\/\/kaa\.to\/[^"]*)"[^>]*>([^<]*)<\/a>/g)?.length || 0
            ];
            
            results.push({
                title: `🧪 Regex tests: ${regexTests[0]} | ${regexTests[1]} | ${regexTests[2]}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.regex"
            });
            
            return JSON.stringify(results);
            
        } catch (fetchError) {
            return JSON.stringify([{
                title: `❌ Fetch error: ${fetchError.message}`,
                image: BASE_URL + "favicon.ico",
                href: "https://debug.fetcherror"
            }]);
        }

    } catch (error) {
        return JSON.stringify([{
            title: `💥 General error: ${error.message}`,
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
        description: "HTML Debug description",
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
