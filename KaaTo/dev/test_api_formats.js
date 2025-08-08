// Test de diferentes formatos de API para kaa.to
const { default: fetch } = require('node-fetch');

async function testDifferentAPIFormats() {
    console.log("🔍 PROBANDO DIFERENTES FORMATOS DE API");
    console.log("=====================================");
    
    const testCases = [
        {
            name: "POST con query básica",
            method: 'POST',
            body: { query: "naruto" }
        },
        {
            name: "POST con query + includes",
            method: 'POST', 
            body: { query: "naruto", include: ["shows"], limit: 20 }
        },
        {
            name: "POST con search term",
            method: 'POST',
            body: { search: "naruto", type: "shows" }
        },
        {
            name: "POST con title",
            method: 'POST',
            body: { title: "naruto" }
        },
        {
            name: "GET con query params",
            method: 'GET',
            url: 'https://kaa.to/api/search?query=naruto&include=shows&limit=20'
        },
        {
            name: "GET simple",
            method: 'GET', 
            url: 'https://kaa.to/api/search?q=naruto'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n📡 ${testCase.name}:`);
        
        try {
            const url = testCase.url || 'https://kaa.to/api/search';
            const options = {
                method: testCase.method,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Origin': 'https://kaa.to',
                    'Referer': 'https://kaa.to/',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin'
                }
            };
            
            if (testCase.method === 'POST' && testCase.body) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(testCase.body);
            }
            
            const response = await fetch(url, options);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Respuesta JSON válida`);
                console.log(`   📊 Keys disponibles:`, Object.keys(data));
                
                if (data.shows) {
                    console.log(`   📺 Shows encontrados: ${data.shows.length}`);
                } else if (data.results) {
                    console.log(`   📺 Results encontrados: ${data.results.length}`);
                } else if (Array.isArray(data)) {
                    console.log(`   📺 Array directo: ${data.length} elementos`);
                } else {
                    console.log(`   📄 Estructura:`, JSON.stringify(data, null, 2).substring(0, 200));
                }
            } else {
                console.log(`   ❌ Error: ${response.status}`);
                const text = await response.text();
                console.log(`   📄 Respuesta:`, text.substring(0, 100));
            }
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Probar endpoint de shows directamente
    console.log(`\n📡 Probando endpoint de shows directamente:`);
    try {
        const response = await fetch('https://kaa.to/api/shows', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://kaa.to/'
            }
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`   📊 Shows disponibles:`, Array.isArray(data) ? data.length : Object.keys(data).length);
        }
    } catch (error) {
        console.log(`   💥 Error: ${error.message}`);
    }
}

testDifferentAPIFormats().catch(console.error);
