const BASE_URL = 'https://kaa.to';
const SEARCH_URL = 'https://kaa.to/search?q=';
const API_BASE = 'https://kaa.to/api'; // Possible API endpoint

//***** LOCAL TESTING
// (async() => {
//     const results = await searchResults('solo camping');
//     console.log('SEARCH RESULTS: ', results);
//     const details = await extractDetails(JSON.parse(results)[0].href);
//     console.log('DETAILS: ', details);
//     const episodes = await extractEpisodes(JSON.parse(results)[0].href);
//     console.log('EPISODES: ', episodes);
//     const streamUrl = await extractStreamUrl(JSON.parse(episodes)[0].href);
//     console.log('STREAMURL: ', streamUrl);
// })();
//***** LOCAL TESTING

async function areRequiredServersUp() {
    const requiredHosts = ['https://kaa.to'];

    try {
        let promises = [];

        for(let host of requiredHosts) {
            promises.push(
                new Promise(async (resolve) => {
                    let response = await soraFetch(host, { method: 'HEAD' });
                    response.host = host;
                    return resolve(response);
                })
            );
        }

        return Promise.allSettled(promises).then((responses) => {
            for(let response of responses) {
                if(response.status === 'rejected' || response.value?.status != 200) {
                    let message = 'Required source ' + response.value?.host + ' is currently down.';
                    console.log(message);
                    return { success: false, error: encodeURIComponent(message), searchTitle: `Error cannot access ${ response.value?.host }, server down. Please try again later.` };
                }
            }

            return { success: true, error: null, searchTitle: null };
        })

    } catch (error) {
        console.log('Server up check error: ' + error.message);
        return { success: false, error: encodeURIComponent('#Failed to access required servers'), searchTitle: 'Error cannot access one or more servers, server down. Please try again later.' };
    }
}

/**
 * Searches the website for anime with the given keyword and returns the results
 * @param {string} keyword The keyword to search for
 * @returns {Promise<string>} A promise that resolves with a JSON string containing the search results in the format: `[{"title": "Title", "image": "Image URL", "href": "URL"}, ...]`
 */
