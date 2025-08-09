// Test COMPLETO KaaTo con nuevo formato STRING
// Simular funciones globales de Sora
const fetch = require('node-fetch');

global.fetchv2 = async function(url, headers, method = 'GET', body = null) {
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ...headers
        }
    };
    
    if (body && method === 'POST') {
        options.body = body;
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.text();
        
        return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            _data: data
        };
    } catch (error) {
        console.error('fetchv2 error:', error.message);
        throw error;
    }
};

// Cargar el módulo KaaTo completo
const fs = require('fs');
const moduleCode = fs.readFileSync('./subs/KaaTo_COMPLETE.js', 'utf8');
eval(moduleCode);

async function testCompleteKaaTo() {
    console.log('🔥 TESTING COMPLETE KAATO MODULE WITH NEW STRING FORMAT\n');
    
    try {
        // Test 1: Search
        console.log('🔍 Testing search...');
        const searchResult = await searchResults('bleach');
        const results = JSON.parse(searchResult);
        console.log(`✅ Search: Found ${results.length} results`);
        
        if (results.length > 0) {
            const firstResult = results[0];
            console.log(`   Title: ${firstResult.title}`);
            console.log(`   URL: ${firstResult.href}`);
            
            // Test 2: Details
            console.log('\n📋 Testing details...');
            const detailsResult = await extractDetails(firstResult.href);
            const details = JSON.parse(detailsResult);
            console.log(`✅ Details extracted successfully`);
            console.log(`   Summary: ${details.summary ? details.summary.substring(0, 100) + '...' : 'N/A'}`);
            
            // Test 3: Episodes
            console.log('\n📺 Testing episodes...');
            const episodesResult = await extractEpisodes(firstResult.href);
            const episodes = JSON.parse(episodesResult);
            console.log(`✅ Episodes: Found ${episodes.length} episodes`);
            
            if (episodes.length > 0) {
                const firstEpisode = episodes[0];
                console.log(`   First episode: ${firstEpisode.href}`);
                
                // Test 4: Stream URL (NUEVO FORMATO)
                console.log('\n🎬 Testing stream extraction with NEW FORMAT...');
                const streamUrl = await extractStreamUrl(firstEpisode.href);
                
                // Verificar que es un STRING y no JSON
                console.log('Stream result type:', typeof streamUrl);
                console.log('Stream result:', streamUrl);
                
                if (typeof streamUrl === 'string' && streamUrl.startsWith('http')) {
                    console.log('✅ SUCCESS! Stream URL returned as STRING (like AnimeFlv)');
                    console.log(`✅ URL: ${streamUrl}`);
                } else {
                    console.log('❌ ERROR: Stream should be a STRING URL, not JSON');
                    console.log('Received:', streamUrl);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteKaaTo();
