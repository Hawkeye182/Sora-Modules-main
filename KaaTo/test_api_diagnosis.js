import fetch from 'node-fetch';

console.log('🔍 DIAGNÓSTICO COMPLETO DE LA API KAA.TO\n');

async function testApiResponse() {
    try {
        console.log('1. 🔎 Probando búsqueda con diferentes términos...');
        
        const searchTerms = ['dragon', 'naruto', 'one piece', 'attack on titan'];
        
        for (const term of searchTerms) {
            console.log(`\n   Buscando: "${term}"`);
            
            const response = await fetch('https://kaa.to/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify({
                    query: term
                })
            });

            console.log(`   Status: ${response.status}`);
            
            const rawText = await response.text();
            console.log(`   Raw response (primeros 200 chars): ${rawText.substring(0, 200)}`);
            
            try {
                const data = JSON.parse(rawText);
                console.log(`   JSON parsed: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
            } catch (e) {
                console.log(`   ❌ No es JSON válido: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
}

async function testDirectUrl() {
    try {
        console.log('\n2. 🌐 Probando acceso directo a kaa.to...');
        
        const response = await fetch('https://kaa.to/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
            const html = await response.text();
            const hasApiScript = html.includes('/api/') || html.includes('api');
            console.log(`   ✅ Sitio accesible, contiene referencias a API: ${hasApiScript}`);
            
            // Buscar patrones en el HTML
            const scriptMatches = html.match(/<script[^>]*src="[^"]*"[^>]*>/g);
            if (scriptMatches) {
                console.log(`   📄 Scripts encontrados: ${scriptMatches.length}`);
            }
        } else {
            console.log(`   ❌ Sitio no accesible`);
        }
        
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
}

async function testAlternativeEndpoints() {
    try {
        console.log('\n3. 🔍 Probando endpoints alternativos...');
        
        const endpoints = [
            'https://kaa.to/api/shows',
            'https://kaa.to/api/anime',
            'https://kaa.to/api/latest',
            'https://kaa.to/search'
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`\n   Probando: ${endpoint}`);
                
                const response = await fetch(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                console.log(`   Status: ${response.status}`);
                
                if (response.ok) {
                    const text = await response.text();
                    console.log(`   Response preview: ${text.substring(0, 100)}...`);
                }
                
            } catch (e) {
                console.log(`   ❌ Error: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('   ❌ Error general:', error.message);
    }
}

// Ejecutar diagnóstico completo
async function runDiagnosis() {
    await testApiResponse();
    await testDirectUrl();
    await testAlternativeEndpoints();
    
    console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
    console.log('\n💡 POSIBLES PROBLEMAS:');
    console.log('   1. La API cambió de formato');
    console.log('   2. Requiere autenticación o headers especiales');
    console.log('   3. El endpoint cambió de ubicación');
    console.log('   4. Hay protección contra bots/scrapers');
}

runDiagnosis().catch(console.error);
