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
            title: `DEBUG: Buscando "${keyword}"`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://search-start"
        });
        
        // Debug 2: Check fetch methods available
        const hasFetchv2 = typeof fetchv2 !== 'undefined';
        const hasFetch = typeof fetch !== 'undefined';
        
        debugResults.push({
            title: `fetchv2: ${hasFetchv2 ? 'SI' : 'NO'} | fetch: ${hasFetch ? 'SI' : 'NO'}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://fetch-methods"
        });
        
        if (!hasFetchv2 && !hasFetch) {
            debugResults.push({
                title: "ERROR: No hay metodos de fetch disponibles",
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://no-fetch"
            });
            return JSON.stringify(debugResults);
        }
        
        // Debug 3: Try the actual search
        let response;
        let fetchMethod = "unknown";
        
        try {
            if (hasFetchv2) {
                fetchMethod = "fetchv2";
                debugResults.push({
                    title: "Intentando fetchv2...",
                    image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                    href: "debug://trying-fetchv2"
                });
                
                response = await fetchv2('https://kaa.to/api/search', {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }, 'POST', JSON.stringify({ query: keyword }));
                
                debugResults.push({
                    title: `fetchv2 ejecutado - tipo respuesta: ${typeof response}`,
                    image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                    href: "debug://fetchv2-executed"
                });
                
                // If fetchv2 returns data directly, wrap it
                if (response && typeof response === 'object' && !response.ok && !response.status) {
                    debugResults.push({
                        title: `fetchv2 retorno datos directos (${Array.isArray(response) ? response.length + ' items' : 'no-array'})`,
                        image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                        href: "debug://fetchv2-direct-data"
                    });
                    
                    if (Array.isArray(response) && response.length > 0) {
                        // Success case - show some real results
                        const results = response.slice(0, 2).map((item, index) => {
                            return {
                                title: `REAL ${index + 1}: ${item.title || item.title_en || "Sin titulo"}`,
                                image: `https://kaa.to/image/poster/${item.poster?.hq || item.poster?.sm || 'default'}.webp`,
                                href: `https://kaa.to/${item.slug}`
                            };
                        });
                        
                        debugResults.push({
                            title: `SUCCESS: Encontrados ${response.length} animes para "${keyword}"`,
                            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                            href: "debug://success"
                        });
                        
                        return JSON.stringify([...debugResults, ...results]);
                    } else {
                        debugResults.push({
                            title: "fetchv2 retorno array vacio",
                            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                            href: "debug://empty-array"
                        });
                        return JSON.stringify(debugResults);
                    }
                }
                
            } else if (hasFetch) {
                fetchMethod = "fetch";
                debugResults.push({
                    title: "Intentando fetch estandar...",
                    image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                    href: "debug://trying-fetch"
                });
                
                response = await fetch('https://kaa.to/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: keyword })
                });
                
                debugResults.push({
                    title: `fetch ejecutado - status: ${response?.status}`,
                    image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                    href: "debug://fetch-executed"
                });
            }
        } catch (fetchError) {
            debugResults.push({
                title: `ERROR en ${fetchMethod}: ${fetchError.message}`,
                image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                href: "debug://fetch-error"
            });
            
            return JSON.stringify(debugResults);
        }
        
        return JSON.stringify(debugResults);
        
    } catch (error) {
        return JSON.stringify([{
            title: `ERROR GENERAL: ${error.message}`,
            image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
            href: "debug://general-error"
        }]);
    }
}

// Required functions for Sora
async function extractDetails(url) {
    return JSON.stringify({
        title: "DEBUG MODE",
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
            title: "DEBUG - Episode Test",
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
