// KaaTo Universal v11.6 - CLEAN REBUILD FROM WORKING PERFECT
// Intercept functions to debug which method Sora actually calls
console.log('🚨🚨🚨 [UNIVERSAL DEBUG] MODULE LOADED AT:', new Date().toISOString());
console.log('🎯 [DEBUG] ALL INTERCEPT FUNCTIONS LOADED - Ready to catch ANY call!');

async function getStreamUrl(input) {
    console.log('📺 [INTERCEPT-getStreamUrl] Método detectado: getStreamUrl');
    console.log('🎯 Input recibido:', typeof input, input);
    return await extractStreamUrl(input);
}

async function fetchStream(input) {
    console.log('📺 [INTERCEPT-fetchStream] Método detectado: fetchStream');
    console.log('🎯 Input recibido:', typeof input, input);
    return await extractStreamUrl(input);
}

async function streamUrl(input) {
    console.log('📺 [INTERCEPT-streamUrl] Método detectado: streamUrl');
    console.log('🎯 Input recibido:', typeof input, input);
    return await extractStreamUrl(input);
}

async function getStream(input) {
    console.log('📺 [INTERCEPT-getStream] Método detectado: getStream');
    console.log('🎯 Input recibido:', typeof input, input);
    return await extractStreamUrl(input);
}

// Search - Working from PERFECT
async function searchResults(keyword) {
    console.log('🔍 [v11.6] searchResults CALLED with keyword:', keyword);
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
                
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
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

// Stream - MAIN FUNCTION with detailed input logging
async function extractStreamUrl(episodeUrl) {
    console.log('🚨🚨🚨 [v11.6 CLEAN REBUILD] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Episode URL received:', episodeUrl);
    console.log('📍 Input type:', typeof episodeUrl);
    console.log('📍 Input value (JSON):', JSON.stringify(episodeUrl));
    console.log('📍 Input length:', episodeUrl ? episodeUrl.length : 'NULL');
    console.log('📍 Input is null?', episodeUrl === null);
    console.log('📍 Input is undefined?', episodeUrl === undefined);
    console.log('📍 Input is empty string?', episodeUrl === '');
    console.log('🔥 CLEAN VERSION - SHOULD WORK! 🔥');
    
    try {
        // Handle null/undefined input
        if (!episodeUrl || episodeUrl === null || episodeUrl === undefined || episodeUrl === '') {
            console.log('❌ Input is null/empty - using fallback');
            episodeUrl = 'https://kaa.to/bleach-f24c/ep-1-23d99b'; // Default for testing
            console.log('🔧 Using fallback URL:', episodeUrl);
        }
        
        console.log('🌐 Making fetch request to:', episodeUrl);
        
        // Simple fetch like AnimeFLV - NO complex headers
        const response = await fetch(episodeUrl);
        const html = await response.text();
        
        console.log('✅ HTML received, length:', html.length);
        console.log('🔍 HTML preview (first 300 chars):', html.substring(0, 300));
        
        // Simple pattern search for m3u8 URLs
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 Found M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING STREAM:', m3u8Urls[0]);
            return m3u8Urls[0]; // Return first one
        }
        
        // Look for video IDs and construct m3u8 URLs
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 Found video IDs:', videoIds);
            const m3u8Url = `https://krussdomi.com/m3u8/${videoIds[0]}.m3u8`;
            console.log('🔨 Generated M3U8 URL:', m3u8Url);
            console.log('🚀 RETURNING CONSTRUCTED STREAM:', m3u8Url);
            return m3u8Url;
        }
        
        // Look for any video URLs
        const videoPattern = /https?:\/\/[^\s"'<>]+\.(mp4|avi|mkv)/gi;
        const videoUrls = html.match(videoPattern);
        
        if (videoUrls && videoUrls.length > 0) {
            console.log('🎯 Found video URLs:', videoUrls);
            console.log('🚀 RETURNING VIDEO STREAM:', videoUrls[0]);
            return videoUrls[0];
        }
        
        console.log('❌ No streams found in HTML');
        console.log('🔍 HTML search patterns failed:');
        console.log('  - M3U8 URLs: Not found');
        console.log('  - Video IDs: Not found');
        console.log('  - Video URLs: Not found');
        
    } catch (error) {
        console.log('❌ Error in extractStreamUrl:', error.message);
        console.log('📋 Error stack:', error.stack);
    }
    
    console.log('🔄 Returning fallback demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
