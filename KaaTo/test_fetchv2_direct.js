import fetch from 'node-fetch';

// Simular entorno con fetchv2 que retorna data directamente
global.fetch = fetch;

// Simular fetchv2 que retorna data directamente (como puede ser en Sora)
global.fetchv2 = async function(url, headers, method, body) {
    console.log(`fetchv2 llamado con: ${method} ${url}`);
    
    const response = await fetch(url, {
        method: method || 'GET',
        headers: headers || {},
        body: body
    });
    
    if (response.ok) {
        // fetchv2 retorna data directamente, no un Response object
        const data = await response.json();
        console.log(`fetchv2 retornando data directamente:`, data);
        return data;
    } else {
        throw new Error(`HTTP ${response.status}`);
    }
};

// Cargar funciones del módulo
async function soraFetch(url, options = {}) {
    try {
        console.log(`soraFetch: Attempting to fetch ${url}`);
        
        // Try fetchv2 first (Sora's preferred method) 
        // fetchv2 might return data directly, not a Response object
        if (typeof fetchv2 !== 'undefined') {
            console.log('Using fetchv2');
            const result = await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
            console.log(`fetchv2 result:`, result);
            
            // If fetchv2 returns data directly (not a Response object), wrap it
            if (result && typeof result === 'object' && !result.ok && !result.status) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => result,
                    text: async () => JSON.stringify(result)
                };
            }
            
            return result;
        }
        
        // Fallback to standard fetch
        if (typeof fetch !== 'undefined') {
            console.log('Using standard fetch');
            const response = await fetch(url, options);
            console.log(`fetch response status: ${response.status}`);
            return response;
        }
        
        throw new Error('No fetch method available');
    } catch(error) {
        console.log(`soraFetch error: ${error.message}`);
        return null; // Return null like HikariTv does
    }
}

async function searchResults(keyword) {
    try {
        console.log(`Searching for: ${keyword}`);
        
        const response = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/'
            },
            body: JSON.stringify({ query: keyword })
        });

        // Handle case where soraFetch returns null (error)
        if (!response) {
            console.log('soraFetch returned null - network error');
            return JSON.stringify([]);
        }

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        console.log(`API returned ${Array.isArray(data) ? data.length : 0} results`);
        
        // Verificar que la respuesta tiene datos
        if (!Array.isArray(data) || data.length === 0) {
            console.log('No results from API');
            return JSON.stringify([]);
        }
        
        const results = data.map(item => {
            // Construir URL de imagen usando el poster real - FORMATO CORREGIDO
            let imageUrl = "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg";
            if (item.poster && item.poster.hq) {
                imageUrl = `https://kaa.to/image/poster/${item.poster.hq}.webp`;
            } else if (item.poster && item.poster.sm) {
                imageUrl = `https://kaa.to/image/poster/${item.poster.sm}.webp`;
            }
            
            return {
                title: item.title || item.title_en || "Sin título",
                image: imageUrl,
                href: `https://kaa.to/${item.slug}`
            };
        });

        console.log(`Returning ${results.length} formatted results`);
        return JSON.stringify(results);

    } catch (error) {
        console.log(`Search failed: ${error.message}`);
        return JSON.stringify([]);
    }
}

async function testWithFetchv2() {
    console.log('🧪 PROBANDO CON FETCHV2 QUE RETORNA DATA DIRECTAMENTE');
    console.log('===================================================');
    
    const testQueries = ['bleach'];
    
    for (const query of testQueries) {
        console.log(`\n--- PROBANDO: "${query}" ---`);
        try {
            const result = await searchResults(query);
            console.log(`✅ Resultado final:`, result);
            
            const parsed = JSON.parse(result);
            if (parsed.length > 0) {
                console.log(`🎯 ${parsed.length} resultados encontrados`);
                console.log(`Primer resultado: ${parsed[0].title}`);
                console.log(`Imagen: ${parsed[0].image}`);
            } else {
                console.log('❌ Sin resultados');
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

testWithFetchv2();
