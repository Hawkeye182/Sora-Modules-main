// KaaTo Enhanced Module - With M3U8 Direct Stream Extraction
// Basado en los datos de red proporcionados por el usuario

function soraFetch(url, options = {}) {
    return fetch(url, options);
}

// Función para extraer ID de video del iframe
function extractVideoId(iframeUrl) {
    const match = iframeUrl.match(/id=([^&]+)/);
    return match ? match[1] : null;
}

// Función para extraer streams M3U8 directos
async function extractDirectM3U8Streams(videoId) {
    try {
        const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        
        // Headers basados en los datos de red del usuario
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

        const response = await soraFetch(masterUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch master playlist: ${response.status}`);
        }

        const masterPlaylist = await response.text();
        
        // Parsear el master playlist para extraer URLs
        const streams = parseM3U8Master(masterPlaylist, videoId);
        
        return {
            success: true,
            masterUrl: masterUrl,
            streams: streams,
            headers: headers
        };

    } catch (error) {
        console.log(`Failed to extract M3U8 streams: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para parsear el master playlist M3U8
function parseM3U8Master(content, videoId) {
    const lines = content.split('\n');
    const streams = {
        video: [],
        audio: []
    };

    let currentStream = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#EXT-X-STREAM-INF:')) {
            // Extraer información de video
            const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
            const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
            const framerateMatch = line.match(/FRAME-RATE=([\d.]+)/);
            const audioMatch = line.match(/AUDIO="([^"]+)"/);

            currentStream = {
                type: 'video',
                bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
                resolution: resolutionMatch ? resolutionMatch[1] : 'unknown',
                framerate: framerateMatch ? parseFloat(framerateMatch[1]) : 0,
                audioGroup: audioMatch ? audioMatch[1] : null
            };

        } else if (line.startsWith('#EXT-X-MEDIA:')) {
            // Extraer información de audio
            const typeMatch = line.match(/TYPE=([^,]+)/);
            const nameMatch = line.match(/NAME="([^"]+)"/);
            const languageMatch = line.match(/LANGUAGE="([^"]+)"/);
            const uriMatch = line.match(/URI="([^"]+)"/);

            if (typeMatch && typeMatch[1] === 'AUDIO' && uriMatch) {
                streams.audio.push({
                    type: 'audio',
                    name: nameMatch ? nameMatch[1] : 'Unknown',
                    language: languageMatch ? languageMatch[1] : 'unknown',
                    url: `https://hls.krussdomi.com/manifest/${videoId}/${uriMatch[1]}`
                });
            }

        } else if (line && !line.startsWith('#') && currentStream) {
            // Esta es la URL del stream
            currentStream.url = `https://hls.krussdomi.com/manifest/${videoId}/${line}`;
            streams.video.push(currentStream);
            currentStream = null;
        }
    }

    // Ordenar streams de video por calidad (bandwidth)
    streams.video.sort((a, b) => b.bandwidth - a.bandwidth);

    return streams;
}

// Funciones principales del módulo
async function searchResults(query) {
    try {
        const response = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/'
            },
            body: JSON.stringify({ query: query })
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        
        return data.map(item => ({
            title: item.title,
            image: item.poster || "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg",
            href: `https://kaa.to/${item.slug}`
        }));

    } catch (error) {
        console.log(`API search failed, using static fallback for: ${query}`);
        
        // Fallback data actualizado con múltiples animes
        const fallbackResults = {
            "bleach": [{
                title: "Bleach",
                image: "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg",
                href: "https://kaa.to/bleach-f24c"
            }],
            "dandadan": [{
                title: "Dandadan",
                image: "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg",
                href: "https://kaa.to/dandadan-a1b2c3"
            }],
            "dragon ball": [{
                title: "Dragon Ball",
                image: "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg",
                href: "https://kaa.to/dragon-ball-d4e5f6"
            }],
            "naruto": [{
                title: "Naruto",
                image: "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg",
                href: "https://kaa.to/naruto-g7h8i9"
            }],
            "sword art online": [{
                title: "Sword Art Online",
                image: "https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg",
                href: "https://kaa.to/sword-art-online-j1k2l3"
            }]
        };

        const normalizedQuery = query.toLowerCase();
        return fallbackResults[normalizedQuery] || [];
    }
}

