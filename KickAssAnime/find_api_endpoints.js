// Investigar el API real de kaa.to
const https = require('https');

async function realFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'identity',
                'Connection': 'keep-alive',
                'Referer': 'https://kaa.to/search/naruto',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            }
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function findApiEndpoints() {
    console.log('🔍 BUSCANDO EL API REAL DE KAA.TO\n');
    console.log('=' .repeat(50));
    
    const apiEndpoints = [
        // Endpoints posibles basados en patrones comunes
        '/api/search?q=naruto',
        '/api/search/naruto',
        '/api/anime/search?q=naruto',
        '/api/anime/search/naruto',
        '/api/v1/search?q=naruto',
        '/api/v1/anime/search?q=naruto',
        '/search-api?q=naruto',
        '/search-api/naruto',
        
        // Endpoints específicos que podrían existir
        '/api/anime?search=naruto',
        '/api/anime?q=naruto',
        '/api/animes?search=naruto',
        '/search/api?q=naruto',
        
        // Basado en otros sitios similares
        '/ajax/search?keyword=naruto',
        '/ajax/search/naruto',
        '/_next/data/search/naruto.json',
        
        // Posibles endpoints de datos
        '/data/search?q=naruto',
        '/json/search?q=naruto'
    ];
    
    console.log('📡 Probando múltiples endpoints de API...\n');
    
    for (const endpoint of apiEndpoints) {
        try {
            const result = await realFetch(`https://kaa.to${endpoint}`);
            
            let status = '';
            if (result.status === 200) status = '✅ 200 OK';
            else if (result.status === 404) status = '❌ 404';
            else if (result.status === 500) status = '⚠️ 500';
            else status = `❓ ${result.status}`;
            
            console.log(`${status} ${endpoint}`);
            
            // Si es exitoso, analizar el contenido
            if (result.status === 200) {
                console.log(`   📊 Length: ${result.body.length}`);
                console.log(`   📄 Content-Type: ${result.headers['content-type']}`);
                
                // Verificar si contiene JSON
                try {
                    const jsonData = JSON.parse(result.body);
                    console.log(`   ✅ JSON válido!`);
                    console.log(`   🔍 Keys: ${Object.keys(jsonData).join(', ')}`);
                    
                    // Buscar datos de anime
                    const jsonStr = JSON.stringify(jsonData);
                    if (jsonStr.toLowerCase().includes('naruto')) {
                        console.log(`   🎯 ¡Contiene datos de naruto!`);
                        console.log(`   📋 Datos: ${result.body.substring(0, 300)}...`);
                    }
                } catch (parseError) {
                    // Si no es JSON, verificar si contiene "naruto"
                    if (result.body.toLowerCase().includes('naruto')) {
                        console.log(`   🎯 ¡Contiene "naruto"!`);
                        console.log(`   📋 Primeros 200 chars: ${result.body.substring(0, 200)}...`);
                    }
                }
            }
            
            // Pequeña pausa para no sobrecargar el servidor
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.log(`❌ Error ${endpoint}: ${error.message}`);
        }
    }
    
    console.log('\n🔍 ANÁLISIS ADICIONAL');
    console.log('=' .repeat(30));
    
    // Intentar también con diferentes términos de búsqueda
    const searchTerms = ['one-piece', 'dragon-ball', 'attack-on-titan'];
    
    for (const term of searchTerms) {
        console.log(`\n📡 Probando con "${term}":`);
        
        const testEndpoints = [
            `/api/search?q=${term}`,
            `/search/${term}`,
            `/api/anime/search?q=${term}`
        ];
        
        for (const endpoint of testEndpoints) {
            try {
                const result = await realFetch(`https://kaa.to${endpoint}`);
                if (result.status === 200 && result.body.toLowerCase().includes(term.replace('-', ' '))) {
                    console.log(`   ✅ ${endpoint} - ¡Funciona con ${term}!`);
                    console.log(`   📋 ${result.body.substring(0, 150)}...`);
                }
            } catch (error) {
                // Ignorar errores en este bucle
            }
        }
    }
}

findApiEndpoints();
