// Test de búsqueda con anime diferente a naruto
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

async function testDifferentAnime() {
    console.log('🔍 Probando búsquedas de diferentes animes\n');
    
    const tests = [
        { letter: 'D', anime: 'dragon' },
        { letter: 'A', anime: 'attack' },
        { letter: 'O', anime: 'one' }
    ];
    
    for (const test of tests) {
        console.log(`📄 Analizando alphabet=${test.letter} para "${test.anime}"`);
        console.log('-'.repeat(50));
        
        try {
            const url = `https://kaa.to/anime?alphabet=${test.letter}`;
            const html = await realFetch(url);
            
            console.log(`✅ HTML Length: ${html.length}`);
            
            // Buscar cualquier mención del anime
            const animeRegex = new RegExp(test.anime, 'gi');
            const matches = html.match(animeRegex);
            console.log(`🎯 Menciones de "${test.anime}": ${matches ? matches.length : 0}`);
            
            // Buscar slugs que contengan el anime
            const slugPattern = new RegExp(`"([^"]*${test.anime}[^"]*-[a-f0-9]{4})"`, 'gi');
            const slugMatches = html.matchAll(slugPattern);
            const slugArray = Array.from(slugMatches);
            console.log(`🔗 Slugs encontrados: ${slugArray.length}`);
            
            if (slugArray.length > 0) {
                slugArray.slice(0, 3).forEach((match, i) => {
                    console.log(`   ${i+1}. ${match[1]}`);
                });
            }
            
            // Buscar títulos en JSON
            const titlePattern = new RegExp(`"title[^"]*":"([^"]*${test.anime}[^"]*)"`, 'gi');
            const titleMatches = html.matchAll(titlePattern);
            const titleArray = Array.from(titleMatches);
            console.log(`📋 Títulos encontrados: ${titleArray.length}`);
            
            if (titleArray.length > 0) {
                titleArray.slice(0, 3).forEach((match, i) => {
                    console.log(`   ${i+1}. ${match[1]}`);
                });
            }
            
            console.log();
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
    }
}

testDifferentAnime();
