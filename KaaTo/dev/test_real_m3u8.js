// Test with REAL M3U8 data format (based on user's network data)
const fs = require('fs');

// Función fetch para Node.js
async function setupFetch() {
    const nodeFetch = await import('node-fetch').then(module => module.default);
    global.fetch = nodeFetch;
    return nodeFetch;
}

async function soraFetch(url, options = {}) {
    const fetch = global.fetch;
    return fetch(url, options);
}

// Función mejorada para parsear el M3U8 master (basada en tus datos EXACTOS)
function parseM3U8Master(content, videoId) {
    const lines = content.split('\n');
    const streams = {
        video: [],
        audio: []
    };

    console.log(`📋 Parsing M3U8 content:\n${content}\n`);

    let currentStream = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#EXT-X-MEDIA:TYPE=AUDIO')) {
            // Formato EXACTO de tus datos:
            // #EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",NAME="Japanese",DEFAULT=YES,LANGUAGE="jpn",CHANNELS="2",URI="64cd8436684efea82b13f4a5/playlist.m3u8"
            const nameMatch = line.match(/NAME="([^"]+)"/);
            const languageMatch = line.match(/LANGUAGE="([^"]+)"/);
            const uriMatch = line.match(/URI="([^"]+)"/);

            if (uriMatch) {
                const audioTrack = {
                    type: 'audio',
                    name: nameMatch ? nameMatch[1] : 'Unknown',
                    language: languageMatch ? languageMatch[1] : 'unknown',
                    url: `https://hls.krussdomi.com/manifest/${videoId}/${uriMatch[1]}`
                };
                streams.audio.push(audioTrack);
                console.log(`🎵 Found audio track: ${audioTrack.name} (${audioTrack.language})`);
            }

        } else if (line.startsWith('#EXT-X-STREAM-INF:')) {
            // Formato EXACTO de tus datos:
            // #EXT-X-STREAM-INF:BANDWIDTH=6631028,AVERAGE-BANDWIDTH=2338000,CODECS="avc1.64002A,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=23.976,AUDIO="stereo"
            const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
            const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
            const framerateMatch = line.match(/FRAME-RATE=([\d.]+)/);

            currentStream = {
                type: 'video',
                bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
                resolution: resolutionMatch ? resolutionMatch[1] : 'unknown',
                framerate: framerateMatch ? parseFloat(framerateMatch[1]) : 0
            };

        } else if (line && !line.startsWith('#') && currentStream) {
            // URL del stream de video (formato: 64cd84b244c6d04c12230479/playlist.m3u8)
            currentStream.url = `https://hls.krussdomi.com/manifest/${videoId}/${line}`;
            
            // Determinar calidad basada en resolución
            let quality = 'unknown';
            if (currentStream.resolution === '1920x1080') quality = '1080p';
            else if (currentStream.resolution === '1280x720') quality = '720p';
            else if (currentStream.resolution === '640x360') quality = '360p';
            
            currentStream.quality = quality;
            streams.video.push(currentStream);
            console.log(`📺 Found video stream: ${quality} (${currentStream.resolution}) - ${currentStream.bandwidth} bps`);
            currentStream = null;
        }
    }

    // Ordenar por calidad (bandwidth descendente)
    streams.video.sort((a, b) => b.bandwidth - a.bandwidth);

    return streams;
}

