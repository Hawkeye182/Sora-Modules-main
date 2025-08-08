// Ver qué animes hay realmente en la página D
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

async function explorePageD() {
    console.log('🔍 Explorando qué animes hay en la página D\n');
    
    try {
        const html = await realFetch('https://kaa.to/anime?alphabet=D');
        
        console.log(`📄 HTML Length: ${html.length}`);
        
        // Buscar todos los slugs de anime
        const allSlugsPattern = /"([a-z0-9\-]+-[a-f0-9]{4})"/g;
        const allSlugs = html.matchAll(allSlugsPattern);
        const slugArray = Array.from(allSlugs);
        
        console.log(`🔗 Total slugs encontrados: ${slugArray.length}`);
        console.log('\n📋 Primeros 20 animes que empiezan con D:');
        
        slugArray.slice(0, 20).forEach((match, i) => {
            const slug = match[1];
            const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            console.log(`   ${i+1}. ${title} -> ${slug}`);
        });
        
        // Buscar específicamente dragon ball
        console.log('\n🐉 Buscando específicamente "dragon ball":');
        const dragonMatches = slugArray.filter(match => 
            match[1].toLowerCase().includes('dragon')
        );
        
        if (dragonMatches.length > 0) {
            dragonMatches.forEach((match, i) => {
                const slug = match[1];
                const title = slug.replace(/-[a-f0-9]{4}$/, '').replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                console.log(`   ${i+1}. ${title} -> ${slug}`);
            });
        } else {
            console.log('   ❌ No se encontró Dragon Ball en la página D');
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

explorePageD();
