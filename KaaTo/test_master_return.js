/**
 * TEST SIMPLE KaaTo v11.5.5 - MASTER PLAYLIST RETURN
 * Verifica que devuelve master.m3u8 directo para iOS player
 */

const fetch = require('node-fetch');

async function fetchv2(url, headers, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: headers || {}
        };
        
        if (body && method !== 'GET') {
            options.body = body;
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            console.log(`HTTP ${response.status}: ${response.statusText}`);
            return await response.text();
        }
        
        return await response.text();
    } catch (error) {
        throw new Error(`fetchv2 error: ${error.message}`);
    }
}

async function testMasterPlaylistReturn() {
    console.log('🔬 TESTING MASTER PLAYLIST RETURN v11.5.5...\n');
    
    // Simular datos de episodio con Video ID conocido
    const testHtml = `
    <html>
        <body>
            <script>
                // Simular datos como los que están en la página real
                var videoData = {
                    id: "6713f500b97399e0e1ae2020",
                    source: "source.php?id=6713f500b97399e0e1ae2020"
                };
            </script>
        </body>
    </html>
    `;
    
    console.log('📄 SIMULATED HTML INPUT:');
    console.log(testHtml);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Simular lógica de extractStreamUrl v11.5.5
    console.log('🔍 RUNNING v11.5.5 LOGIC...');
    
    // PATTERN 1: Buscar M3U8 directo
    const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
    const m3u8Urls = testHtml.match(m3u8Pattern);
    
    if (m3u8Urls && m3u8Urls.length > 0) {
        console.log('✅ FOUND DIRECT M3U8:', m3u8Urls[0]);
        return m3u8Urls[0];
    }
    
    // PATTERN 2: Buscar source.php patterns
    const sourcePattern = /source\.php\?id=([a-f0-9]{24})/gi;
    const sourceMatches = testHtml.match(sourcePattern);
    
    if (sourceMatches) {
        console.log('✅ FOUND SOURCE API PATTERN:', sourceMatches[0]);
        const videoId = sourceMatches[0].match(/[a-f0-9]{24}/)[0];
        console.log('🎮 EXTRACTED VIDEO ID:', videoId);
        
        const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        console.log('🎯 CONSTRUCTED MASTER URL:', masterUrl);
        
        // Verificar que el master URL funciona
        console.log('\n🔬 TESTING MASTER URL...');
        try {
            const masterContent = await fetchv2(masterUrl, {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Origin': 'https://krussdomi.com',
                'Referer': 'https://krussdomi.com/',
            });
            
            console.log('✅ MASTER URL RESPONSE (first 300 chars):');
            console.log(masterContent.substring(0, 300));
            
            // Verificar que contiene streams
            if (masterContent.includes('#EXT-X-STREAM-INF')) {
                console.log('✅ MASTER CONTAINS VIDEO STREAMS');
            }
            if (masterContent.includes('TYPE=AUDIO')) {
                console.log('✅ MASTER CONTAINS AUDIO STREAMS');
            }
            
        } catch (error) {
            console.log('❌ MASTER URL TEST FAILED:', error.message);
        }
        
        console.log('\n🚀 RESULT: v11.5.5 would return:', masterUrl);
        return masterUrl;
    }
    
    // PATTERN 3: Video IDs
    const videoIdPattern = /[a-f0-9]{24}/g;
    const videoIds = testHtml.match(videoIdPattern);
    
    if (videoIds && videoIds.length > 0) {
        console.log('✅ FOUND VIDEO IDs:', videoIds);
        const selectedVideoId = videoIds[0]; // Simplificado para test
        
        const masterUrl = `https://hls.krussdomi.com/manifest/${selectedVideoId}/master.m3u8`;
        console.log('🎯 CONSTRUCTED MASTER URL:', masterUrl);
        console.log('🚀 RESULT: v11.5.5 would return:', masterUrl);
        return masterUrl;
    }
    
    console.log('❌ NO PATTERNS FOUND');
    return null;
}

testMasterPlaylistReturn();
