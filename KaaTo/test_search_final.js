import fetch from 'node-fetch';

// Simular soraFetch para testing
function soraFetch(url, options) {
    return fetch(url, options);
}

// Función searchResults corregida
async function searchResults(keyword) {
    try {
        console.log(`🔍 Searching for: "${keyword}"`);
        
        const response = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                query: keyword
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ API returned ${Array.isArray(data) ? data.length : 0} results`);
        
        if (!Array.isArray(data) || data.length === 0) {
            console.log('❌ No results from API');
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

        console.log(`🎯 Returning ${results.length} formatted results`);
        return JSON.stringify(results);

    } catch (error) {
        console.log(`❌ Search failed: ${error.message}`);
        return JSON.stringify([]);
    }
}

async function testSearchFunction() {
    console.log('🧪 PROBANDO FUNCIÓN SEARCHRESULTS CORREGIDA');
    console.log('==========================================');
    
    const testQueries = ['bleach', 'naruto', 'dragon'];
    
    for (const query of testQueries) {
        console.log(`\n--- PROBANDO: "${query}" ---`);
        try {
            const result = await searchResults(query);
            const parsed = JSON.parse(result);
            
            if (parsed.length > 0) {
                console.log(`✅ Encontrados ${parsed.length} resultados`);
                const first = parsed[0];
                console.log(`📺 Primer resultado: "${first.title}"`);
                console.log(`🖼️ Imagen: ${first.image}`);
                console.log(`🔗 Link: ${first.href}`);
                
                // Verificar si la imagen funciona
                if (first.image.includes('kaa.to/image/poster/')) {
                    try {
                        const imgTest = await fetch(first.image, { method: 'HEAD' });
                        console.log(`🖼️ Imagen status: ${imgTest.status} ${imgTest.status === 200 ? '✅' : '❌'}`);
                    } catch (e) {
                        console.log(`🖼️ Imagen error: ${e.message}`);
                    }
                }
            } else {
                console.log('❌ Sin resultados');
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

testSearchFunction();
