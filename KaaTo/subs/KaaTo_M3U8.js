// KaaTo Module - WITH M3U8 EPISODE EXTRACTION
async function searchResults(keyword) {
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (response && response._data) {
            let animeData = response._data;
            if (typeof animeData === 'string') {
                animeData = JSON.parse(animeData);
            }
            
            if (Array.isArray(animeData) && animeData.length > 0) {
                const results = animeData.map(anime => ({
                    title: anime.title || anime.title_en || "Sin título",
                    image: `https://kaa.to/image/poster/${anime.poster?.hq || anime.poster?.sm || 'default'}.webp`,
                    href: `https://kaa.to/anime/${anime.slug}`
                }));
                
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('Search error: ' + error.message);
        return JSON.stringify([]);
    }
}

async function extractDetails(url) {
    try {
        // Manejar URLs de información/debug
        if (url.startsWith('info://') || url.startsWith('debug://')) {
            return JSON.stringify([{
                description: "Este es el módulo KaaTo para extraer animes de kaa.to con soporte M3U8",
                aliases: "KaaTo M3U8 Module",
                airdate: "2024"
            }]);
        }
        
        // Extraer slug de la URL
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        
        // Llamar a la API de detalles
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            // Formatear según lo que espera Sora: array con objeto {description, aliases, airdate}
            const result = {
                description: details.synopsis || details.description || "Sin descripción disponible",
                aliases: [
                    details.title_en,
                    details.title_original
                ].filter(title => title && title !== details.title).join(', ') || '',
                airdate: details.year ? `Año: ${details.year}` : (details.start_date ? `Aired: ${details.start_date}` : 'Aired: Unknown')
            };
            
            return JSON.stringify([result]);
        } else {
            return JSON.stringify([{
                description: "Error obteniendo detalles del anime",
                aliases: "",
                airdate: "Aired: Unknown"
            }]);
        }
    } catch (error) {
        console.log('Details error: ' + error.message);
        return JSON.stringify([{
            description: 'Error loading description: ' + error.message,
            aliases: '',
            airdate: 'Aired: Unknown'
        }]);
    }
}

async function extractEpisodes(url) {
    try {
        // Manejar URLs de información/debug
        if (url.startsWith('info://') || url.startsWith('debug://')) {
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}/episodes`);
        
        if (response && response._data) {
            let episodesData = response._data;
            if (typeof episodesData === 'string') {
                episodesData = JSON.parse(episodesData);
            }
            
            // Manejar la estructura real: { current_page: 1, pages: [...] }
            let episodes = [];
            
            if (episodesData.pages && Array.isArray(episodesData.pages)) {
                // Extraer episodios de todas las páginas
                episodesData.pages.forEach(page => {
                    if (page.episodes && Array.isArray(page.episodes)) {
                        episodes.push(...page.episodes);
                    }
                });
            }
            
            if (episodes.length > 0) {
                const episodeList = episodes.map((ep, index) => ({
                    href: ep.watch_uri ? `https://kaa.to${ep.watch_uri}` : `https://kaa.to/anime/${slug}/episode/${ep.episode || index + 1}`,
                    number: ep.episode || ep.number || index + 1
                }));
                
                return JSON.stringify(episodeList);
            } else {
                // Si no hay episodios, retornar episodio genérico
                return JSON.stringify([{
                    href: `https://kaa.to/anime/${slug}`,
                    number: 1
                }]);
            }
        } else {
            return JSON.stringify([{
                href: url,
                number: 1
            }]);
        }
        
    } catch (error) {
        console.log('Episodes error: ' + error.message);
        return JSON.stringify([{
            href: url,
            number: 1
        }]);
    }
}

// Función para extraer ID de video del iframe
function extractVideoId(url) {
    const match = url.match(/id=([^&]+)/);
    return match ? match[1] : null;
}

// Función para extraer streams M3U8 directos
async function extractDirectM3U8Streams(videoId) {
    try {
        const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        
        // Headers exactos basados en los datos de red
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

        const response = await fetchv2(masterUrl, headers);
        
        if (response && response._data) {
            const masterPlaylist = response._data;
            
            // Parsear para encontrar la mejor calidad
            const streams = parseM3U8Master(masterPlaylist, videoId);
            
            return {
                success: true,
                masterUrl: masterUrl,
                streams: streams,
                headers: headers
            };
        } else {
            throw new Error('No se pudo obtener el master playlist');
        }

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para parsear el master playlist
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
            // Extraer info de video
            const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
            const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);

            currentStream = {
                type: 'video',
                bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
                resolution: resolutionMatch ? resolutionMatch[1] : 'unknown'
            };

        } else if (line && !line.startsWith('#') && currentStream) {
            // URL del stream de video
            currentStream.url = `https://hls.krussdomi.com/manifest/${videoId}/${line}`;
            streams.video.push(currentStream);
            currentStream = null;
        }
    }

    // Ordenar por calidad (mayor bandwidth = mejor calidad)
    streams.video.sort((a, b) => b.bandwidth - a.bandwidth);

    return streams;
}

async function extractStreamUrl(url) {
    try {
        // Primero obtener la página del episodio para encontrar el iframe
        const response = await fetchv2(url);
        
        if (response && response._data) {
            const html = response._data;
            
            // Buscar el iframe de krussdomi
            const iframeMatch = html.match(/src="([^"]*krussdomi\.com[^"]*)"/);
            
            if (iframeMatch) {
                const iframeUrl = iframeMatch[1];
                const videoId = extractVideoId(iframeUrl);
                
                if (videoId) {
                    // Intentar extraer M3U8 directo
                    const m3u8Data = await extractDirectM3U8Streams(videoId);
                    
                    if (m3u8Data.success && m3u8Data.streams.video.length > 0) {
                        // Retornar la mejor calidad disponible
                        const bestStream = m3u8Data.streams.video[0];
                        
                        return JSON.stringify({
                            streamUrl: bestStream.url,
                            quality: bestStream.resolution || "1080p",
                            type: "m3u8",
                            headers: {
                                'Origin': 'https://krussdomi.com',
                                'Referer': 'https://krussdomi.com/',
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                    }
                }
                
                // Fallback al iframe si M3U8 falla
                return JSON.stringify({
                    streamUrl: iframeUrl,
                    quality: "1080p",
                    type: "iframe",
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
            }
        }
        
        // Fallback genérico
        return JSON.stringify({
            streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            quality: "720p",
            type: "mp4",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
        
    } catch (error) {
        console.log('Stream error: ' + error.message);
        return JSON.stringify({
            streamUrl: "",
            quality: "Error",
            type: "error",
            headers: {}
        });
    }
}
