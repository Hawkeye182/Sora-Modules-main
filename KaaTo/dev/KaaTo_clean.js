const BASE_URL = 'https://kaa.to';
const SEARCH_URL = 'https://kaa.to/search?q=';
const API_BASE = 'https://kaa.to/api';

//***** LOCAL TESTING
(async() => {
    console.log('Starting KaaTo module test with API...');
    
    // Test search
    const results = await searchResults('bleach');
    console.log('SEARCH RESULTS: ', results);
    
    const parsedResults = JSON.parse(results);
    if (parsedResults.length > 0) {
        console.log('Found', parsedResults.length, 'results');
        
        const details = await extractDetails(parsedResults[0].href);
        console.log('DETAILS: ', details);
        
        const episodes = await extractEpisodes(parsedResults[0].href);
        console.log('EPISODES: ', episodes);
        
        const parsedEpisodes = JSON.parse(episodes);
        if (parsedEpisodes.length > 0) {
            const streamUrl = await extractStreamUrl(parsedEpisodes[0].href);
            console.log('STREAMURL: ', streamUrl);
        }
    } else {
        console.log('No results found.');
    }
})();
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
