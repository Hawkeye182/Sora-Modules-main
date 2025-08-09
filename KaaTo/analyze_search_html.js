// Analizar estructura HTML de búsqueda KaaTo

async function analyzeSearchHTML() {
    console.log('🔍 Analizando estructura de búsqueda HTML...');
    
    try {
        const searchUrl = `https://kaa.to/search?query=naruto`;
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
                'Referer': 'https://kaa.to/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        console.log('✅ HTML descargado, tamaño:', html.length);
        
        // Buscar diferentes patrones que podrían contener resultados
        console.log('\n🔎 Buscando patrones de anime...');
        
        // Patrón 1: Enlaces a páginas de anime
        const animeLinks = html.match(/<a[^>]+href="\/[^"\/\?#]+\"[^>]*>/g);
        console.log('Enlaces encontrados:', animeLinks?.length || 0);
        
        if (animeLinks) {
            console.log('Primeros 5 enlaces:');
            animeLinks.slice(0, 5).forEach((link, i) => {
                const hrefMatch = link.match(/href="([^"]+)"/);
                if (hrefMatch) {
                    console.log(`${i + 1}. ${hrefMatch[1]}`);
                }
            });
        }
        
        // Patrón 2: Elementos con clases relacionadas con anime
        const classPatterns = [
            /class="[^"]*anime[^"]*"/g,
            /class="[^"]*card[^"]*"/g,
            /class="[^"]*item[^"]*"/g,
            /class="[^"]*result[^"]*"/g
        ];
        
        classPatterns.forEach((pattern, i) => {
            const matches = html.match(pattern);
            console.log(`Patrón de clase ${i + 1}:`, matches?.length || 0, 'elementos');
            if (matches) {
                console.log('Ejemplos:', matches.slice(0, 3));
            }
        });
        
        // Patrón 3: Imágenes que podrían ser posters
        const imagePattern = /<img[^>]+src="[^"]*"[^>]*>/g;
        const images = html.match(imagePattern);
        console.log('\nImágenes encontradas:', images?.length || 0);
        
        if (images) {
            console.log('Primeras 3 imágenes:');
            images.slice(0, 3).forEach((img, i) => {
                const srcMatch = img.match(/src="([^"]+)"/);
                if (srcMatch) {
                    console.log(`${i + 1}. ${srcMatch[1]}`);
                }
            });
        }
        
        // Patrón 4: Buscar texto "naruto" para ver contexto
        const narutoMatches = [];
        const narutoRegex = /naruto/gi;
        let match;
        while ((match = narutoRegex.exec(html)) !== null && narutoMatches.length < 10) {
            const start = Math.max(0, match.index - 100);
            const end = Math.min(html.length, match.index + 100);
            const context = html.substring(start, end);
            narutoMatches.push(context);
        }
        
        console.log('\nContextos con "naruto":');
        narutoMatches.forEach((context, i) => {
            console.log(`${i + 1}. ...${context.replace(/\s+/g, ' ')}...`);
        });
        
    } catch (error) {
        console.error('❌ Error analizando HTML:', error.message);
    }
}

analyzeSearchHTML();