// Función de extracción M3U8 actualizada
async function extractDirectM3U8Streams(videoId) {
    try {
        const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        
        // Headers EXACTOS de tus datos de red
        const headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'es-419,es;q=0.9',
            'Origin': 'https://krussdomi.com',
            'Referer': 'https://krussdomi.com/',
            'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Brave";v="139", "Chromium";v="139"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Gpc': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        };

        console.log(`🔍 Fetching master M3U8: ${masterUrl}`);
        const response = await soraFetch(masterUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const masterPlaylist = await response.text();
        console.log(`✅ Master playlist fetched (${masterPlaylist.length} chars)`);
        
        // Parsear con el formato correcto
        const streams = parseM3U8Master(masterPlaylist, videoId);
        
        return {
            success: true,
            masterUrl: masterUrl,
            streams: streams,
            headers: headers
        };

    } catch (error) {
        console.log(`❌ M3U8 extraction failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Simular datos de M3U8 basados en tus ejemplos REALES
function simulateRealM3U8Data() {
    // Tu master.m3u8 REAL
    const realMasterM3U8 = `#EXTM3U
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",NAME="Japanese",DEFAULT=YES,LANGUAGE="jpn",CHANNELS="2",URI="64cd8436684efea82b13f4a5/playlist.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",NAME="English",LANGUAGE="eng",CHANNELS="2",URI="64cd843655993f0068a24343/playlist.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",NAME="Spanish",LANGUAGE="spa",CHANNELS="2",URI="64cd8499a16f5b01c55b96e8/playlist.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=1024074,AVERAGE-BANDWIDTH=567000,CODECS="avc1.64001E,mp4a.40.2",RESOLUTION=640x360,FRAME-RATE=23.976,AUDIO="stereo"
64cd843644c6d04c121e7deb/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=6631028,AVERAGE-BANDWIDTH=2338000,CODECS="avc1.64002A,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=23.976,AUDIO="stereo"
64cd84b244c6d04c12230479/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3395697,AVERAGE-BANDWIDTH=1279000,CODECS="avc1.640020,mp4a.40.2",RESOLUTION=1280x720,FRAME-RATE=23.976,AUDIO="stereo"
64cd84c244c6d04c1223529b/playlist.m3u8`;

    return realMasterM3U8;
}

// Test con datos REALES
async function testWithRealData() {
    console.log("=".repeat(70));
    console.log("TESTING WITH REAL M3U8 DATA FORMAT");
    console.log("=".repeat(70));
    
    await setupFetch();
    
    const videoId = "64cd832e44c6d04c12186497"; // El ID que sabemos que funciona
    
    console.log(`\n🎬 Testing with REAL video ID: ${videoId}`);
    console.log(`📺 Iframe URL: https://krussdomi.com/vidstreaming/player.php?id=${videoId}&ln=en-US`);
    
    // Primero, prueba con datos simulados para verificar el parsing
    console.log(`\n🧪 1. Testing M3U8 parsing with simulated REAL data...`);
    const simulatedData = simulateRealM3U8Data();
    const parsedStreams = parseM3U8Master(simulatedData, videoId);
    
    console.log(`\n📊 Parsing results:`);
    console.log(`📺 Video streams found: ${parsedStreams.video.length}`);
    console.log(`🎵 Audio tracks found: ${parsedStreams.audio.length}`);
    
    if (parsedStreams.video.length > 0) {
        console.log(`\n📺 Video Qualities:`);
        parsedStreams.video.forEach((stream, i) => {
            console.log(`   ${i+1}. ${stream.quality} (${stream.resolution}) - ${stream.bandwidth} bps`);
            console.log(`      URL: ${stream.url}`);
        });
    }
    
    if (parsedStreams.audio.length > 0) {
        console.log(`\n🎵 Audio Tracks:`);
        parsedStreams.audio.forEach((track, i) => {
            console.log(`   ${i+1}. ${track.name} (${track.language})`);
            console.log(`      URL: ${track.url}`);
        });
    }
    
    // Ahora prueba con fetch real
    console.log(`\n🌐 2. Testing with REAL HTTP fetch...`);
    const m3u8Data = await extractDirectM3U8Streams(videoId);
    
    if (m3u8Data.success) {
        console.log(`✅ REAL M3U8 extraction SUCCESS!`);
        console.log(`📁 Master URL: ${m3u8Data.masterUrl}`);
        console.log(`📺 Video streams: ${m3u8Data.streams.video.length}`);
        console.log(`🎵 Audio tracks: ${m3u8Data.streams.audio.length}`);
        
        // Mostrar la mejor calidad para Sora
        if (m3u8Data.streams.video.length > 0) {
            const bestVideo = m3u8Data.streams.video[0];
            console.log(`\n🎯 BEST QUALITY FOR SORA:`);
            console.log(`   Quality: ${bestVideo.quality} (${bestVideo.resolution})`);
            console.log(`   URL: ${bestVideo.url}`);
        }
        
        // Mostrar audio japonés para Sora
        const japaneseAudio = m3u8Data.streams.audio.find(a => a.language === 'jpn');
        if (japaneseAudio) {
            console.log(`\n🎌 JAPANESE AUDIO FOR SORA:`);
            console.log(`   Track: ${japaneseAudio.name}`);
            console.log(`   URL: ${japaneseAudio.url}`);
        }
        
    } else {
        console.log(`❌ REAL fetch failed: ${m3u8Data.error}`);
    }
    
    console.log(`\n${"=".repeat(70)}`);
    console.log("🎉 REAL DATA TESTING COMPLETED!");
    console.log("📋 M3U8 parsing format is now correct for kaa.to");
    console.log("🔧 Ready to integrate into final KaaTo module");
    console.log(`${"=".repeat(70)}`);
}

// Ejecutar test
testWithRealData().catch(console.error);
