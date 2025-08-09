// KaaTo Universal Extension v11.4 - STRING FORMAT (CLEAN VERSION)
// Based on the working version that successfully called extractStreamUrl

console.log('🚨🚨🚨 [v11.4 CLEAN] MODULE STARTING TO LOAD 🚨🚨🚨');
console.log('🎯 [v11.4] TIMESTAMP:', new Date().toISOString());
console.log('🔥 [v11.4] CLEAN VERSION - WORKING extractStreamUrl! 🔥');

// =============================================================================
// DEBUG: INTERCEPT ALL POSSIBLE SORA CALLS
// =============================================================================

// Method 2: Alternative names Sora might use
async function getStreamUrl(input) {
    console.log('🎯 [METHOD 2] getStreamUrl called with:', typeof input);
    console.log('📝 Input preview:', input ? input.substring(0, 100) + '...' : 'null');
    return await extractStreamUrl(input);
}

// Method 3: Another possible name
async function fetchStream(input) {
    console.log('🎯 [METHOD 3] fetchStream called with:', typeof input);
    console.log('📝 Input preview:', input ? input.substring(0, 100) + '...' : 'null');
    return await extractStreamUrl(input);
}

// Method 4: Stream URL
async function streamUrl(input) {
    console.log('🎯 [METHOD 4] streamUrl called with:', typeof input);
    console.log('📝 Input preview:', input ? input.substring(0, 100) + '...' : 'null');
    return await extractStreamUrl(input);
}

// Method 5: Get Stream
async function getStream(input) {
    console.log('🎯 [METHOD 5] getStream called with:', typeof input);
    console.log('📝 Input preview:', input ? input.substring(0, 100) + '...' : 'null');
    return await extractStreamUrl(input);
}

console.log('🎯 [DEBUG] ALL INTERCEPT FUNCTIONS LOADED - Ready to catch ANY call!');

// =============================================================================
// MAIN FUNCTIONS - COPIED FROM WORKING PERFECT VERSION
// =============================================================================

// Search - Del PERFECT que funciona EXACTO
async function searchResults(keyword) {
    console.log('🔍 [v11.4] searchResults CALLED with keyword:', keyword);
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
            
            const results = data.result.map(item => ({
                title: item.name || 'Unknown Title',
                image: item.poster || 'https://via.placeholder.com/300x400?text=No+Image',
                href: `https://kaa.to/anime/${item.slug}`
            }));
            
            console.log(`Found ${results.length} search results`);
            return JSON.stringify(results);
        }
    } catch (error) {
        console.log('Search error:', error.message);
    }
    
    return JSON.stringify([]);
}

// Details - Del PERFECT que funciona EXACTO
async function extractDetails(url) {
    console.log('📋 [v11.4] extractDetails CALLED with URL:', url);
    try {
        const slug = url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            const details = [{
                description: data.result?.synopsis || 'No description available',
                aliases: `Genres: ${data.result?.genres?.join(', ') || 'Unknown'}`,
                airdate: `Year: ${data.result?.year || 'Unknown'}`
            }];
            
            console.log('Details extracted successfully');
            return JSON.stringify(details);
        }
    } catch (error) {
        console.log('Details error:', error.message);
    }
    
    return JSON.stringify([{
        description: 'Error loading details',
        aliases: 'Error loading genres',
        airdate: 'Error loading year'
    }]);
}

// Episodes - Del PERFECT que funciona EXACTO
async function extractEpisodes(url) {
    console.log('📺 [v11.4] extractEpisodes CALLED with URL:', url);
    try {
        const slug = url.split('/').pop();
        console.log('🎯 Extracted slug:', slug);
        
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            // Obtener idiomas disponibles
            const availableLanguages = data.result?.avlang || [];
            let selectedLanguage = 'ja-JP'; // Default to Japanese
            
            if (availableLanguages.length > 0) {
                if (availableLanguages.includes('ja-JP')) {
                    selectedLanguage = 'ja-JP';
                } else if (availableLanguages.includes('en-US')) {
                    selectedLanguage = 'en-US';
                } else {
                    selectedLanguage = availableLanguages[0];
                }
            }
            
            console.log('Using language:', selectedLanguage);
            
            // Obtener episodios
            const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=${selectedLanguage}`);
            
            if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
                let episodesData = episodesResponse._data;
                if (typeof episodesData === 'string') {
                    episodesData = JSON.parse(episodesData);
                }
                
                if (episodesData && episodesData.result && episodesData.result.length > 0) {
                    console.log(`Found ${episodesData.result.length} episodes on first page`);
                    
                    // Calcular total de páginas
                    const totalPages = Math.ceil(episodesData.total / 100);
                    console.log(`Found ${totalPages} pages of episodes`);
                    
                    const allEpisodes = [];
                    
                    // Generar todos los episodios basado en el total
                    for (let ep = 1; ep <= episodesData.total; ep++) {
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${ep}-${episodesData.result[0]?.id || 'unknown'}`.replace(/ep-\d+-/, `ep-${ep}-`),
                            number: ep
                        });
                    }
                    
                    console.log(`Generated ${allEpisodes.length} episode links`);
                    return JSON.stringify(allEpisodes);
                }
            }
        }
    } catch (error) {
        console.log('Episodes error:', error.message);
    }
    
    return JSON.stringify([{
        href: url,
        number: 1
    }]);
}

