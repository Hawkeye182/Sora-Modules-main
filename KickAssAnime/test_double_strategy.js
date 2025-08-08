// Test de la nueva búsqueda con doble estrategia
const BASE_URL = 'https://kaa.to/';

// Mock mejorado de fetchv2
async function fetchv2(url) {
    console.log(`📡 Fetching: ${url}`);
    
    // Simular respuesta del buscador oficial (falla)
    if (url.includes('/search?q=')) {
        return {
            text: async () => `
            Search Query narutoGENREYEARCOUNTRYSTATUSTYPERESET ALLVIEW No Match
            `
        };
    }
    
    // Respuestas de páginas alfabéticas (funcionan)
    if (url.includes('alphabet=N')) {
        return {
            text: async () => `
[2002](https://kaa.to/naruto-f3cf)
## Naruto

 TV Finished SUB DUB[2012](https://kaa.to/naruto-spin-off-rock-lee-his-ninja-pals-0e13)
## Naruto Spin-Off: Rock Lee & His Ninja Pals

 TV Finished SUB[2007](https://kaa.to/naruto-shippuden-43fe)
## Naruto Shippuden
            `
        };
    } else if (url.includes('alphabet=D')) {
        return {
            text: async () => `
[1986](https://kaa.to/dragon-ball-ee14)
## Dragon Ball

 TV Finished SUB DUB[1989](https://kaa.to/dragon-ball-z-abc1)
## Dragon Ball Z

 TV Finished SUB DUB[2024](https://kaa.to/dandadan-da3b)
## Dan Da Dan
            `
        };
    } else if (url.includes('alphabet=F')) {
        return {
            text: async () => `
[2004](https://kaa.to/fatestay-night-a351)
## Fate/stay night

 TV Finished SUB DUB[2011](https://kaa.to/fate-zero-def2)
## Fate/Zero

 TV Finished SUB DUB[2019](https://kaa.to/fate-grand-order-ghi3)
## Fate/Grand Order
            `
        };
    } else if (url.includes('alphabet=G')) {
        return {
            text: async () => `
[2024](https://kaa.to/gachiakuta-93e1)
## Gachiakuta

 TV Finished SUB[2020](https://kaa.to/ghost-in-the-shell-jkl4)
## Ghost in the Shell
            `
        };
    }
    
    return { text: async () => '' };
}

// Función searchResults con doble estrategia
async function searchResults(keyword) {
    try {
        const keywordLower = keyword.toLowerCase().trim();
        let results = [];

        // Método 1: Intentar el buscador oficial de kaa.to
        try {
            const searchUrl = `https://kaa.to/search?q=${encodeURIComponent(keyword)}`;
            const searchResponse = await fetchv2(searchUrl);
            const searchHtml = typeof searchResponse === 'object' ? await searchResponse.text() : await searchResponse;
            
            // Si el buscador oficial funciona, extraer resultados
            if (!searchHtml.includes('No Match')) {
                const officialRegex = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const officialMatches = searchHtml.matchAll(officialRegex);
                const officialMatchesArray = Array.from(officialMatches);
                
                results = officialMatchesArray.map(match => ({
                    title: match[4].trim(),
                    image: BASE_URL + "favicon.ico",
                    href: match[2]
                }));
                
                if (results.length > 0) {
                    console.log(`✅ Buscador oficial encontró ${results.length} resultados`);
                    return JSON.stringify(results.slice(0, 10));
                }
            }
        } catch (officialError) {
            console.log('Buscador oficial falló, usando método alfabético...');
        }

        // Método 2: Búsqueda alfabética mejorada (fallback)
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        const searchPages = [];
        
        // Búsqueda inteligente por letra inicial
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`https://kaa.to/anime?alphabet=${firstLetter}`);
        }
        
        // Para búsquedas populares, también buscar en páginas relacionadas
        const popularSearches = {
            'naruto': ['N'],
            'dragon': ['D'],
            'one': ['O'],
            'attack': ['A'],
            'demon': ['D'],
            'tokyo': ['T'],
            'fate': ['F'],
            'jujutsu': ['J'],
            'my': ['M']
        };
        
        for (const [searchTerm, letters] of Object.entries(popularSearches)) {
            if (keywordLower.includes(searchTerm)) {
                for (const letter of letters) {
                    const pageUrl = `https://kaa.to/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                    }
                }
                break;
            }
        }
        
        // Si no hay páginas específicas, usar página general
        if (searchPages.length === 0) {
            searchPages.push('https://kaa.to/anime');
        }

        // Buscar en las páginas seleccionadas
        for (const searchUrl of searchPages) {
            try {
                const response = await fetchv2(searchUrl);
                const html = typeof response === 'object' ? await response.text() : await response;

                const ANIME_REGEX = /\[(\d{4})\]\((https:\/\/kaa\.to\/([^)]+))\)[\s\S]*?##\s*([^\n]+)/g;
                const matches = html.matchAll(ANIME_REGEX);
                const matchesArray = Array.from(matches);
                
                const pageResults = matchesArray
                    .filter(match => {
                        const title = match[4]?.toLowerCase() || '';
                        return title.includes(keywordLower);
                    })
                    .map(match => ({
                        title: match[4].trim(),
                        image: BASE_URL + "favicon.ico",
                        href: match[2]
                    }));

                results.push(...pageResults);
                
                // Si encontramos suficientes resultados, no seguir buscando
                if (results.length >= 10) break;
                
            } catch (pageError) {
                console.log(`Error en página ${searchUrl}: ${pageError.message}`);
                continue;
            }
        }

        // Eliminar duplicados y limitar resultados
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        console.log('Error de búsqueda: ' + error.message);
        return JSON.stringify([]);
    }
}

// Ejecutar pruebas
async function runTests() {
    console.log('🚀 PRUEBAS DE DOBLE ESTRATEGIA DE BÚSQUEDA\n');
    console.log('=' .repeat(50));
    
    const tests = [
        'naruto',
        'dragon ball',
        'fate',
        'gachiakuta'
    ];
    
    for (const keyword of tests) {
        console.log(`\n🔍 Buscando: "${keyword}"`);
        console.log('-'.repeat(30));
        
        const start = Date.now();
        const results = await searchResults(keyword);
        const time = Date.now() - start;
        
        const parsed = JSON.parse(results);
        
        console.log(`⚡ Tiempo: ${time}ms`);
        console.log(`📊 Resultados: ${parsed.length}`);
        
        if (parsed.length > 0) {
            console.log('✅ Animes encontrados:');
            parsed.forEach((anime, index) => {
                console.log(`   ${index + 1}. ${anime.title}`);
                console.log(`      ${anime.href}`);
            });
        } else {
            console.log('❌ Sin resultados');
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 PRUEBAS COMPLETADAS');
}

runTests();
