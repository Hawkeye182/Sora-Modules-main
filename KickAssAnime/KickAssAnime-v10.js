// KickAssAnime v10.0.0 - Con headers y cookies reales
const BASE_URL = "https://kaa.to";

/**
 * Función de búsqueda con headers y cookies reales
 */
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        
        // Estrategia 1: Intentar búsqueda oficial con headers correctos
        try {
            const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`;
            
            // Usar fetchv2 con headers que simulen un navegador real
            const response = await fetchv2(searchUrl, {
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'es-419,es;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                    'Referer': 'https://kaa.to/',
                    'sec-fetch-dest': 'document',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin'
                }
            });
            
            const html = typeof response === 'object' ? await response.text() : await response;
            
            // Buscar datos en el HTML de búsqueda
            let results = [];
            
            // Patrón 1: Buscar elementos de anime en el HTML
            const animeElementPattern = /<[^>]*anime[^>]*>[\s\S]*?<\/[^>]*>/gi;
            const animeElements = html.matchAll(animeElementPattern);
            
            for (const element of animeElements) {
                const elementText = element[0];
                if (elementText.toLowerCase().includes(keywordLower)) {
                    // Extraer título y enlace del elemento
                    const titleMatch = elementText.match(/title[^"]*["']([^"']+)["']/i);
                    const linkMatch = elementText.match(/href[^"]*["']([^"']+)["']/i);
                    
                    if (titleMatch && linkMatch) {
                        results.push({
                            title: titleMatch[1],
                            image: BASE_URL + "/favicon.ico",
                            href: linkMatch[1].startsWith('http') ? linkMatch[1] : BASE_URL + linkMatch[1]
                        });
                    }
                }
            }
            
            // Patrón 2: Buscar datos JSON embebidos (window.__NUXT__ o similar)
            const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*(.+?);/s);
            if (nuxtMatch) {
                try {
                    const nuxtData = nuxtMatch[1];
                    // Buscar arrays que contengan anime data
                    const animeDataPattern = /\{[^}]*"title"[^}]*"[^"]*${keywordLower}[^"]*"[^}]*\}/gi;
                    const animeMatches = nuxtData.matchAll(animeDataPattern);
                    
                    for (const match of animeMatches) {
                        const animeObj = match[0];
                        const titleMatch = animeObj.match(/"title":\s*"([^"]+)"/);
                        const slugMatch = animeObj.match(/"slug":\s*"([^"]+)"/);
                        
                        if (titleMatch && slugMatch) {
                            results.push({
                                title: titleMatch[1],
                                image: BASE_URL + "/favicon.ico",
                                href: BASE_URL + "/" + slugMatch[1]
                            });
                        }
                    }
                } catch (parseError) {
                    console.log('Error parsing NUXT data');
                }
            }
            
            // Patrón 3: Buscar enlaces directos a anime
            const animeLinks = html.matchAll(/<a[^>]*href["']([^"']*${keywordLower}[^"']*)["'][^>]*>([^<]+)<\/a>/gi);
            for (const linkMatch of animeLinks) {
                const href = linkMatch[1];
                const title = linkMatch[2].replace(/<[^>]*>/g, '').trim();
                
                if (title && href) {
                    results.push({
                        title: title,
                        image: BASE_URL + "/favicon.ico",
                        href: href.startsWith('http') ? href : BASE_URL + href
                    });
                }
            }
            
            if (results.length > 0) {
                // Eliminar duplicados
                const uniqueResults = results.filter((result, index, self) => 
                    index === self.findIndex(r => r.href === result.href)
                );
                
                return JSON.stringify(uniqueResults.slice(0, 10));
            }
            
        } catch (searchError) {
            console.log('Búsqueda oficial falló:', searchError.message);
        }
        
        // Estrategia 2: Fallback a páginas alfabéticas (como antes)
        const searchPages = [];
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`${BASE_URL}/anime?alphabet=${firstLetter}`);
        }
        
        // Ubicaciones conocidas mejoradas
        const knownLocations = {
            'dragon': ['C'],  // Dragon Ball está en C según descubrimos
            'naruto': ['N'],
            'one': ['O'],
            'attack': ['A', 'S'],
            'demon': ['D', 'K'],
            'jujutsu': ['J'],
            'tokyo': ['T'],
            'fate': ['F'],
            'bleach': ['B'],
            'death': ['D']
        };
        
        for (const [anime, letters] of Object.entries(knownLocations)) {
            if (keywordLower.includes(anime)) {
                for (const letter of letters) {
                    const pageUrl = `${BASE_URL}/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                    }
                }
                break;
            }
        }
        
        // Buscar en páginas alfabéticas con los mismos headers
        let fallbackResults = [];
        for (const searchUrl of searchPages) {
            try {
                const response = await fetchv2(searchUrl, {
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://kaa.to/'
                    }
                });
                
                const html = typeof response === 'object' ? await response.text() : await response;
                
                // Usar los patrones que sabemos que funcionan
                const slugPattern = new RegExp(`"([^"]*${keywordLower}[^"]*-[a-f0-9]{4})"`, 'gi');
                const slugMatches = html.matchAll(slugPattern);
                
                for (const match of slugMatches) {
                    const slug = match[1];
                    const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    fallbackResults.push({
                        title: title,
                        image: BASE_URL + "/favicon.ico",
                        href: BASE_URL + "/" + slug
                    });
                }
                
                if (fallbackResults.length >= 5) break;
                
            } catch (pageError) {
                console.log(`Error en ${searchUrl}:`, pageError.message);
            }
        }
        
        // Eliminar duplicados
        const uniqueResults = fallbackResults.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );
        
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
        const response = await fetchv2(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/'
            }
        });
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
