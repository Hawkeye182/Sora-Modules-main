// Test specific episode URL from Bleach that should be called
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
                    _data: data
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

async function testBleachEpisodeStructure() {
    console.log('🧪 Testing Bleach episode structure...');
    
    try {
        // First get Bleach episodes to see the exact format
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/bleach-f24c/episodes?ep=1&lang=ja-JP`);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData = JSON.parse(episodesResponse._data);
            
            console.log('📺 Episodes API response keys:', Object.keys(episodesData || {}));
            
            if (episodesData.result && episodesData.result.length > 0) {
                const firstEpisode = episodesData.result[0];
                console.log('📄 First episode structure:', firstEpisode);
                
                // Construct the URL that should be generated
                const slug = 'bleach-f24c';
                const episodeUrl = `https://kaa.to/${slug}/ep-${firstEpisode.episode_number}-${firstEpisode.slug}`;
                console.log('🎯 Expected episode URL:', episodeUrl);
                
                // Test if this URL exists
                console.log('\n🌐 Testing episode URL accessibility...');
                const testResponse = await fetchv2(episodeUrl, {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                });
                
                console.log(`Status: ${testResponse.status}`);
                if (testResponse.status === 200) {
                    console.log('✅ Episode URL is accessible');
                    console.log('HTML length:', testResponse._data.length);
                    
                    // Look for video IDs in the HTML
                    const videoIdPattern = /[a-f0-9]{24}/g;
                    const videoIds = testResponse._data.match(videoIdPattern);
                    console.log('🎯 Found video IDs:', videoIds);
                } else {
                    console.log('❌ Episode URL returned status:', testResponse.status);
                }
            }
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testBleachEpisodeStructure().catch(console.error);