// =============================================================================
// STREAM EXTRACTION - THE CRITICAL FUNCTION
// =============================================================================

async function extractStreamUrl(input) {
    console.log('🚨🚨🚨 [v11.4 UNIVERSAL - STRING FORMAT] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Input received:', typeof input, input && input.length > 500 ? 'HTML_CONTENT' : input);
    console.log('🔥 RETURNING STRING LIKE ANIMEFLV! 🔥');
    
    try {
        let html;
        let episodeUrl;
        
        // DETECT INPUT TYPE
        if (input && (input.includes('<html') || input.includes('<!DOCTYPE') || input.includes('<body'))) {
            // INPUT IS HTML - Sora already fetched it
            console.log('🌐 Input detected as: HTML CONTENT');
            html = input;
            episodeUrl = 'parsed_from_html';
        } else if (input && input.startsWith('http')) {
            // INPUT IS URL - We need to fetch it
            console.log('🌐 Input detected as: EPISODE URL');
            episodeUrl = input;
            
            console.log('📡 Fetching HTML from URL...');
            const response = await fetchv2(episodeUrl, {}, 'GET', null);
            html = typeof response === 'object' ? await response.text() : response;
            console.log('✅ HTML fetched, length:', html.length);
        } else {
            console.log('❌ Invalid input type or null input');
            return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
        }
        
        console.log('🔍 Analyzing HTML for streams...');
        
        // PATTERN 1: Direct M3U8 URLs in HTML
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING M3U8 STREAM (STRING):', m3u8Urls[0]);
            return m3u8Urls[0]; // RETURN STRING DIRECTLY
        }
        
        // PATTERN 2: Video IDs for M3U8 construction
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 FOUND VIDEO IDs:', videoIds);
            const m3u8Url = `https://krussdomi.com/m3u8/${videoIds[0]}.m3u8`;
            console.log('🔨 CONSTRUCTED M3U8 URL:', m3u8Url);
            console.log('🚀 RETURNING CONSTRUCTED STREAM (STRING):', m3u8Url);
            return m3u8Url; // RETURN STRING DIRECTLY
        }
        
        // PATTERN 3: Look for KaaTo-specific patterns
        const kaatoPattern = /video[_-]?id['":\s]*['"]?([a-f0-9]{24})/gi;
        const kaatoMatches = html.match(kaatoPattern);
        
        if (kaatoMatches && kaatoMatches.length > 0) {
            console.log('🎯 FOUND KAATO PATTERNS:', kaatoMatches);
            const videoId = kaatoMatches[0].match(/[a-f0-9]{24}/)[0];
            const m3u8Url = `https://krussdomi.com/m3u8/${videoId}.m3u8`;
            console.log('🔨 CONSTRUCTED FROM KAATO PATTERN:', m3u8Url);
            console.log('🚀 RETURNING KAATO STREAM (STRING):', m3u8Url);
            return m3u8Url; // RETURN STRING DIRECTLY
        }
        
        // PATTERN 4: Look for other video patterns
        const mp4Pattern = /https?:\/\/[^\s"'<>]+\.mp4/gi;
        const mp4Urls = html.match(mp4Pattern);
        
        if (mp4Urls && mp4Urls.length > 0) {
            console.log('🎯 FOUND MP4 URLs:', mp4Urls);
            console.log('🚀 RETURNING MP4 STREAM (STRING):', mp4Urls[0]);
            return mp4Urls[0]; // RETURN STRING DIRECTLY
        }
        
        console.log('❌ NO STREAMS FOUND - Returning demo video (STRING)');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error details:', error.stack);
    }
    
    console.log('🔄 FALLBACK: Returning demo video (STRING)');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // RETURN STRING DIRECTLY
}

console.log('✅ [v11.4 CLEAN] MODULE FULLY LOADED - All functions ready!');
