// 🔍 Debug para Sora - Entendiendo qué funciona y qué no
// Basado en el análisis del código fuente de Sora

function searchResults(keyword) {
    console.log("🔍 [SORA-DEBUG] searchResults iniciado con keyword:", keyword);
    
    // Mostrar información del entorno de Sora
    const results = [
        {
            title: "🔧 1. Entorno JavaScript",
            link: "debug://env",
            image: "https://kaa.to/image/poster/env.webp"
        },
        {
            title: `🔍 2. Keyword recibido: "${keyword}"`,
            link: "debug://keyword",
            image: "https://kaa.to/image/poster/keyword.webp"
        },
        {
            title: `✅ 3. fetchv2: ${typeof fetchv2 !== 'undefined' ? 'DISPONIBLE' : 'NO DISPONIBLE'}`,
            link: "debug://fetchv2",
            image: "https://kaa.to/image/poster/fetchv2.webp"
        },
        {
            title: `🌐 4. fetch: ${typeof fetch !== 'undefined' ? 'DISPONIBLE' : 'NO DISPONIBLE'}`,
            link: "debug://fetch",
            image: "https://kaa.to/image/poster/fetch.webp"
        },
        {
            title: `📱 5. console: ${typeof console !== 'undefined' ? 'DISPONIBLE' : 'NO DISPONIBLE'}`,
            link: "debug://console", 
            image: "https://kaa.to/image/poster/console.webp"
        }
    ];
    
    // INTENTAR usar fetchv2 de la forma que Sora espera
    if (typeof fetchv2 !== 'undefined') {
        console.log("🚀 [SORA-DEBUG] Intentando fetchv2...");
        
        try {
            // Llamada SIMPLE a fetchv2 (como en el código de Sora)
            const response = fetchv2('https://httpbin.org/json');
            
            console.log("📦 [SORA-DEBUG] fetchv2 retornó:", typeof response);
            
            if (response && typeof response.then === 'function') {
                console.log("✅ [SORA-DEBUG] fetchv2 retornó Promise");
                results.push({
                    title: "🎯 6. fetchv2 retornó PROMISE",
                    link: "debug://promise",
                    image: "https://kaa.to/image/poster/promise.webp"
                });
            } else {
                console.log("📦 [SORA-DEBUG] fetchv2 retornó datos directos");
                results.push({
                    title: "📦 6. fetchv2 retornó DATOS DIRECTOS",
                    link: "debug://direct",
                    image: "https://kaa.to/image/poster/direct.webp"
                });
            }
        } catch (error) {
            console.log("❌ [SORA-DEBUG] Error en fetchv2:", error);
            results.push({
                title: `❌ 6. Error fetchv2: ${error.message}`,
                link: "debug://error",
                image: "https://kaa.to/image/poster/error.webp"
            });
        }
    }
    
    // INTENTAR una llamada REAL a kaa.to API
    if (typeof fetchv2 !== 'undefined') {
        console.log("🌐 [SORA-DEBUG] Intentando API real de kaa.to...");
        
        try {
            const apiResponse = fetchv2('https://kaa.to/api/search', {
                'Content-Type': 'application/json'
            }, 'POST', {
                query: keyword
            });
            
            console.log("🎯 [SORA-DEBUG] API kaa.to respondió:", typeof apiResponse);
            
            if (apiResponse && typeof apiResponse.then === 'function') {
                results.push({
                    title: "🎉 7. API kaa.to - Promise OK",
                    link: "debug://api-promise",
                    image: "https://kaa.to/image/poster/api-ok.webp"
                });
            } else if (apiResponse) {
                results.push({
                    title: "⚡ 7. API kaa.to - Datos directos",
                    link: "debug://api-direct",
                    image: "https://kaa.to/image/poster/api-direct.webp"
                });
            } else {
                results.push({
                    title: "❌ 7. API kaa.to - Sin respuesta",
                    link: "debug://api-null",
                    image: "https://kaa.to/image/poster/api-null.webp"
                });
            }
        } catch (error) {
            console.log("❌ [SORA-DEBUG] Error en API kaa.to:", error);
            results.push({
                title: `⚠️ 7. API Error: ${error.message.substring(0, 20)}`,
                link: "debug://api-error",
                image: "https://kaa.to/image/poster/api-error.webp"
            });
        }
    }
    
    console.log("📤 [SORA-DEBUG] Retornando", results.length, "resultados");
    return JSON.stringify(results);
}

function extractDetails(url) {
    console.log("📋 [SORA-DEBUG] extractDetails llamado con:", url);
    
    return JSON.stringify({
        title: "🔍 Debug de Detalles",
        description: "Este es el módulo debug para entender cómo funciona Sora internamente. URL: " + url,
        image: "https://kaa.to/image/poster/debug.webp",
        releaseDate: "2024",
        aliases: ["Debug Module", "Sora Test"]
    });
}

function extractEpisodes(url) {
    console.log("📺 [SORA-DEBUG] extractEpisodes llamado con:", url);
    
    return JSON.stringify([
        { title: "Debug Episode 1", link: url + "/episode/1", episode: 1 },
        { title: "Debug Episode 2", link: url + "/episode/2", episode: 2 }
    ]);
}

function extractStreamUrl(url) {
    console.log("🎥 [SORA-DEBUG] extractStreamUrl llamado con:", url);
    
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p",
        type: "mp4"
    });
}
