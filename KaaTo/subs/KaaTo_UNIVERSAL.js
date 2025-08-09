// KaaTo Universal v11.7 - LOG DISPLAY IN SEARCH
// Global variable to store logs for display
let debugLogs = [];

function addDebugLog(message) {
    const timestamp = new Date().toISOString().substr(11, 8);
    const logEntry = `[${timestamp}] ${message}`;
    debugLogs.push(logEntry);
    console.log(logEntry);
    
    // Keep only last 10 logs to avoid memory issues
    if (debugLogs.length > 10) {
        debugLogs.shift();
    }
}

// Intercept functions to debug which method Sora actually calls
addDebugLog('🚨🚨🚨 [UNIVERSAL DEBUG] MODULE LOADED');
addDebugLog('🎯 [DEBUG] ALL INTERCEPT FUNCTIONS LOADED - Ready to catch ANY call!');

async function getStreamUrl(input) {
    addDebugLog('📺 [INTERCEPT-getStreamUrl] Método detectado: getStreamUrl');
    addDebugLog(`🎯 Input recibido: ${typeof input} ${input}`);
    return await extractStreamUrl(input);
}

async function fetchStream(input) {
    addDebugLog('📺 [INTERCEPT-fetchStream] Método detectado: fetchStream');
    addDebugLog(`🎯 Input recibido: ${typeof input} ${input}`);
    return await extractStreamUrl(input);
}

async function streamUrl(input) {
    addDebugLog('📺 [INTERCEPT-streamUrl] Método detectado: streamUrl');
    addDebugLog(`🎯 Input recibido: ${typeof input} ${input}`);
    return await extractStreamUrl(input);
}

async function getStream(input) {
    addDebugLog('📺 [INTERCEPT-getStream] Método detectado: getStream');
    addDebugLog(`🎯 Input recibido: ${typeof input} ${input}`);
    return await extractStreamUrl(input);
}

// Search - Working from PERFECT + LOG DISPLAY
async function searchResults(keyword) {
    addDebugLog(`🔍 [v11.7] searchResults CALLED with keyword: ${keyword}`);
    
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            if (Array.isArray(data)) {
                const results = data.map(item => ({
                    title: item.title || 'Unknown Title',
                    image: item.poster && item.poster.hq ? 
                           `https://kaa.to/image/poster/${item.poster.hq}.webp` : '',
                    href: `https://kaa.to/anime/${item.slug}`
                }));
                
                // ADD DEBUG LOG DISPLAY ITEM
                if (debugLogs.length > 0) {
                    results.unshift({
                        title: "🔍 DEBUG LOGS - KaaTo Universal v11.7",
                        image: "https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/ofchaos.jpg",
                        href: `DEBUG_LOGS: ${debugLogs.join(' | ')}`
                    });
                }
                
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        addDebugLog(`❌ Search error: ${error.message}`);
        return JSON.stringify([]);
    }
}

