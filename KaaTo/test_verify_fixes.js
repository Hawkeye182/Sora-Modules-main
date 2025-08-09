const fetch = require('node-fetch');

// Simular fetchv2 de Sora
function fetchv2(url, headers = {}) {
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
    .then(response => {
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

async function testRealStreamExtraction() {
    console.log('🧪 TESTING REAL STREAM EXTRACTION v3.5.0\n');
    
    const episodeUrl = 'https://kaa.to/episode/64cd832c44c6d04c12186496';
    console.log('🎯 Episode:', episodeUrl);
    
    try {
        const pageResponse = await fetchv2(episodeUrl, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'es-419,es;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://kaa.to/',
            'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Sec-Gpc': '1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        });
        
        if (pageResponse && pageResponse.status === 200 && pageResponse._data) {
            const html = pageResponse._data;
            console.log('✅ Page loaded, size:', html.length);
            
            const serversMatch = html.match(/servers:\[([^\]]+)\]/);
            
            if (serversMatch) {
                console.log('✅ Servers found in window.KAA');
                
                const serverUrlMatch = serversMatch[1].match(/src:"([^"]+)"/);
                
                if (serverUrlMatch) {
                    const serverUrl = serverUrlMatch[1].replace(/\\u002F/g, '/');
                    console.log('🔗 Server URL:', serverUrl);
                    
                    // Extracción mejorada de video ID
                    let videoId = null;
                    
                    try {
                        const urlParams = new URL(serverUrl);
                        videoId = urlParams.searchParams.get('v');
                        
                        if (!videoId) {
                            videoId = urlParams.searchParams.get('id');
                        }
                        
                        if (!videoId) {
                            const pathMatch = serverUrl.match(/\/([a-f0-9]{24})/);
                            if (pathMatch) {
                                videoId = pathMatch[1];
                            }
                        }
                    } catch (e) {
                        console.log('❌ URL parsing error:', e.message);
                    }
                    
                    if (videoId) {
                        console.log('🎯 Video ID:', videoId);
                        
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
                        
                        console.log('📊 M3U8 Status:', m3u8Response ? m3u8Response.status : 'failed');
                        
                        if (m3u8Response && m3u8Response.status === 200 && m3u8Response._data && m3u8Response._data.includes('#EXTM3U')) {
                            console.log('\n🎉 SUCCESS! M3U8 válido encontrado');
                            console.log('📱 Preview:', m3u8Response._data.substring(0, 200));
                            console.log('\n🚀 RESULTADO FINAL PARA SORA:');
                            console.log('URL:', m3u8Url);
                            console.log('Type: STRING (correcto para Sora)');
                            console.log('\n✅ Esto debería eliminar el video del conejo!');
                            return m3u8Url;
                        } else {
                            console.log('\n⚠️ M3U8 no accesible, usando fallback');
                            console.log('🔄 Server URL fallback:', serverUrl);
                            return serverUrl;
                        }
                    } else {
                        console.log('❌ No se pudo extraer video ID');
                        return serverUrl;
                    }
                } else {
                    console.log('❌ No server URL found');
                    return null;
                }
            } else {
                console.log('❌ No servers array found');
                return null;
            }
        } else {
            console.log('❌ Failed to load page');
            return null;
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        return null;
    }
}

testRealStreamExtraction()
    .then(result => {
        console.log('\n📝 RESUMEN DEL TEST:');
        if (result && result.includes('hls.krussdomi.com')) {
            console.log('✅ M3U8 real extraído correctamente');
            console.log('🎬 Sora debería reproducir el stream real');
        } else if (result) {
            console.log('⚠️ Fallback a player URL');
        } else {
            console.log('❌ Error en extracción');
        }
        
        console.log('\n🔄 Para probar en Sora:');
        console.log('1. Haz commit/push de los cambios');
        console.log('2. Reinstala el módulo v3.5.0');
        console.log('3. Debería cargar el stream real, no el conejo');
    })
    .catch(console.error);
