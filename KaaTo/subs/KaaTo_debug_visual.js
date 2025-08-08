// 🔍 Debug Visual para Sora - Información mostrada como animes
// Para ver logs y entender qué funciona en el entorno de Sora

function searchResults(keyword) {
    // Crear resultados de debug mostrados como "animes"
    const debugResults = [
        {
            title: `🔧 fetchv2: ${typeof fetchv2 !== 'undefined' ? 'DISPONIBLE ✅' : 'NO DISPONIBLE ❌'}`,
            link: "debug://fetchv2",
            image: "https://via.placeholder.com/300x400/007acc/fff?text=fetchv2+Test"
        },
        {
            title: `🌐 fetch: ${typeof fetch !== 'undefined' ? 'DISPONIBLE ✅' : 'NO DISPONIBLE ❌'}`,
            link: "debug://fetch", 
            image: "https://via.placeholder.com/300x400/28a745/fff?text=fetch+Test"
        },
        {
            title: `⚡ Promise: ${typeof Promise !== 'undefined' ? 'SOPORTADO ✅' : 'NO SOPORTADO ❌'}`,
            link: "debug://promise",
            image: "https://via.placeholder.com/300x400/ffc107/fff?text=Promise+Test"
        },
        {
            title: `🔍 Búsqueda: "${keyword || 'sin keyword'}"`,
            link: "debug://query",
            image: "https://via.placeholder.com/300x400/dc3545/fff?text=Search+Query"
        },
        {
            title: `📱 console: ${typeof console !== 'undefined' ? 'DISPONIBLE ✅' : 'NO DISPONIBLE ❌'}`,
            link: "debug://console",
            image: "https://via.placeholder.com/300x400/6f42c1/fff?text=Console+Test"
        }
    ];
    
    // Intentar llamada a API de prueba
    if (typeof fetchv2 !== 'undefined') {
        try {
            const testResponse = fetchv2('https://httpbin.org/json');
            debugResults.push({
                title: `🎯 Test API: ${testResponse ? 'RESPUESTA RECIBIDA ✅' : 'SIN RESPUESTA ❌'}`,
                link: "debug://test-api",
                image: "https://via.placeholder.com/300x400/17a2b8/fff?text=API+Test"
            });
        } catch (error) {
            debugResults.push({
                title: `❌ Test API Error: ${error.message.substring(0, 30)}`,
                link: "debug://test-error",
                image: "https://via.placeholder.com/300x400/e74c3c/fff?text=API+Error"
            });
        }
        
        // Intentar llamada real a kaa.to
        try {
            const kaaResponse = fetchv2('https://kaa.to/api/search?q=naruto');
            debugResults.push({
                title: `🎌 kaa.to API: ${kaaResponse ? 'CONECTADO ✅' : 'SIN CONEXIÓN ❌'}`,
                link: "debug://kaa-api",
                image: "https://via.placeholder.com/300x400/20c997/fff?text=KaaTo+API"
            });
        } catch (error) {
            debugResults.push({
                title: `⚠️ kaa.to Error: ${error.message.substring(0, 30)}`,
                link: "debug://kaa-error",
                image: "https://via.placeholder.com/300x400/f39c12/fff?text=KaaTo+Error"
            });
        }
    } else {
        debugResults.push({
            title: `❌ Sin fetchv2: No se pueden hacer llamadas HTTP`,
            link: "debug://no-network",
            image: "https://via.placeholder.com/300x400/6c757d/fff?text=No+Network"
        });
    }
    
    return JSON.stringify(debugResults);
}

function extractDetails(url) {
    return JSON.stringify({
        title: "🔍 Debug de Detalles",
        description: "Módulo debug para entender Sora. URL: " + url,
        image: "https://via.placeholder.com/300x400/333/fff?text=Debug+Details",
        releaseDate: "2024",
        aliases: ["Debug Module", "Sora Test"]
    });
}

function extractEpisodes(url) {
    return JSON.stringify([
        { title: "Debug Episode 1", link: url + "/episode/1", episode: 1 },
        { title: "Debug Episode 2", link: url + "/episode/2", episode: 2 }
    ]);
}

function extractStreamUrl(url) {
    return JSON.stringify({
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        quality: "1080p",
        type: "mp4"
    });
}
