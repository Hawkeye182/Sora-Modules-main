// Test para debuggear la estructura de episodios
const fetch = require('node-fetch');

async function debugEpisodes() {
    console.log('🔍 DEBUGGING EPISODES STRUCTURE\n');
    
    try {
        const response = await fetch('https://kaa.to/api/show/bleach-f24c/episodes?ep=1&lang=ja-JP', {
            headers: {
                'Accept': 'application/json',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/anime/bleach-f24c',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log(`Response length: ${data.length}`);
        
        if (response.status === 200) {
            try {
                const parsed = JSON.parse(data);
                console.log('\n✅ JSON parsed successfully');
                console.log('Top level keys:', Object.keys(parsed));
                
                if (parsed.result) {
                    console.log(`\nResult array length: ${parsed.result.length}`);
                    if (parsed.result.length > 0) {
                        console.log('First result structure:', Object.keys(parsed.result[0]));
                        console.log('First result sample:', JSON.stringify(parsed.result[0], null, 2));
                    }
                }
                
                if (parsed.pages) {
                    console.log(`\nPages array length: ${parsed.pages.length}`);
                    if (parsed.pages.length > 0) {
                        console.log('First page structure:', Object.keys(parsed.pages[0]));
                        console.log('First page sample:', JSON.stringify(parsed.pages[0], null, 2));
                    }
                }
                
                // Buscar cualquier mención de episodios
                const fullStr = JSON.stringify(parsed);
                const episodeCount = (fullStr.match(/episode/gi) || []).length;
                console.log(`\nTotal "episode" mentions in response: ${episodeCount}`);
                
            } catch (e) {
                console.log('❌ Failed to parse JSON:', e.message);
                console.log('Raw response preview:', data.substring(0, 1000));
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugEpisodes();
