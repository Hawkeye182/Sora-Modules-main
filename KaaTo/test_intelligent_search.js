// Simulador local de búsqueda con términos inteligentes
const https = require('https');

async function intelligentSearch(mainKeyword) {
    console.log(`🔍 Búsqueda inteligente para: "${mainKeyword}"`);
    
    const allResults = [];
    const searchTerms = generateSearchTerms(mainKeyword);
    
    console.log(`📋 Términos de búsqueda generados: ${searchTerms.join(', ')}`);
    
    for (const term of searchTerms) {
        try {
            console.log(`\n🌐 Buscando: "${term}"`);
            const results = await searchKaaTo(term);
            
            // Filtrar solo resultados que realmente contengan el término original
            const relevantResults = results.filter(anime => 
                anime.title.toLowerCase().includes(mainKeyword.toLowerCase())
            );
            
            console.log(`  📊 ${results.length} resultados totales, ${relevantResults.length} relevantes`);
            
            // Agregar solo resultados únicos
            const existingSlugs = new Set(allResults.map(a => a.slug));
            const newResults = relevantResults.filter(anime => !existingSlugs.has(anime.slug));
            
            allResults.push(...newResults);
            console.log(`  ✅ ${newResults.length} resultados nuevos agregados`);
            
            // Si ya tenemos suficientes, parar
            if (allResults.length >= 15) break;
            
        } catch (error) {
            console.log(`  ❌ Error con término "${term}": ${error.message}`);
        }
    }
    
    console.log(`\n🎯 Total final: ${allResults.length} animes únicos`);
    allResults.forEach((anime, i) => {
        console.log(`${i+1}. ${anime.title} (${anime.slug})`);
    });
    
    return allResults;
}

function generateSearchTerms(keyword) {
    const terms = [keyword]; // Término original
    
    // Si es una palabra larga, probar versiones más cortas
    if (keyword.length > 4) {
        terms.push(keyword.substring(0, 4));
        terms.push(keyword.substring(0, 3));
    }
    
    // Variaciones comunes
    const variations = [
        `${keyword} anime`,
        `${keyword} series`,
        keyword.replace(/\s+/g, ''), // Sin espacios
    ];
    
    // Solo agregar variaciones que no sean iguales al original
    variations.forEach(variation => {
        if (variation !== keyword && !terms.includes(variation)) {
            terms.push(variation);
        }
    });
    
    return terms.slice(0, 4); // Máximo 4 términos para no saturar
}

function searchKaaTo(query) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query });
        
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
                    resolve(results || []);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Test con "dragon"
intelligentSearch('dragon');
