/**
 * TEST VIDEO PLAYLIST ACCESS v11.5.4
 * Verifica que la nueva lógica busque streams de VIDEO en lugar de AUDIO
 */

const fetch = require('node-fetch');

async function fetchv2(url, headers, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: headers || {}
        };
        
        if (body && method !== 'GET') {
            options.body = body;
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            console.log(`HTTP ${response.status}: ${response.statusText}`);
            return await response.text();
        }
        
        return await response.text();
    } catch (error) {
        throw new Error(`fetchv2 error: ${error.message}`);
    }
}

async function testVideoPlaylistAccess() {
    console.log('🔬 TESTING VIDEO PLAYLIST ACCESS v11.5.4...\n');
    
    const selectedVideoId = '6713f500b97399e0e1ae2020'; // El Video ID que sabemos funciona
    
    try {
        // Paso 1: Obtener master.m3u8
        const masterM3u8Url = `https://hls.krussdomi.com/manifest/${selectedVideoId}/master.m3u8`;
        console.log('🎯 MASTER M3U8 URL:', masterM3u8Url);
        
        const masterContent = await fetchv2(masterM3u8Url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Origin': 'https://krussdomi.com',
            'Referer': 'https://krussdomi.com/',
        }, 'GET', null);
        
        console.log('🔍 MASTER M3U8 CONTENT:');
        console.log(masterContent);
        console.log('\n' + '='.repeat(80) + '\n');
        
        // Paso 2: Buscar VIDEO STREAMS (nuevo algoritmo v11.5.4)
        console.log('🎥 SEARCHING FOR VIDEO STREAMS (EXT-X-STREAM-INF)...');
        const videoStreamPattern = /#EXT-X-STREAM-INF:[^\n]*\n([^\n]+\.m3u8)/gi;
        const videoMatches = [];
        let match;
        
        while ((match = videoStreamPattern.exec(masterContent)) !== null) {
            videoMatches.push(match[1]);
        }
        
        console.log(`✅ FOUND ${videoMatches.length} VIDEO STREAMS:`);
        videoMatches.forEach((videoStream, index) => {
            console.log(`   ${index + 1}. ${videoStream}`);
            console.log(`      -> https://hls.krussdomi.com/manifest/${selectedVideoId}/${videoStream}`);
        });
        
        if (videoMatches.length > 0) {
            const selectedVideo = videoMatches[0];
            const videoUrl = `https://hls.krussdomi.com/manifest/${selectedVideoId}/${selectedVideo}`;
            console.log('\n🎯 SELECTED VIDEO STREAM:', videoUrl);
            
            // Paso 3: Verificar contenido del video stream
            console.log('\n🔬 TESTING VIDEO STREAM CONTENT...');
            const videoContent = await fetchv2(videoUrl, {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Origin': 'https://krussdomi.com',
                'Referer': 'https://krussdomi.com/',
            }, 'GET', null);
            
            console.log('📄 VIDEO PLAYLIST CONTENT (first 500 chars):');
            console.log(videoContent.substring(0, 500));
            
            // Verificar que contenga segmentos de video (no .jpg)
            const segmentLines = videoContent.split('\n').filter(line => 
                line.trim() && !line.startsWith('#') && !line.startsWith('//')
            );
            
            console.log('\n🧩 SEGMENT ANALYSIS:');
            console.log(`   Total segments found: ${segmentLines.length}`);
            
            if (segmentLines.length > 0) {
                const firstSegment = segmentLines[0];
                console.log(`   First segment: ${firstSegment}`);
                
                if (firstSegment.includes('.ts')) {
                    console.log('✅ SEGMENTS ARE VIDEO FILES (.ts) - GOOD!');
                } else if (firstSegment.includes('.jpg')) {
                    console.log('❌ SEGMENTS ARE IMAGES (.jpg) - NOT VIDEO!');
                } else {
                    console.log('❓ UNKNOWN SEGMENT TYPE');
                }
            }
            
            console.log('\n🚀 RESULT: Module v11.5.4 would return:', videoUrl);
            
        } else {
            console.log('\n❌ NO VIDEO STREAMS FOUND');
            
            // Fallback: analizar playlists de audio
            console.log('\n🔄 ANALYZING AUDIO PLAYLISTS...');
            const playlistPattern = /URI="([^"]+\.m3u8)"/gi;
            const allPlaylists = masterContent.match(playlistPattern);
            
            if (allPlaylists) {
                console.log(`Found ${allPlaylists.length} total playlists:`);
                allPlaylists.forEach((playlist, index) => {
                    const path = playlist.match(/URI="([^"]+)"/)[1];
                    const context = masterContent.substring(
                        Math.max(0, masterContent.indexOf(playlist) - 100),
                        masterContent.indexOf(playlist) + 100
                    );
                    const isAudio = context.includes('TYPE=AUDIO');
                    console.log(`   ${index + 1}. ${path} ${isAudio ? '(AUDIO)' : '(NOT AUDIO)'}`);
                });
            }
        }
        
    } catch (error) {
        console.log('❌ TEST FAILED:', error.message);
    }
}

testVideoPlaylistAccess();
