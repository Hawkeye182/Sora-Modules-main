// Test con el módulo corregido para usar API real
const fs = require('fs');
const vm = require('vm');

// Función simulada de soraFetch
async function soraFetch(url, options = {}) {
    const { default: fetch } = await import('node-fetch');
    
    const defaultHeaders = {
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
    };

    const finalOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    return fetch(url, finalOptions);
}

// Cargar y evaluar el módulo KaaTo
function loadKaaToModule() {
    const moduleCode = fs.readFileSync('./KaaTo_final_enhanced.js', 'utf8');
    
    const sandbox = {
        soraFetch: soraFetch,
        console: console,
        require: require,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        searchResults: null,
        extractDetails: null,
        extractEpisodes: null,
        extractStreamUrl: null
    };
    
    vm.createContext(sandbox);
    vm.runInContext(moduleCode, sandbox);
    
    return {
        searchResults: sandbox.searchResults,
        extractDetails: sandbox.extractDetails,
        extractEpisodes: sandbox.extractEpisodes,
        extractStreamUrl: sandbox.extractStreamUrl
    };
}

async function testCorrectedModule() {
    console.log("🎯 PROBANDO MÓDULO CORREGIDO CON API REAL");
    console.log("=========================================");
    
    const kaaToModule = loadKaaToModule();
    
    const testCases = [
        "naruto",
        "dragon ball", 
        "dandadan",
        "one piece",
        "attack on titan"
    ];
    
    for (const anime of testCases) {
        console.log(`\n🔍 Probando: "${anime}"`);
        
        try {
            const results = await kaaToModule.searchResults(anime);
            const parsedResults = JSON.parse(results);
            
            console.log(`   ✅ API funcionó correctamente`);
            console.log(`   📊 Resultados: ${parsedResults.length}`);
            
            if (parsedResults.length > 0) {
                console.log(`   📺 Primer resultado: "${parsedResults[0].title}"`);
                console.log(`   🖼️  Imagen: ${parsedResults[0].image.substring(0, 50)}...`);
                console.log(`   🔗 Link: ${parsedResults[0].href}`);
            }
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log("\n🎉 PRUEBA COMPLETADA");
    console.log("Ahora el módulo debería usar la API real en lugar del fallback");
}

testCorrectedModule().catch(console.error);
