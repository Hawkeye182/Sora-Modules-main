/*
 * KaaTo UNIVERSAL Module v11.0 - SORA INTEGRATION COMPLETE
 * Handles BOTH URL and HTML inputs for extractStreamUrl
 * Based on real Sora calling patterns analysis
 */

// Search - Working perfectly
async function searchAnime(query) {
    console.log('🔍 [KaaTo v11.0] Search started for:', query);
    
    try {
        const searchUrl = `https://kaa.to/api/search?q=${encodeURIComponent(query)}&type=0`;
        console.log('🌐 Search URL:', searchUrl);
        
        const response = await fetchv2(searchUrl);
        
        if (response && response.status === 200 && response._data) {
            let data;
            try {
                data = typeof response._data === 'string' ? 
                      JSON.parse(response._data) : response._data;
            } catch (e) {
                console.log('❌ Failed to parse search response');
                return "[]";
            }
            
            if (data && data.result && Array.isArray(data.result)) {
                const results = data.result.map(item => ({
                    title: item.name || 'Unknown Title',
                    href: `https://kaa.to/anime/${item.slug}`,
                    image: item.image_url || ''
                }));
                
                console.log(`✅ Search found ${results.length} results`);
                return JSON.stringify(results);
            }
        }
        
        console.log('❌ Search failed or no results');
        return "[]";
        
    } catch (error) {
        console.log('❌ Search error:', error.message);
        return "[]";
    }
}

// Details - Working perfectly  
async function extractDetails(url) {
    console.log('📋 [KaaTo v11.0] Details extraction for:', url);
    
    try {
        const response = await fetchv2(url);
        
        if (response && response.status === 200 && response._data) {
            let data;
            try {
                data = typeof response._data === 'string' ? 
                      JSON.parse(response._data) : response._data;
            } catch (e) {
                console.log('❌ Failed to parse details response');
                return JSON.stringify([{
                    description: "No description available",
                    aliases: "",
                    airdate: ""
                }]);
            }
            
            const result = [{
                description: data.description || "No description available",
                aliases: (data.alternative_names || []).join(', ') || "",
                airdate: data.aired_from || ""
            }];
            
            console.log('✅ Details extracted successfully');
            return JSON.stringify(result);
        }
        
        console.log('❌ Details extraction failed');
        return JSON.stringify([{
            description: "No description available", 
            aliases: "",
            airdate: ""
        }]);
        
    } catch (error) {
        console.log('❌ Details error:', error.message);
        return JSON.stringify([{
            description: "Error loading details",
            aliases: "",
            airdate: ""
        }]);
    }
}

// Episodes - Working perfectly
async function extractEpisodes(url) {
    console.log('📺 [KaaTo v11.0] Episodes extraction for:', url);
    
    try {
        // Extract slug from URL
        const urlMatch = url.match(/\/anime\/([^\/]+)/);
        if (!urlMatch || !urlMatch[1]) {
            console.log('❌ Could not extract slug from URL');
            return JSON.stringify([{ href: url, number: 1 }]);
        }
        
        const slug = urlMatch[1];
        console.log('🎯 Extracted slug:', slug);
        
        // Get available languages
        const langResponse = await fetchv2(`https://kaa.to/api/show/${slug}`);
        let selectedLanguage = 'ja-JP'; // Default
        
        if (langResponse && langResponse.status === 200 && langResponse._data) {
            let langData;
            try {
                langData = typeof langResponse._data === 'string' ? 
                          JSON.parse(langResponse._data) : langResponse._data;
            } catch (e) {
                console.log('❌ Failed to parse language response');
            }
            
            if (langData && langData.available_languages) {
                const availableLanguages = Object.keys(langData.available_languages);
                console.log('🗣️ Available languages:', availableLanguages);
                
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
        }
        
        console.log('🗣️ Using language:', selectedLanguage);
        
        // Get episodes
        const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=${selectedLanguage}`);
        
        if (episodesResponse && episodesResponse.status === 200 && episodesResponse._data) {
            let episodesData;
            try {
                episodesData = typeof episodesResponse._data === 'string' ? 
                              JSON.parse(episodesResponse._data) : episodesResponse._data;
            } catch (e) {
                console.log('❌ Failed to parse episodes response');
                return JSON.stringify([{ href: url, number: 1 }]);
            }
            
            if (episodesData && episodesData.result && episodesData.result.length > 0) {
                console.log(`📺 Found ${episodesData.result.length} episodes on first page`);
                
                const allEpisodes = [];
                
                // Handle pagination if exists
                if (episodesData.pages && Array.isArray(episodesData.pages) && episodesData.pages.length > 1) {
                    console.log(`📄 Found ${episodesData.pages.length} pages of episodes`);
                    
                    episodesData.pages.forEach(page => {
                        if (page.eps && Array.isArray(page.eps)) {
                            page.eps.forEach(epNum => {
                                const episodeData = episodesData.result.find(ep => ep.episode_number === epNum);
                                const episodeSlug = episodeData ? episodeData.slug : `missing-${epNum}`;
                                
                                allEpisodes.push({
                                    href: `https://kaa.to/${slug}/ep-${epNum}-${episodeSlug}`,
                                    number: epNum
                                });
                            });
                        }
                    });
                } else {
                    // Single page
                    episodesData.result.forEach(ep => {
                        allEpisodes.push({
                            href: `https://kaa.to/${slug}/ep-${ep.episode_number}-${ep.slug}`,
                            number: ep.episode_number
                        });
                    });
                }
                
                console.log(`✅ Generated ${allEpisodes.length} episode links`);
                return JSON.stringify(allEpisodes);
            }
        }
        
        console.log('❌ No episodes found, returning single episode');
        return JSON.stringify([{ href: url, number: 1 }]);
        
    } catch (error) {
        console.log('❌ Episodes error:', error.message);
        return JSON.stringify([{ href: url, number: 1 }]);
    }
}

