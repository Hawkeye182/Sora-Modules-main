// Test de compatibilidad EXACTA con Sora
console.log('🔍 Testing EXACT Sora compatibility...\n');

// Función exacta de nuestro módulo
async function searchResults(keyword) {
    try {
        const keywordLower = keyword.toLowerCase().trim();
        
        // Resultado de prueba exacto
        const results = [
            {
                title: "Naruto",
                image: "https://kaa.to/favicon.ico",
                href: "https://kaa.to/naruto-f3cf"
            },
            {
                title: "Naruto Shippuden", 
                image: "https://kaa.to/favicon.ico",
                href: "https://kaa.to/naruto-shippuden-43fe"
            }
        ];

        console.log('📊 Raw results object:', results);
        console.log('📊 Results length:', results.length);
        
        const jsonString = JSON.stringify(results);
        console.log('📋 JSON string:', jsonString);
        console.log('📋 JSON string type:', typeof jsonString);
        console.log('📋 JSON string length:', jsonString.length);
        
        // Verificar que se puede parsear de vuelta
        try {
            const parsed = JSON.parse(jsonString);
            console.log('✅ JSON parse successful:', parsed.length, 'items');
            
            // Verificar estructura exacta como Sora espera
            for (let i = 0; i < parsed.length; i++) {
                const item = parsed[i];
                console.log(`📖 Item ${i + 1}:`);
                console.log(`   title: "${item.title}" (${typeof item.title})`);
                console.log(`   image: "${item.image}" (${typeof item.image})`);
                console.log(`   href: "${item.href}" (${typeof item.href})`);
                
                // Verificar que tiene todas las propiedades requeridas
                const hasTitle = typeof item.title === 'string';
                const hasImage = typeof item.image === 'string'; 
                const hasHref = typeof item.href === 'string';
                
                console.log(`   ✅ Valid item: ${hasTitle && hasImage && hasHref}`);
            }
        } catch (parseError) {
            console.log('❌ JSON parse error:', parseError.message);
        }
        
        return jsonString;

    } catch (error) {
        console.log('❌ Error de búsqueda:', error.message);
        return JSON.stringify([]);
    }
}

// Test con diferentes keywords
async function runSoraCompatibilityTest() {
    console.log('🚀 SORA COMPATIBILITY TEST');
    console.log('=' .repeat(50));
    
    const testKeywords = ['naruto', 'test', ''];
    
    for (const keyword of testKeywords) {
        console.log(`\n🔍 Testing keyword: "${keyword}"`);
        console.log('-'.repeat(30));
        
        const result = await searchResults(keyword);
        
        console.log('📤 Function returned:', typeof result);
        console.log('📤 Return value preview:', result.substring(0, 100) + (result.length > 100 ? '...' : ''));
        
        // Simular exactamente lo que hace Sora
        console.log('\n🎯 Simulating Sora parsing:');
        try {
            const data = result; // En Sora: result.toString()
            if (typeof data === 'string') {
                const jsonData = JSON.parse(data);
                if (Array.isArray(jsonData)) {
                    console.log(`✅ Sora would find ${jsonData.length} results`);
                    
                    jsonData.forEach((item, index) => {
                        const title = item["title"];
                        const imageUrl = item["image"];
                        const href = item["href"];
                        
                        if (typeof title === 'string' && typeof imageUrl === 'string' && typeof href === 'string') {
                            console.log(`   ✅ Item ${index + 1}: "${title}" - VALID`);
                        } else {
                            console.log(`   ❌ Item ${index + 1}: Invalid data format`);
                            console.log(`      title: ${typeof title}, image: ${typeof imageUrl}, href: ${typeof href}`);
                        }
                    });
                } else {
                    console.log('❌ Not an array');
                }
            } else {
                console.log('❌ Not a string');
            }
        } catch (soraError) {
            console.log('❌ Sora parsing failed:', soraError.message);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 COMPATIBILITY TEST COMPLETED');
}

runSoraCompatibilityTest();
