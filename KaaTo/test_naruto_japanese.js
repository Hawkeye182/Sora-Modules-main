const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Accept-Language': 'es-419,es;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let chunks = [];
            
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
            res.on('end', () => {
                let buffer = Buffer.concat(chunks);
                let data = '';
                
                const encoding = res.headers['content-encoding'];
                
                try {
                    if (encoding === 'gzip') {
                        data = zlib.gunzipSync(buffer).toString('utf8');
                    } else if (encoding === 'deflate') {
                        data = zlib.inflateSync(buffer).toString('utf8');
                    } else if (encoding === 'br') {
                        data = zlib.brotliDecompressSync(buffer).toString('utf8');
                    } else {
                        data = buffer.toString('utf8');
                    }
                } catch (e) {
                    data = buffer.toString('utf8');
                }
                
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    _data: data
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function testNarutoJapanese() {
    console.log('🍜 TESTING NARUTO WITH JAPANESE SUBTITLES\n');
    
    try {
        // Probar con japonés que debería tener subtítulos
        console.log('📺 Testing Naruto with ja-JP (Japanese with subtitles)...');
        const episodeResponse = await fetchv2('https://kaa.to/api/show/naruto-f3cf/episodes?ep=1&lang=ja-JP');
        
        console.log(`Status: ${episodeResponse.status}`);
        
        if (episodeResponse.status === 200) {
            try {
                const episodeData = JSON.parse(episodeResponse._data);
                
                console.log(`✅ Episode data parsed successfully`);
                console.log(`Current page: ${episodeData.current_page}`);
                console.log(`Pages available: ${episodeData.pages.length}`);
                
                let totalEpisodes = 0;
                episodeData.pages.forEach((page, i) => {
                    const pageEpisodes = page.eps.length;
                    totalEpisodes += pageEpisodes;
                    console.log(`   Page ${page.number}: Episodes ${page.from}-${page.to} (${pageEpisodes} episodes)`);
                });
                
                console.log(`\n🎯 TOTAL EPISODES IN JAPANESE: ${totalEpisodes}`);
                
                if (totalEpisodes >= 220) {
                    console.log(`✅ FOUND THE COMPLETE NARUTO SERIES WITH SUBTITLES!`);
                } else {
                    console.log(`⚠️  Expected 220 episodes, found ${totalEpisodes}`);
                }
                
                // Mostrar algunos episodios de ejemplo
                if (episodeData.result && episodeData.result.length > 0) {
                    console.log(`\n📝 Sample episodes from result:`);
                    episodeData.result.slice(0, 5).forEach(ep => {
                        console.log(`   Episode ${ep.episode_number}: ${ep.title || 'No title'} (${ep.slug})`);
                    });
                }
                
            } catch (parseError) {
                console.log(`❌ Parse error: ${parseError.message}`);
                console.log(`Data preview: ${episodeResponse._data.substring(0, 200)}...`);
            }
        } else {
            console.log(`❌ HTTP Error: ${episodeResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ Japanese test failed:', error.message);
    }
}

testNarutoJapanese();
