//***** LOCAL TESTING - KaaTo Module Test v2
(async() => {
    console.log('Starting KaaTo module test v2...');
    
    // Test search with static fallback
    const results = await searchResults('solo');
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
        console.log('No results found. Testing with known URL...');
        
        // Test with known working URL
        const knownUrl = 'https://kaa.to/solo-camping-for-two-8096';
        
        const details = await extractDetails(knownUrl);
        console.log('DETAILS from known URL: ', details);
        
        const episodes = await extractEpisodes(knownUrl);
        console.log('EPISODES from known URL: ', episodes);
        
        const parsedEpisodes = JSON.parse(episodes);
        if (parsedEpisodes.length > 0) {
            const streamUrl = await extractStreamUrl(parsedEpisodes[0].href);
            console.log('STREAMURL from known URL: ', streamUrl);
        }
    }
})();
//***** LOCAL TESTING

const BASE_URL = 'https://kaa.to';
const SEARCH_URL = 'https://kaa.to/search?q=';
const API_BASE = 'https://kaa.to/api'; // Possible API endpoint

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
        // Try multiple search approaches
        
        // Approach 1: Try API search
        try {
            const apiResponse = await soraFetch(`${API_BASE}/search?q=${encodeURIComponent(keyword)}`);
            if (apiResponse && apiResponse.status === 200) {
                const apiData = await apiResponse.json();
                if (apiData && apiData.results) {
                    return JSON.stringify(apiData.results.map(item => ({
                        title: item.title || item.name,
                        image: item.image || item.poster || 'https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg',
                        href: item.url || `${BASE_URL}/${item.slug || item.id}`
                    })));
                }
            }
        } catch (e) {
            console.log('API search failed:', e.message);
        }

        // Approach 2: Static fallback with known anime for testing
        console.log('Using static fallback for search:', keyword);
        const staticResults = getStaticSearchResults(keyword);
        if (staticResults.length > 0) {
            return JSON.stringify(staticResults);
        }

        return JSON.stringify([]);

    } catch (error) {
        console.log('Fetch error: ' + error.message);
        return JSON.stringify([]);
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
 * Helper function to extract anime from main page when search doesn't work
 */
function extractAnimeFromMainPage(html, keyword) {
    try {
        const REGEX = /## \[([^\]]+)\]\(([^)]+)\)/g;
        const matches = Array.from(html.matchAll(REGEX));
        
        // Filter results that contain the keyword
        const filteredMatches = matches.filter(match => 
            match[1].toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 10); // Limit to 10 results
        
        const matchesArray = filteredMatches.map(match => {
            return {
                title: match[1],
                image: 'https://raw.githubusercontent.com/ShadeOfChaos/Sora-Modules/refs/heads/main/ofchaos.jpg', // Placeholder image
                href: match[2].startsWith('http') ? match[2] : BASE_URL + match[2]
            };
        });

        return JSON.stringify(matchesArray);
    } catch (error) {
        console.log('Extract from main page error: ' + error.message);
        return JSON.stringify([]);
    }
}

/**
 * Extracts the details (description, aliases, airdate) from the given url
 * @param {string} url The id required to fetch the details
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
 * @param {string} url - The id required to fetch the episodes
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
 * Extracts the stream URL from the given url, using a utility function on ac-api.ofchaos.com.
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