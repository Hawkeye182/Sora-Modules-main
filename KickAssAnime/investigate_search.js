// Investigar el mecanismo real de búsqueda de kaa.to
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
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
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

async function investigateSearch() {
    console.log('🔍 INVESTIGANDO EL MECANISMO DE BÚSQUEDA DE KAA.TO\n');
    console.log('=' .repeat(60));
    
    try {
        // 1. Analizar la página principal
        console.log('📄 1. Analizando página principal...');
        const mainPage = await realFetch('https://kaa.to/');
        console.log(`Status: ${mainPage.status}`);
        console.log(`Body length: ${mainPage.body.length}`);
        
        // Buscar formularios de búsqueda
        const searchForms = mainPage.body.match(/<form[^>]*search[^>]*>[\s\S]*?<\/form>/gi);
        if (searchForms) {
            console.log('\n🔍 Formularios de búsqueda encontrados:');
            searchForms.forEach((form, i) => {
                console.log(`\n--- Formulario ${i+1} ---`);
                console.log(form.substring(0, 300) + '...');
            });
        }
        
        // Buscar inputs de búsqueda
        const searchInputs = mainPage.body.match(/<input[^>]*search[^>]*>/gi);
        if (searchInputs) {
            console.log('\n🎯 Inputs de búsqueda:');
            searchInputs.forEach((input, i) => {
                console.log(`${i+1}. ${input}`);
            });
        }
        
        // Buscar scripts que manejen búsqueda
        const searchScripts = mainPage.body.match(/<script[^>]*>[\s\S]*?search[\s\S]*?<\/script>/gi);
        if (searchScripts) {
            console.log('\n💻 Scripts relacionados con búsqueda:');
            searchScripts.slice(0, 2).forEach((script, i) => {
                console.log(`\n--- Script ${i+1} ---`);
                console.log(script.substring(0, 500) + '...');
            });
        }
        
        // 2. Probar búsqueda real
        console.log('\n📄 2. Probando búsqueda real con "naruto"...');
        const searchResult = await realFetch('https://kaa.to/search?q=naruto');
        console.log(`Status: ${searchResult.status}`);
        console.log(`Body length: ${searchResult.body.length}`);
        
        // Analizar contenido de resultados
        if (searchResult.body.includes('naruto')) {
            console.log('✅ La búsqueda real contiene resultados de naruto');
            
            // Buscar patrones de resultados
            const resultPatterns = [
                /class="[^"]*result[^"]*"[^>]*>[\s\S]*?naruto[\s\S]*?<\/[^>]+>/gi,
                /<a[^>]*href="[^"]*naruto[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
                /naruto[^<>\n]{0,100}/gi
            ];
            
            resultPatterns.forEach((pattern, i) => {
                const matches = searchResult.body.match(pattern);
                if (matches) {
                    console.log(`\n🎯 Patrón ${i+1} encontró ${matches.length} coincidencias:`);
                    matches.slice(0, 3).forEach((match, j) => {
                        console.log(`   ${j+1}. ${match.substring(0, 150)}...`);
                    });
                }
            });
        } else {
            console.log('❌ La búsqueda real no contiene "naruto"');
            console.log('Primeros 500 caracteres del resultado:');
            console.log(searchResult.body.substring(0, 500));
        }
        
        // 3. Analizar JavaScript y APIs
        console.log('\n📄 3. Buscando APIs o endpoints AJAX...');
        
        // Buscar fetch/axios/XMLHttpRequest en scripts
        const apiPatterns = [
            /fetch\s*\(\s*['"`]([^'"`]+)['"`]/gi,
            /axios\.[get|post]+\s*\(\s*['"`]([^'"`]+)['"`]/gi,
            /XMLHttpRequest[\s\S]*?open\s*\(\s*['"`]GET['"`]\s*,\s*['"`]([^'"`]+)['"`]/gi,
            /api[^'"`\s]*['"`]\s*:\s*['"`]([^'"`]+)['"`]/gi
        ];
        
        apiPatterns.forEach((pattern, i) => {
            const matches = mainPage.body.match(pattern);
            if (matches) {
                console.log(`\n🔗 API Patrón ${i+1}:`);
                matches.slice(0, 5).forEach((match, j) => {
                    console.log(`   ${j+1}. ${match}`);
                });
            }
        });
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

investigateSearch();
