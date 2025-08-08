const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Implementación real de fetchv2 con soporte gzip
async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        console.log(`[FETCH] ${method} ${url}`);
        
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-419,es;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Gpc': '1',
                'Referer': 'https://kaa.to/',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let data = [];
            
            res.on('data', (chunk) => {
                data.push(chunk);
            });
            
            res.on('end', () => {
                let buffer = Buffer.concat(data);
                
                // Manejar compresión gzip
                if (res.headers['content-encoding'] === 'gzip') {
                    zlib.gunzip(buffer, (err, decompressed) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                status: res.statusCode,
                                headers: res.headers,
                                _data: decompressed.toString()
                            });
                        }
                    });
                } else {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        _data: buffer.toString()
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function debugEpisodePage() {
    console.log('🐛 DEBUGGING EPISODE PAGE HTML\n');
    
    try {
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log(`📺 Fetching: ${episodeUrl}`);
        
        const response = await fetchv2(episodeUrl);
        
        console.log(`📋 Status: ${response.status}`);
        console.log(`📋 Content-Type: ${response.headers['content-type']}`);
        console.log(`📋 Content length: ${response._data.length} characters\n`);
        
        const html = response._data;
        
        // Buscar iframes
        console.log('🔍 Searching for iframes...');
        const iframeMatches = html.match(/<iframe[^>]*>/gi);
        if (iframeMatches) {
            console.log(`✅ Found ${iframeMatches.length} iframe(s):`);
            iframeMatches.forEach((iframe, i) => {
                console.log(`   ${i+1}. ${iframe}`);
            });
        } else {
            console.log('❌ No iframes found');
        }
        
        // Buscar menciones de krussdomi
        console.log('\n🔍 Searching for krussdomi...');
        const krussdomiMatches = html.match(/krussdomi[^"'\s]*/gi);
        if (krussdomiMatches) {
            console.log(`✅ Found ${krussdomiMatches.length} krussdomi mention(s):`);
            krussdomiMatches.forEach((match, i) => {
                console.log(`   ${i+1}. ${match}`);
            });
        } else {
            console.log('❌ No krussdomi mentions found');
        }
        
        // Buscar player.php
        console.log('\n🔍 Searching for player.php...');
        const playerMatches = html.match(/player\.php[^"'\s]*/gi);
        if (playerMatches) {
            console.log(`✅ Found ${playerMatches.length} player.php mention(s):`);
            playerMatches.forEach((match, i) => {
                console.log(`   ${i+1}. ${match}`);
            });
        } else {
            console.log('❌ No player.php mentions found');
        }
        
        // Mostrar una parte del HTML para ver la estructura
        console.log('\n📄 HTML Preview (first 500 chars):');
        console.log(html.substring(0, 500));
        
        // Buscar scripts que podrían contener el player
        console.log('\n🔍 Searching for script tags...');
        const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
        if (scriptMatches) {
            console.log(`✅ Found ${scriptMatches.length} script tag(s)`);
            
            // Buscar en scripts por menciones del player
            scriptMatches.forEach((script, i) => {
                if (script.includes('krussdomi') || script.includes('player') || script.includes('iframe')) {
                    console.log(`   Script ${i+1} contains player references:`);
                    console.log(`   ${script.substring(0, 200)}...`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugEpisodePage();
