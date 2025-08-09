// Test final con ambas funciones de stream
const https = require('https');

function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://kaa.to/',
                'Origin': 'https://kaa.to',
                ...headers
            }
        };

        const req = https.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    _data: data,
                    text: () => Promise.resolve(data)
                });
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

// Load the module
const moduleContent = require('fs').readFileSync('./KaaTo_v11_5_8_RESTORED.js', 'utf8');
eval(moduleContent);

async function testBothStreamFunctions() {
    console.log('🧪 Testing BOTH stream functions...\n');
    
    const testUrl = 'https://kaa.to/bleach-f24c/ep-1-23d99b';
    
    // Test extractStreamUrl
    console.log('1️⃣ Testing extractStreamUrl...');
    try {
        const result1 = await extractStreamUrl(testUrl);
        console.log('✅ extractStreamUrl result:', result1);
    } catch (error) {
        console.log('❌ extractStreamUrl error:', error.message);
    }
    
    console.log('\n2️⃣ Testing getStreamUrl...');
    try {
        const result2 = await getStreamUrl(testUrl);
        console.log('✅ getStreamUrl result:', result2);
    } catch (error) {
        console.log('❌ getStreamUrl error:', error.message);
    }
    
    // Function availability check
    console.log('\n📍 Function availability:');
    console.log('- extractStreamUrl exists:', typeof extractStreamUrl === 'function');
    console.log('- getStreamUrl exists:', typeof getStreamUrl === 'function');
}

testBothStreamFunctions().catch(console.error);
