const fetch = require('node-fetch');

// Simular fetchv2 de Sora
function fetchv2(url, headers = {}) {
    console.log(`📡 Fetching: ${url}`);
    console.log(`🔧 Headers:`, headers);
    
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

async function testCloudflareBypass() {
    console.log('🧪 Testing Cloudflare bypass with improved headers...\n');
    
    const videoId = '64cd832e44c6d04c12186497'; // Bleach episode 1
    const serverUrl = 'https://krussdomi.com/player.php?v=64cd832e44c6d04c12186497';
    
    // Test M3U8 con headers mejorados
    const m3u8Url = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
    
    const response = await fetchv2(m3u8Url, {
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
    
    if (response && response.status === 200) {
        console.log('✅ SUCCESS! M3U8 accessible');
        console.log('📱 First 200 chars of M3U8:', response._data.substring(0, 200));
        
        // Verificar que es un M3U8 válido
        if (response._data.includes('#EXTM3U') || response._data.includes('#EXT-X-STREAM-INF')) {
            console.log('🎯 Valid M3U8 playlist confirmed!');
        } else {
            console.log('⚠️ Response received but might not be valid M3U8');
        }
    } else {
        console.log('❌ M3U8 still blocked by Cloudflare');
        console.log('📊 Status:', response ? response.status : 'No response');
        
        if (response && response._data) {
            console.log('📄 Response preview:', response._data.substring(0, 300));
        }
    }
}

testCloudflareBypass().catch(console.error);
