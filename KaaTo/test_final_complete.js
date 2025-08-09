// Test final de todas las funciones del módulo KaaTo v11.5.8 RESTORED
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

async function testAllFunctions() {
    console.log('🧪 Testing ALL module functions...\n');
    
    // Test search
    console.log('1️⃣ Testing searchResults...');
    try {
        const searchResult = await searchResults('Dandadan');
        const parsed = JSON.parse(searchResult);
        console.log(`✅ Search: Found ${parsed.length} results`);
        if (parsed.length > 0) {
            console.log(`   First result: ${parsed[0].title}`);
        }
    } catch (error) {
        console.log('❌ Search error:', error.message);
    }
    
    // Test details
    console.log('\n2️⃣ Testing extractDetails...');
    try {
        const detailsResult = await extractDetails('https://kaa.to/anime/dandadan-da3b');
        const parsed = JSON.parse(detailsResult);
        console.log('✅ Details:', parsed[0]);
    } catch (error) {
        console.log('❌ Details error:', error.message);
    }
    
    // Test episodes
    console.log('\n3️⃣ Testing extractEpisodes...');
    try {
        const episodesResult = await extractEpisodes('https://kaa.to/anime/dandadan-da3b');
        const parsed = JSON.parse(episodesResult);
        console.log(`✅ Episodes: Found ${parsed.length} episodes`);
        if (parsed.length > 0) {
            console.log(`   First episode: ${parsed[0].href}`);
        }
    } catch (error) {
        console.log('❌ Episodes error:', error.message);
    }
    
    // Test stream
    console.log('\n4️⃣ Testing extractStreamUrl...');
    try {
        const streamResult = await extractStreamUrl('https://kaa.to/dandadan-da3b/ep-1-b324b5');
        console.log('✅ Stream URL:', streamResult);
    } catch (error) {
        console.log('❌ Stream error:', error.message);
    }
    
    console.log('\n🎉 All function tests completed!');
}

testAllFunctions().catch(console.error);
