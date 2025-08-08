// Test extensivo con múltiples animes para verificar capacidad de búsqueda - VERSIÓN CORREGIDA
const fs = require('fs');
const vm = require('vm');

// Función simulada de soraFetch
async function soraFetch(url, options = {}) {
    const { default: fetch } = await import('node-fetch');
    
    // Headers por defecto para mantener consistencia
    const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://kaa.to',
        'Referer': 'https://kaa.to/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
    };

    const finalOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    return fetch(url, finalOptions);
}

// Cargar y evaluar el módulo KaaTo
function loadKaaToModule() {
    const moduleCode = fs.readFileSync('./KaaTo_final_enhanced.js', 'utf8');
    
    // Crear sandbox con funciones necesarias
    const sandbox = {
        soraFetch: soraFetch,
        console: console,
        require: require,
        setTimeout: setTimeout,
        setInterval: setInterval,
        clearTimeout: clearTimeout,
        clearInterval: clearInterval,
        // Variables globales que se definirán en el módulo
        searchResults: null,
        extractDetails: null,
        extractEpisodes: null,
        extractStreamUrl: null
    };
    
    // Crear contexto y ejecutar el código
    vm.createContext(sandbox);
    vm.runInContext(moduleCode, sandbox);
    
    // Retornar las funciones exportadas
    return {
        searchResults: sandbox.searchResults,
        extractDetails: sandbox.extractDetails,
        extractEpisodes: sandbox.extractEpisodes,
        extractStreamUrl: sandbox.extractStreamUrl
    };
}

