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
                'Accept': '*/*',
                'Accept-Language': 'es-419,es;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': 'https://kaa.to',
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

// Cargar el módulo KaaTo
const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_COMPLETE.js'), 'utf8');
global.fetchv2 = fetchv2;
eval(moduleCode);

async function debugStreamExtraction() {
    console.log('🐛 DEBUGGING STREAM EXTRACTION\n');
    
    try {
        // Test con Bleach episodio 1
        console.log('🔍 Testing Bleach Episode 1 Stream...');
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        
        console.log(`📺 Episode URL: ${episodeUrl}`);
        
        const streamResult = await extractStreamUrl(episodeUrl);
        console.log('\n📋 Stream Result:');
        console.log(streamResult);
        
        const stream = JSON.parse(streamResult);
        console.log('\n🎬 Parsed Stream:');
        console.log(`   Type: ${stream.type}`);
        console.log(`   Quality: ${stream.quality}`);
        console.log(`   Stream URL: ${stream.streamUrl}`);
        console.log(`   Headers: ${JSON.stringify(stream.headers, null, 2)}`);
        
        // Verificar si la URL del stream es válida
        if (stream.streamUrl && stream.streamUrl !== "") {
            console.log('\n✅ Stream URL found');
            
            // Si es M3U8, verificar que el manifest sea accesible
            if (stream.type === 'm3u8' && stream.streamUrl.includes('.m3u8')) {
                console.log('\n🔗 Testing M3U8 manifest access...');
                try {
                    const manifestResponse = await fetchv2(stream.streamUrl, stream.headers);
                    if (manifestResponse.status === 200) {
                        console.log('✅ M3U8 manifest accessible');
                        console.log(`   Manifest preview: ${manifestResponse._data.substring(0, 200)}...`);
                    } else {
                        console.log(`❌ M3U8 manifest failed: HTTP ${manifestResponse.status}`);
                    }
                } catch (manifestError) {
                    console.log(`❌ M3U8 manifest error: ${manifestError.message}`);
                }
            }
        } else {
            console.log('❌ No stream URL found');
        }
        
    } catch (error) {
        console.error('❌ Stream extraction failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

debugStreamExtraction();
