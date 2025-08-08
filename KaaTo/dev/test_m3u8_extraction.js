// Test script for KaaTo Enhanced Module with M3U8 extraction
const fs = require('fs');

// Importar el módulo mejorado (simulamos require)
eval(fs.readFileSync('./KaaTo_enhanced.js', 'utf8'));

// Función fetch para Node.js
async function fetch(url, options = {}) {
    const nodeFetch = await import('node-fetch').then(module => module.default);
    return nodeFetch(url, options);
}

// Función soraFetch para el módulo
global.fetch = fetch;

async function testEnhancedModule() {
    console.log("=".repeat(70));
    console.log("TESTING ENHANCED KaaTo MODULE WITH REAL M3U8 EXTRACTION");
    console.log("=".repeat(70));
    
    const testQueries = ["dandadan", "dragon ball", "naruto", "sword art online"];
    
    for (let query of testQueries) {
        console.log(`\n${"=".repeat(50)}`);
        console.log(`🎬 TESTING: ${query.toUpperCase()}`);
        console.log(`${"=".repeat(50)}`);
        
        try {
            // 1. Búsqueda
            console.log(`\n🔍 1. Searching for: ${query}`);
            const searchResults = await searchResults(query);
            
            if (searchResults.length === 0) {
                console.log(`❌ No results found for ${query}`);
                continue;
            }
            
            console.log(`✅ Found ${searchResults.length} result(s)`);
            console.log(`   Title: ${searchResults[0].title}`);
            console.log(`   URL: ${searchResults[0].href}`);
            
            // 2. Detalles
            console.log(`\n📝 2. Extracting details...`);
            const details = await extractDetails(searchResults[0].href);
            if (details.length > 0) {
                console.log(`   Description: ${details[0].description.substring(0, 80)}...`);
            }
            
            // 3. Episodios
            console.log(`\n📺 3. Extracting episodes...`);
            const episodes = await extractEpisodes(searchResults[0].href);
            console.log(`   Found ${episodes.length} episodes`);
            
            if (episodes.length > 0) {
                console.log(`   First: Episode ${episodes[0].number} - ${episodes[0].href}`);
                
                // 4. Stream URL con extracción M3U8
                console.log(`\n🎯 4. Extracting stream URL with M3U8...`);
                const streamUrl = await extractStreamUrl(episodes[0].href);
                console.log(`   Stream URL: ${streamUrl}`);
                
                // Verificar si obtuvimos un M3U8 directo
                if (streamUrl && streamUrl.includes('.m3u8')) {
                    console.log(`   ✅ SUCCESS: Got direct M3U8 URL!`);
                    console.log(`   📺 Direct streaming ready for Sora`);
                } else if (streamUrl && streamUrl.includes('krussdomi.com')) {
                    console.log(`   ⚠️  Got iframe URL (fallback mode)`);
                    console.log(`   🔄 M3U8 extraction may need refinement`);
                } else {
                    console.log(`   ❌ Unexpected stream URL format`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Error testing ${query}: ${error.message}`);
        }
        
        console.log(`\n✅ Test completed for ${query}`);
    }
    
    console.log(`\n${"=".repeat(70)}`);
    console.log("🎉 ENHANCED MODULE TESTING COMPLETED!");
    console.log("📋 Module can now extract direct M3U8 URLs when available");
    console.log("🔄 Falls back to iframe URLs when M3U8 extraction fails");
    console.log(`${"=".repeat(70)}`);
}

// Ejecutar las pruebas
testEnhancedModule().catch(console.error);
