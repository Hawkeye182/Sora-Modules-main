// Test para extraer datos específicos del player de la página
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

async function extractPlayerData() {
    console.log('🔍 EXTRACTING PLAYER DATA FROM PAGE\n');
    
    try {
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log(`📺 Getting: ${episodeUrl}`);
        
        const response = await fetchv2(episodeUrl);
        
        if (response && response.status === 200 && response._data) {
            const html = response._data;
            
            // Buscar el script con window.KAA
            console.log('\n🔍 Looking for window.KAA data...');
            const kaaMatch = html.match(/window\.KAA=\(function[^}]+\{[\s\S]*?\}\)\(/);
            
            if (kaaMatch) {
                console.log('✅ Found window.KAA function');
                console.log('Full KAA function:');
                console.log(kaaMatch[0]);
            }
            
            // Buscar otros patrones de datos
            console.log('\n🔍 Looking for other data patterns...');
            
            // Buscar JSON estructurado
            const jsonMatches = html.match(/\{[^}]*"episode"[^}]*\}/g);
            if (jsonMatches) {
                console.log(`\n📊 Found ${jsonMatches.length} JSON-like objects with "episode":`);
                jsonMatches.forEach((json, i) => {
                    console.log(`  ${i + 1}: ${json.substring(0, 200)}...`);
                });
            }
            
            // Buscar player config
            const playerConfigMatches = html.match(/(?:player|config|sources?)[^=]*=[\s]*[{[][^}]*}/gi);
            if (playerConfigMatches) {
                console.log(`\n🎬 Found ${playerConfigMatches.length} player config objects:`);
                playerConfigMatches.forEach((config, i) => {
                    console.log(`  ${i + 1}: ${config.substring(0, 200)}...`);
                });
            }
            
            // Buscar window.__ variables
            const windowVarMatches = html.match(/window\.__[^=]*=[^;]+/gi);
            if (windowVarMatches) {
                console.log(`\n🪟 Found ${windowVarMatches.length} window.__ variables:`);
                windowVarMatches.forEach((winVar, i) => {
                    console.log(`  ${i + 1}: ${winVar.substring(0, 100)}...`);
                });
            }
            
            // Buscar cualquier mención de m3u8 o video URLs
            const videoLinkMatches = html.match(/['"](https?:\/\/[^'"]*(?:m3u8|mp4|stream)[^'"]*)['"]/gi);
            if (videoLinkMatches) {
                console.log(`\n🎬 Found ${videoLinkMatches.length} potential video links:`);
                videoLinkMatches.forEach((link, i) => {
                    console.log(`  ${i + 1}: ${link}`);
                });
            }
            
        } else {
            console.log(`❌ Failed to get page: ${response ? response.status : 'no response'}`);
        }
        
    } catch (error) {
        console.error('❌ Extraction failed:', error.message);
    }
}

extractPlayerData();
