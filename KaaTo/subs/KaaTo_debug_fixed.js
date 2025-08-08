// 🐛 KaaTo Debug Module - Versión de prueba para diagnóstico
// Este módulo está diseñado para mostrar información de debug como resultados de búsqueda

// Función soraFetch con debug
async function soraFetch(url, options = {}) {
    console.log("🔍 [DEBUG] soraFetch llamada con:", url);
    
    try {
        // Intentar fetchv2 primero (método preferido de Sora)
        if (typeof fetchv2 !== 'undefined') {
            console.log("✅ [DEBUG] fetchv2 disponible");
            const response = await fetchv2(url, options);
            
            // fetchv2 en Sora puede retornar datos directamente o un Response object
            if (response && typeof response.json === 'function') {
                console.log("📦 [DEBUG] fetchv2 retornó Response object");
                return response;
            } else {
                console.log("📦 [DEBUG] fetchv2 retornó datos directamente");
                return {
                    ok: true,
                    status: 200,
                    json: async () => response,
                    text: async () => JSON.stringify(response)
                };
            }
        }
        
        // Fallback a fetch estándar
        console.log("⚡ [DEBUG] Usando fetch estándar");
        return await fetch(url, options);
        
    } catch (error) {
        console.error("❌ [DEBUG] Error en soraFetch:", error);
        return null;
    }
}

// Función de búsqueda que muestra información de debug
async function searchResults(keyword) {
    console.log("🔍 [DEBUG] searchResults llamada con keyword:", keyword);
    
    // Siempre retornar resultados de debug para verificar que funciona
    const debugResults = [
        {
            title: "🐛 DEBUG: Módulo funcionando",
            link: "debug://test1",
            image: "https://kaa.to/image/poster/123.webp"
        },
        {
            title: `🔍 DEBUG: Buscaste "${keyword}"`,
            link: "debug://test2", 
            image: "https://kaa.to/image/poster/456.webp"
        },
        {
            title: `✅ DEBUG: fetchv2 ${typeof fetchv2 !== 'undefined' ? 'disponible' : 'NO disponible'}`,
            link: "debug://test3",
            image: "https://kaa.to/image/poster/789.webp"
        }
    ];
    
    // Agregar debug de entorno primero
    debugResults.push({
        title: `🌐 DEBUG: fetch ${typeof fetch !== 'undefined' ? 'disponible' : 'NO disponible'}`,
        link: "debug://test4",
        image: "https://kaa.to/image/poster/fetch.webp"
    });
    
    // Intentar también hacer una llamada real a la API para diagnosticar
    try {
        console.log("🌐 [DEBUG] Intentando llamada real a API...");
        
        // Timeout para evitar que se cuelgue
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout 10s')), 10000)
        );
        
        const apiPromise = soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Sora/1.0'
            },
            body: JSON.stringify({
                query: keyword
            })
        });
        
        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        if (response && response.ok) {
            const data = await response.json();
            console.log("✅ [DEBUG] API respondió correctamente:", data);
            
            // Agregar resultado de éxito de API
            debugResults.push({
                title: `🎯 DEBUG: API OK - ${Array.isArray(data) ? data.length : 'objeto'} resultados`,
                link: "debug://api-success",
                image: "https://kaa.to/image/poster/success.webp"
            });
        } else if (response) {
            console.log("❌ [DEBUG] API falló:", response.status, response.statusText);
            debugResults.push({
                title: `❌ DEBUG: API falló - ${response.status}`,
                link: "debug://api-fail",
                image: "https://kaa.to/image/poster/fail.webp"
            });
        } else {
            console.log("❌ [DEBUG] Sin respuesta de API");
            debugResults.push({
                title: "❌ DEBUG: Sin respuesta API",
                link: "debug://api-null",
                image: "https://kaa.to/image/poster/null.webp"
            });
        }
    } catch (error) {
        console.error("❌ [DEBUG] Error en API:", error);
        debugResults.push({
            title: `⚠️ DEBUG: Error - ${error.message.substring(0, 30)}`,
            link: "debug://api-error",
            image: "https://kaa.to/image/poster/error.webp"
        });
    }
    
    console.log("📤 [DEBUG] Retornando resultados:", debugResults);
    return debugResults;
}

// Funciones placeholder para cumplir con la estructura del módulo
async function extractDetails(url) {
    console.log("📋 [DEBUG] extractDetails llamada con:", url);
    return {
        title: "🐛 Debug Details",
        description: "Este es un módulo de debug. URL: " + url,
        image: "https://kaa.to/image/poster/debug.webp",
        releaseDate: "2024"
    };
}

async function extractEpisodes(url) {
    console.log("📺 [DEBUG] extractEpisodes llamada con:", url);
    return [
        {
            title: "🐛 Debug Episode 1",
            link: "debug://episode1",
            episode: 1
        },
        {
            title: "🐛 Debug Episode 2", 
            link: "debug://episode2",
            episode: 2
        }
    ];
}

async function extractStreamUrl(url) {
    console.log("🎥 [DEBUG] extractStreamUrl llamada con:", url);
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
