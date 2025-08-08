// Buscar Dragon Ball en todas las páginas alfabéticas principales
const https = require('https');

async function realFetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function findDragonBall() {
    console.log('🔍 Buscando Dragon Ball en diferentes páginas\n');
    
    const letters = ['D', 'A', 'B', 'C', 'N', 'O']; // Páginas más probables
    
    for (const letter of letters) {
        console.log(`📄 Revisando página ${letter}...`);
        
        try {
            const html = await realFetch(`https://kaa.to/anime?alphabet=${letter}`);
            
            // Buscar dragon ball en cualquier formato
            const dragonMatches = [
                ...html.matchAll(/dragon[^"<>\n]{0,50}/gi),
                ...html.matchAll(/"([^"]*dragon[^"]*-[a-f0-9]{4})"/gi)
            ];
            
            if (dragonMatches.length > 0) {
                console.log(`✅ ¡Encontrado en página ${letter}!`);
                dragonMatches.slice(0, 5).forEach((match, i) => {
                    console.log(`   ${i+1}. ${match[0] || match[1]}`);
                });
                console.log();
            } else {
                console.log(`❌ No encontrado en página ${letter}`);
            }
            
        } catch (error) {
            console.log(`❌ Error en página ${letter}: ${error.message}`);
        }
    }
    
    // También buscar en la página principal sin filtro
    console.log('\n📄 Revisando página principal sin filtro...');
    try {
        const html = await realFetch('https://kaa.to/anime');
        
        const dragonMatches = [
            ...html.matchAll(/dragon[^"<>\n]{0,50}/gi),
            ...html.matchAll(/"([^"]*dragon[^"]*-[a-f0-9]{4})"/gi)
        ];
        
        if (dragonMatches.length > 0) {
            console.log(`✅ ¡Encontrado en página principal!`);
            dragonMatches.slice(0, 5).forEach((match, i) => {
                console.log(`   ${i+1}. ${match[0] || match[1]}`);
            });
        } else {
            console.log(`❌ No encontrado en página principal`);
        }
        
    } catch (error) {
        console.log(`❌ Error en página principal: ${error.message}`);
    }
}

findDragonBall();
