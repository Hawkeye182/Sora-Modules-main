// Test del módulo con patrones reales
const BASE_URL = 'https://kaa.to';

// Mock con datos reales extraídos de kaa.to
async function fetchv2(url) {
    console.log(`📡 Fetching: ${url}`);
    
    if (url.includes('alphabet=N')) {
        return {
            text: async () => `
            <!doctype html><html>
            <script>
            var animeData = [
                {title_jp:"Naruto",title_en:"Naruto",slug:"naruto-f3cf",synopsis:"Moments prior to Naruto Uzumaki's birth, a huge demon known as the Kyuubi"},
                {title_jp:"Naruto SD: Rock Lee no Seishun Full-Power Ninden",title_en:"Naruto Spin-Off: Rock Lee & His Ninja Pals",slug:"naruto-spin-off-rock-lee-his-ninja-pals-0e13",synopsis:"The competitive shinobi world"},
                {title_jp:"Naruto: Shippuuden",title_en:"Naruto Shippuden",slug:"naruto-shippuden-43fe",synopsis:"It has been two and a half years since Naruto Uzumaki left Konoh"}
            ];
            </script>
            </html>
            `
        };
    } else if (url.includes('alphabet=D')) {
        return {
            text: async () => `
            <!doctype html><html>
            <script>
            var animeData = [
                {title_jp:"Dragon Ball",title_en:"Dragon Ball",slug:"dragon-ball-1a2b",synopsis:"The story of Goku and his adventures"},
                {title_jp:"Dragon Ball Z",title_en:"Dragon Ball Z",slug:"dragon-ball-z-3c4d",synopsis:"Continuation of Dragon Ball series"}
            ];
            </script>
            </html>
            `
        };
    } else if (url.includes('alphabet=F')) {
        return {
            text: async () => `
            <!doctype html><html>
            <script>
            var animeData = [
                {title_jp:"Fate/stay night",title_en:"Fate/stay night",slug:"fate-stay-night-5e6f",synopsis:"Holy Grail War story"},
                {title_jp:"Fate/Zero",title_en:"Fate/Zero",slug:"fate-zero-7g8h",synopsis:"Prequel to Fate/stay night"}
            ];
            </script>
            </html>
            `
        };
    }
    
    return { text: async () => '' };
}

// Función de búsqueda con patrones reales
async function searchResults(keyword) {
    try {
        if (!keyword || !keyword.trim()) {
            return JSON.stringify([]);
        }

        const keywordLower = keyword.toLowerCase().trim();
        
        // Buscar en página alfabética de la primera letra
        const firstLetter = keywordLower.charAt(0).toUpperCase();
        const searchUrl = `${BASE_URL}/anime?alphabet=${firstLetter}`;
        
        const response = await fetchv2(searchUrl);
        const html = typeof response === 'object' ? await response.text() : await response;

        let results = [];
        
        // Patrón 1: Buscar slugs de anime que contengan la palabra clave
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
        
        // Patrón 2: Buscar títulos en JSON
        const titlePattern = new RegExp(`"title[^"]*":"([^"]*${keywordLower}[^"]*)"`, 'gi');
        const titleMatches = html.matchAll(titlePattern);
        
        for (const match of titleMatches) {
            const title = match[1];
            
            // Buscar el slug correspondiente cerca de este título
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
        
        // Patrón 3: Buscar en synopsis
        const synopsisPattern = new RegExp(`synopsis:"[^"]*${keywordLower}[^"]*"[^}]*?"([a-z0-9\-]+-[a-f0-9]{4})"`, 'gi');
        const synopsisMatches = html.matchAll(synopsisPattern);
        
        for (const match of synopsisMatches) {
            const slug = match[1];
            const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
                
            results.push({
                title: title,
                image: BASE_URL + "/favicon.ico",
                href: BASE_URL + "/" + slug
            });
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
    console.log('🚀 PRUEBAS CON PATRONES REALES DE KAA.TO\n');
    console.log('=' .repeat(50));
    
    const tests = [
        'naruto',
        'dragon',
        'fate'
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
