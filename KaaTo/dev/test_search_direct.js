// Test directo de la función searchResults
const { default: fetch } = require('node-fetch');

async function soraFetch(url, options = {}) {
    const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://kaa.to',
        'Referer': 'https://kaa.to/',
    };

    const finalOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    return fetch(url, finalOptions);
}

async function testSearchFunction() {
    console.log("🔍 TEST DIRECTO DE FUNCIÓN SEARCH");
    console.log("=================================");
    
    try {
        console.log("📡 Realizando request a la API...");
        
        const response = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/'
            },
            body: JSON.stringify({ query: "naruto" })
        });

        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`📊 Headers:`, response.headers.raw());

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Respuesta recibida`);
        console.log(`📊 Tipo: ${typeof data}, Array: ${Array.isArray(data)}, Longitud: ${data.length}`);
        
        // Verificar que la respuesta tiene datos
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No results found in API response');
        }
        
        console.log(`🎯 Procesando resultados...`);
        
        const results = data.map(item => {
            // Construir URL de imagen usando el poster
            let imageUrl = "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg";
            if (item.poster && item.poster.hq) {
                imageUrl = `https://kaa.to/image/${item.poster.hq}.webp`;
            }
            
            return {
                title: item.title || item.title_en || "Sin título",
                image: imageUrl,
                href: `https://kaa.to/${item.slug}`
            };
        });

        console.log(`✅ ÉXITO: ${results.length} resultados procesados`);
        console.log(`📺 Primer resultado:`, results[0]);
        
        return JSON.stringify(results);

    } catch (error) {
        console.log(`💥 ERROR: ${error.message}`);
        console.log(`📝 Stack: ${error.stack}`);
        return null;
    }
}

testSearchFunction().catch(console.error);
