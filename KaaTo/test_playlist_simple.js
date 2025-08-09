/**
 * TEST DIRECTO DE PLAYLIST ACCESS
 * Simula exactamente lo que hace la nueva versión 11.5.3
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

async function testDirectPlaylistAccess() {
    console.log('🔬 TESTING DIRECT PLAYLIST ACCESS v11.5.3...\n');
    
    const selectedVideoId = '6713f500b97399e0e1ae2020'; // El Video ID que sabemos funciona
    
    try {
        // Paso 1: Obtener master.m3u8
        const masterM3u8Url = `https://hls.krussdomi.com/manifest/${selectedVideoId}/master.m3u8`;
        console.log('🎯 MASTER M3U8 URL:', masterM3u8Url);
        
        const masterContent = await fetchv2(masterM3u8Url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Origin': 'https://krussdomi.com',
            'Referer': 'https://krussdomi.com/',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'sec-gpc': '1'
        }, 'GET', null);
        
        console.log('🔍 MASTER M3U8 RESPONSE (first 400 chars):');
        console.log(masterContent.substring(0, 400));
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Paso 2: Buscar playlists específicos
        const playlistPattern = /URI="([^"]+\.m3u8)"/gi;
        const playlistMatches = masterContent.match(playlistPattern);
        
        console.log('🔍 PLAYLIST SEARCH RESULTS:');
        if (playlistMatches && playlistMatches.length > 0) {
            console.log(`✅ Found ${playlistMatches.length} playlists:`);
            
            playlistMatches.forEach((match, index) => {
                const playlistPath = match.match(/URI="([^"]+)"/)[1];
                const directPlaylistUrl = `https://hls.krussdomi.com/manifest/${selectedVideoId}/${playlistPath}`;
                console.log(`   ${index + 1}. ${playlistPath}`);
                console.log(`      -> ${directPlaylistUrl}`);
            });
            
            // Tomar el primer playlist (normalmente la mejor calidad)
            const firstPlaylistPath = playlistMatches[0].match(/URI="([^"]+)"/)[1];
            const directPlaylistUrl = `https://hls.krussdomi.com/manifest/${selectedVideoId}/${firstPlaylistPath}`;
            
            console.log('\n🎯 SELECTED DIRECT PLAYLIST:', directPlaylistUrl);
            
            // Paso 3: Verificar que el playlist directo funciona
            console.log('\n🔬 TESTING DIRECT PLAYLIST...');
            const directContent = await fetchv2(directPlaylistUrl, {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Origin': 'https://krussdomi.com',
                'Referer': 'https://krussdomi.com/',
            }, 'GET', null);
            
            console.log('✅ DIRECT PLAYLIST RESPONSE (first 300 chars):');
            console.log(directContent.substring(0, 300));
            
            console.log('\n🚀 FINAL RESULT: Module would return:', directPlaylistUrl);
            
        } else {
            console.log('❌ No playlists found, would return master URL');
            console.log('🚀 FINAL RESULT: Module would return:', masterM3u8Url);
        }
        
    } catch (error) {
        console.log('❌ TEST FAILED:', error.message);
    }
}

testDirectPlaylistAccess();