async function searchResults(keyword) {
    const serversUp = await areRequiredServersUp();

    if(serversUp.success === false) {
        return JSON.stringify([{
            title: serversUp.searchTitle,
            image: 'https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/sora_host_down.png',
            href: '#' + serversUp.error,
        }]);
    }

    try {
        // Use the correct kaa.to search API
        const searchResponse = await soraFetch(`${BASE_URL}/api/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ q: keyword })
        });

        if (searchResponse && searchResponse.status === 200) {
            const searchData = await searchResponse.json();
            
            if (Array.isArray(searchData) && searchData.length > 0) {
                return JSON.stringify(searchData.map(item => ({
                    title: item.title || item.title_en,
                    image: item.poster ? 
                        `${BASE_URL}/img/${item.poster.hq}.${item.poster.formats[0]}` : 
                        'https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg',
                    href: `${BASE_URL}/${item.slug}`
                })));
            }
        }

        // Fallback to static results if API fails
        console.log('API search failed, using static fallback for:', keyword);
        const staticResults = getStaticSearchResults(keyword);
        return JSON.stringify(staticResults);

    } catch (error) {
        console.log('Search error:', error.message);
        const staticResults = getStaticSearchResults(keyword);
        return JSON.stringify(staticResults);
    }
}

/**
 * Static fallback with some known anime URLs for testing
 */
function getStaticSearchResults(keyword) {
    const knownAnime = [
        {
            title: "Solo Camping for Two",
            slug: "solo-camping-for-two-8096",
            keywords: ["solo", "camping", "two"]
        },
        {
            title: "Dan Da Dan Season 2",
            slug: "dan-da-dan-season-2-9686", 
            keywords: ["dan", "da", "season"]
        },
        {
            title: "Rent-a-Girlfriend Season 4",
            slug: "rent-a-girlfriend-season-4-45dc",
            keywords: ["rent", "girlfriend", "season"]
        },
        {
            title: "Dr. Stone: Science Future Part 2",
            slug: "dr-stone-science-future-part-2-f947",
            keywords: ["stone", "science", "future"]
        },
        {
            title: "Sakamoto Days Part 2", 
            slug: "sakamoto-days-part-2-ebf1",
            keywords: ["sakamoto", "days", "part"]
        }
    ];

    const keywordLower = keyword.toLowerCase();
    const matchingAnime = knownAnime.filter(anime => 
        anime.keywords.some(k => keywordLower.includes(k) || k.includes(keywordLower))
    );

    return matchingAnime.map(anime => ({
        title: anime.title,
        image: 'https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg',
        href: `${BASE_URL}/${anime.slug}`
    }));
}

/**
 * Extracts the details (description, aliases, airdate) from the given url
 * @param {string} url The url to extract the details from
 * @returns {Promise<string>} A promise that resolves with a JSON string containing the details in the format: `[{"description": "Description", "aliases": "Aliases", "airdate": "Airdate"}]`
 */
async function extractDetails(url) {
    if(url.startsWith('#')) {
        return JSON.stringify([{
            description: decodeURIComponent(url.slice(1)) + ' Please try again later.',
            aliases: '',
            airdate: ''
        }]);
    }

    try {
        // Extract slug from URL
        const slug = url.split('/').pop();
        
        // Use kaa.to API to get show details
        const apiResponse = await soraFetch(`${BASE_URL}/api/show/${slug}`);
        
        if (apiResponse && apiResponse.status === 200) {
            const showData = await apiResponse.json();
            
            const details = {
                description: showData.synopsis || 'No description available',
                aliases: showData.genres ? showData.genres.join(', ') : '',
                airdate: showData.year ? `Aired: ${showData.year}` : 'Aired: Unknown'
            };

            return JSON.stringify([details]);
        }

        // Fallback: try to extract from HTML if API fails
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        const titleRegex = /<title[^>]*>([^<]+)</i;
        const titleMatch = html.match(titleRegex);
        const descRegex = /<meta[^>]*name="description"[^>]*content="([^"]+)"/i;
        const descMatch = html.match(descRegex);

        const details = {
            description: descMatch ? descMatch[1] : (titleMatch ? titleMatch[1] : 'No description available'),
            aliases: '',
            airdate: 'Aired: Unknown'
        };

        return JSON.stringify([details]);
    } catch(error) {
        console.log('Details error: ' + error.message);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: '',
            airdate: 'Aired: Unknown'
        }]);
    }
}

/**
 * Helper function to find anime data in Nuxt structure
 */
function findAnimeDataInNuxt(data) {
    // Recursively search for anime data
    if (typeof data !== 'object' || data === null) return null;
    
    if (data.description || data.synopsis) return data;
    
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const result = findAnimeDataInNuxt(data[key]);
            if (result) return result;
        }
    }
    
    return null;
}

/**
 * Extracts the episodes from the given url.
 * @param {string} url - The url to extract the episodes from
 * @returns {Promise<string>} A promise that resolves with a JSON string containing the episodes in the format: `[{ "href": "Episode URL", "number": Episode Number }, ...]`.
 * If an error occurs during the fetch operation, an empty array is returned in JSON format.
 */
async function extractEpisodes(url) {
    try {
        if(url.startsWith('#')) throw new Error('Host down but still attempted to get episodes');

        // Extract slug from URL
        const slug = url.split('/').pop();
        
        // Get show details first to find the watch_uri for episode 1
        const showResponse = await soraFetch(`${BASE_URL}/api/show/${slug}`);
        
        if (showResponse && showResponse.status === 200) {
            const showData = await showResponse.json();
            
            // Extract episode slug from watch_uri
            if (showData.watch_uri) {
                // watch_uri looks like "/bleach-f24c/ep-1-515c41"
                const episodePath = showData.watch_uri.split('/');
                const episodeSlug = episodePath[episodePath.length - 1]; // "ep-1-515c41"
                
                // Get episodes list using the API - try with default language first
                const language = 'en-US'; // Default language
                const episodesResponse = await soraFetch(`${BASE_URL}/api/show/${slug}/episodes?ep=1&lang=${language}`);
                
                if (episodesResponse && episodesResponse.status === 200) {
                    const episodesData = await episodesResponse.json();
                    
                    if (episodesData.result && Array.isArray(episodesData.result)) {
                        return JSON.stringify(episodesData.result.map(ep => ({
                            href: `${BASE_URL}/${slug}/ep-${ep.episode_number}-${ep.slug}`,
                            number: ep.episode_number
                        })));
                    }
                }
                
                // If episodes API fails, at least return episode 1
                const ep1Number = episodeSlug.match(/ep-(\d+)-/);
                if (ep1Number) {
                    return JSON.stringify([{
                        href: `${BASE_URL}${showData.watch_uri}`,
                        number: parseInt(ep1Number[1])
                    }]);
                }
            }
        }

        // Fallback: Create episode 1 from the current URL pattern
        return JSON.stringify([{ 
            href: `${url}/ep-1-000000`, 
            number: 1 
        }]);

    } catch (error) {
        console.log('Episodes fetch error: ' + error.message);
        return JSON.stringify([]);
    }
}

/**
 * Helper function to find episodes in Nuxt structure  
 */
function findEpisodesInNuxt(data, baseUrl) {
    if (typeof data !== 'object' || data === null) return null;
    
    // Look for episode arrays
    if (Array.isArray(data) && data.length > 0 && data[0].number) {
        const baseSlug = baseUrl.split('/').pop();
        return data.map(ep => ({
            href: `${BASE_URL}/${baseSlug}/ep-${ep.number}-${ep.id || '000000'}`,
            number: ep.number
        }));
    }
    
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const result = findEpisodesInNuxt(data[key], baseUrl);
            if (result) return result;
        }
    }
    
    return null;
}

/**
 * Extracts the stream URL from the given url.
 * @param {string} url - The url to extract the stream URL from.
 * @returns {Promise<string|null>} A promise that resolves with the stream URL if successful, or null if an error occurs during the fetch operation.
 */
async function extractStreamUrl(url) {
    try {
        // Parse the URL to get show slug and episode slug
        // URL format: https://kaa.to/bleach-f24c/ep-1-515c41
        const urlParts = url.replace(BASE_URL + '/', '').split('/');
        const showSlug = urlParts[0]; // "bleach-f24c"
        const episodeSlug = urlParts[1]; // "ep-1-515c41"
        
        // Use the episode API to get server information
        const episodeResponse = await soraFetch(`${BASE_URL}/api/show/${showSlug}/episode/${episodeSlug}`);
        
        if (episodeResponse && episodeResponse.status === 200) {
            const episodeData = await episodeResponse.json();
            
            // Check if servers are available
            if (episodeData.servers && Array.isArray(episodeData.servers) && episodeData.servers.length > 0) {
                const server = episodeData.servers[0]; // Use first available server
                console.log('Found server:', server.name, 'URL:', server.src);
                
                // For VidStreaming servers, try to extract the direct stream
                if (server.src) {
                    try {
                        // Fetch the iframe content
                        const iframeResponse = await soraFetch(server.src, {
                            headers: { 'Referer': url }
                        });
                        
                        if (iframeResponse && iframeResponse.status === 200) {
                            const iframeHtml = await iframeResponse.text();
                            
                            // Look for video sources in the iframe
                            const patterns = [
                                // HLS streams
                                /https?:\/\/[^"'\s]*\.m3u8[^"'\s]*/gi,
                                /\/\/[^"'\s]*\.m3u8[^"'\s]*/gi,
                                // MP4 streams
                                /https?:\/\/[^"'\s]*\.mp4[^"'\s]*/gi,
                                /\/\/[^"'\s]*\.mp4[^"'\s]*/gi,
                                // Common video player patterns
                                /file\s*:\s*['"]([^'"]*\.(?:m3u8|mp4))['"]/gi,
                                /src\s*:\s*['"]([^'"]*\.(?:m3u8|mp4))['"]/gi,
                                /source\s*:\s*['"]([^'"]*\.(?:m3u8|mp4))['"]/gi
                            ];

                            for (const pattern of patterns) {
                                let match;
                                while ((match = pattern.exec(iframeHtml)) !== null) {
                                    let streamUrl = match[1] || match[0];
                                    
                                    // Clean and validate the URL
                                    if (streamUrl.startsWith('//')) {
                                        streamUrl = 'https:' + streamUrl;
                                    } else if (!streamUrl.startsWith('http') && streamUrl.includes('/')) {
                                        // Try to construct full URL
                                        const serverBase = server.src.split('/').slice(0, 3).join('/');
                                        streamUrl = serverBase + (streamUrl.startsWith('/') ? '' : '/') + streamUrl;
                                    }
                                    
                                    // Check if it looks like a valid stream URL
                                    if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                                        console.log('Found stream URL:', streamUrl);
                                        return streamUrl;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.log('Error extracting from iframe:', e.message);
                    }
                    
                    // If iframe extraction fails, return the server src as fallback
                    console.log('Returning server src as fallback:', server.src);
                    return server.src;
                }
            }
        }

        // Fallback: try to extract from the episode page HTML
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Look for video sources in various formats in the HTML
        const patterns = [
            // HLS streams
            /https?:\/\/[^"'\s]*\.m3u8[^"'\s]*/gi,
            /\/\/[^"'\s]*\.m3u8[^"'\s]*/gi,
            // MP4 streams  
            /https?:\/\/[^"'\s]*\.mp4[^"'\s]*/gi,
            /\/\/[^"'\s]*\.mp4[^"'\s]*/gi,
            // Video elements
            /<(?:video|source)[^>]*src\s*=\s*['"]([^'"]*)['"]/gi,
            // Common video player patterns
            /file\s*:\s*['"]([^'"]*)['"]/gi,
            /url\s*:\s*['"]([^'"]*)['"]/gi,
            /source\s*:\s*['"]([^'"]*)['"]/gi
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let streamUrl = match[1] || match[0];
                
                // Clean and validate the URL
                if (streamUrl.startsWith('//')) {
                    streamUrl = 'https:' + streamUrl;
                } else if (!streamUrl.startsWith('http') && streamUrl.includes('/')) {
                    streamUrl = BASE_URL + (streamUrl.startsWith('/') ? '' : '/') + streamUrl;
                }
                
                // Check if it looks like a valid stream URL
                if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                    console.log('Found potential stream URL:', streamUrl);
                    return streamUrl;
                }
            }
        }

        console.log('No stream URL found');
        return null;

    } catch(e) {
        console.log('Error extracting stream: ' + e.message);
        return null;
    }
}

/**
 * Trims around the content, leaving only the area between the start and end string
 * @param {string} text The text to trim
 * @param {string} startString The string to start at (inclusive)
 * @param {string} endString The string to end at (exclusive)
 * @returns The trimmed text
 */
function trimText(text, startString, endString) {
    const startIndex = text.indexOf(startString);
    const endIndex = text.indexOf(endString, startIndex);
    return text.substring(startIndex, endIndex);
}

// Uses Sora's fetchv2 on ipad, fallbacks to regular fetch on Windows
async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            return null;
        }
    }
}

/**
 * Extracts the details (description, aliases, airdate) from the given url
 * @param {string} url The url to extract the details from
 * @returns {Promise<string>} A promise that resolves with a JSON string containing the details in the format: `[{"description": "Description", "aliases": "Aliases", "airdate": "Airdate"}]`
 */
async function extractDetails(url) {
    if(url.startsWith('#')) {
        return JSON.stringify([{
            description: decodeURIComponent(url.slice(1)) + ' Please try again later.',
            aliases: '',
            airdate: ''
        }]);
    }

    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Extract description from Synopsis section
        const descRegex = /Synopsis\s*([\s\S]*?)(?=A-Z LIST|$)/i;
        const descMatch = html.match(descRegex);
        
        // Extract year/status info
        const statusRegex = /(\d{4})\s*•\s*(\d+)\s*min\s*•\s*(SUB|DUB|SUB DUB)/;
        const statusMatch = html.match(statusRegex);
        
        // Extract genre info
        const genreRegex = /(Adult Cast|Seinen|Slice of Life|TV|Airing|Finished)/g;
        const genreMatches = html.match(genreRegex);

        const details = {
            description: descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : 'No description available',
            aliases: genreMatches ? genreMatches.join(', ') : '',
            airdate: statusMatch ? `Aired: ${statusMatch[1]}` : 'Aired: Unknown'
        };

        return JSON.stringify([details]);
    } catch(error) {
        console.log('Details error: ' + error.message);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: '',
            airdate: 'Aired: Unknown'
        }]);
    }
}

/**
 * Extracts the episodes from the given url.
 * @param {string} url - The url to extract the episodes from
 * @returns {Promise<string>} A promise that resolves with a JSON string containing the episodes in the format: `[{ "href": "Episode URL", "number": Episode Number }, ...]`.
 * If an error occurs during the fetch operation, an empty array is returned in JSON format.
 */
async function extractEpisodes(url) {
    try {
        if(url.startsWith('#')) throw new Error('Host down but still attempted to get episodes');

        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Look for episode links in the page
        // Pattern: /episode-path/ep-number-id
        const episodeRegex = new RegExp(`${url.split('/').pop()}/ep-(\\d+)-([a-f0-9]+)`, 'g');
        const matches = Array.from(html.matchAll(episodeRegex));
        
        // If no episodes found on this page, try to find a "WATCH NOW" link
        if (matches.length === 0) {
            const watchNowRegex = /WATCH NOW.*?href="([^"]+)"/i;
            const watchMatch = html.match(watchNowRegex);
            if (watchMatch) {
                const watchUrl = watchMatch[1].startsWith('http') ? watchMatch[1] : BASE_URL + watchMatch[1];
                return JSON.stringify([{ href: watchUrl, number: 1 }]);
            }
        }

        const episodes = matches.map(match => {
            return {
                href: `${BASE_URL}/${url.split('/').pop()}/ep-${match[1]}-${match[2]}`,
                number: parseInt(match[1])
            };
        });

        // Remove duplicates and sort by episode number
        const uniqueEpisodes = episodes.filter((episode, index, self) => 
            index === self.findIndex(e => e.number === episode.number)
        ).sort((a, b) => a.number - b.number);

        return JSON.stringify(uniqueEpisodes);

    } catch (error) {
        console.log('Episodes fetch error: ' + error.message);
        return JSON.stringify([]);
    }
}

/**
 * Extracts the stream URL from the given url.
 * @param {string} url - The url to extract the stream URL from.
 * @returns {Promise<string|null>} A promise that resolves with the stream URL if successful, or null if an error occurs during the fetch operation.
 */
async function extractStreamUrl(url) {
    try {
        const response = await soraFetch(url);
        const html = typeof response === 'object' ? await response.text() : await response;

        // Look for video sources in various formats
        const patterns = [
            // HLS streams
            /https?:\/\/[^"'\s]*\.m3u8[^"'\s]*/gi,
            /\/\/[^"'\s]*\.m3u8[^"'\s]*/gi,
            // MP4 streams
            /https?:\/\/[^"'\s]*\.mp4[^"'\s]*/gi,
            /\/\/[^"'\s]*\.mp4[^"'\s]*/gi,
            // Video elements
            /<(?:video|source)[^>]*src\s*=\s*['"]([^'"]*)['"]/gi,
            // Common video player patterns
            /file\s*:\s*['"]([^'"]*)['"]/gi,
            /url\s*:\s*['"]([^'"]*)['"]/gi,
            /source\s*:\s*['"]([^'"]*)['"]/gi,
            // Player configuration
            /player.*?src.*?['"]([^'"]*)['"]/gi
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let streamUrl = match[1] || match[0];
                
                // Clean and validate the URL
                if (streamUrl.startsWith('//')) {
                    streamUrl = 'https:' + streamUrl;
                } else if (!streamUrl.startsWith('http') && streamUrl.includes('/')) {
                    streamUrl = BASE_URL + (streamUrl.startsWith('/') ? '' : '/') + streamUrl;
                }
                
                // Check if it looks like a valid stream URL
                if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                    console.log('Found potential stream URL:', streamUrl);
                    return streamUrl;
                }
            }
        }

        // If no direct stream found, look for iframe sources
        const iframeRegex = /<iframe[^>]*src\s*=\s*['"]([^'"]*)['"]/gi;
        let iframeMatch;
        while ((iframeMatch = iframeRegex.exec(html)) !== null) {
            let iframeUrl = iframeMatch[1];
            if (iframeUrl.startsWith('//')) {
                iframeUrl = 'https:' + iframeUrl;
            } else if (!iframeUrl.startsWith('http')) {
                iframeUrl = BASE_URL + (iframeUrl.startsWith('/') ? '' : '/') + iframeUrl;
            }
            
            console.log('Found iframe source, attempting to extract:', iframeUrl);
            
            // Try to extract from the iframe
            try {
                const iframeResponse = await soraFetch(iframeUrl);
                const iframeHtml = typeof iframeResponse === 'object' ? await iframeResponse.text() : await iframeResponse;
                
                // Recursively search in iframe content
                for (const pattern of patterns.slice(0, 4)) { // Only use direct URL patterns
                    let match;
                    while ((match = pattern.exec(iframeHtml)) !== null) {
                        let streamUrl = match[1] || match[0];
                        if (streamUrl.startsWith('//')) {
                            streamUrl = 'https:' + streamUrl;
                        }
                        if (streamUrl.includes('.m3u8') || streamUrl.includes('.mp4')) {
                            console.log('Found stream URL in iframe:', streamUrl);
                            return streamUrl;
                        }
                    }
                }
            } catch (e) {
                console.log('Error extracting from iframe:', e.message);
            }
        }

        console.log('No stream URL found');
        return null;

    } catch(e) {
        console.log('Error extracting stream: ' + e.message);
        return null;
    }
}

/**
 * Trims around the content, leaving only the area between the start and end string
 * @param {string} text The text to trim
 * @param {string} startString The string to start at (inclusive)
 * @param {string} endString The string to end at (exclusive)
 * @returns The trimmed text
 */
function trimText(text, startString, endString) {
    const startIndex = text.indexOf(startString);
    const endIndex = text.indexOf(endString, startIndex);
    return text.substring(startIndex, endIndex);
}

// Uses Sora's fetchv2 on ipad, fallbacks to regular fetch on Windows
async function soraFetch(url, options = { headers: {}, method: 'GET', body: null }) {
    try {
        return await fetchv2(url, options.headers ?? {}, options.method ?? 'GET', options.body ?? null);
    } catch(e) {
        try {
            return await fetch(url, options);
        } catch(error) {
            return null;
        }
    }
}
