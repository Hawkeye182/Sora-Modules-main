// TEST ULTRA DEBUG CON HEADERS REALES
// Importar módulo KaaTo con máximo debugging
console.log('🚀🚀🚀 INICIANDO TEST ULTRA DEBUG 🚀🚀🚀');
console.log('⚡⚡⚡ TIMESTAMP:', new Date().toISOString());

// Función fetchv2 simulada para testing
global.fetchv2 = async (url, headers, method, body) => {
    console.log('🌐🌐🌐 FETCHV2 CALLED:', url);
    console.log('🔧🔧🔧 HEADERS:', headers);
    
    // Simular contenido HTML con video ID para DanDaDan ep 1
    const mockHtml = `
    <html>
    <head><title>DanDaDan Episodio 1</title></head>
    <body>
        <div id="player">
            <script>
                var videoId = "6713f500b97399e0e1ae2020";
                var source = "/source.php?id=6713f500b97399e0e1ae2020";
            </script>
        </div>
    </body>
    </html>
    `;
    
    return {
        status: 200,
        _data: mockHtml
    };
};

// Cargar el módulo
require('./KaaTo_v11_5_8_RESTORED.js');

async function testUltraDebug() {
    console.log('\n🎯🎯🎯 TESTING extractStreamUrl WITH REAL EPISODE URL 🎯🎯🎯');
    
    const episodeUrl = 'https://kaa.to/dandadan-da3b/ep-1-b324b5';
    console.log('📍📍📍 EPISODE URL:', episodeUrl);
    
    try {
        const result = await global.extractStreamUrl(episodeUrl);
        console.log('\n✅✅✅ STREAM RESULT:', result);
        console.log('🔍🔍🔍 RESULT TYPE:', typeof result);
        console.log('🔍🔍🔍 RESULT LENGTH:', result ? result.length : 0);
        
        if (result.includes('krussdomi.com')) {
            console.log('🎉🎉🎉 SUCCESS: STREAM URL CONTAINS KRUSSDOMI.COM! 🎉🎉🎉');
        }
        
        if (result.includes('6713f500b97399e0e1ae2020')) {
            console.log('🎯🎯🎯 SUCCESS: CORRECT VIDEO ID EXTRACTED! 🎯🎯🎯');
        }
        
        // Verificar si retorna JSON con headers anti-bloqueo
        try {
            const jsonResult = JSON.parse(result);
            if (jsonResult.url && jsonResult.headers) {
                console.log('🛡️🛡️🛡️ SUCCESS: JSON WITH ANTI-BLOCK HEADERS! 🛡️🛡️🛡️');
                console.log('🌐🌐🌐 URL:', jsonResult.url);
                console.log('🔧🔧🔧 ORIGIN HEADER:', jsonResult.headers.origin);
                console.log('🔧🔧🔧 REFERER HEADER:', jsonResult.headers.referer);
                
                if (jsonResult.headers.origin === 'https://kaa.to') {
                    console.log('✅✅✅ ORIGIN CORRECTO PARA BYPASS! ✅✅✅');
                }
            }
        } catch (e) {
            console.log('📄📄📄 RESULT IS STRING (NOT JSON):', result);
        }
        
    } catch (error) {
        console.log('❌❌❌ TEST ERROR:', error.message);
        console.log('💥💥💥 ERROR STACK:', error.stack);
    }
}

testUltraDebug();
