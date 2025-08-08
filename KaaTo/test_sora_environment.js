// Simular el entorno de Sora para testing
import fetch from 'node-fetch';

// Simular fetchv2 de Sora (puede que no exista o tenga signatura diferente)
global.fetch = fetch;
// No definir fetchv2 para simular que no está disponible

// Cargar la función del módulo
async function soraFetch(url, options = {}) {
    try {
        console.log(`soraFetch: Attempting to fetch ${url}`);
        
        // Try fetchv2 first (Sora's preferred method)
        if (typeof fetchv2 !== 'undefined') {
            console.log('Using fetchv2');
            const response = await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
            console.log(`fetchv2 response:`, response);
            return response;
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
        // En lugar de devolver null, crear una respuesta de error simulada
        return {
            ok: false,
            status: 500,
            statusText: error.message,
            json: async () => { throw error; },
            text: async () => { throw error; }
        };
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

async function testModuleInSoraEnvironment() {
    console.log('🧪 PROBANDO MÓDULO EN ENTORNO SIMULADO DE SORA');
    console.log('===============================================');
    
    const testQueries = ['bleach', 'naruto', 'dragon'];
    
    for (const query of testQueries) {
        console.log(`\n--- PROBANDO: "${query}" ---`);
        try {
            const result = await searchResults(query);
            console.log(`✅ Respuesta del módulo:`, result);
            
            const parsed = JSON.parse(result);
            if (parsed.length > 0) {
                console.log(`🎯 ${parsed.length} resultados encontrados`);
                console.log(`Primer resultado: ${parsed[0].title}`);
            } else {
                console.log('❌ Sin resultados');
            }
        } catch (error) {
            console.log(`❌ Error en el módulo: ${error.message}`);
        }
    }
}

testModuleInSoraEnvironment();
