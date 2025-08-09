// Test de la API de búsqueda KaaTo

async function testSearchAPI() {
    console.log('🔍 Probando API de búsqueda KaaTo...');
    
    try {
        // Test 1: API de búsqueda original (que funcionaba en v11.5.13)
        const query = 'naruto';
        const searchUrl = `https://kaa.to/api/search?q=${encodeURIComponent(query)}`;
        
        console.log('URL de búsqueda:', searchUrl);
        
        const response = await fetch(searchUrl, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/'
            }
        });
        
        console.log('Status de respuesta:', response.status);
        console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API de búsqueda funciona!');
            console.log('Estructura de datos:', Object.keys(data));
            console.log('Primeros 3 resultados:', data.data?.slice(0, 3));
        } else {
            console.log('❌ API de búsqueda falló');
            const text = await response.text();
            console.log('Respuesta:', text.substring(0, 500));
        }
        
    } catch (error) {
        console.error('❌ Error en test de búsqueda:', error.message);
    }
    
    // Test 2: Probar diferentes endpoints de búsqueda
    console.log('\n🔍 Probando endpoint alternativo...');
    
    try {
        const searchUrl2 = `https://kaa.to/search?query=naruto`;
        const response2 = await fetch(searchUrl2, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });
        
        console.log('Status HTML search:', response2.status);
        if (response2.ok) {
            const html = await response2.text();
            console.log('✅ Búsqueda HTML funciona, tamaño:', html.length);
            
            // Buscar elementos típicos de resultados
            const hasAnimeCards = html.includes('anime-card') || html.includes('search-result');
            const hasLinks = html.match(/<a[^>]+href="\/[^"\/]+"/g);
            
            console.log('Tiene tarjetas de anime:', hasAnimeCards);
            console.log('Enlaces encontrados:', hasLinks?.length || 0);
            
            if (hasLinks) {
                console.log('Ejemplos de enlaces:', hasLinks.slice(0, 3));
            }
        }
        
    } catch (error) {
        console.error('❌ Error en búsqueda HTML:', error.message);
    }
}

testSearchAPI();
