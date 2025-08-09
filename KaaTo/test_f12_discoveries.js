/*
 * KaaTo F12 Discoveries Test - v11.5.0
 * Testing the new architecture discovered through browser inspection
 */

console.log('🔍 TESTING F12 DISCOVERIES - KaaTo v11.5.0');

async function testNewStreamArchitecture() {
    const videoId = '6713f500b97399e0e1ae2020'; // From F12 discovery
    
    console.log('\n=== TEST 1: NEW HLS ARCHITECTURE ===');
    const newM3u8Url = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
    console.log('🎯 Testing URL:', newM3u8Url);
    
    try {
        const response = await fetchv2(newM3u8Url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'es-419,es;q=0.9',
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
        
        console.log('✅ NEW HLS RESPONSE STATUS:', response.status || 'OK');
        const content = typeof response === 'object' ? await response.text() : response;
        console.log('📋 CONTENT LENGTH:', content.length);
        console.log('🎬 CONTENT PREVIEW:', content.substring(0, 200));
        
    } catch (error) {
        console.log('❌ NEW HLS ERROR:', error.message);
    }
    
    console.log('\n=== TEST 2: OLD ARCHITECTURE COMPARISON ===');
    const oldM3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
    console.log('🎯 Testing OLD URL:', oldM3u8Url);
    
    try {
        const response = await fetchv2(oldM3u8Url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Referer': 'https://krussdomi.com/',
        }, 'GET', null);
        
        console.log('✅ OLD RESPONSE STATUS:', response.status || 'OK');
        const content = typeof response === 'object' ? await response.text() : response;
        console.log('📋 CONTENT LENGTH:', content.length);
        console.log('🎬 CONTENT PREVIEW:', content.substring(0, 200));
        
    } catch (error) {
        console.log('❌ OLD ERROR:', error.message);
    }
    
    console.log('\n=== TEST 3: TOKEN AUTHENTICATION TEST ===');
    console.log('🔑 Testing with discovered token...');
    
    try {
        const response = await fetchv2(newM3u8Url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'es-419,es;q=0.9',
            'Origin': 'https://krussdomi.com',
            'Referer': 'https://krussdomi.com/',
            'Cookie': 'token=eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI2Nzk2MmI0MmE1NmVhMDhiMTBjODEzZDciLCJ1c2VybmFtZSI6Imhhd2siLCJlbWFpbCI6ImJyb2FuZHNpc21pbmlvbmVyc0BnbWFpbC5jb20iLCJhdWQiOiJwdWJsaWMiLCJleHAiOjE3NjE1MTE2ODJ9.ezjAqvCbCghRBJTupFgfO9dI_3cv4msLK5thsORuLb4',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'sec-gpc': '1'
        }, 'GET', null);
        
        console.log('✅ TOKEN AUTH RESPONSE STATUS:', response.status || 'OK');
        const content = typeof response === 'object' ? await response.text() : response;
        console.log('📋 CONTENT LENGTH:', content.length);
        console.log('🎬 CONTENT PREVIEW:', content.substring(0, 200));
        
        if (content.includes('#EXTM3U')) {
            console.log('🎉 SUCCESS! FOUND VALID M3U8 PLAYLIST!');
            console.log('🚀 NUEVA ARQUITECTURA FUNCIONA CON TOKEN!');
        }
        
    } catch (error) {
        console.log('❌ TOKEN AUTH ERROR:', error.message);
    }
    
    console.log('\n=== TEST 4: KAA.TO API WITH TOKEN ===');
    console.log('🔑 Testing KaaTo API with token...');
    
    try {
        const apiUrl = 'https://kaa.to/api/show/dandadan-da3b/episodes?ep=1&lang=ja-JP';
        const response = await fetchv2(apiUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-419,es;q=0.9',
            'Referer': 'https://kaa.to/dandadan-da3b/ep-1-b324b5',
            'Cookie': 'token=eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI2Nzk2MmI0MmE1NmVhMDhiMTBjODEzZDciLCJ1c2VybmFtZSI6Imhhd2siLCJlbWFpbCI6ImJyb2FuZHNpc21pbmlvbmVyc0BnbWFpbC5jb20iLCJhdWQiOiJwdWJsaWMiLCJleHAiOjE3NjE1MTE2ODJ9.ezjAqvCbCghRBJTupFgfO9dI_3cv4msLK5thsORuLb4',
            'x-origin': 'kaa.to',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sec-gpc': '1'
        }, 'GET', null);
        
        console.log('✅ API RESPONSE STATUS:', response.status || 'OK');
        const content = typeof response === 'object' ? await response.text() : response;
        console.log('📋 API CONTENT:', content.substring(0, 500));
        
    } catch (error) {
        console.log('❌ API ERROR:', error.message);
    }
}

// Include fetchv2 for testing
async function fetchv2(url, headers, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: headers || {}
    };
    
    if (body) {
        options.body = body;
    }
    
    const response = await fetch(url, options);
    return response;
}

// Execute test
testNewStreamArchitecture().then(() => {
    console.log('\n🏁 F12 DISCOVERIES TEST COMPLETED');
}).catch(error => {
    console.log('💥 TEST FAILED:', error.message);
});
