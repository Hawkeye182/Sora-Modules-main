const fetch = require('node-fetch');

// Simular fetchv2 de Sora
function fetchv2(url, headers = {}) {
    console.log(`📡 Fetching: ${url}`);
    
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
    .then(response => {
        console.log(`📊 Status: ${response.status}`);
        return response.text().then(data => ({
            status: response.status,
            headers: response.headers,
            _data: data
        }));
    })
    .catch(error => {
        console.log(`❌ Error:`, error.message);
        return null;
    });
}

async function debugStreamExtraction() {
    console.log('🧪 DEBUG: EXACTLY WHAT URL SORA GETS\n');
    
    // Test exactamente como lo haría Sora
    const episodeUrl = 'https://kaa.to/episode/64cd832c44c6d04c12186496'; // Bleach ep 1
    console.log('🎯 Testing episode:', episodeUrl);
    console.log('🔄 Simulating Sora stream extraction...\n');
    
    try {
        // Paso 1: Cargar página del episodio (como Sora)
        console.log('1️⃣ LOADING EPISODE PAGE...');
        const pageResponse = await fetchv2(episodeUrl, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'es-419,es;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        });
        
        if (!pageResponse || pageResponse.status !== 200) {
            console.log('❌ Failed to load episode page');
            return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        }
        
        console.log('✅ Episode page loaded');
        const html = pageResponse._data;
        
        // Paso 2: Buscar servers en window.KAA (como en nuestro código)
        console.log('\n2️⃣ LOOKING FOR SERVERS...');
        const serversMatch = html.match(/servers:\[([^\]]+)\]/);
        
        if (!serversMatch) {
            console.log('❌ No servers array found');
            console.log('🔄 This would return bunny video fallback');
            return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        }
        
        console.log('✅ Found servers array');
        console.log('📄 Servers content:', serversMatch[1].substring(0, 100) + '...');
        
        // Paso 3: Extraer URL del servidor
        console.log('\n3️⃣ EXTRACTING SERVER URL...');
        const serverUrlMatch = serversMatch[1].match(/src:"([^"]+)"/);
        
        if (!serverUrlMatch) {
            console.log('❌ Could not extract server URL');
            return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        }
        
        const serverUrl = serverUrlMatch[1].replace(/\\u002F/g, '/');
        console.log('🔗 Server URL found:', serverUrl);
        
        // Paso 4: Extraer video ID (método mejorado)
        console.log('\n4️⃣ EXTRACTING VIDEO ID...');
        let videoId = null;
        
        try {
            const urlParams = new URL(serverUrl);
            
            // Método 1: parámetro 'v'
            videoId = urlParams.searchParams.get('v');
            console.log('   Method 1 (v param):', videoId);
            
            // Método 2: parámetro 'id' 
            if (!videoId) {
                videoId = urlParams.searchParams.get('id');
                console.log('   Method 2 (id param):', videoId);
            }
            
            // Método 3: extraer de path
            if (!videoId) {
                const pathMatch = serverUrl.match(/\/([a-f0-9]{24})/);
                if (pathMatch) {
                    videoId = pathMatch[1];
                    console.log('   Method 3 (path):', videoId);
                }
            }
        } catch (e) {
            console.log('❌ URL parsing error:', e.message);
        }
        
        if (!videoId) {
            console.log('❌ Could not extract video ID');
            console.log('🔄 Fallback to server URL:', serverUrl);
            console.log('\n🌐 COPY THIS URL TO TEST IN BROWSER:');
            console.log('=' .repeat(60));
            console.log(serverUrl);
            console.log('=' .repeat(60));
            return serverUrl;
        }
        
        console.log('🎯 Final extracted video ID:', videoId);
        
        // Paso 5: Construir y probar M3U8
        console.log('\n5️⃣ TESTING M3U8 ACCESS...');
        const m3u8Url = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        console.log('🎬 M3U8 URL:', m3u8Url);
        
        const m3u8Response = await fetchv2(m3u8Url, {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Origin': 'https://krussdomi.com',
            'Pragma': 'no-cache',
            'Referer': serverUrl,
            'Sec-Ch-Ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
        });
        
        console.log('📊 M3U8 Status:', m3u8Response ? m3u8Response.status : 'request failed');
        
        if (m3u8Response && m3u8Response.status === 200 && m3u8Response._data) {
            console.log('📄 M3U8 preview:', m3u8Response._data.substring(0, 150));
            
            if (m3u8Response._data.includes('#EXTM3U')) {
                console.log('✅ VALID M3U8 FOUND!');
                console.log('\n🎯 FINAL URL SORA WOULD RETURN:');
                console.log('=' .repeat(60));
                console.log(m3u8Url);
                console.log('=' .repeat(60));
                console.log('\n🌐 TEST IN BROWSER:');
                console.log('1. Copy URL above');
                console.log('2. Open in new tab (might download .m3u8 file)');
                console.log('3. Or use VLC: Media > Open Network Stream > paste URL');
                return m3u8Url;
            } else {
                console.log('❌ Response is not valid M3U8');
            }
        } else {
            console.log('❌ M3U8 request failed or blocked');
        }
        
        // Si M3U8 falla, usar server URL como fallback
        console.log('\n🔄 FALLING BACK TO SERVER URL');
        console.log('=' .repeat(60));
        console.log(serverUrl);
        console.log('=' .repeat(60));
        console.log('\n🌐 TEST IN BROWSER:');
        console.log('1. Copy URL above');
        console.log('2. Should open video player page');
        console.log('3. Right-click on video > "Copy video address" for direct URL');
        
        return serverUrl;
        
    } catch (error) {
        console.log('❌ Error in stream extraction:', error.message);
        console.log('🔄 Would return bunny video fallback');
        return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }
}

// Ejecutar debug
console.log('🚀 DEBUGGING STREAM EXTRACTION FOR SORA\n');
debugStreamExtraction()
    .then(finalUrl => {
        console.log('\n📋 FINAL RESULT SUMMARY:');
        console.log('URL Type:', typeof finalUrl);
        console.log('URL Value:', finalUrl);
        
        if (finalUrl.includes('BigBuckBunny')) {
            console.log('\n🐰 This explains why you see the bunny video!');
            console.log('💡 The module is falling back to test video');
        } else if (finalUrl.includes('hls.krussdomi.com')) {
            console.log('\n🎬 Real M3U8 stream found!');
            console.log('💡 This should work in Sora');
        } else if (finalUrl.includes('krussdomi.com')) {
            console.log('\n📺 Player URL found!');
            console.log('💡 This should work as fallback');
        }
        
        console.log('\n🧪 NEXT STEPS:');
        console.log('1. Test the URL above in your browser');
        console.log('2. If it works in browser but not Sora, we need different approach');
        console.log('3. If it doesn\'t work in browser either, need to debug further');
    })
    .catch(console.error);
