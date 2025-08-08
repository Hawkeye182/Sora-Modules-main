// Test extensivo con múltiples animes para verificar capacidad de búsqueda
const fs = require('fs');

// Cargar el módulo mejorado
eval(fs.readFileSync('./KaaTo_final_enhanced.js', 'utf8'));

// Configurar fetch para Node.js
async function setupFetch() {
    const nodeFetch = await import('node-fetch').then(module => module.default);
    global.fetch = nodeFetch;
    return nodeFetch;
}

async function testExtensiveAnimeSearch() {
    console.log("=".repeat(80));
    console.log("🎬 PRUEBA EXTENSIVA DE BÚSQUEDA DE ANIMES - KaaTo Module");
    console.log("Probando capacidad de búsqueda con múltiples animes populares");
    console.log("=".repeat(80));
    
    // Configurar fetch
    await setupFetch();
    
    // Lista extensa de animes para probar (diferentes géneros y épocas)
    const testAnimes = [
        // Shounen populares
        "naruto",
        "dragon ball",
        "one piece", 
        "bleach",
        "attack on titan",
        "demon slayer",
        "jujutsu kaisen",
        "my hero academia",
        "hunter x hunter",
        "death note",
        
        // Anime recientes/trending
        "dandadan",
        "chainsaw man",
        "spy x family",
        "cyberpunk edgerunners",
        "kaguya sama",
        "mob psycho 100",
        
        // Isekai/Fantasy
        "sword art online",
        "overlord",
        "re zero",
        "konosuba",
        "shield hero",
        "slime",
        
        // Seinen/Mature
        "berserk",
        "tokyo ghoul",
        "parasyte",
        "monster",
        "psycho pass",
        "ghost in the shell",
        
        // Romance/Slice of life
        "your name",
        "weathering with you",
        "violet evergarden",
        "clannad",
        "toradora",
        
        // Mecha/Sci-fi
        "evangelion",
        "gundam",
        "code geass",
        "cowboy bebop",
        "akira",
        
        // Deportes
        "haikyu",
        "kuroko basketball",
        "blue lock",
        
        // Horror/Thriller
        "another",
        "higurashi",
        "elfen lied",
        
        // Clásicos
        "dragon ball z",
        "sailor moon",
        "pokemon",
        "digimon",
        "yu gi oh"
    ];
    
    let totalTested = 0;
    let successfulSearches = 0;
    let failedSearches = 0;
    let searchResults = {};
    
    console.log(`\n📊 Iniciando pruebas con ${testAnimes.length} animes diferentes...\n`);
    
    for (let animeName of testAnimes) {
        totalTested++;
        
        try {
            console.log(`\n${totalTested.toString().padStart(2, '0')}. 🔍 Buscando: "${animeName}"`);
            
            // Realizar búsqueda
            const searchResultsStr = await searchResults(animeName);
            const searchResultsArray = JSON.parse(searchResultsStr);
            
            if (searchResultsArray.length > 0) {
                successfulSearches++;
                searchResults[animeName] = {
                    status: 'SUCCESS',
                    count: searchResultsArray.length,
                    title: searchResultsArray[0].title,
                    url: searchResultsArray[0].href
                };
                
                console.log(`    ✅ ENCONTRADO: "${searchResultsArray[0].title}" (${searchResultsArray.length} resultado${searchResultsArray.length > 1 ? 's' : ''})`);
                
                // Mostrar resultados adicionales si hay más de uno
                if (searchResultsArray.length > 1) {
                    for (let i = 1; i < Math.min(3, searchResultsArray.length); i++) {
                        console.log(`       📌 También: "${searchResultsArray[i].title}"`);
                    }
                }
                
            } else {
                failedSearches++;
                searchResults[animeName] = {
                    status: 'NOT_FOUND',
                    count: 0,
                    title: null,
                    url: null
                };
                
                console.log(`    ❌ NO ENCONTRADO: "${animeName}"`);
            }
            
        } catch (error) {
            failedSearches++;
            searchResults[animeName] = {
                status: 'ERROR',
                count: 0,
                title: null,
                url: null,
                error: error.message
            };
            
            console.log(`    💥 ERROR: "${animeName}" - ${error.message}`);
        }
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Mostrar resumen detallado
    console.log(`\n${"=".repeat(80)}`);
    console.log("📊 RESUMEN DETALLADO DE RESULTADOS");
    console.log(`${"=".repeat(80)}`);
    
    console.log(`\n📈 ESTADÍSTICAS GENERALES:`);
    console.log(`   Total probados: ${totalTested}`);
    console.log(`   Búsquedas exitosas: ${successfulSearches} (${((successfulSearches/totalTested)*100).toFixed(1)}%)`);
    console.log(`   Búsquedas fallidas: ${failedSearches} (${((failedSearches/totalTested)*100).toFixed(1)}%)`);
    
    // Mostrar animes encontrados por categoría
    const foundAnimes = Object.entries(searchResults).filter(([name, data]) => data.status === 'SUCCESS');
    const notFoundAnimes = Object.entries(searchResults).filter(([name, data]) => data.status === 'NOT_FOUND');
    const errorAnimes = Object.entries(searchResults).filter(([name, data]) => data.status === 'ERROR');
    
    if (foundAnimes.length > 0) {
        console.log(`\n✅ ANIMES ENCONTRADOS (${foundAnimes.length}):`);
        foundAnimes.forEach(([searchTerm, data]) => {
            console.log(`   "${searchTerm}" → "${data.title}" (${data.count} resultado${data.count > 1 ? 's' : ''})`);
        });
    }
    
    if (notFoundAnimes.length > 0) {
        console.log(`\n❌ ANIMES NO ENCONTRADOS (${notFoundAnimes.length}):`);
        notFoundAnimes.forEach(([searchTerm, data]) => {
            console.log(`   "${searchTerm}"`);
        });
    }
    
    if (errorAnimes.length > 0) {
        console.log(`\n💥 ERRORES (${errorAnimes.length}):`);
        errorAnimes.forEach(([searchTerm, data]) => {
            console.log(`   "${searchTerm}" - ${data.error}`);
        });
    }
    
    // Análisis por género
    console.log(`\n🎭 ANÁLISIS POR CATEGORÍA:`);
    
    const categories = {
        "Shounen": ["naruto", "dragon ball", "one piece", "bleach", "attack on titan", "demon slayer", "jujutsu kaisen", "my hero academia", "hunter x hunter"],
        "Trending/Recientes": ["dandadan", "chainsaw man", "spy x family", "cyberpunk edgerunners", "kaguya sama", "mob psycho 100"],
        "Isekai/Fantasy": ["sword art online", "overlord", "re zero", "konosuba", "shield hero", "slime"],
        "Seinen/Mature": ["berserk", "tokyo ghoul", "parasyte", "monster", "psycho pass", "ghost in the shell"],
        "Romance/Slice of Life": ["your name", "weathering with you", "violet evergarden", "clannad", "toradora"],
        "Mecha/Sci-fi": ["evangelion", "gundam", "code geass", "cowboy bebop", "akira"],
        "Deportes": ["haikyu", "kuroko basketball", "blue lock"],
        "Horror/Thriller": ["another", "higurashi", "elfen lied"],
        "Clásicos": ["dragon ball z", "sailor moon", "pokemon", "digimon", "yu gi oh"]
    };
    
    for (let [category, animes] of Object.entries(categories)) {
        const foundInCategory = animes.filter(anime => searchResults[anime]?.status === 'SUCCESS').length;
        const totalInCategory = animes.length;
        const percentage = ((foundInCategory / totalInCategory) * 100).toFixed(1);
        
        console.log(`   ${category}: ${foundInCategory}/${totalInCategory} (${percentage}%)`);
    }
    
    // Recomendaciones basadas en resultados
    console.log(`\n💡 ANÁLISIS Y RECOMENDACIONES:`);
    
    if (successfulSearches / totalTested >= 0.8) {
        console.log(`   🎉 EXCELENTE: Tasa de éxito superior al 80%`);
        console.log(`   ✅ El módulo KaaTo tiene una cobertura muy buena de anime`);
    } else if (successfulSearches / totalTested >= 0.6) {
        console.log(`   👍 BUENO: Tasa de éxito entre 60-80%`);
        console.log(`   ✅ El módulo KaaTo tiene una cobertura decente de anime`);
    } else if (successfulSearches / totalTested >= 0.4) {
        console.log(`   ⚠️  MODERADO: Tasa de éxito entre 40-60%`);
        console.log(`   🔄 El módulo podría beneficiarse de más fuentes de anime`);
    } else {
        console.log(`   ❌ BAJO: Tasa de éxito menor al 40%`);
        console.log(`   🔧 Se recomienda revisar la API de búsqueda o agregar más fuentes`);
    }
    
    console.log(`\n🎯 CASOS DE USO RECOMENDADOS:`);
    if (foundAnimes.length > 0) {
        console.log(`   ✅ Mejor para: ${Object.entries(categories).filter(([cat, animes]) => {
            const found = animes.filter(anime => searchResults[anime]?.status === 'SUCCESS').length;
            return found / animes.length >= 0.7;
        }).map(([cat]) => cat).join(', ')}`);
    }
    
    console.log(`\n${"=".repeat(80)}`);
    console.log("🎬 PRUEBA EXTENSIVA COMPLETADA");
    console.log("El módulo KaaTo ha sido probado con una amplia variedad de anime");
    console.log(`${"=".repeat(80)}`);
}

// Ejecutar las pruebas extensivas
testExtensiveAnimeSearch().catch(console.error);