async function testExtensiveAnimeSearch() {
    console.log("=".repeat(80));
    console.log("🎬 PRUEBA EXTENSIVA DE BÚSQUEDA DE ANIMES - KaaTo Module (FIXED)");
    console.log("Probando capacidad de búsqueda con múltiples animes populares");
    console.log("=".repeat(80));
    
    // Cargar el módulo
    let kaaToModule;
    try {
        kaaToModule = loadKaaToModule();
        console.log("✅ Módulo KaaTo cargado exitosamente");
    } catch (error) {
        console.log("❌ Error al cargar el módulo:", error.message);
        return;
    }
    
    // Lista completa de animes para probar (organizada por categorías)
    const testAnimes = {
        "Shounen": [
            "naruto", "dragon ball", "one piece", "bleach", "attack on titan",
            "demon slayer", "jujutsu kaisen", "my hero academia", "hunter x hunter"
        ],
        "Trending/Recientes": [
            "dandadan", "chainsaw man", "spy x family", "cyberpunk edgerunners", 
            "kaguya sama", "mob psycho 100"
        ],
        "Isekai/Fantasy": [
            "sword art online", "overlord", "re zero", "konosuba", "shield hero", "slime"
        ],
        "Seinen/Mature": [
            "berserk", "tokyo ghoul", "parasyte", "monster", "psycho pass", "ghost in the shell"
        ],
        "Romance/Slice of Life": [
            "your name", "weathering with you", "violet evergarden", "clannad", "toradora"
        ],
        "Mecha/Sci-fi": [
            "evangelion", "gundam", "code geass", "cowboy bebop", "akira"
        ],
        "Deportes": [
            "haikyu", "kuroko basketball", "blue lock"
        ],
        "Horror/Thriller": [
            "another", "higurashi", "elfen lied"
        ],
        "Clásicos": [
            "dragon ball z", "sailor moon", "pokemon", "digimon", "yu gi oh"
        ]
    };
    
    // Aplanar la lista para obtener todos los animes
    let allAnimes = [];
    Object.values(testAnimes).forEach(categoryAnimes => {
        allAnimes = allAnimes.concat(categoryAnimes);
    });
    
    console.log(`📊 Iniciando pruebas con ${allAnimes.length} animes diferentes...`);
    
    // Contadores para estadísticas
    let totalTested = 0;
    let successful = 0;
    let failed = 0;
    let errors = [];
    let successfulSearches = [];
    
    // Estadísticas por categoría
    let categoryStats = {};
    Object.keys(testAnimes).forEach(category => {
        categoryStats[category] = { total: testAnimes[category].length, success: 0 };
    });
    
    // Probar cada anime
    for (let i = 0; i < allAnimes.length; i++) {
        const anime = allAnimes[i];
        totalTested++;
        
        try {
            console.log(`${String(totalTested).padStart(2, '0')}. 🔍 Buscando: "${anime}"`);
            
            // Realizar búsqueda
            const results = await kaaToModule.searchResults(anime);
            
            // Verificar resultado
            if (results && results.length > 0) {
                successful++;
                successfulSearches.push(anime);
                console.log(`    ✅ ÉXITO: "${anime}" - ${results.length} resultado(s) encontrado(s)`);
                
                // Actualizar estadísticas por categoría
                Object.keys(testAnimes).forEach(category => {
                    if (testAnimes[category].includes(anime)) {
                        categoryStats[category].success++;
                    }
                });
                
                // Mostrar primer resultado como ejemplo
                if (results[0]) {
                    console.log(`       📺 Primer resultado: "${results[0].title || results[0].name || 'Sin título'}"`);
                }
            } else {
                failed++;
                errors.push(`"${anime}" - Sin resultados encontrados`);
                console.log(`    ❌ SIN RESULTADOS: "${anime}"`);
            }
            
            // Pausa entre búsquedas para no sobrecargar la API
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            failed++;
            const errorMsg = `"${anime}" - ${error.message}`;
            errors.push(errorMsg);
            console.log(`    💥 ERROR: ${errorMsg}`);
        }
    }
    
    // Mostrar resumen detallado
    console.log("=".repeat(80));
    console.log("📊 RESUMEN DETALLADO DE RESULTADOS");
    console.log("=".repeat(80));
    
    console.log("📈 ESTADÍSTICAS GENERALES:");
    console.log(`   Total probados: ${totalTested}`);
    console.log(`   Búsquedas exitosas: ${successful} (${((successful/totalTested)*100).toFixed(1)}%)`);
    console.log(`   Búsquedas fallidas: ${failed} (${((failed/totalTested)*100).toFixed(1)}%)`);
    
    if (successfulSearches.length > 0) {
        console.log(`✅ ÉXITOS (${successfulSearches.length}):`);
        successfulSearches.forEach(anime => {
            console.log(`   "${anime}"`);
        });
    }
    
    if (errors.length > 0) {
        console.log(`💥 ERRORES (${errors.length}):`);
        errors.slice(0, 10).forEach(error => { // Mostrar solo los primeros 10 errores
            console.log(`   ${error}`);
        });
        if (errors.length > 10) {
            console.log(`   ... y ${errors.length - 10} errores más`);
        }
    }
    
    console.log("🎭 ANÁLISIS POR CATEGORÍA:");
    Object.keys(categoryStats).forEach(category => {
        const stats = categoryStats[category];
        const percentage = ((stats.success / stats.total) * 100).toFixed(1);
        console.log(`   ${category}: ${stats.success}/${stats.total} (${percentage}%)`);
    });
    
    // Evaluación y recomendaciones
    const successRate = (successful / totalTested) * 100;
    console.log("💡 ANÁLISIS Y RECOMENDACIONES:");
    
    if (successRate >= 70) {
        console.log("   ✅ EXCELENTE: Muy buena cobertura de anime");
    } else if (successRate >= 40) {
        console.log("   ⚠️  BUENO: Cobertura decente, se puede mejorar");
    } else {
        console.log("   ❌ BAJO: Tasa de éxito menor al 40%");
        console.log("   🔧 Se recomienda revisar la API de búsqueda o agregar más fuentes");
    }
    
    console.log("🎯 CASOS DE USO RECOMENDADOS:");
    if (successfulSearches.length > 0) {
        console.log(`   El módulo funciona mejor con animes como: ${successfulSearches.slice(0, 5).join(', ')}`);
        if (successfulSearches.length > 5) {
            console.log(`   Y ${successfulSearches.length - 5} títulos más...`);
        }
    }
    
    console.log("=".repeat(80));
    console.log("🎬 PRUEBA EXTENSIVA COMPLETADA");
    console.log("El módulo KaaTo ha sido probado con una amplia variedad de anime");
    console.log("=".repeat(80));
}

// Ejecutar la prueba
testExtensiveAnimeSearch().catch(console.error);
