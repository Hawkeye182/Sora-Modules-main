// 🐛 Debug Inside Sora App - Diagnóstico específico para entorno móvil
// Este módulo nos dirá exactamente qué funciona y qué no dentro de Sora

function searchResults(keyword) {
    console.log("🔍 [SORA DEBUG] Iniciando búsqueda dentro de la app");
    
    const debugInfo = [];
    
    // 1. Verificar entorno básico
    debugInfo.push({
        title: "📱 1. ENTORNO SORA DETECTADO",
        link: "debug://env",
        image: "https://kaa.to/image/poster/debug1.webp"
    });
    
    // 2. Verificar keyword recibida
    debugInfo.push({
        title: `🔍 2. KEYWORD: "${keyword}"`,
        link: "debug://keyword",
        image: "https://kaa.to/image/poster/debug2.webp"
    });
    
    // 3. Verificar disponibilidad de funciones de red
    debugInfo.push({
        title: `📡 3. fetch: ${typeof fetch !== 'undefined' ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`,
        link: "debug://fetch",
        image: "https://kaa.to/image/poster/debug3.webp"
    });
    
    debugInfo.push({
        title: `📡 4. fetchv2: ${typeof fetchv2 !== 'undefined' ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`,
        link: "debug://fetchv2",
        image: "https://kaa.to/image/poster/debug4.webp"
    });
    
    // 5. Verificar XMLHttpRequest
    debugInfo.push({
        title: `📡 5. XMLHttpRequest: ${typeof XMLHttpRequest !== 'undefined' ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`,
        link: "debug://xhr",
        image: "https://kaa.to/image/poster/debug5.webp"
    });
    
    // 6. Verificar capacidades de console
    debugInfo.push({
        title: `📝 6. console: ${typeof console !== 'undefined' ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`,
        link: "debug://console",
        image: "https://kaa.to/image/poster/debug6.webp"
    });
    
    // 7. Verificar JSON
    debugInfo.push({
        title: `📄 7. JSON: ${typeof JSON !== 'undefined' ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`,
        link: "debug://json",
        image: "https://kaa.to/image/poster/debug7.webp"
    });
    
    // 8. Verificar capacidades de tiempo
    debugInfo.push({
        title: `⏰ 8. setTimeout: ${typeof setTimeout !== 'undefined' ? '✅ DISPONIBLE' : '❌ NO DISPONIBLE'}`,
        link: "debug://timeout",
        image: "https://kaa.to/image/poster/debug8.webp"
    });
    
    // 9. Intentar crear una promesa simple
    try {
        const testPromise = new Promise((resolve) => resolve("test"));
        debugInfo.push({
            title: "✅ 9. Promise: FUNCIONA",
            link: "debug://promise",
            image: "https://kaa.to/image/poster/debug9.webp"
        });
    } catch (error) {
        debugInfo.push({
            title: `❌ 9. Promise: ERROR - ${error.message}`,
            link: "debug://promise",
            image: "https://kaa.to/image/poster/debug9.webp"
        });
    }
    
    // 10. Verificar globalThis/window
    const globalObj = typeof globalThis !== 'undefined' ? 'globalThis' : 
                     typeof window !== 'undefined' ? 'window' : 
                     typeof global !== 'undefined' ? 'global' : 'unknown';
    
    debugInfo.push({
        title: `🌐 10. Global: ${globalObj}`,
        link: "debug://global",
        image: "https://kaa.to/image/poster/debug10.webp"
    });
    
    // 11. Mostrar información del navegador/webview
    const userAgent = typeof navigator !== 'undefined' && navigator.userAgent ? 
                     navigator.userAgent.substring(0, 50) + "..." : "No disponible";
    
    debugInfo.push({
        title: `📱 11. UserAgent: ${userAgent}`,
        link: "debug://ua",
        image: "https://kaa.to/image/poster/debug11.webp"
    });
    
    // 12. Intentar acceso básico a red (sin async)
    debugInfo.push({
        title: "🌐 12. Intentando test de conectividad...",
        link: "debug://network",
        image: "https://kaa.to/image/poster/debug12.webp"
    });
    
    // 13. Mostrar el JSON final
    const resultsJson = JSON.stringify(debugInfo);
    debugInfo.push({
        title: `📄 13. JSON generado: ${resultsJson.length} chars`,
        link: "debug://jsonsize",
        image: "https://kaa.to/image/poster/debug13.webp"
    });
    
    console.log("🐛 [SORA DEBUG] Información completa:", debugInfo);
    console.log("🐛 [SORA DEBUG] JSON a retornar:", resultsJson);
    
    return resultsJson;
}

function extractDetails(url) {
    console.log("📋 [SORA DEBUG] extractDetails llamado con:", url);
    
    const debugDetail = {
        title: "🐛 DEBUG: extractDetails funcionando",
        description: `Esta función fue llamada con la URL: ${url}. Si ves esto, significa que la navegación y extracción de detalles está funcionando correctamente en Sora.`,
        image: "https://kaa.to/image/poster/debug_detail.webp",
        releaseDate: "2024",
        aliases: ["Debug Details", "Función Funcionando", "Test OK"]
    };
    
    return JSON.stringify(debugDetail);
}

function extractEpisodes(url) {
    console.log("📺 [SORA DEBUG] extractEpisodes llamado con:", url);
    
    const debugEpisodes = [
        {
            title: "🐛 DEBUG Episode 1: Función funcionando",
            link: `${url}/episode/1`,
            episode: 1
        },
        {
            title: "🐛 DEBUG Episode 2: extractEpisodes OK",
            link: `${url}/episode/2`,
            episode: 2
        },
        {
            title: "🐛 DEBUG Episode 3: Navegación correcta",
            link: `${url}/episode/3`,
            episode: 3
        }
    ];
    
    return JSON.stringify(debugEpisodes);
}

function extractStreamUrl(url) {
    console.log("🎥 [SORA DEBUG] extractStreamUrl llamado con:", url);
    
    const debugStream = {
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "DEBUG_1080p",
        type: "mp4",
        debug: "Si este video se reproduce, extractStreamUrl funciona correctamente"
    };
    
    return JSON.stringify(debugStream);
}
