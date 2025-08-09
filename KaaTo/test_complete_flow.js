/*
 * KaaTo Complete Module Test - v11.5.0
 * Testing the complete flow: search → details → episodes → extractStreamUrl
 */

// Load the actual module
const fs = require('fs');
const path = require('path');

// Read the actual KaaTo module
const moduleContent = fs.readFileSync(path.join(__dirname, 'subs', 'KaaTo_UNIVERSAL_FIXED.js'), 'utf8');

// Extract functions from module
console.log('🔍 LOADING KAATO MODULE v11.5.0 FOR COMPLETE TEST');

// Mock fetchv2 for Node.js environment
global.fetchv2 = async function(url, headers, method = 'GET', body = null) {
    const fetch = (await import('node-fetch')).default;
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

// Execute the module code to get functions
eval(moduleContent);

async function testCompleteFlow() {
    console.log('\n🚀 === COMPLETE KAATO FLOW TEST ===');
    
    try {
        // Test 1: Search
        console.log('\n📍 STEP 1: SEARCH');
        const searchResults = await search('dandadan');
        console.log('✅ Search results count:', searchResults.length);
        if (searchResults.length > 0) {
            console.log('🎯 First result:', searchResults[0].title, '→', searchResults[0].url);
        }
        
        if (searchResults.length === 0) {
            console.log('❌ No search results found');
            return;
        }
        
        // Test 2: Details
        console.log('\n📍 STEP 2: DETAILS');
        const animeDetails = await details(searchResults[0].url);
        console.log('✅ Anime details:');
        console.log('   Title:', animeDetails.title);
        console.log('   Episodes count:', animeDetails.episodes ? animeDetails.episodes.length : 'N/A');
        
        if (!animeDetails.episodes || animeDetails.episodes.length === 0) {
            console.log('❌ No episodes found');
            return;
        }
        
        // Test 3: Episodes
        console.log('\n📍 STEP 3: EPISODES');
        const episodesList = await episodes(searchResults[0].url);
        console.log('✅ Episodes list count:', episodesList.length);
        if (episodesList.length > 0) {
            console.log('🎯 First episode:', episodesList[0].title, '→', episodesList[0].url);
        }
        
        if (episodesList.length === 0) {
            console.log('❌ No episodes in list');
            return;
        }
        
        // Test 4: Extract Stream URL (THE CRITICAL ONE)
        console.log('\n📍 STEP 4: EXTRACT STREAM URL (WITH F12 DISCOVERIES)');
        const streamUrl = await extractStreamUrl(episodesList[0].url);
        console.log('✅ Stream URL extracted:', streamUrl);
        
        // Validate the stream URL
        if (streamUrl.includes('hls.krussdomi.com/manifest')) {
            console.log('🎉 SUCCESS! NEW ARCHITECTURE URL GENERATED!');
            console.log('🔗 URL format: hls.krussdomi.com/manifest/{videoId}/master.m3u8');
        } else if (streamUrl.includes('commondatastorage.googleapis.com')) {
            console.log('⚠️ FALLBACK: Demo video returned (BigBuckBunny)');
        } else {
            console.log('🤔 UNKNOWN: Different URL format:', streamUrl);
        }
        
        // Test 5: Verify the stream URL works
        console.log('\n📍 STEP 5: VERIFY STREAM URL');
        if (streamUrl.includes('hls.krussdomi.com')) {
            try {
                const streamResponse = await fetchv2(streamUrl, {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Origin': 'https://krussdomi.com',
                    'Referer': 'https://krussdomi.com/',
                }, 'GET', null);
                
                const streamContent = await streamResponse.text();
                console.log('✅ Stream verification status:', streamResponse.status);
                console.log('📋 Stream content preview:', streamContent.substring(0, 100));
                
                if (streamContent.includes('#EXTM3U')) {
                    console.log('🎉 VERIFIED! REAL M3U8 STREAM WORKING!');
                } else {
                    console.log('❌ Stream URL not returning valid M3U8');
                }
                
            } catch (error) {
                console.log('❌ Stream verification failed:', error.message);
            }
        }
        
    } catch (error) {
        console.log('💥 COMPLETE FLOW TEST FAILED:', error.message);
        console.log('📋 Error stack:', error.stack);
    }
}

// Execute the complete test
testCompleteFlow().then(() => {
    console.log('\n🏁 COMPLETE KAATO FLOW TEST FINISHED');
}).catch(error => {
    console.log('💥 TEST EXECUTION FAILED:', error.message);
});