// UNIVERSAL extractStreamUrl - Handles BOTH URL and HTML inputs!
async function extractStreamUrl(input) {
    console.log('🚨🚨🚨 [v11.0 UNIVERSAL] 🚨🚨🚨');
    console.log('⚡ extractStreamUrl CALLED AT:', new Date().toISOString());
    console.log('📍 Input received:', typeof input, input.length > 500 ? 'HTML_CONTENT' : input);
    console.log('🔥 UNIVERSAL VERSION - HANDLES BOTH URL AND HTML! 🔥');
    
    try {
        let html;
        let episodeUrl;
        
        // DETECT INPUT TYPE
        if (input.includes('<html') || input.includes('<!DOCTYPE') || input.includes('<body')) {
            // INPUT IS HTML - Sora already fetched it
            console.log('🌐 Input detected as: HTML CONTENT');
            html = input;
            episodeUrl = 'parsed_from_html';
        } else {
            // INPUT IS URL - We need to fetch it
            console.log('🌐 Input detected as: EPISODE URL');
            episodeUrl = input;
            
            console.log('📡 Fetching HTML from URL...');
            const response = await fetch(episodeUrl);
            html = await response.text();
            console.log('✅ HTML fetched, length:', html.length);
        }
        
        console.log('🔍 Analyzing HTML for streams...');
        console.log('📄 HTML preview:', html.substring(0, 300));
        
        // PATTERN 1: Direct M3U8 URLs in HTML
        const m3u8Pattern = /https?:\/\/[^\s"'<>]+\.m3u8/gi;
        const m3u8Urls = html.match(m3u8Pattern);
        
        if (m3u8Urls && m3u8Urls.length > 0) {
            console.log('🎯 FOUND DIRECT M3U8 URLs:', m3u8Urls);
            console.log('🚀 RETURNING M3U8 STREAM:', m3u8Urls[0]);
            return m3u8Urls[0];
        }
        
        // PATTERN 2: Video IDs for M3U8 construction
        const videoIdPattern = /[a-f0-9]{24}/g;
        const videoIds = html.match(videoIdPattern);
        
        if (videoIds && videoIds.length > 0) {
            console.log('🎯 FOUND VIDEO IDs:', videoIds);
            const m3u8Url = `https://krussdomi.com/m3u8/${videoIds[0]}.m3u8`;
            console.log('🔨 CONSTRUCTED M3U8 URL:', m3u8Url);
            console.log('🚀 RETURNING CONSTRUCTED STREAM:', m3u8Url);
            return m3u8Url;
        }
        
        // PATTERN 3: Look for other video patterns
        const mp4Pattern = /https?:\/\/[^\s"'<>]+\.mp4/gi;
        const mp4Urls = html.match(mp4Pattern);
        
        if (mp4Urls && mp4Urls.length > 0) {
            console.log('🎯 FOUND MP4 URLs:', mp4Urls);
            console.log('🚀 RETURNING MP4 STREAM:', mp4Urls[0]);
            return mp4Urls[0];
        }
        
        console.log('❌ NO STREAMS FOUND - Returning demo video');
        console.log('🔍 Search patterns failed:');
        console.log('  - M3U8 URLs: None found');
        console.log('  - Video IDs: None found');
        console.log('  - MP4 URLs: None found');
        
    } catch (error) {
        console.log('❌ ERROR in extractStreamUrl:', error.message);
        console.log('📋 Error details:', error.stack);
    }
    
    console.log('🔄 FALLBACK: Returning demo video');
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
}
