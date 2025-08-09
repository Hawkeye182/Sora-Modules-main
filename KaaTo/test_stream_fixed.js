// Test para el módulo KaaTo con extracción desde window.KAA
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

// Cargar el módulo KaaTo_STREAM_FIXED
const fs = require('fs');
const path = require('path');

const moduleCode = fs.readFileSync(path.join(__dirname, 'subs', 'KaaTo_STREAM_FIXED.js'), 'utf8');
eval(moduleCode);

async function testStreamFixed() {
    console.log('🔥 TESTING KAATO STREAM FIXED MODULE\n');
    
    try {
        // Test de búsqueda
        console.log('🔍 Testing search...');
        const searchResult = await searchResults('bleach');
        const searchData = JSON.parse(searchResult);
        console.log(`✅ Search: Found ${searchData.length} results`);
        
        if (searchData.length > 0) {
            const firstResult = searchData[0];
            console.log(`   First result: ${firstResult.title}`);
            console.log(`   URL: ${firstResult.href}`);
            
            // Test de detalles
            console.log('\n📋 Testing details...');
            const detailsResult = await extractDetails(firstResult.href);
            const detailsData = JSON.parse(detailsResult);
            console.log('✅ Details extracted successfully');
            
            // Test de episodios
            console.log('\n📺 Testing episodes...');
            const episodesResult = await extractEpisodes(firstResult.href);
            const episodesData = JSON.parse(episodesResult);
            console.log(`✅ Episodes: Found ${episodesData.length} episodes`);
            
            if (episodesData.length > 0) {
                const firstEpisode = episodesData[0];
                console.log(`   First episode: ${firstEpisode.href}`);
                
                // Test de stream con nueva implementación
                console.log('\n🎬 Testing NEW stream extraction...');
                const streamResult = await extractStreamUrl(firstEpisode.href);
                
                console.log('\n📊 STREAM RESULT ANALYSIS:');
                console.log(`   Type: ${typeof streamResult}`);
                console.log(`   Value: ${streamResult}`);
                
                if (typeof streamResult === 'string') {
                    const isUrl = streamResult.startsWith('http');
                    const isM3U8 = streamResult.includes('.m3u8');
                    const isFallback = streamResult.includes('BigBuckBunny');
                    
                    console.log(`   Is URL: ${isUrl}`);
                    console.log(`   Is M3U8: ${isM3U8}`);
                    console.log(`   Is Fallback: ${isFallback}`);
                    
                    if (isFallback) {
                        console.log('\n⚠️  Using fallback - M3U8 extraction or Cloudflare bypass failed');
                    } else if (isM3U8) {
                        console.log('\n✅ SUCCESS: Real M3U8 URL extracted and Cloudflare bypassed!');
                    } else if (isUrl) {
                        console.log('\n✅ SUCCESS: Valid URL extracted');
                    }
                    
                    console.log(`\n🎯 Final stream URL: ${streamResult}`);
                } else {
                    console.log('\n❌ ERROR: Stream result is not a string');
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testStreamFixed();
