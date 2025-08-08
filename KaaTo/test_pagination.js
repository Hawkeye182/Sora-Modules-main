// Test con parámetros de paginación para obtener más resultados
const https = require('https');

async function testWithPagination() {
    // Test 1: Parámetros básicos con limit
    console.log("🔍 Test 1: Con parámetro limit...");
    await testSearch({ query: 'dragon', limit: 20 });
    
    // Test 2: Con página y límite
    console.log("\n🔍 Test 2: Con page y limit...");
    await testSearch({ query: 'dragon', page: 1, limit: 20 });
    
    // Test 3: Con offset
    console.log("\n🔍 Test 3: Con offset...");
    await testSearch({ query: 'dragon', offset: 0, limit: 20 });
    
    // Test 4: Parámetros tipo GET con query string
    console.log("\n🔍 Test 4: Usando GET con query string...");
    await testSearchGET('dragon', 'limit=20');
}

function testSearch(payload) {
    return new Promise((resolve) => {
        const postData = JSON.stringify(payload);
        
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
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    console.log(`Payload: ${JSON.stringify(payload)}`);
                    console.log(`Resultados: ${results.length}`);
                    if (results.length > 5) {
                        console.log(`✅ ¡Más resultados! Títulos 6-10:`);
                        results.slice(5, 10).forEach((anime, i) => {
                            console.log(`  ${i+6}. ${anime.title}`);
                        });
                    }
                } catch (error) {
                    console.log(`Error: ${error.message}`);
                }
                resolve();
            });
        });
        
        req.write(postData);
        req.end();
    });
}

function testSearchGET(query, params) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'kaa.to',
            port: 443,
            path: `/api/search?q=${encodeURIComponent(query)}&${params}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    console.log(`GET query: q=${query}&${params}`);
                    console.log(`Resultados: ${results.length}`);
                    if (results.length > 5) {
                        console.log(`✅ ¡Más resultados con GET!`);
                    }
                } catch (error) {
                    console.log(`Error: ${error.message}`);
                }
                resolve();
            });
        });
        
        req.end();
    });
}

testWithPagination();
