/*
 * KaaTo extractStreamUrl Test - v11.5.0
 * Testing only the updated extractStreamUrl function with F12 discoveries
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING UPDATED extractStreamUrl FUNCTION v11.5.0');

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

// Read and extract just the extractStreamUrl function
const moduleContent = fs.readFileSync(path.join(__dirname, 'subs', 'KaaTo_UNIVERSAL_FIXED.js'), 'utf8');

// Extract the extractStreamUrl function
const functionMatch = moduleContent.match(/async function extractStreamUrl\([\s\S]*?^}/m);
if (!functionMatch) {
    console.log('❌ Could not extract extractStreamUrl function');
    process.exit(1);
}

// Execute the function definition
eval(functionMatch[0]);

async function testExtractStreamUrl() {
    console.log('\n🚀 === TESTING extractStreamUrl WITH F12 DISCOVERIES ===');
    
    // Test 1: With known working episode URL
    console.log('\n📍 TEST 1: Real Episode URL');
    const episodeUrl = 'https://kaa.to/dandadan-da3b/ep-1-b324b5';
    console.log('🎯 Testing URL:', episodeUrl);
    
    try {
        const streamUrl = await extractStreamUrl(episodeUrl);
        console.log('✅ Stream URL result:', streamUrl);
        
        if (streamUrl.includes('hls.krussdomi.com/manifest')) {
            console.log('🎉 SUCCESS! NEW ARCHITECTURE URL GENERATED!');
            console.log('🔗 Format: hls.krussdomi.com/manifest/{videoId}/master.m3u8');
            
            // Test if the URL actually works
            console.log('\n🔍 Verifying stream URL...');
            try {
                const verifyResponse = await fetchv2(streamUrl, {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Origin': 'https://krussdomi.com',
                    'Referer': 'https://krussdomi.com/',
                }, 'GET', null);
                
                const verifyContent = await verifyResponse.text();
                console.log('✅ Verification status:', verifyResponse.status);
                
                if (verifyContent.includes('#EXTM3U')) {
                    console.log('🎉 VERIFIED! REAL M3U8 STREAM IS WORKING!');
                    console.log('📺 Stream preview:', verifyContent.substring(0, 200));
                } else {
                    console.log('⚠️ Stream URL exists but not returning valid M3U8');
                    console.log('📋 Content preview:', verifyContent.substring(0, 200));
                }
                
            } catch (verifyError) {
                console.log('❌ Stream verification failed:', verifyError.message);
            }
            
        } else if (streamUrl.includes('commondatastorage.googleapis.com')) {
            console.log('⚠️ FALLBACK: Demo video returned (BigBuckBunny)');
        } else {
            console.log('🤔 UNKNOWN: Different URL format:', streamUrl);
        }
        
    } catch (error) {
        console.log('❌ extractStreamUrl failed:', error.message);
    }
    
    // Test 2: With HTML content directly (simulating what Sora might pass)
    console.log('\n📍 TEST 2: Direct HTML Content');
    
    const sampleHtml = `
    <html>
    <body>
        <div class="video-container">
            <script>
                var videoId = "6713f500b97399e0e1ae2020";
                var playerData = {
                    id: "6713f500b97399e0e1ae2020",
                    source: "krussdomi"
                };
            </script>
        </div>
    </body>
    </html>
    `;
    
    try {
        const streamUrl = await extractStreamUrl(sampleHtml);
        console.log('✅ Stream URL from HTML:', streamUrl);
        
        if (streamUrl.includes('hls.krussdomi.com/manifest')) {
            console.log('🎉 SUCCESS! NEW ARCHITECTURE FROM HTML!');
        } else {
            console.log('⚠️ Fallback or different result from HTML');
        }
        
    } catch (error) {
        console.log('❌ HTML test failed:', error.message);
    }
}

// Execute the test
testExtractStreamUrl().then(() => {
    console.log('\n🏁 extractStreamUrl TEST COMPLETED');
}).catch(error => {
    console.log('💥 TEST FAILED:', error.message);
});