// Details - Working from PERFECT
async function extractDetails(url) {
    console.log('📄 [v11.6] extractDetails CALLED with URL:', url);
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            if (details && details.synopsis) {
                return JSON.stringify([{
                    description: details.synopsis,
                    aliases: details.title_en || details.title || '',
                    airdate: details.aired || details.year || 'Unknown'
                }]);
            }
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

// Episodes - Working from PERFECT
async function extractEpisodes(url) {
    console.log('📺 [v11.6] extractEpisodes CALLED with URL:', url);
    try {
        const slug = url.split('/').pop();
        console.log('🎯 Extracted slug:', slug);
        
        // Get language info first
        const languageResponse = await fetchv2(`https://kaa.to/api/show/${slug}/language`);
        
        if (!languageResponse || languageResponse.status !== 200) {
            console.log('Language API failed');
            return JSON.stringify([{href: url, number: 1}]);
        }
        
        let languageData;
        try {
            languageData = typeof languageResponse._data === 'string' ? 
                          JSON.parse(languageResponse._data) : languageResponse._data;
        } catch (e) {
            console.log('Failed to parse language response');
            return JSON.stringify([{href: url, number: 1}]);
        }
        
        // Use Japanese with subtitles as preference
        let selectedLanguage = 'ja-JP';
        if (languageData && languageData.result && Array.isArray(languageData.result)) {
            const availableLanguages = languageData.result;
            
            const jaLang = availableLanguages.find(lang => lang.includes('ja-JP'));
            const enLang = availableLanguages.find(lang => lang.includes('en-US'));
            
            if (jaLang) {
                selectedLanguage = 'ja-JP';
            } else if (enLang) {
                selectedLanguage = 'en-US';
            } else if (availableLanguages.length > 0) {
                selectedLanguage = availableLanguages[0];
            }
        }
        
        console.log('Using language:', selectedLanguage);
        
        // Get episodes with selected language
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=${selectedLanguage}`);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData;
            try {
                episodesData = typeof episodesResponse._data === 'string' ? 
                              JSON.parse(episodesResponse._data) : episodesResponse._data;
            } catch (e) {
                console.log('Failed to parse episodes response');
                return JSON.stringify([{href: url, number: 1}]);
            }
            
            if (episodesData && episodesData.result && episodesData.result.length > 0) {
                console.log(`Found ${episodesData.result.length} episodes on first page`);
                
                const allEpisodes = [];
                
                // Strategy 1: Use page info to get all episode numbers
                if (episodesData.pages && Array.isArray(episodesData.pages) && episodesData.pages.length > 1) {
                    console.log(`Found ${episodesData.pages.length} pages of episodes`);
                    
                    // Generate all episode numbers from all pages
                    episodesData.pages.forEach(page => {
                        if (page.eps && Array.isArray(page.eps)) {
                            page.eps.forEach(epNum => {
                                // Find corresponding slug in current results
                                const episodeData = episodesData.result.find(ep => ep.episode_number === epNum);
                                const episodeSlug = episodeData ? episodeData.slug : `missing-${epNum}`;
                                
                                // CORRECT FORMAT: https://kaa.to/{show_slug}/ep-{episode_number}-{episode_slug}
                                allEpisodes.push({
                                    href: `https://kaa.to/${slug}/ep-${epNum}-${episodeSlug}`,
                                    number: epNum
                                });
                            });
                        }
                    });
                    
                    console.log(`Generated ${allEpisodes.length} episode links`);
                } else {
                    // Strategy 2: Use only first page episodes
                    episodesData.result.forEach(episode => {
                        // CORRECT FORMAT: https://kaa.to/{show_slug}/ep-{episode_number}-{episode_slug}
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${episode.episode_number}-${episode.slug}`,
                            number: episode.episode_number
                        });
                    });
                }
                
                // Sort by episode number
                allEpisodes.sort((a, b) => a.number - b.number);
                
                console.log(`Returning ${allEpisodes.length} episodes for ${slug}`);
                return JSON.stringify(allEpisodes);
            }
        }
        
        // Fallback
        return JSON.stringify([{href: url, number: 1}]);
        
    } catch (error) {
        console.log('Episodes error: ' + error.message);
        return JSON.stringify([{href: url, number: 1}]);
    }
}

// Stream - MAIN FUNCTION with visible debug logs
async function extractStreamUrl(episodeUrl) {
    addDebugLog('🚨🚨🚨 [v11.7 VISIBLE LOGS] extractStreamUrl CALLED!');
    addDebugLog(`📍 Episode URL: ${episodeUrl}`);
    addDebugLog(`📍 Input type: ${typeof episodeUrl}`);
    addDebugLog(`📍 Input null? ${episodeUrl === null}`);
    addDebugLog(`📍 Input undefined? ${episodeUrl === undefined}`);
    addDebugLog(`📍 Input empty? ${episodeUrl === ''}`);
    
    try {
        // Handle null/undefined input
        if (!episodeUrl || episodeUrl === null || episodeUrl === undefined || episodeUrl === '') {
            addDebugLog('❌ Input is null/empty - using fallback');
            episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-23d99b'; // Default for testing
            addDebugLog(`🔧 Using fallback URL: ${episodeUrl}`);
        }
        
        addDebugLog(`🌐 Making fetch request to: ${episodeUrl.substring(0, 50)}...`);
        
        // Simple fetch like AnimeFLV - NO complex headers
        const response = await fetch(episodeUrl);
        const html = await response.text();
        
        addDebugLog(`✅ HTML received, length: ${html.length}`);
        addDebugLog(`🔍 HTML preview: ${html.substring(0, 100)}...`);
        
        // Simple pattern search for m3u8 URLs
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            addDebugLog(`🎯 Found M3U8 URLs: ${m3u8Urls.length} found`);
            addDebugLog(`🚀 RETURNING STREAM: ${m3u8Urls[0]}`);
            return m3u8Urls[0]; // Return first one
        }
        
        // Look for video IDs and construct m3u8 URLs
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            addDebugLog(`🎯 Found video IDs: ${videoIds.length} found`);
            const m3u8Url = `https://krussdomi.com/m3u8/${videoIds[0]}.m3u8`;
            addDebugLog(`🔨 Generated M3U8 URL: ${m3u8Url}`);
            addDebugLog(`🚀 RETURNING CONSTRUCTED STREAM: ${m3u8Url}`);
            return m3u8Url;
        }
        
        // Look for any video URLs
        const videoPattern = /https?:\/\/[^\s"'<>]+\.(mp4|avi|mkv)/gi;
        const videoUrls = html.match(videoPattern);
        
        if (videoUrls && videoUrls.length > 0) {
            addDebugLog(`🎯 Found video URLs: ${videoUrls.length} found`);
            addDebugLog(`🚀 RETURNING VIDEO STREAM: ${videoUrls[0]}`);
            return videoUrls[0];
        }
        
        addDebugLog('❌ No streams found in HTML');
        addDebugLog('🔍 Search patterns all failed');
        
    } catch (error) {
        addDebugLog(`❌ Error in extractStreamUrl: ${error.message}`);
    }
    
    addDebugLog('🔄 Returning fallback demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
