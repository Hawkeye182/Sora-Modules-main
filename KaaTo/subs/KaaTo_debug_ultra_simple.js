// Debug ultra-simple - Solo datos estáticos garantizados
function searchResults(keyword) {
    return JSON.stringify([
        {
            title: "🔧 TEST 1: Módulo cargado correctamente",
            link: "debug://loaded",
            image: "https://via.placeholder.com/300x400/007acc/fff?text=LOADED+OK"
        },
        {
            title: "🔍 TEST 2: Keyword = " + (keyword || "vacio"),
            link: "debug://keyword", 
            image: "https://via.placeholder.com/300x400/28a745/fff?text=KEYWORD+OK"
        },
        {
            title: "🎯 TEST 3: JSON stringify funciona",
            link: "debug://json",
            image: "https://via.placeholder.com/300x400/ffc107/fff?text=JSON+OK"
        },
        {
            title: "⚡ TEST 4: Funciones básicas OK",
            link: "debug://functions",
            image: "https://via.placeholder.com/300x400/dc3545/fff?text=FUNCTIONS+OK"
        },
        {
            title: "✅ TEST 5: Debug completo funcionando",
            link: "debug://complete",
            image: "https://via.placeholder.com/300x400/20c997/fff?text=DEBUG+COMPLETE"
        }
    ]);
}

function extractDetails(url) {
    return JSON.stringify({
        title: "Debug Details",
        description: "URL: " + url,
        image: "https://via.placeholder.com/300x400/333/fff?text=DETAILS",
        releaseDate: "2024"
    });
}

function extractEpisodes(url) {
    return JSON.stringify([
        { title: "Episode 1", link: url + "/1", episode: 1 }
    ]);
}

function extractStreamUrl(url) {
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p"
    });
}
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
    
    // FORZAR que aparezca el 5º bloque SIEMPRE
    results.push({
        title: "🚀 5. Forzado: Antes del try",
        link: "debug://5",
        image: "https://kaa.to/image/poster/5.webp"
    });
    
    // Intentar llamada paso a paso
    console.log("🚀 [DEBUG] Iniciando llamada API...");
    
    try {
        console.log("📝 [DEBUG] Paso 1: Preparando datos...");
        
        results.push({
            title: "📝 6. Dentro del try",
            link: "debug://6",
            image: "https://kaa.to/image/poster/6.webp"
        });
        
        const url = 'https://kaa.to/api/search';
        const body = JSON.stringify({ query: keyword });
        
        console.log("📝 [DEBUG] Paso 2: URL preparada:", url);
        console.log("📝 [DEBUG] Paso 3: Body preparado:", body);
        
        results.push({
            title: "� 7. URL y Body preparados",
            link: "debug://7",
            image: "https://kaa.to/image/poster/7.webp"
        });
        
        console.log("📝 [DEBUG] Paso 4: Llamando soraFetch...");
        
        // NO hacer la llamada real, solo simular
        results.push({
            title: "⚠️ 8. Simulando llamada (sin API real)",
            link: "debug://8",
            image: "https://kaa.to/image/poster/8.webp"
        });
        
        /*
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
        */
        
    } catch (error) {
        console.error("❌ [DEBUG] Error capturado:", error);
        results.push({
            title: `⚠️ 9. Error: ${error.message.substring(0, 15)}...`,
            link: "debug://9",
            image: "https://kaa.to/image/poster/9.webp"
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
