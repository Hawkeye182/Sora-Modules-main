// Test final - simular exactamente lo que hace Sora iOS
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

// Import the extractStreamUrl function from the module
async function extractStreamUrl(episodeUrl) {
    console.log('🚨🚨🚨 [v11.5.8 MASTER PLAYLIST] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Episode URL:', episodeUrl);
    console.log('🔥 IF YOU SEE THIS LOG, extractStreamUrl IS WORKING! 🔥');
    
    // Add debug info about what type of URL we received
    if (!episodeUrl) {
        console.log('❌ CRITICAL: episodeUrl is null or undefined!');
        return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    
    console.log('🔍 Episode URL type:', typeof episodeUrl);
    console.log('🔍 Episode URL length:', episodeUrl.length);
    
    try {
        console.log('🌐 Fetching episode page with enhanced headers...');
        
        // Enhanced headers from F12 discoveries
        const response = await fetchv2(episodeUrl, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'sec-ch-ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-gpc': '1',
            'Referer': 'https://kaa.to/',
            'Origin': 'https://kaa.to'
        }, 'GET', null);
        
        console.log('📡 Response received, type:', typeof response);
        console.log('📡 Response status:', response ? response.status : 'undefined');
        
        // Handle response properly for Sora iOS
        let html;
        if (response && response._data) {
            html = response._data;
        } else if (typeof response === 'string') {
            html = response;
        } else {
            console.log('❌ Invalid response format');
            return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        }
        
        console.log('✅ HTML received, length:', html.length);
        console.log('🔍 HTML preview:', html.substring(0, 200) + '...');
        
        // PATTERN 1: Buscar M3U8 directo
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING M3U8 STREAM (STRING):', m3u8Urls[0]);
            return m3u8Urls[0];
        }
        
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
        
        console.log('❌ No streams found - returning demo video');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error details:', error.stack);
    }
    
    console.log('🔄 Returning fallback demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}

async function testSoraIOSWorkflow() {
    console.log('🧪 Testing full Sora iOS workflow...\n');
    
    // Test the exact Bleach episode URL that should be called
    const bleachEpisodeUrl = 'https://kaa.to/bleach-f24c/ep-1-23d99b';
    
    console.log('🎬 Testing extractStreamUrl with Bleach Episode 1...');
    try {
        const streamResult = await extractStreamUrl(bleachEpisodeUrl);
        console.log('\n✅ Final stream result:', streamResult);
        
        // Verify the stream URL is accessible
        if (streamResult.includes('hls.krussdomi.com')) {
            console.log('\n🔍 Testing stream URL accessibility...');
            try {
                const streamTest = await fetchv2(streamResult, {
                    'Referer': 'https://krussdomi.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                });
                console.log('Stream test status:', streamTest.status);
                if (streamTest.status === 200) {
                    console.log('✅ Stream URL is accessible and working!');
                } else {
                    console.log('⚠️ Stream URL status:', streamTest.status);
                }
            } catch (streamError) {
                console.log('⚠️ Stream test error:', streamError.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Stream extraction error:', error.message);
    }
}

testSoraIOSWorkflow().catch(console.error);
