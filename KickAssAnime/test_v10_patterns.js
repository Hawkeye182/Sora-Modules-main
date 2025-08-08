// Test rápido del patrón de búsqueda v10.0.0
async function testPattern() {
    const keyword = "naruto";
    const keywordLower = keyword.toLowerCase().trim();
    
    // Simular HTML que podría venir de kaa.to/search?q=naruto
    const mockHTML = `
    <div class="anime-item">
        <a href="/naruto-f3cf" title="Naruto">
            <img src="/naruto.jpg" alt="Naruto"/>
            <span>Naruto</span>
        </a>
    </div>
    <div class="anime-item">
        <a href="/naruto-shippuden-43fe" title="Naruto Shippuden">
            <img src="/naruto-shippuden.jpg" alt="Naruto Shippuden"/>
            <span>Naruto Shippuden</span>
        </a>
    </div>
    <script>
    window.__NUXT__ = {
        data: [
            {"title": "Naruto", "slug": "naruto-f3cf", "year": 2002},
            {"title": "Naruto Shippuden", "slug": "naruto-shippuden-43fe", "year": 2007}
        ]
    };
    </script>
    `;
    
    console.log('🔍 Testing v10.0.0 patterns...\n');
    
    // Patrón 1: Buscar elementos de anime en el HTML
    console.log('📋 Patrón 1: Elementos de anime');
    const animeElementPattern = /<[^>]*anime[^>]*>[\s\S]*?<\/[^>]*>/gi;
    const animeElements = mockHTML.matchAll(animeElementPattern);
    
    let count1 = 0;
    for (const element of animeElements) {
        const elementText = element[0];
        if (elementText.toLowerCase().includes(keywordLower)) {
            console.log(`   Found: ${elementText.substring(0, 100)}...`);
            count1++;
        }
    }
    console.log(`   Total: ${count1} matches\n`);
    
    // Patrón 2: Buscar datos JSON embebidos
    console.log('📋 Patrón 2: window.__NUXT__');
    const nuxtMatch = mockHTML.match(/window\.__NUXT__\s*=\s*(.+?);/s);
    if (nuxtMatch) {
        console.log('   ✅ Found NUXT data');
        const nuxtData = nuxtMatch[1];
        
        // Buscar objects que contengan anime data con la keyword
        const animeDataPattern = new RegExp(`\\{[^}]*"title"[^}]*"[^"]*${keywordLower}[^"]*"[^}]*\\}`, 'gi');
        const animeMatches = nuxtData.matchAll(animeDataPattern);
        
        let count2 = 0;
        for (const match of animeMatches) {
            console.log(`   Found: ${match[0]}`);
            count2++;
        }
        console.log(`   Total: ${count2} matches\n`);
    }
    
    // Patrón 3: Buscar enlaces directos a anime
    console.log('📋 Patrón 3: Enlaces directos');
    const animeLinks = mockHTML.matchAll(new RegExp(`<a[^>]*href["']([^"']*${keywordLower}[^"']*)["'][^>]*>([^<]+)<\/a>`, 'gi'));
    
    let count3 = 0;
    for (const linkMatch of animeLinks) {
        const href = linkMatch[1];
        const title = linkMatch[2].replace(/<[^>]*>/g, '').trim();
        console.log(`   Found: "${title}" -> ${href}`);
        count3++;
    }
    console.log(`   Total: ${count3} matches\n`);
    
    console.log(`🎯 Total potential results: ${count1 + count3} (NUXT parsing would need JSON.parse)`);
}

testPattern();
