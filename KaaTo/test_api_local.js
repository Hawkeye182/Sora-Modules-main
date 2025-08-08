// Test local de la API de kaa.to
const https = require('https');

// Test 1: Búsqueda
function testSearch() {
    console.log("🔍 Probando búsqueda en kaa.to...");
    
    const postData = JSON.stringify({ query: "naruto" });
    
    const options = {
        hostname: 'kaa.to',
        port: 443,
        path: '/api/search',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };
    
    const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const results = JSON.parse(data);
                console.log(`✅ Búsqueda exitosa: ${results.length} resultados`);
                if (results.length > 0) {
                    console.log(`Primer resultado: ${results[0].title}`);
                    console.log(`Slug: ${results[0].slug}`);
                    console.log(`Poster: ${results[0].poster?.hq || 'N/A'}`);
                    
                    // Test detalles del primer anime
                    testDetails(results[0].slug);
                }
            } catch (error) {
                console.error("❌ Error parseando respuesta:", error.message);
                console.log("Respuesta raw:", data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error("❌ Error en búsqueda:", error.message);
    });
    
    req.write(postData);
    req.end();
}

// Test 2: Detalles de anime
function testDetails(slug) {
    console.log(`\n📋 Probando detalles para: ${slug}`);
    
    const options = {
        hostname: 'kaa.to',
        port: 443,
        path: `/api/show/${slug}`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };
    
    const req = https.request(options, (res) => {
        console.log(`Status detalles: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const details = JSON.parse(data);
                console.log(`✅ Detalles obtenidos para: ${details.title}`);
                console.log(`Descripción: ${details.description?.substring(0, 100)}...`);
                console.log(`Estado: ${details.status}`);
                console.log(`Géneros: ${details.genres?.join(', ')}`);
                
                // Test episodios
                testEpisodes(slug);
            } catch (error) {
                console.error("❌ Error parseando detalles:", error.message);
                console.log("Respuesta raw:", data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (error) => {
        console.error("❌ Error obteniendo detalles:", error.message);
    });
    
    req.end();
}

// Test 3: Episodios
function testEpisodes(slug) {
    console.log(`\n📺 Probando episodios para: ${slug}`);
    
    const options = {
        hostname: 'kaa.to',
        port: 443,
        path: `/api/show/${slug}/episodes`,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };
    
    const req = https.request(options, (res) => {
        console.log(`Status episodios: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const episodes = JSON.parse(data);
                console.log(`✅ ${episodes.length} episodios encontrados`);
                if (episodes.length > 0) {
                    console.log(`Primer episodio: ${episodes[0].title || episodes[0].episode}`);
                    console.log(`URL episodio: ${episodes[0].href || episodes[0].url}`);
                }
            } catch (error) {
                console.error("❌ Error parseando episodios:", error.message);
                console.log("Respuesta raw:", data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (error) => {
        console.error("❌ Error obteniendo episodios:", error.message);
    });
    
    req.end();
}

// Ejecutar tests
console.log("🚀 Iniciando tests de API kaa.to...");
testSearch();
