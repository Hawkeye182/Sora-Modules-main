/*
 * Test directo de la API source.php con parámetros F12
 */

console.log('🔐 TESTING SOURCE API WITH F12 PARAMETERS');

async function testSourceAPI() {
    const videoId = '6713f500b97399e0e1ae2020';
    
    // Mock fetchv2 for Node.js environment
    const fetch = (await import('node-fetch')).default;
    global.fetchv2 = async function(url, headers, method = 'GET', body = null) {
        const options = {
            method: method,
            headers: headers || {}
        };
        
        if (body) {
            options.body = body;
        }
        
        try {
            const response = await fetch(url, options);
            return {
                status: response.status,
                text: async () => await response.text(),
                json: async () => await response.json()
            };
        } catch (error) {
            throw error;
        }
    };
    
    console.log('\n=== TEST 1: BASIC SOURCE API ===');
    try {
        const sourceApiUrl = `https://krussdomi.com/vidstreaming/source.php?id=${videoId}`;
        console.log('🎯 URL:', sourceApiUrl);
        
        const response = await fetchv2(sourceApiUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-419,es;q=0.9',
            'Referer': `https://krussdomi.com/vidstreaming/player.php?id=${videoId}&ln=ja-JP`,
        }, 'GET', null);
        
        const content = await response.text();
        console.log('✅ Status:', response.status);
        console.log('📋 Content:', content.substring(0, 500));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n=== TEST 2: SOURCE API WITH F12 PARAMS ===');
    try {
        // Usando los parámetros exactos de tu F12
        const timestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hora en el futuro
        const signature = 'fde8a49380c2f71dacfe75ca0671a9816aae4df5'; // Del F12
        
        const sourceApiUrl = `https://krussdomi.com/vidstreaming/source.php?id=${videoId}&e=${timestamp}&s=${signature}`;
        console.log('🎯 URL con parámetros F12:', sourceApiUrl);
        
        const response = await fetchv2(sourceApiUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-419,es;q=0.9',
            'Referer': `https://krussdomi.com/vidstreaming/player.php?id=${videoId}&ln=ja-JP`,
            'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sec-gpc': '1'
        }, 'GET', null);
        
        const content = await response.text();
        console.log('✅ Status:', response.status);
        console.log('📋 Content:', content.substring(0, 500));
        
        // Buscar URLs M3U8
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = content.match(m3u8Pattern);
        
        if (m3u8Urls) {
            console.log('🎉 FOUND M3U8 URLs:', m3u8Urls);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n=== TEST 3: DIRECT MASTER M3U8 TEST ===');
    try {
        const m3u8Url = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        console.log('🎯 M3U8 URL:', m3u8Url);
        
        const response = await fetchv2(m3u8Url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Origin': 'https://krussdomi.com',
            'Referer': 'https://krussdomi.com/',
        }, 'GET', null);
        
        const content = await response.text();
        console.log('✅ Status:', response.status);
        console.log('📋 M3U8 Content:', content.substring(0, 300));
        
        if (content.includes('#EXTM3U')) {
            console.log('🎉 VALID M3U8 PLAYLIST CONFIRMED!');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testSourceAPI().then(() => {
    console.log('\n🏁 SOURCE API TESTS COMPLETED');
}).catch(error => {
    console.log('💥 TEST FAILED:', error.message);
});
