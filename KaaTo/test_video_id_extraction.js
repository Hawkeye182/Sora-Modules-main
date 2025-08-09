/**
 * TEST ESPECÍFICO PARA EXTRACCIÓN DE VIDEO IDS
 * Basado en los datos observados en F12
 */

const { KaaToModule } = require('./KaaTo_FINAL_v11_5_15.js');

async function testVideoIdExtraction() {
    console.log('🔍 TESTING VIDEO ID EXTRACTION FROM REAL PAGE');
    console.log('===============================================');
    
    const testUrl = 'https://kaa.to/dandadan-da3b/ep-1-b324b5';
    
    try {
        // Obtener el HTML real de la página
        const fetch = require('node-fetch');
        
        const response = await fetch(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load page: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('✅ Page loaded successfully');
        console.log('📄 HTML size:', html.length, 'characters');
        
        // Buscar video IDs usando el patrón observado
        const videoIdPattern = /(?:id["\s]*[:=]["\s]*|data-id["\s]*=["\s]*|video[_-]?id["\s]*[:=]["\s]*)([a-f0-9]{24})/gi;
        const videoIds = new Set();
        let match;
        
        while ((match = videoIdPattern.exec(html)) !== null) {
            videoIds.add(match[1]);
        }
        
        console.log('\n🎯 FOUND VIDEO IDs:');
        if (videoIds.size > 0) {
            Array.from(videoIds).forEach((id, index) => {
                console.log(`${index + 1}. ${id}`);
                
                // Analizar el ObjectId
                const timestampHex = id.substring(0, 8);
                const timestamp = parseInt(timestampHex, 16);
                const date = new Date(timestamp * 1000);
                console.log(`   └─ Created: ${date.toISOString()}`);
            });
        } else {
            console.log('❌ No video IDs found');
        }
        
        // Buscar también otros patrones
        console.log('\n🔍 SEARCHING OTHER PATTERNS:');
        
        // Buscar referencias a streaming services
        const streamingPatterns = [
            /vidstream/gi,
            /birdstream/gi,
            /krussdomi/gi,
            /manifest/gi,
            /\.m3u8/gi,
            /source\.php/gi
        ];
        
        streamingPatterns.forEach(pattern => {
            const matches = html.match(pattern);
            if (matches) {
                console.log(`✅ Found ${pattern.source}: ${matches.length} occurrences`);
            }
        });
        
        // Buscar JSON embebido
        const jsonPattern = /{[^{}]*(?:"id"|"source"|"stream"|"url")[^{}]*}/gi;
        const jsonMatches = html.match(jsonPattern);
        
        if (jsonMatches) {
            console.log('\n📦 FOUND JSON-LIKE OBJECTS:');
            jsonMatches.slice(0, 5).forEach((json, index) => {
                console.log(`${index + 1}. ${json.substring(0, 100)}...`);
            });
        }
        
        // Probar construir URLs de stream
        console.log('\n🚀 TESTING STREAM URL CONSTRUCTION:');
        
        for (const videoId of Array.from(videoIds).slice(0, 3)) {
            const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
            
            try {
                const streamResponse = await fetch(masterUrl, {
                    method: 'HEAD',
                    headers: {
                        'Referer': 'https://krussdomi.com/',
                        'Origin': 'https://krussdomi.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`📺 ${videoId}: ${streamResponse.status} ${streamResponse.statusText}`);
                
                if (streamResponse.ok) {
                    console.log(`✅ WORKING STREAM FOUND: ${masterUrl}`);
                    return masterUrl;
                }
                
            } catch (error) {
                console.log(`❌ ${videoId}: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Ejecutar test
if (require.main === module) {
    testVideoIdExtraction();
}

module.exports = { testVideoIdExtraction };
