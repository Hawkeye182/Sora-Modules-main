// Test rápido de la API real de kaa.to
const { default: fetch } = require('node-fetch');

async function testRealAPI() {
    console.log("🔍 PROBANDO API REAL DE KAA.TO");
    console.log("================================");
    
    const searchTerms = ["naruto", "dragon ball", "dandadan", "one piece"];
    
    for (const term of searchTerms) {
        console.log(`\n📡 Probando búsqueda: "${term}"`);
        
        try {
            const response = await fetch('https://kaa.to/api/search', {
                method: 'POST',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Content-Type': 'application/json',
                    'Origin': 'https://kaa.to',
                    'Referer': 'https://kaa.to/',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                },
                body: JSON.stringify({
                    query: term,
                    include: ['shows'],
                    limit: 20
                })
            });
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ API respondió correctamente`);
                console.log(`   📊 Resultados encontrados: ${data.shows ? data.shows.length : 0}`);
                
                if (data.shows && data.shows.length > 0) {
                    console.log(`   📺 Primer resultado: "${data.shows[0].title || data.shows[0].name || 'Sin título'}"`);
                }
            } else {
                console.log(`   ❌ Error de API: ${response.status}`);
                const text = await response.text();
                console.log(`   Respuesta: ${text.substring(0, 200)}...`);
            }
            
        } catch (error) {
            console.log(`   💥 Error de conexión: ${error.message}`);
        }
        
        // Pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("\n🎯 CONCLUSIONES:");
    console.log("Si la API real funciona, podemos actualizar el módulo para usar menos fallbacks");
    console.log("Si falla, el sistema de fallback está funcionando perfectamente como respaldo");
}

testRealAPI().catch(console.error);
