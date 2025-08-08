const { readFileSync } = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Implementación real de fetchv2 con soporte gzip y cookies
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
                // Usar la cookie de autenticación de tus datos
                'Cookie': 'token=eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI2Nzk2MmI0MmE1NmVhMDhiMTBjODEzZDciLCJ1c2VybmFtZSI6Imhhd2siLCJlbWFpbCI6ImJyb2FuZHNpc21pbmlvbmVyc0BnbWFpbC5jb20iLCJhdWQiOiJwdWJsaWMiLCJleHAiOjE3NjE1MTE2ODJ9.ezjAqvCbCghRBJTupFgfO9dI_3cv4msLK5thsORuLb4',
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

async function debugWithAuth() {
    console.log('🔐 DEBUGGING WITH AUTHENTICATION\n');
    
    try {
        // Test 1: Obtener página del episodio con autenticación
        const episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-515c41';
        console.log(`📺 Fetching episode page: ${episodeUrl}`);
        
        const response = await fetchv2(episodeUrl, {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin'
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Content length: ${response._data.length}`);
        
        // Verificar si ahora tenemos HTML válido
        const html = response._data;
        if (html.startsWith('<!DOCTYPE html') || html.includes('<html')) {
            console.log('✅ Valid HTML received!');
            
            // Buscar iframe de krussdomi
            const iframeMatch = html.match(/src="(https:\/\/krussdomi\.com[^"]+)"/);
            if (iframeMatch) {
                console.log(`✅ Found krussdomi iframe: ${iframeMatch[1]}`);
                
                // Extraer ID del video
                const idMatch = iframeMatch[1].match(/id=([^&]+)/);
                if (idMatch) {
                    console.log(`✅ Video ID: ${idMatch[1]}`);
                    
                    // Test del M3U8 master playlist
                    const masterUrl = `https://hls.krussdomi.com/manifest/${idMatch[1]}/master.m3u8`;
                    console.log(`\n🎬 Testing M3U8: ${masterUrl}`);
                    
                    const m3u8Response = await fetchv2(masterUrl, {
                        'Accept': '*/*',
                        'Origin': 'https://krussdomi.com',
                        'Referer': 'https://krussdomi.com/'
                    });
                    
                    console.log(`M3U8 Status: ${m3u8Response.status}`);
                    if (m3u8Response.status === 200) {
                        console.log('✅ M3U8 accessible!');
                        console.log('Preview:', m3u8Response._data.substring(0, 300));
                    }
                }
            } else {
                console.log('❌ No krussdomi iframe found');
                
                // Buscar cualquier mención de video/streaming
                const videoMatches = html.match(/(player|video|stream|embed)[^"'\s]*/gi);
                if (videoMatches) {
                    console.log('Found video-related content:', videoMatches.slice(0, 5));
                }
            }
        } else {
            console.log('❌ Still receiving invalid HTML');
            console.log('Response preview:', html.substring(0, 200));
        }
        
    } catch (error) {
        console.error('❌ Debug with auth failed:', error.message);
    }
}

debugWithAuth();
