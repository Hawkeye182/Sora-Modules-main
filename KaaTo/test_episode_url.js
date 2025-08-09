// Test para verificar URLs de episodios de KaaTo
async function testEpisodeURL() {
    console.log('🧪 Testing Bleach episode URL...');
    
    try {
        // URL de ejemplo del log anterior
        const testUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log('🌐 Testing episode URL:', testUrl);
        
        const response = await fetch(testUrl);
        const html = await response.text();
        
        console.log('📋 Response status:', response.status);
        console.log('📄 HTML length:', html.length);
        console.log('📄 HTML preview (first 500):', html.substring(0, 500));
        console.log('📄 Contains video patterns:');
        console.log('  - m3u8:', html.includes('m3u8'));
        console.log('  - video:', html.includes('video'));
        console.log('  - stream:', html.includes('stream'));
        console.log('  - krussdomi:', html.includes('krussdomi'));
        
        // Look for video IDs
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        console.log('🎯 Found video IDs:', videoIds);
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testEpisodeURL();
