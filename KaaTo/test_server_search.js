// Test para buscar específicamente los servidores de video en la página
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

async function findVideoServers() {
    console.log('🔍 SEARCHING FOR VIDEO SERVERS\n');
    
    try {
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log(`📺 Getting: ${episodeUrl}`);
        
        const response = await fetchv2(episodeUrl);
        
        if (response && response.status === 200 && response._data) {
            const html = response._data;
            
            // Buscar 'servers' en el window.KAA
            console.log('\n🔍 Looking for servers in window.KAA...');
            const kaaMatch = html.match(/servers:\[([^\]]+)\]/);
            
            if (kaaMatch) {
                console.log('✅ Found servers array:');
                console.log(kaaMatch[0]);
                
                // Extraer URLs de los servidores
                const serverUrls = [...kaaMatch[1].matchAll(/src:"([^"]+)"/g)];
                
                if (serverUrls.length > 0) {
                    console.log('\n🎬 Extracted server URLs:');
                    serverUrls.forEach((match, i) => {
                        console.log(`  ${i + 1}: ${match[1]}`);
                    });
                    
                    // Probar el primer servidor
                    if (serverUrls[0]) {
                        const serverUrl = serverUrls[0][1];
                        console.log(`\n🔍 Testing server: ${serverUrl}`);
                        
                        // Decodificar caracteres escapados
                        const decodedUrl = serverUrl.replace(/\\u002F/g, '/');
                        console.log(`   Decoded URL: ${decodedUrl}`);
                        
                        // Si hay parámetros en la URL, extraerlos
                        const urlParams = new URL(decodedUrl);
                        console.log(`   Domain: ${urlParams.hostname}`);
                        console.log(`   Path: ${urlParams.pathname}`);
                        console.log(`   Params:`, urlParams.searchParams.toString());
                        
                        // Especialmente buscar el ID
                        const idParam = urlParams.searchParams.get('id');
                        if (idParam) {
                            console.log(`\n🎯 Found video ID: ${idParam}`);
                            
                            // Probar M3U8 con este ID
                            const m3u8Url = `https://hls.krussdomi.com/manifest/${idParam}/master.m3u8`;
                            console.log(`\n🔍 Testing M3U8: ${m3u8Url}`);
                            
                            const m3u8Response = await fetchv2(m3u8Url);
                            console.log(`📊 M3U8 Response: ${m3u8Response.status}`);
                            
                            if (m3u8Response.status === 200) {
                                console.log('✅ M3U8 WORKS! Content preview:');
                                console.log(m3u8Response._data.substring(0, 500));
                            } else {
                                console.log('❌ M3U8 Failed. Error:');
                                console.log(m3u8Response._data);
                            }
                        }
                    }
                } else {
                    console.log('❌ No server URLs found in servers array');
                }
            } else {
                console.log('❌ No servers array found');
                
                // Buscar cualquier mención de krussdomi
                console.log('\n🔍 Looking for any krussdomi mentions...');
                const krussdomiMatches = html.match(/krussdomi[^"'\s]*/g);
                if (krussdomiMatches) {
                    console.log(`Found ${krussdomiMatches.length} krussdomi mentions:`);
                    krussdomiMatches.forEach((match, i) => {
                        console.log(`  ${i + 1}: ${match}`);
                    });
                }
            }
        } else {
            console.log(`❌ Failed to get page: ${response ? response.status : 'no response'}`);
        }
        
    } catch (error) {
        console.error('❌ Search failed:', error.message);
    }
}

findVideoServers();