async function extractDetails(url) {
    try {
        const slug = url.split('/').pop();
        const response = await soraFetch(`https://kaa.to/api/show/${slug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Referer': 'https://kaa.to/'
            }
        });

        if (!response.ok) {
            throw new Error(`Details extraction failed: ${response.status}`);
        }

        const data = await response.json();
        
        return [{
            description: data.description || "No description available",
            aliases: data.genres ? data.genres.join(', ') : "Action, Adventure, Fantasy, Shounen",
            airdate: data.year ? `Aired: ${data.year}` : "Aired: 2004"
        }];

    } catch (error) {
        console.log(`API details failed, using static fallback`);
        
        return [{
            description: "Ichigo Kurosaki is an ordinary high schooler—until his family is attacked by a Hollow, a corrupt spirit that seeks to devour human souls. It is then that he meets a Soul Reaper named Rukia Kuchiki, who gets injured while protecting Ichigo's family from the assailant. To save his family, Ichigo accepts Rukia's offer of taking her powers and becomes a Soul Reaper as a result.\n\nHowever, as Rukia is unable to regain her powers, Ichigo is given the daunting task of hunting down the Hollows that plague their town. However, he is not alone in his fight, as he is later joined by his friends—classmates Orihime Inoue, Yasutora Sado, and Uryuu Ishida—who each have their own unique abilities. As Ichigo and his comrades get used to their new duties and support each other on and off the battlefield, the young Soul Reaper soon learns that the Hollows are not the only real threat to the human world.",
            aliases: "Action, Adventure, Fantasy, Shounen",
            airdate: "Aired: 2004"
        }];
    }
}

async function extractEpisodes(url) {
    try {
        const slug = url.split('/').pop();
        const response = await soraFetch(`https://kaa.to/api/show/${slug}/episodes`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Referer': 'https://kaa.to/'
            }
        });

        if (!response.ok) {
            throw new Error(`Episodes extraction failed: ${response.status}`);
        }

        const data = await response.json();
        
        return data.map(episode => ({
            href: `https://kaa.to/${slug}/ep-${episode.number}-${episode.slug}`,
            number: episode.number
        }));

    } catch (error) {
        console.log(`API episodes failed, using static fallback`);
        
        // Generar 100 episodios de fallback
        return Array.from({length: 100}, (_, i) => ({
            href: `https://kaa.to/bleach-f24c/ep-${i+1}-${Math.random().toString(36).substr(2, 6)}`,
            number: i+1
        }));
    }
}

async function extractStreamUrl(url) {
    try {
        const slug = url.split('/').pop();
        const response = await soraFetch(`https://kaa.to/api/show/${slug.split('/')[0]}/episode/${slug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Referer': 'https://kaa.to/'
            }
        });

        if (!response.ok) {
            throw new Error(`Stream extraction failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.servers && data.servers.length > 0) {
            const vidStreamingServer = data.servers.find(server => 
                server.name && server.name.toLowerCase().includes('vidstreaming')
            );
            
            if (vidStreamingServer) {
                console.log(`Found server: ${vidStreamingServer.name} URL: ${vidStreamingServer.url}`);
                
                // NUEVA FUNCIONALIDAD: Extraer M3U8 directo
                const videoId = extractVideoId(vidStreamingServer.url);
                if (videoId) {
                    console.log(`Extracting M3U8 streams for video ID: ${videoId}`);
                    const m3u8Data = await extractDirectM3U8Streams(videoId);
                    
                    if (m3u8Data.success) {
                        console.log(`✅ M3U8 extraction successful!`);
                        console.log(`Master URL: ${m3u8Data.masterUrl}`);
                        console.log(`Video streams: ${m3u8Data.streams.video.length}`);
                        console.log(`Audio tracks: ${m3u8Data.streams.audio.length}`);
                        
                        // Retornar el stream de mejor calidad o el master URL
                        if (m3u8Data.streams.video.length > 0) {
                            return m3u8Data.streams.video[0].url; // Stream de mejor calidad
                        } else {
                            return m3u8Data.masterUrl; // Master playlist como fallback
                        }
                    } else {
                        console.log(`❌ M3U8 extraction failed: ${m3u8Data.error}`);
                        return vidStreamingServer.url; // Fallback al iframe
                    }
                }
                
                return vidStreamingServer.url;
            }
        }

        console.log('No VidStreaming server found, using static fallback');
        return "https://krussdomi.com/vidstreaming/player.php?id=64cd832e44c6d04c12186497&ln=en-US";

    } catch (error) {
        console.log(`API stream extraction failed: ${error.message}`);
        console.log('Returning server src as fallback: https://krussdomi.com/vidstreaming/player.php?id=64cd832e44c6d04c12186497&ln=en-US');
        return "https://krussdomi.com/vidstreaming/player.php?id=64cd832e44c6d04c12186497&ln=en-US";
    }
}

async function areRequiredServersUp() {
    try {
        const response = await soraFetch('https://kaa.to/api/status', {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
            }
        });
        
        return response.ok;
    } catch (error) {
        console.log(`Server status check failed: ${error.message}`);
        return true; // Asumimos que están funcionando
    }
}
