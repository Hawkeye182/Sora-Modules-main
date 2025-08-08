const https = require('https');

async function debugBleachAPI() {
    console.log('🔍 DEBUGGING BLEACH API RESPONSES\n');
    
    const slug = 'bleach-f24c';
    
    // Test 1: Languages
    console.log('1️⃣ Testing Language API...');
    try {
        const langResponse = await makeRequest(`https://kaa.to/api/show/${slug}/language`);
        console.log(`   Status: ${langResponse.status}`);
        console.log(`   Response: ${langResponse.data.substring(0, 200)}...`);
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }
    
    // Test 2: Episodes page 1
    console.log('\n2️⃣ Testing Episodes API (page 1)...');
    try {
        const ep1Response = await makeRequest(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=en-US`);
        console.log(`   Status: ${ep1Response.status}`);
        console.log(`   Response length: ${ep1Response.data.length} chars`);
        console.log(`   First 300 chars: ${ep1Response.data.substring(0, 300)}...`);
        
        if (ep1Response.data.startsWith('{')) {
            const parsed = JSON.parse(ep1Response.data);
            console.log(`   Pages found: ${parsed.pages ? parsed.pages.length : 'none'}`);
            console.log(`   Results found: ${parsed.result ? parsed.result.length : 'none'}`);
            if (parsed.pages) {
                console.log(`   Total episodes in all pages: ${parsed.pages.reduce((total, page) => total + (page.eps ? page.eps.length : 0), 0)}`);
            }
        }
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }
    
    // Test 3: Episodes page 2
    console.log('\n3️⃣ Testing Episodes API (page 2)...');
    try {
        const ep2Response = await makeRequest(`https://kaa.to/api/show/${slug}/episodes?ep=101&lang=en-US`);
        console.log(`   Status: ${ep2Response.status}`);
        console.log(`   Response length: ${ep2Response.data.length} chars`);
        console.log(`   First 200 chars: ${ep2Response.data.substring(0, 200)}...`);
    } catch (e) {
        console.log(`   Error: ${e.message}`);
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-419,es;q=0.9',
                'Referer': 'https://kaa.to/',
                'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

debugBleachAPI();
