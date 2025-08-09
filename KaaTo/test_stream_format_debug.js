// Test específico para debugging del formato de stream
const fetch = require('node-fetch');

global.fetchv2 = async function(url, headers, method = 'GET', body = null) {
    console.log(`📡 Fetching: ${method} ${url}`);
    
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
        
        console.log(`✅ Response ${response.status} - Length: ${_data.length}`);
        return result;
    } catch (error) {
        console.log(`❌ Fetch error: ${error.message}`);
        throw error;
    }
};

// Cargar el módulo KaaTo_COMPLETE
const fs = require('fs');
const path = require('path');

const moduleCode = fs.readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
eval(moduleCode);

async function testStreamExtraction() {
    console.log('🔍 DEBUGGING STREAM FORMAT\n');
    
    try {
        // Usar una URL de episodio real de Bleach
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        
        console.log('📺 Testing stream extraction...');
        console.log(`   Episode URL: ${episodeUrl}`);
        
        const streamResult = await extractStreamUrl(episodeUrl);
        
        console.log('\n📊 STREAM RESULT ANALYSIS:');
        console.log(`   Type: ${typeof streamResult}`);
        console.log(`   Value: ${streamResult}`);
        console.log(`   Length: ${streamResult ? streamResult.length : 'null'}`);
        
        // Verificar si es una URL válida
        if (typeof streamResult === 'string') {
            const isUrl = streamResult.startsWith('http');
            const isM3U8 = streamResult.includes('.m3u8');
            const isFallback = streamResult.includes('BigBuckBunny');
            
            console.log(`   Is URL: ${isUrl}`);
            console.log(`   Is M3U8: ${isM3U8}`);
            console.log(`   Is Fallback: ${isFallback}`);
            
            if (isFallback) {
                console.log('\n⚠️  WARNING: Using fallback URL - M3U8 extraction failed');
            } else if (isM3U8) {
                console.log('\n✅ SUCCESS: Real M3U8 URL extracted');
            } else if (isUrl) {
                console.log('\n✅ SUCCESS: Valid URL extracted (not M3U8)');
            }
        } else {
            console.log('\n❌ ERROR: Stream result is not a string');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testStreamExtraction();
