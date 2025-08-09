// Test para debugging específico de la extracción de video ID
const fetch = require('node-fetch');

global.fetchv2 = async function(url, headers, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: headers || {}
    };
    
    if (body && method !== 'GET') {
        options.body = body;
    }
    
    try {
        const response = await fetch(url, options);
        const _data = await response.text();
        
        const result = {
            status: response.status,
            headers: response.headers,
            _data: _data
        };
        
        return result;
    } catch (error) {
        throw error;
    }
};

async function testVideoIdExtraction() {
    console.log('🔍 DEBUGGING VIDEO ID EXTRACTION\n');
    
    try {
        // Obtener la página del episodio directamente
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log(`📺 Getting episode page: ${episodeUrl}`);
        
        const response = await fetchv2(episodeUrl);
        
        if (response && response.status === 200 && response._data) {
            const html = response._data;
            
            // Buscar el iframe de krussdomi
            console.log('\n🔍 Looking for krussdomi iframe...');
            const iframeRegex = /<iframe[^>]*src=["']([^"']*krussdomi[^"']*)["']/i;
            const iframeMatch = html.match(iframeRegex);
            
            if (iframeMatch) {
                const iframeSrc = iframeMatch[1];
                console.log(`✅ Found iframe: ${iframeSrc}`);
                
                // Extraer el video ID
                const idMatch = iframeSrc.match(/id=([^&]+)/);
                if (idMatch) {
                    const videoId = idMatch[1];
                    console.log(`✅ Extracted video ID: ${videoId}`);
                    
                    // Probar el M3U8 con este ID exacto
                    const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
                    console.log(`\n🔍 Testing M3U8 URL: ${masterUrl}`);
                    
                    const m3u8Response = await fetchv2(masterUrl);
                    console.log(`📊 M3U8 Response: ${m3u8Response.status}`);
                    
                    if (m3u8Response.status === 200) {
                        console.log('✅ M3U8 WORKS! Content:');
                        console.log(m3u8Response._data.substring(0, 500));
                    } else {
                        console.log('❌ M3U8 Failed. Response:');
                        console.log(m3u8Response._data);
                    }
                } else {
                    console.log('❌ No video ID found in iframe src');
                }
            } else {
                console.log('❌ No krussdomi iframe found');
                
                // Buscar cualquier iframe
                console.log('\n🔍 Looking for any iframe...');
                const anyIframeRegex = /<iframe[^>]*src=["']([^"']*)["']/gi;
                const allIframes = [...html.matchAll(anyIframeRegex)];
                
                if (allIframes.length > 0) {
                    console.log(`Found ${allIframes.length} iframe(s):`);
                    allIframes.forEach((match, i) => {
                        console.log(`  ${i + 1}: ${match[1]}`);
                    });
                } else {
                    console.log('❌ No iframes found at all');
                }
            }
        } else {
            console.log(`❌ Failed to get episode page: ${response ? response.status : 'no response'}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testVideoIdExtraction();
