// Test para ver qué contiene realmente la página de episodio
const fetch = require('node-fetch');

global.fetchv2 = async function(url, headers, method = 'GET', body = null) {
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
        
        return result;
    } catch (error) {
        throw error;
    }
};

async function analyzeEpisodePage() {
    console.log('🔍 ANALYZING EPISODE PAGE CONTENT\n');
    
    try {
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log(`📺 Getting: ${episodeUrl}`);
        
        const response = await fetchv2(episodeUrl);
        
        if (response && response.status === 200 && response._data) {
            const html = response._data;
            
            console.log(`📊 Page size: ${html.length} characters`);
            
            // Buscar diferentes patrones comunes para video
            console.log('\n🔍 Looking for video-related patterns...');
            
            // 1. Buscar player o video keywords
            const playerMatches = html.match(/player|video|stream/gi);
            console.log(`📺 "player/video/stream" mentions: ${playerMatches ? playerMatches.length : 0}`);
            
            // 2. Buscar URLs de video
            const videoUrlMatches = html.match(/https?:\/\/[^"'\s]*\.(mp4|m3u8|ts)/gi);
            if (videoUrlMatches) {
                console.log(`🎬 Video URLs found (${videoUrlMatches.length}):`);
                videoUrlMatches.forEach(url => console.log(`  ${url}`));
            }
            
            // 3. Buscar scripts con datos
            const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
            console.log(`📜 Script tags found: ${scriptMatches ? scriptMatches.length : 0}`);
            
            if (scriptMatches) {
                scriptMatches.forEach((script, i) => {
                    if (script.includes('video') || script.includes('stream') || script.includes('player') || script.includes('m3u8')) {
                        console.log(`\n📜 Script ${i + 1} (contains video keywords):`);
                        const content = script.replace(/<script[^>]*>|<\/script>/gi, '').trim();
                        console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
                    }
                });
            }
            
            // 4. Buscar elementos con data attributes
            const dataMatches = html.match(/data-[^=]*=["'][^"']*["']/gi);
            if (dataMatches) {
                console.log(`\n📋 Data attributes found: ${dataMatches.length}`);
                dataMatches.slice(0, 10).forEach(attr => console.log(`  ${attr}`));
                if (dataMatches.length > 10) console.log(`  ... and ${dataMatches.length - 10} more`);
            }
            
            // 5. Buscar divs con player class
            const playerDivs = html.match(/<div[^>]*class[^>]*player[^>]*>/gi);
            if (playerDivs) {
                console.log(`\n🎬 Player divs found:`);
                playerDivs.forEach(div => console.log(`  ${div}`));
            }
            
        } else {
            console.log(`❌ Failed to get page: ${response ? response.status : 'no response'}`);
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

analyzeEpisodePage();
