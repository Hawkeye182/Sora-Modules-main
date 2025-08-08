// 🐛 KaaTo Ultra Simple Debug - Para diagnosticar problema de API
// Versión minimalista que muestra cada paso

async function soraFetch(url, options = {}) {
    console.log("🔍 [DEBUG] soraFetch iniciado");
    
    try {
        if (typeof fetchv2 !== 'undefined') {
            console.log("✅ [DEBUG] Usando fetchv2");
            const response = await fetchv2(url, options);
            if (response && typeof response.json === 'function') {
                return response;
            } else {
                return {
                    ok: true,
                    status: 200,
                    json: async () => response,
                    text: async () => JSON.stringify(response)
                };
            }
        }
        
        console.log("⚡ [DEBUG] Usando fetch estándar");
        return await fetch(url, options);
        
    } catch (error) {
        console.error("❌ [DEBUG] Error en soraFetch:", error);
        return null;
    }
}

async function searchResults(keyword) {
    console.log("🔍 [DEBUG] searchResults iniciado con:", keyword);
    
    const results = [
        {
            title: "🐛 1. Módulo iniciado OK",
            link: "debug://1",
            image: "https://kaa.to/image/poster/1.webp"
        },
        {
            title: `🔍 2. Término: "${keyword}"`,
            link: "debug://2", 
            image: "https://kaa.to/image/poster/2.webp"
        },
        {
            title: `✅ 3. fetchv2: ${typeof fetchv2 !== 'undefined' ? 'SÍ' : 'NO'}`,
            link: "debug://3",
            image: "https://kaa.to/image/poster/3.webp"
        },
        {
            title: `🌐 4. fetch: ${typeof fetch !== 'undefined' ? 'SÍ' : 'NO'}`,
            link: "debug://4",
            image: "https://kaa.to/image/poster/4.webp"
        }
    ];
    
    // Intentar llamada paso a paso
    console.log("🚀 [DEBUG] Iniciando llamada API...");
    
    try {
        console.log("📝 [DEBUG] Paso 1: Preparando datos...");
        
        const url = 'https://kaa.to/api/search';
        const body = JSON.stringify({ query: keyword });
        
        console.log("📝 [DEBUG] Paso 2: URL preparada:", url);
        console.log("📝 [DEBUG] Paso 3: Body preparado:", body);
        
        results.push({
            title: "🚀 5. Iniciando llamada API...",
            link: "debug://5",
            image: "https://kaa.to/image/poster/5.webp"
        });
        
        console.log("📝 [DEBUG] Paso 4: Llamando soraFetch...");
        
        const response = await soraFetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });
        
        console.log("📝 [DEBUG] Paso 5: Respuesta recibida:", response);
        
        if (response === null) {
            results.push({
                title: "❌ 6. API retornó NULL",
                link: "debug://6",
                image: "https://kaa.to/image/poster/6.webp"
            });
        } else if (response && response.ok) {
            console.log("📝 [DEBUG] Paso 6: Respuesta OK, parseando JSON...");
            const data = await response.json();
            console.log("📝 [DEBUG] Paso 7: JSON parseado:", data);
            
            results.push({
                title: `🎯 6. API OK - ${Array.isArray(data) ? data.length : 'obj'} resultados`,
                link: "debug://6",
                image: "https://kaa.to/image/poster/6.webp"
            });
        } else {
            results.push({
                title: `❌ 6. API Error - ${response ? response.status : 'sin response'}`,
                link: "debug://6",
                image: "https://kaa.to/image/poster/6.webp"
            });
        }
        
    } catch (error) {
        console.error("❌ [DEBUG] Error capturado:", error);
        results.push({
            title: `⚠️ 6. Error: ${error.message.substring(0, 20)}...`,
            link: "debug://6",
            image: "https://kaa.to/image/poster/6.webp"
        });
    }
    
    console.log("📤 [DEBUG] Retornando", results.length, "resultados");
    return results;
}

// Funciones placeholder
async function extractDetails(url) {
    return {
        title: "🐛 Debug Details",
        description: "Debug URL: " + url,
        image: "https://kaa.to/image/poster/debug.webp",
        releaseDate: "2024"
    };
}

async function extractEpisodes(url) {
    return [
        { title: "🐛 Debug Episode 1", link: "debug://ep1", episode: 1 }
    ];
}

async function extractStreamUrl(url) {
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
