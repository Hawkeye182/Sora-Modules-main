// Función simple de fetch para pruebas
async function soraFetch(url, options = {}) {
    const fetch = await import('node-fetch').then(module => module.default);
    const response = await fetch(url, options);
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error response body:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    } else {
        return await response.text();
    }
}

// Función para diagnosticar problemas con la API
async function diagnoseAPI() {
    console.log('=== DIAGNOSING KAAT.TO API ===\n');
    
    // Primero intentemos acceder a la página principal
    try {
        console.log('🔍 Verificando acceso a kaa.to...');
        const mainPageResponse = await soraFetch('https://kaa.to/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
            }
        });
        console.log(`✅ Página principal accesible (${mainPageResponse.length} caracteres)`);
    } catch (error) {
        console.log(`❌ Error accediendo a página principal: ${error.message}`);
    }
    
    console.log('\n');
    
    // Intentar búsqueda simple
    try {
        console.log('🔍 Probando búsqueda simple...');
        const searchResponse = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Referer': 'https://kaa.to/',
                'Origin': 'https://kaa.to',
                'Accept-Language': 'es-419,es;q=0.9',
                'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            },
            body: JSON.stringify({ query: 'bleach' })
        });
        
        console.log('✅ Búsqueda exitosa');
        console.log(`Respuesta:`, JSON.stringify(searchResponse, null, 2));
        
    } catch (error) {
        console.log(`❌ Error en búsqueda: ${error.message}`);
    }
    
    console.log('\n');
    
    // Intentar con diferentes términos de búsqueda
    const testTerms = ['a', 'anime', 'test', ''];
    
    for (const term of testTerms) {
        try {
            console.log(`🔍 Probando búsqueda con: "${term}"`);
            const searchResponse = await soraFetch('https://kaa.to/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://kaa.to/',
                    'Origin': 'https://kaa.to'
                },
                body: JSON.stringify({ query: term })
            });
            
            if (searchResponse && searchResponse.data) {
                console.log(`   ✅ ${searchResponse.data.length} resultados encontrados`);
                if (searchResponse.data.length > 0) {
                    console.log(`   Primer resultado: ${searchResponse.data[0].attributes.title_en || searchResponse.data[0].attributes.title_jp}`);
                }
            } else {
                console.log(`   ❌ Respuesta sin datos válidos`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

// Ejecutar diagnóstico
diagnoseAPI().catch(console.error);
