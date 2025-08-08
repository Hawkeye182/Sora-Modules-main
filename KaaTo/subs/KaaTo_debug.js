// KaaTo Module for Sora - DEBUG VERSION
// Shows debug information as anime results

/**
 * Debug version that shows what's happening in the search
 */
async function searchResults(keyword) {
    const debugResults = [];
    
    try {
        // Debug 1: Show what we received
        debugResults.push({
            title: `🔍 DEBUG: Buscando "${keyword}"`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://search-start"
        });
        
        // Debug 2: Check fetch methods available
        const hasFetchv2 = typeof fetchv2 !== 'undefined';
        const hasFetch = typeof fetch !== 'undefined';
        
        debugResults.push({
            title: `📡 fetchv2: ${hasFetchv2 ? '✅' : '❌'} | fetch: ${hasFetch ? '✅' : '❌'}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://fetch-methods"
        });
        
        // Debug 3: Try the actual search
        let response;
        let fetchMethod = "unknown";
        
        try {
            if (hasFetchv2) {
                fetchMethod = "fetchv2";
                response = await fetchv2('https://kaa.to/api/search', {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }, 'POST', JSON.stringify({ query: keyword }));
                
                debugResults.push({
                    title: `🚀 fetchv2 ejecutado - tipo: ${typeof response}`,
                    image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                    href: "debug://fetchv2-executed"
                });
                
                // If fetchv2 returns data directly, wrap it
                if (response && typeof response === 'object' && !response.ok && !response.status) {
                    debugResults.push({
                        title: `📦 fetchv2 retornó datos directos (${Array.isArray(response) ? response.length : 'no-array'})`,
                        image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                        href: "debug://fetchv2-direct-data"
                    });
                    
                    response = {
                        ok: true,
                        status: 200,
                        json: async () => response,
                        text: async () => JSON.stringify(response)
                    };
                }
                
            } else if (hasFetch) {
                fetchMethod = "fetch";
                response = await fetch('https://kaa.to/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    body: JSON.stringify({ query: keyword })
                });
                
                debugResults.push({
                    title: `🚀 fetch ejecutado - status: ${response?.status}`,
                    image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                    href: "debug://fetch-executed"
                });
            } else {
                throw new Error("No fetch method available");
            }
        } catch (fetchError) {
            debugResults.push({
                title: `❌ Error en ${fetchMethod}: ${fetchError.message}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://fetch-error"
            });
            
            return JSON.stringify(debugResults);
        }
        
        // Debug 4: Check response
        if (!response) {
            debugResults.push({
                title: `⚠️ Response es null`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://response-null"
            });
            return JSON.stringify(debugResults);
        }
        
        debugResults.push({
            title: `📋 Response OK: ${response.ok} | Status: ${response.status}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://response-status"
        });
        
        if (!response.ok) {
            debugResults.push({
                title: `❌ HTTP Error: ${response.status}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://http-error"
            });
            return JSON.stringify(debugResults);
        }
        
        // Debug 5: Try to get JSON data
        let data;
        try {
            data = await response.json();
            debugResults.push({
                title: `📄 JSON obtenido - tipo: ${typeof data} | array: ${Array.isArray(data)}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://json-obtained"
            });
        } catch (jsonError) {
            debugResults.push({
                title: `❌ Error al parsear JSON: ${jsonError.message}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://json-error"
            });
            return JSON.stringify(debugResults);
        }
        
        // Debug 6: Check data content
        if (!Array.isArray(data)) {
            debugResults.push({
                title: `⚠️ Data no es array: ${typeof data}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://data-not-array"
            });
            return JSON.stringify(debugResults);
        }
        
        debugResults.push({
            title: `✅ Datos OK - ${data.length} resultados encontrados`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://data-ok"
        });
        
        if (data.length === 0) {
            debugResults.push({
                title: `⚠️ API retornó 0 resultados para "${keyword}"`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://no-results"
            });
            return JSON.stringify(debugResults);
        }
        
        // Debug 7: Show first result structure
        const firstItem = data[0];
        debugResults.push({
            title: `🔬 Primer resultado: ${firstItem.title || firstItem.title_en || 'sin-titulo'}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://first-result"
        });
        
        debugResults.push({
            title: `🖼️ Poster: ${firstItem.poster ? (firstItem.poster.hq || firstItem.poster.sm || 'sin-poster') : 'no-poster-field'}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://poster-info"
        });
        
        // Debug 8: Try to format results
        try {
            const results = data.slice(0, 3).map((item, index) => {
                let imageUrl = "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg";
                if (item.poster && item.poster.hq) {
                    imageUrl = `https://kaa.to/image/poster/${item.poster.hq}.webp`;
                } else if (item.poster && item.poster.sm) {
                    imageUrl = `https://kaa.to/image/poster/${item.poster.sm}.webp`;
                }
                
                return {
                    title: `${index + 1}. ${item.title || item.title_en || "Sin título"}`,
                    image: imageUrl,
                    href: `https://kaa.to/${item.slug}`
                };
            });
            
            debugResults.push({
                title: `✅ Formateados ${results.length} resultados exitosamente`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://format-success"
            });
            
            // Return debug info + actual results
            return JSON.stringify([...debugResults, ...results]);
            
        } catch (formatError) {
            debugResults.push({
                title: `❌ Error al formatear: ${formatError.message}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://format-error"
            });
            return JSON.stringify(debugResults);
        }
        
    } catch (error) {
        debugResults.push({
            title: `💥 Error general: ${error.message}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://general-error"
        });
        return JSON.stringify(debugResults);
    }
}

// Dummy functions for debugging
async function extractDetails(url) {
    return JSON.stringify({
        title: "🔧 DEBUG MODE",
        description: `URL recibida: ${url}`,
        release: "2024",
        status: "Debug activo",
        genres: ["Debug", "Testing"]
    });
}

async function extractEpisodes(url) {
    return JSON.stringify([
        {
            number: "1",
            title: "🔧 DEBUG - Episode Test",
            href: `${url}/episode/debug-test`
        }
    ]);
}

async function extractStreamUrl(url) {
    return JSON.stringify([
        {
            quality: "DEBUG",
            url: "debug://stream-test",
            headers: {}
        }
    ]);
}
