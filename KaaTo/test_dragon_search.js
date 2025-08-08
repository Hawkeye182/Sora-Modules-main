// Test específico para 'dragon' para ver cuántos resultados retorna
const https = require('https');

const postData = JSON.stringify({ query: 'dragon' });

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
            console.log(`\n🔍 Resultados para 'dragon': ${results.length} animes encontrados`);
            console.log('\n📋 Lista completa:');
            results.forEach((anime, i) => {
                console.log(`${i+1}. ${anime.title} (${anime.slug})`);
            });
            
            console.log('\n📊 Análisis:');
            console.log(`- Total resultados: ${results.length}`);
            console.log(`- Primera página o resultados limitados?`);
        } catch (error) {
            console.error("❌ Error parseando respuesta:", error.message);
            console.log("Respuesta raw:", data.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.error("❌ Error en búsqueda:", error.message);
});

req.write(postData);
req.end();
