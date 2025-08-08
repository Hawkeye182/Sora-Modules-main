// KaaTo Module for Sora - Fixed Version
// Addresses search, image, details, and streaming issues

/**
 * Searches the website for anime with the given keyword and returns the results
 * @param {string} keyword The keyword to search for
 * @returns {Promise<string>} A promise that resolves with a JSON string containing the search results
 */
async function searchResults(keyword) {
    try {
        console.log(`Searching for: ${keyword}`);
        
        const response = await soraFetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/'
            },
            body: JSON.stringify({ query: keyword })
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        console.log(`API returned ${Array.isArray(data) ? data.length : 0} results`);
        
        // Verificar que la respuesta tiene datos
        if (!Array.isArray(data) || data.length === 0) {
            console.log('No results from API');
            return JSON.stringify([]);
        }
        
        const results = data.map(item => {
            // Construir URL de imagen usando el poster real
            let imageUrl = "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg";
            if (item.poster && item.poster.hq) {
                imageUrl = `https://kaa.to/image/poster/${item.poster.hq}.webp`;
            } else if (item.poster && item.poster.sm) {
                imageUrl = `https://kaa.to/image/poster/${item.poster.sm}.webp`;
            }
            
            return {
                title: item.title || item.title_en || "Sin título",
                image: imageUrl,
                href: `https://kaa.to/${item.slug}`
            };
        });

        console.log(`Returning ${results.length} formatted results`);
        return JSON.stringify(results);

    } catch (error) {
        console.log(`Search failed: ${error.message}`);
        return JSON.stringify([]);
    }
}

/**
 * Extracts the details from the given URL
 * @param {string} url The URL to extract details from
 * @returns {Promise<string>} A promise that resolves with JSON containing details
 */
async function extractDetails(url) {
    try {
        // Extract slug from URL: https://kaa.to/naruto-f3cf -> naruto-f3cf
        const slug = url.split('/').pop();
        console.log(`Extracting details for: ${slug}`);
        
        const response = await soraFetch(`https://kaa.to/api/show/${slug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/'
            }
        });

        if (!response.ok) {
            throw new Error(`Details failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data) {
            throw new Error('No details data received');
        }

        // Format the response according to what we found in the API
        const details = {
            description: data.overview || data.description || "No description available",
            aliases: buildAliasString(data),
            airdate: formatAirDate(data)
        };

        console.log(`Details extracted successfully`);
        return JSON.stringify([details]);

    } catch (error) {
        console.log(`Details extraction failed: ${error.message}`);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Unable to load aliases',
            airdate: 'Air date unknown'
        }]);
    }

    function buildAliasString(data) {
        let aliases = [];
        if (data.title) aliases.push(data.title);
        if (data.title_en && data.title_en !== data.title) aliases.push(data.title_en);
        if (data.title_jp) aliases.push(data.title_jp);
        return aliases.join(', ') || 'No aliases available';
    }

    function formatAirDate(data) {
        if (data.start_date) {
            const startYear = new Date(data.start_date).getFullYear();
            if (data.end_date) {
                const endYear = new Date(data.end_date).getFullYear();
                return `${startYear} - ${endYear}`;
            }
            return `${startYear} - Ongoing`;
        }
        if (data.year) {
            return `${data.year}`;
        }
        return 'Unknown';
    }
}

/**
 * Extracts episodes from the given URL
 * @param {string} url The URL to extract episodes from
 * @returns {Promise<string>} A promise that resolves with JSON containing episodes
 */
async function extractEpisodes(url) {
    try {
        // Extract slug from URL
        const slug = url.split('/').pop();
        console.log(`Extracting episodes for: ${slug}`);
        
        const response = await soraFetch(`https://kaa.to/api/show/${slug}/episodes`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/'
            }
        });

        if (!response.ok) {
            throw new Error(`Episodes failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No episodes data received');
        }

        const episodes = data.map(episode => ({
            href: `https://kaa.to/${slug}/episode/${episode.slug}`,
            number: episode.number || episode.episode_number || 1
        }));

        console.log(`Found ${episodes.length} episodes`);
        return JSON.stringify(episodes);

    } catch (error) {
        console.log(`Episodes extraction failed: ${error.message}`);
        // Return basic episode structure as fallback
        const fallbackEpisodes = [];
        for (let i = 1; i <= 12; i++) {
            fallbackEpisodes.push({
                href: `${url}/episode/${i}`,
                number: i
            });
        }
        return JSON.stringify(fallbackEpisodes);
    }
}

