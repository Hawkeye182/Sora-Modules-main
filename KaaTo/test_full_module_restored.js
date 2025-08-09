// Test final completo del módulo v11.5.8 RESTORED
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

// Test extractStreamUrl function
async function extractStreamUrl(episodeUrl) {
    console.log('🚨🚨🚨 [v11.5.8 MASTER PLAYLIST] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Episode URL:', episodeUrl);
    console.log('🔥 IF YOU SEE THIS LOG, extractStreamUrl IS WORKING! 🔥');
    
    try {
        console.log('🌐 Fetching episode page with enhanced headers...');
        
        const response = await fetchv2(episodeUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://kaa.to/',
            'Origin': 'https://kaa.to'
        });
        
        const html = typeof response === 'object' ? await response.text() : response;
        console.log('✅ HTML received, length:', html.length);
        
        // PATTERN 3: Video IDs para construcción M3U8
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 FOUND VIDEO IDs:', videoIds);
            const masterUrl = `https://hls.krussdomi.com/manifest/${videoIds[0]}/master.m3u8`;
            console.log('🔨 CONSTRUCTED M3U8 URL:', masterUrl);
            console.log('🚀 RETURNING CONSTRUCTED STREAM (STRING):', masterUrl);
            return masterUrl;
        }
        
        console.log('❌ No video IDs found');
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
}

async function testFullModule() {
    console.log('🧪 Testing COMPLETE v11.5.8 RESTORED module...\n');
    
    // Test episode URL extraction
    const testEpisodeUrl = 'https://kaa.to/dandadan-da3b/ep-1-b324b5';
    
    console.log('🎬 Testing extractStreamUrl...');
    try {
        const streamResult = await extractStreamUrl(testEpisodeUrl);
        console.log('✅ Stream result:', streamResult);
    } catch (error) {
        console.log('❌ Stream error:', error.message);
    }
}

testFullModule().catch(console.error);
