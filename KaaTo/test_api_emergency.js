import fetch from 'node-fetch';

async function testKaaToAPI() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE LA API KAA.TO');
    console.log('=====================================');
    
    // Test 1: Verificar si la API de búsqueda está funcionando
    console.log('\n1️⃣ PROBANDO API DE BÚSQUEDA...');
    try {
        const searchResponse = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                query: "bleach"
            })
        });
        
        console.log(`Status: ${searchResponse.status}`);
        console.log(`Headers:`, Object.fromEntries(searchResponse.headers));
        
        if (searchResponse.ok) {
            const data = await searchResponse.json();
            console.log(`✅ Respuesta exitosa: ${Array.isArray(data) ? data.length : 'No es array'} resultados`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(`Primera resultado:`, data[0]);
            } else {
                console.log(`❌ Sin resultados en la respuesta`);
            }
        } else {
            console.log(`❌ Error HTTP: ${searchResponse.status}`);
            const errorText = await searchResponse.text();
            console.log(`Error body:`, errorText);
        }
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
    }
    
    // Test 2: Probar conectividad básica al sitio
    console.log('\n2️⃣ PROBANDO CONECTIVIDAD BÁSICA...');
    try {
        const siteResponse = await fetch('https://kaa.to', {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log(`✅ Sitio principal: ${siteResponse.status}`);
    } catch (error) {
        console.log(`❌ Sitio principal error: ${error.message}`);
    }
    
    // Test 3: Probar diferentes términos de búsqueda
    console.log('\n3️⃣ PROBANDO DIFERENTES BÚSQUEDAS...');
    const queries = ['naruto', 'dragon', 'one piece', 'attack'];
    
    for (const query of queries) {
        try {
            console.log(`\n🔍 Buscando: "${query}"`);
            const response = await fetch('https://kaa.to/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({ query })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ ${Array.isArray(data) ? data.length : 0} resultados`);
            } else {
                console.log(`   ❌ Error: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
    
    // Test 4: Probar con headers adicionales
    console.log('\n4️⃣ PROBANDO CON HEADERS ADICIONALES...');
    try {
        const response = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://kaa.to/',
                'Origin': 'https://kaa.to'
            },
            body: JSON.stringify({
                query: "bleach"
            })
        });
        
        console.log(`Status con headers completos: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Resultados: ${Array.isArray(data) ? data.length : 0}`);
        }
    } catch (error) {
        console.log(`❌ Error con headers: ${error.message}`);
    }
}

testKaaToAPI();