/**
 * Extracts the stream URL from the given episode URL
 * @param {string} url The episode URL to extract stream from
 * @returns {Promise<string>} A promise that resolves with JSON containing stream info
 */
async function extractStreamUrl(url) {
    try {
        console.log(`Extracting stream from: ${url}`);
        
        // Parse URL to get show slug and episode slug
        // URL format: https://kaa.to/show-slug/episode/episode-slug
        const urlParts = url.split('/');
        const showSlug = urlParts[3]; // show slug
        const episodeSlug = urlParts[5]; // episode slug
        
        // Get episode details first
        const episodeResponse = await soraFetch(`https://kaa.to/api/show/${showSlug}/episode/${episodeSlug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://kaa.to/'
            }
        });

        if (!episodeResponse.ok) {
            throw new Error(`Episode data failed: ${episodeResponse.status}`);
        }

        const episodeData = await episodeResponse.json();
        console.log(`Episode data received`);

        // Try to find video sources
        if (episodeData.videos && episodeData.videos.length > 0) {
            // Look for the best quality video
            const video = episodeData.videos.find(v => v.quality === '1080p') || 
                         episodeData.videos.find(v => v.quality === '720p') || 
                         episodeData.videos[0];
            
            if (video && video.src) {
                console.log(`Direct video source found: ${video.quality || 'unknown quality'}`);
                return JSON.stringify({ 
                    stream: video.src, 
                    subtitles: null 
                });
            }
        }

        // Try to extract from iframe if direct sources not available
        if (episodeData.iframe_url || episodeData.embed_url) {
            const iframeUrl = episodeData.iframe_url || episodeData.embed_url;
            console.log(`Trying iframe extraction from: ${iframeUrl}`);
            
            // Extract video ID from iframe URL
            const videoId = extractVideoId(iframeUrl);
            if (videoId) {
                const m3u8Url = await extractDirectM3U8Streams(videoId);
                if (m3u8Url) {
                    console.log(`M3U8 stream extracted successfully`);
                    return JSON.stringify({ 
                        stream: m3u8Url, 
                        subtitles: null 
                    });
                }
            }
        }

        throw new Error('No stream sources found');

    } catch (error) {
        console.log(`Stream extraction failed: ${error.message}`);
        return JSON.stringify({ 
            stream: null, 
            subtitles: null 
        });
    }
}

// Helper function to extract video ID from iframe URL
function extractVideoId(iframeUrl) {
    try {
        const match = iframeUrl.match(/id=([^&]+)/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

// Function to extract M3U8 streams using the network data provided
async function extractDirectM3U8Streams(videoId) {
    try {
        const masterUrl = `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`;
        
        const headers = {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        const response = await soraFetch(masterUrl, { headers });
        
        if (!response.ok) {
            throw new Error(`M3U8 request failed: ${response.status}`);
        }

        const masterPlaylist = await response.text();
        
        // Parse M3U8 to find the best quality stream
        const lines = masterPlaylist.split('\n');
        let bestStream = null;
        let bestBandwidth = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXT-X-STREAM-INF:')) {
                const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
                const bandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0;
                
                if (bandwidth > bestBandwidth && i + 1 < lines.length) {
                    const streamLine = lines[i + 1].trim();
                    if (streamLine && !streamLine.startsWith('#')) {
                        bestBandwidth = bandwidth;
                        bestStream = `https://hls.krussdomi.com/manifest/${videoId}/${streamLine}`;
                    }
                }
            }
        }
        
        return bestStream || masterUrl;
        
    } catch (error) {
        console.log(`M3U8 extraction failed: ${error.message}`);
        return null;
    }
}

// Required soraFetch function for Sora compatibility
async function soraFetch(url, options = {}) {
    try {
        // Try fetchv2 first (Sora's preferred method)
        if (typeof fetchv2 !== 'undefined') {
            return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
        }
        
        // Fallback to standard fetch
        if (typeof fetch !== 'undefined') {
            return await fetch(url, options);
        }
        
        throw new Error('No fetch method available');
    } catch(error) {
        console.log(`soraFetch error: ${error.message}`);
        return null;
    }
}
