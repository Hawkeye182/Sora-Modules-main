// Test del módulo v9.0.0 con múltiples páginas
const BASE_URL = 'https://kaa.to';

// Mock con datos de múltiples páginas
async function fetchv2(url) {
    console.log(`📡 Fetching: ${url}`);
    
    if (url.includes('alphabet=N')) {
        return {
            text: async () => `
            <script>
            var animeData = [
                {title_jp:"Naruto",title_en:"Naruto",slug:"naruto-f3cf"},
                {title_jp:"Naruto: Shippuuden",title_en:"Naruto Shippuden",slug:"naruto-shippuden-43fe"}
            ];
            </script>
            `
        };
    } else if (url.includes('alphabet=C')) {
        // Dragon Ball está en la página C
        return {
            text: async () => `
            <script>
            var animeData = [
                {title_jp:"Dragon Ball",title_en:"Dragon Ball",slug:"dragon-ball-1a2b"},
                {title_jp:"Dragon Ball Z",title_en:"Dragon Ball Z",slug:"dragon-ball-z-3c4d"}
            ];
            </script>
            `
        };
    } else if (url.includes('alphabet=D')) {
        return {
            text: async () => `
            <script>
            var animeData = [
                {title_jp:"Dandadan",title_en:"Dan Da Dan",slug:"dandadan-da3b"}
            ];
            </script>
            `
        };
    } else if (url.includes('alphabet=O')) {
        return {
            text: async () => `
            <script>
            var animeData = [
                {title_jp:"One Piece",title_en:"One Piece",slug:"one-piece-0948"}
            ];
            </script>
            `
        };
    }
    
    return { text: async () => '' };
}

// Función de búsqueda v9.0.0
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        let results = [];
        
        // Estrategia 1: Buscar en múltiples páginas alfabéticas relevantes
        const searchPages = [];
        
        // Página principal por primera letra
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        if (/[A-Z]/.test(firstLetter)) {
            searchPages.push(`${BASE_URL}/anime?alphabet=${firstLetter}`);
        }
        
        // Para animes conocidos, buscar en páginas específicas donde pueden estar
        const knownLocations = {
            'dragon': ['C', 'D'],  // Dragon Ball está en C
            'naruto': ['N'],
            'one': ['O'],
            'attack': ['A', 'S'],
            'demon': ['D', 'K'],
            'jujutsu': ['J'],
            'tokyo': ['T'],
            'fate': ['F']
        };
        
        // Buscar páginas relevantes para la palabra clave
        for (const [anime, letters] of Object.entries(knownLocations)) {
            if (keywordLower.includes(anime)) {
                for (const letter of letters) {
                    const pageUrl = `${BASE_URL}/anime?alphabet=${letter}`;
                    if (!searchPages.includes(pageUrl)) {
                        searchPages.push(pageUrl);
                    }
                }
                break;
            }
        }

        // Buscar en cada página
        for (const searchUrl of searchPages) {
            try {
                const response = await fetchv2(searchUrl);
                const html = typeof response === 'object' ? await response.text() : await response;

                // Patrón 1: Buscar slugs que contengan la palabra clave
                const slugPattern = new RegExp(`"([^"]*${keywordLower}[^"]*-[a-f0-9]{4})"`, 'gi');
                const slugMatches = html.matchAll(slugPattern);
                
                for (const match of slugMatches) {
                    const slug = match[1];
                    const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    results.push({
                        title: title,
                        image: BASE_URL + "/favicon.ico",
                        href: BASE_URL + "/" + slug
                    });
                }
                
                // Patrón 2: Buscar títulos en JSON que contengan la palabra
                const titlePattern = new RegExp(`"title[^"]*":"([^"]*${keywordLower}[^"]*)"`, 'gi');
                const titleMatches = html.matchAll(titlePattern);
                
                for (const match of titleMatches) {
                    const title = match[1];
                    
                    // Buscar el slug correspondiente
                    const context = html.substring(Math.max(0, match.index - 200), match.index + 200);
                    const contextSlugMatch = context.match(/"([a-z0-9\-]+-[a-f0-9]{4})"/);
                    
                    if (contextSlugMatch) {
                        results.push({
                            title: title,
                            image: BASE_URL + "/favicon.ico", 
                            href: BASE_URL + "/" + contextSlugMatch[1]
                        });
                    }
                }
                
            } catch (pageError) {
                console.log(`Error en ${searchUrl}: ${pageError.message}`);
                continue;
            }
        }

        // Eliminar duplicados por href
        const uniqueResults = results.filter((result, index, self) => 
            index === self.findIndex(r => r.href === result.href)
        );

        return JSON.stringify(uniqueResults.slice(0, 10));

    } catch (error) {
        return JSON.stringify([{
            title: `Debug: ${error.message}`,
            image: BASE_URL + "/favicon.ico",
            href: BASE_URL
        }]);
    }
}

// Ejecutar pruebas
async function runTests() {
    console.log('🚀 PRUEBAS DEL MÓDULO v9.0.0 - MÚLTIPLES PÁGINAS\n');
    console.log('=' .repeat(50));
    
    const tests = [
        'naruto',
        'dragon',
        'one piece'
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
